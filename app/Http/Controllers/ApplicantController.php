<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ApplicantController extends Controller
{
    /**
     * Store a newly created application.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'job_id' => 'required|exists:vacancies,id',
                'job_title' => 'required|string',
                'email' => 'required|email',
                'applicant_name' => 'required|string',
                'phone_number' => 'required|string',
                'education' => 'required|string',
                'to_follow_docs' => 'nullable|array',
                'dynamic_responses' => 'nullable|array',
            ]);

            Log::info('Application validation passed', $validated);

            $customFileResponses = [];
            if ($request->has('custom_files')) {
                foreach ($request->file('custom_files', []) as $label => $file) {
                    if ($file) {
                        $path = $file->store('applications/custom', 'public');
                        $customFileResponses[$label] = $path;
                        Log::info("File stored: {$label} => {$path}");
                    }
                }
            }

            $dyn = $validated['dynamic_responses'] ?? [];
            if (empty($dyn['contactNumber']) && ! empty($validated['phone_number'])) {
                $dyn['contactNumber'] = $validated['phone_number'];
            }
            if (empty($dyn['firstName']) || empty($dyn['lastName'])) {
                $parts = explode(' ', trim($validated['applicant_name']));
                $dyn['firstName'] = $dyn['firstName'] ?? ($parts[0] ?? '');
                $dyn['lastName'] = $dyn['lastName'] ?? (count($parts) > 1 ? end($parts) : '');
            }

            $application = Application::create([
                'job_id' => $validated['job_id'],
                'job_title' => $validated['job_title'],
                'email' => $validated['email'],
                'applicant_name' => $validated['applicant_name'],
                'phone_number' => $validated['phone_number'],
                'education' => $validated['education'],
                'to_follow_docs' => $validated['to_follow_docs'],
                'custom_file_responses' => $customFileResponses,
                'dynamic_responses' => $dyn,
                'status' => 'Submitted',
            ]);

            Log::info("Application created successfully with ID: {$application->id}");

            try {
                ActivityLog::write(
                    'New Application Submitted',
                    "{$application->applicant_name} submitted application for {$application->job_title}",
                    'Villamor Campus',
                    'FileText',
                    'text-blue-600 bg-blue-50'
                );
            } catch (\Exception $ex) {
                Log::warning('ActivityLog write failed: '.$ex->getMessage());
            }

            return redirect()->route('dashboard')->with('message', 'Application submitted successfully!');
        } catch (\Exception $e) {
            Log::error('Application creation failed: '.$e->getMessage(), [
                'exception' => $e,
                'request' => $request->all(),
            ]);

            return redirect()->back()->withErrors(['error' => 'Failed to submit application: '.$e->getMessage()])->withInput();
        }
    }

    // Render the Dashboard with data
    public function dashboard()
    {
        $user = Auth::user();

        // Safety check for admins
        if ($user->isAdmin() || in_array($user->email, ['admin@naap.edu.ph', 'admin@admin.com'])) {
            return redirect()->route('admin.dashboard');
        }

        $rawApps = Application::where('email', $user->email)
            ->select('id', 'job_title', 'job_id', 'status', 'created_at', 'updated_at', 'phone_number', 'education', 'email')
            ->latest()
            ->get();

        $unreadAppIds = \App\Models\Message::whereIn('application_id', $rawApps->pluck('id'))
            ->where('sender_id', '!=', Auth::id())
            ->where('is_read', false)
            ->pluck('application_id')
            ->flip();

        $applications = $rawApps->map(function ($app) use ($unreadAppIds) {
            return [
                'id' => $app->id,
                'jobTitle' => $app->job_title,
                'jobId' => $app->job_id,
                'status' => $app->status,
                'submittedDate' => $app->created_at->toISOString(),
                'updatedAt' => $app->updated_at ? $app->updated_at->toISOString() : $app->created_at->toISOString(),
                'phone' => $app->phone_number,
                'education' => $app->education,
                'email' => $app->email,
                'hasUnreadMessages' => isset($unreadAppIds[$app->id]),
            ];
        });

        $jobs = \App\Models\Vacancy::where('status', 'Open')->latest()->get()->map(function ($vacancy) {
            return [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'department' => $vacancy->department,
                'employmentType' => $vacancy->employment_type,
                'location' => $vacancy->location,
                'salaryGrade' => $vacancy->salary_grade,
                'description' => $vacancy->description,
                'postedDate' => $vacancy->created_at->toDateString(),
                'deadline' => $vacancy->deadline ? $vacancy->deadline->toDateString() : null,
                'applicantCount' => $vacancy->applications()->count(),
                'status' => $vacancy->status,
            ];
        });
        $dbInterviews = \App\Models\Interview::where('applicant_email', $user->email)
            ->latest()
            ->get()
            ->map(function ($int) {
                return [
                    'id' => $int->id,
                    'applicationId' => $int->application_id,
                    'date' => $int->date->toDateString(),
                    'time' => $int->time,
                    'panelMembers' => $int->panel_members,
                    'venue' => $int->venue,
                    'notifyApplicant' => $int->notify_applicant,
                    'resultNotes' => $int->result_notes,
                    'candidateName' => $int->candidate_name,
                    'position' => $int->position,
                    'applicantEmail' => $int->applicant_email,
                ];
            });

        return Inertia::render('dashboard', [
            'applications' => $applications,
            'jobs' => $jobs,
            'dbProfileData' => $user->profile_data,
            'dbInterviews' => $dbInterviews,
        ]);
    }

    /**
     * Save the applicant's profile data.
     */
    public function saveProfileData(Request $request)
    {
        try {
            $user = Auth::user();
            $profile = $request->input('profile_data');

            Log::info("Saving profile data for user: {$user->email}");

            $user->profile_data = $profile;
            $user->save();

            Log::info('User profile saved successfully');

            // Sync with existing applications
            $applications = Application::where('email', $user->email)->get();
            foreach ($applications as $app) {
                $dyn = $app->dynamic_responses ?? [];

                // Merge profile fields into dynamic_responses
                foreach ($profile as $key => $value) {
                    $dyn[$key] = $value;
                }

                if (isset($profile['phone'])) {
                    $app->phone_number = $profile['phone'];
                    $dyn['phone_number'] = $profile['phone'];
                }

                if (isset($profile['firstName']) || isset($profile['lastName'])) {
                    $first = $profile['firstName'] ?? '';
                    $middle = $profile['middleName'] ?? '';
                    $last = $profile['lastName'] ?? '';
                    $ext = $profile['extensionName'] ?? '';
                    $fullName = trim("{$first} ".($middle ? "{$middle} " : '').$last.($ext ? " {$ext}" : ''));
                    if ($fullName) {
                        $app->applicant_name = $fullName;
                    }
                }

                $app->dynamic_responses = $dyn;
                $app->save();
            }

            Log::info('All applications updated with profile data');

            return redirect()->back()->with('message', 'Profile updated successfully!');
        } catch (\Exception $e) {
            Log::error('Profile data save failed: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            return redirect()->back()->withErrors(['error' => 'Failed to update profile: '.$e->getMessage()]);
        }
    }

    /**
     * Withdraw an application.
     */
    public function withdraw(Application $application)
    {
        try {
            if ($application->email !== Auth::user()->email) {
                return response()->json(['error' => 'Unauthorized action.'], 403);
            }

            $application->update(['status' => 'Withdrawn']);

            return response()->json([
                'success' => true,
                'message' => 'Application withdrawn successfully.',
            ]);
        } catch (\Throwable $ex) {
            Log::error("Error withdrawing application ID {$application->id}: ".$ex->getMessage());

            return response()->json(['error' => 'Failed to withdraw application'], 500);
        }
    }

    /**
     * Permanently delete an application.
     */
    public function destroy(Application $application)
    {
        try {
            if ($application->email !== Auth::user()->email) {
                return response()->json(['error' => 'Unauthorized action.'], 403);
            }

            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application deleted permanently.',
            ]);
        } catch (\Throwable $ex) {
            Log::error("Error deleting application ID {$application->id}: ".$ex->getMessage());

            return response()->json(['error' => 'Failed to delete application'], 500);
        }
    }
}
