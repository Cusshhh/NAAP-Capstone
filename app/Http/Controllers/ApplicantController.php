<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Application; 

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

            $application = Application::create([
                'job_id' => $validated['job_id'],
                'job_title' => $validated['job_title'],
                'email' => $validated['email'],
                'applicant_name' => $validated['applicant_name'],
                'phone_number' => $validated['phone_number'],
                'education' => $validated['education'],
                'to_follow_docs' => $validated['to_follow_docs'],
                'custom_file_responses' => $customFileResponses,
                'dynamic_responses' => $validated['dynamic_responses'] ?? [],
                'status' => 'Submitted',
            ]);

            Log::info("Application created successfully with ID: {$application->id}");

            return redirect()->route('dashboard')->with('message', 'Application submitted successfully!');
        } catch (\Exception $e) {
            Log::error('Application creation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all(),
            ]);
            
            return redirect()->back()->withErrors(['error' => 'Failed to submit application: ' . $e->getMessage()])->withInput();
        }
    }

    // Render the Dashboard with data
    public function dashboard()
    {
        $user = Auth::user();
        
        // Safety check for admins
        $adminEmails = ['admin@naap.edu.ph', 'admin@admin.com'];
        if (in_array($user->email, $adminEmails)) {
            return redirect()->route('admin.dashboard');
        }

        $applications = Application::where('email', $user->email)
            ->latest()
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'jobTitle' => $app->job_title,
                    'jobId' => $app->job_id,
                    'status' => $app->status,
                    'submittedDate' => $app->created_at->toISOString(),
                    'phone' => $app->phone_number,
                    'education' => $app->education,
                    'email' => $app->email,
                    'hasUnreadMessages' => \App\Models\Message::where('application_id', $app->id)
                        ->where('sender_id', '!=', Auth::id())
                        ->where('is_read', false)
                        ->exists(),
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

            Log::info("User profile saved successfully");

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
                    $fullName = trim("{$first} " . ($middle ? "{$middle} " : "") . $last . ($ext ? " {$ext}" : ""));
                    if ($fullName) {
                        $app->applicant_name = $fullName;
                    }
                }

                $app->dynamic_responses = $dyn;
                $app->save();
            }

            Log::info("All applications updated with profile data");

            return redirect()->back()->with('message', 'Profile updated successfully!');
        } catch (\Exception $e) {
            Log::error('Profile data save failed: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            
            return redirect()->back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    /**
     * Withdraw an application.
     */
    public function withdraw(Application $application)
    {
        if ($application->email !== Auth::user()->email) {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        $application->update(['status' => 'Withdrawn']);

        return response()->json([
            'success' => true,
            'message' => 'Application withdrawn successfully.'
        ]);
    }

    /**
     * Permanently delete an application.
     */
    public function destroy(Application $application)
    {
        if ($application->email !== Auth::user()->email) {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        $application->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application deleted permanently.'
        ]);
    }
}