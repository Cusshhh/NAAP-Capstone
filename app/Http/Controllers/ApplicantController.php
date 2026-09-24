<?php

namespace App\Http\Controllers;

use App\Mail\ApplicationSubmittedMail;
use App\Models\ActivityLog;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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

            // 1. Check Hired Employee Lock
            $hiredApp = Application::where('email', $validated['email'])
                ->where('status', 'Hired')
                ->first();

            if ($hiredApp) {
                return redirect()->back()->withErrors([
                    'error' => "You have been officially Hired for '{$hiredApp->job_title}' at NAAP. Active employee accounts are restricted from submitting new job applications.",
                ])->withInput();
            }

            // 2. Check Single Active Application Rule (Max 1 active application across all jobs)
            $activeApp = Application::where('email', $validated['email'])
                ->whereIn('status', ['Submitted', 'Under Review', 'Interview Scheduled', 'Interview'])
                ->first();

            if ($activeApp) {
                if ((string)$activeApp->job_id === (string)$validated['job_id']) {
                    return redirect()->back()->withErrors([
                        'error' => "You already have an active application for '{$validated['job_title']}'. Only 1 active application per position is permitted.",
                    ])->withInput();
                } else {
                    return redirect()->back()->withErrors([
                        'error' => "Government CSC PRIME-HRM policy permits only ONE (1) active job application at a time. You currently have an active application for '{$activeApp->job_title}'. Please wait for its outcome or withdraw it before applying for another position.",
                    ])->withInput();
                }
            }

            // 3. Check 60-Day Rejection Cooldown Period
            $rejectedApp = Application::where('email', $validated['email'])
                ->where('status', 'Rejected')
                ->latest('updated_at')
                ->first();

            if ($rejectedApp && $rejectedApp->updated_at) {
                $cooldownEndDate = $rejectedApp->updated_at->copy()->addDays(60);
                if (now()->lt($cooldownEndDate)) {
                    $daysLeft = (int) ceil(now()->diffInSeconds($cooldownEndDate) / 86400);
                    $unlockDate = $cooldownEndDate->format('F d, Y');
                    return redirect()->back()->withErrors([
                        'error' => "Your previous application for '{$rejectedApp->job_title}' was not selected. Pursuant to CSC government recruitment rules, a 60-day waiting period is required before submitting new applications. You may apply again in {$daysLeft} day(s) on {$unlockDate}.",
                    ])->withInput();
                }
            }

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
                'to_follow_docs' => $validated['to_follow_docs'] ?? [],
                'custom_file_responses' => $customFileResponses,
                'dynamic_responses' => $dyn,
                'status' => 'Submitted',
            ]);

            Log::info("Application created successfully with ID: {$application->id}");

            // Send email confirmation to applicant
            try {
                Mail::to($application->email)->send(new ApplicationSubmittedMail($application));
            } catch (\Throwable $mailEx) {
                Log::error("Failed sending ApplicationSubmittedMail to {$application->email}: ".$mailEx->getMessage());
            }

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

            if (is_array($profile)) {
                // Strictly enforce authenticated user email to prevent identity mixups
                $profile['email'] = strtolower(trim($user->email));

                if (!empty($profile['remove_avatar']) || !empty($profile['photo_removed'])) {
                    $profile['avatar_url'] = null;
                    $profile['photo'] = null;
                    $profile['avatar'] = null;
                    $profile['photo_removed'] = true;
                    if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'avatar_url')) {
                        $user->avatar_url = null;
                    }
                }

                foreach (['photo', 'avatar', 'avatar_url'] as $photoKey) {
                    if (isset($profile[$photoKey]) && is_string($profile[$photoKey]) && str_starts_with($profile[$photoKey], 'data:image')) {
                        try {
                            @[$type, $data] = explode(';', $profile[$photoKey]);
                            @[, $data] = explode(',', $data);
                            $decoded = base64_decode($data);
                            if ($decoded) {
                                $filename = 'avatars/user_'.$user->id.'_'.time().'.jpg';
                                $fullPath = storage_path('app/public/'.$filename);
                                if (! is_dir(dirname($fullPath))) {
                                    mkdir(dirname($fullPath), 0755, true);
                                }
                                file_put_contents($fullPath, $decoded);
                                $url = '/storage/'.$filename;
                                $profile['photo'] = $url;
                                $profile['avatar'] = $url;
                                $profile['avatar_url'] = $url;
                            }
                        } catch (\Exception $ex) {
                            Log::warning('Base64 photo conversion error: '.$ex->getMessage());
                        }
                    }
                }

                if (isset($profile['firstName']) || isset($profile['lastName'])) {
                    $fullName = $this->formatFullName($profile);
                    if ($fullName) {
                        $user->name = $fullName;
                    }
                }
            }

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
                    $fullName = $this->formatFullName($profile);
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

            try {
                ActivityLog::write(
                    'Application Withdrawn',
                    "{$application->applicant_name} withdrew their application for {$application->job_title}",
                    'Villamor Campus',
                    'FileX',
                    'text-amber-600 bg-amber-50'
                );
            } catch (\Exception $ex) {
                Log::warning('ActivityLog write failed on withdrawal: '.$ex->getMessage());
            }

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
     * Permanently delete an application (Blocked for Government CSC Record Retention Compliance).
     */
    public function destroy(Application $application)
    {
        return response()->json([
            'error' => 'According to government regulations, official application records cannot be permanently deleted. You may withdraw your application instead.',
        ], 403);
    }

    /**
     * Upload a previously marked "To Follow" document for an application.
     */
    public function uploadToFollowDocument(Request $request, Application $application)
    {
        try {
            if ($application->email !== Auth::user()->email) {
                return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
            }

            $validated = $request->validate([
                'document_label' => 'required|string',
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            ]);

            $documentLabel = $validated['document_label'];
            $file = $request->file('file');

            $path = $file->store('applications/custom', 'public');
            Log::info("To-Follow file uploaded for application {$application->id}: {$documentLabel} => {$path}");

            // Update custom_file_responses
            $customResponses = $application->custom_file_responses ?? [];
            if (!is_array($customResponses)) {
                $customResponses = [];
            }
            $customResponses[$documentLabel] = $path;

            // Remove document_label from to_follow_docs array
            $toFollow = $application->to_follow_docs ?? [];
            if (!is_array($toFollow)) {
                $toFollow = [];
            }
            $updatedToFollow = array_values(array_filter($toFollow, function ($label) use ($documentLabel) {
                return trim((string) $label) !== trim((string) $documentLabel);
            }));

            $application->update([
                'custom_file_responses' => $customResponses,
                'to_follow_docs' => $updatedToFollow,
            ]);

            try {
                ActivityLog::write(
                    'To-Follow Document Uploaded',
                    "{$application->applicant_name} uploaded missing document: {$documentLabel} for {$application->job_title}",
                    'Villamor Campus',
                    'FileText',
                    'text-emerald-600 bg-emerald-50'
                );
            } catch (\Exception $ex) {
                Log::warning('ActivityLog write failed: ' . $ex->getMessage());
            }

            return redirect()->back()->with('message', "Document '{$documentLabel}' uploaded successfully!");
        } catch (\Throwable $e) {
            Log::error("Error uploading to-follow document for application {$application->id}: " . $e->getMessage(), [
                'exception' => $e,
            ]);

            return redirect()->back()->withErrors(['error' => 'Failed to upload document: ' . $e->getMessage()]);
        }
    }

    /**
     * Format applicant full name cleanly with Middle Initial and without N/A extension.
     */
    private function formatFullName(array $profile): string
    {
        $first = trim($profile['firstName'] ?? '');
        $last = trim($profile['lastName'] ?? '');
        $middle = trim($profile['middleName'] ?? '');
        $ext = trim($profile['extensionName'] ?? '');

        $middleInitial = '';
        if ($middle !== '' && !in_array(strtolower($middle), ['n/a', 'none', '-', 'null', 'n / a'])) {
            $cleanMid = trim(str_replace('.', '', $middle));
            if ($cleanMid !== '') {
                $middleInitial = strtoupper(substr($cleanMid, 0, 1)) . '.';
            }
        }

        $extFormatted = '';
        if ($ext !== '' && !in_array(strtolower($ext), ['n/a', 'none', '-', 'null', 'n / a'])) {
            $extFormatted = $ext;
        }

        $parts = array_filter([$first, $middleInitial, $last, $extFormatted], fn ($p) => $p !== '');

        return implode(' ', $parts);
    }
}

