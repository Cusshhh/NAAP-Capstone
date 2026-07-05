<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Application; 

class ApplicantController extends Controller
{
    /**
     * Store a newly created application.
     */
    public function store(Request $request)
    {
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

        $customFileResponses = [];
        if ($request->has('custom_files')) {
            foreach ($request->file('custom_files', []) as $label => $file) {
                if ($file) {
                    $path = $file->store('applications/custom', 'public');
                    $customFileResponses[$label] = $path;
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

        return redirect()->route('dashboard')->with('message', 'Application submitted successfully!');
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
            
        return Inertia::render('dashboard', [
            'applications' => $applications,
            'jobs' => $jobs,
            'dbProfileData' => $user->profile_data,
        ]);
    }

    /**
     * Save the applicant's profile data.
     */
    public function saveProfileData(Request $request)
    {
        $user = Auth::user();
        $profile = $request->input('profile_data');
        
        $user->profile_data = $profile;
        $user->save();

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

        return redirect()->back()->with('message', 'Profile updated successfully!');
    }
}