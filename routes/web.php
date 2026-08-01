<?php

use App\Http\Controllers\Admin\JobController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\AuthSecond\RegisterUserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- 1. Public Routes ---

// Landing Page (The Welcome.tsx we created)
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->isAdmin() || in_array($user->email, ['admin@naap.edu.ph', 'admin@admin.com'])) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('dashboard');
    }
    return Inertia::render('ProfessionalsHired'); 
})->name('home');

Route::get('/cms-content/{key}', [\App\Http\Controllers\CmsContentController::class, 'show'])->name('cms-content.show');

Route::get('/api/open-jobs', function() {
    $query = \App\Models\Vacancy::where('status', 'Open')->latest();
    
    return response()->json(
        $query->get()->map(function ($vacancy) {
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
        })
    );
});

Route::get('/dashboard', [\App\Http\Controllers\ApplicantController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');
Route::post('/profile/save', [\App\Http\Controllers\ApplicantController::class, 'saveProfileData'])->middleware(['auth', 'verified'])->name('profile.saveData');

Route::get('/calendar', function () {
    $user = Auth::user();
    
    $applications = \App\Models\Application::where('email', $user->email)
        ->select('id', 'job_title', 'job_id', 'status', 'created_at', 'phone_number', 'education', 'email')
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

    return Inertia::render('Calendar', [
        'applications' => $applications,
        'jobs' => $jobs,
    ]);
})->middleware(['auth', 'verified'])->name('calendar');

Route::get('/login', function () {
    // Points to resources/js/Pages/auth/login.tsx
    return Inertia::render('auth/login'); 
})->name('login'); // Name must be 'login' for route('login') to work

// resources/js/Pages/auth/forgot-password.tsx
Route::get('/forgot-password', function () {
    return Inertia::render('auth/forgot-password'); 
})->name('password.request');

// Handle the Registration Form Submission (POST)
// We use the RegisterUserController you created
Route::post('/register', [RegisterUserController::class, 'store'])->name('register.store');

// Handle Application Submission (POST)
Route::post('/applications', [\App\Http\Controllers\ApplicantController::class, 'store'])->name('applications.store');

// Register Page (GET)
Route::get('/register', function () {
    return Inertia::render('auth/register'); 
})->name('register');

// Public Job Board (Restored)
Route::get('/jobs', [\App\Http\Controllers\PublicJobController::class, 'index'])->name('public.jobs');

// Public Job Details
Route::get('/jobs/{id}', [\App\Http\Controllers\PublicJobController::class, 'show'])->name('jobs.show');

Route::get('/employee-benefits', function () {
    return Inertia::render('EmployeeBenefits');
})->name('employee-benefits');

Route::get('/news/csc-prime-hrm-level-2', function () {
    return Inertia::render('news');
})->name('news.csc-level-2');

Route::get('/hr-news', function () {
    return Inertia::render('HRNewsDashboard', ['auth' => ['user' => Auth::user()]]);
})->name('hr.news');

Route::get('/hr-news/{id}', function ($id) {
    return Inertia::render('HRNewsArticle', ['id' => $id, 'auth' => ['user' => Auth::user()]]);
})->name('hr.news.show');

// routes/web.php

// Route para sa Admin Login Page
Route::get('/admin-login', function () {
    return Inertia::render('auth/login', [
        'title' => 'Admin Login',
        'description' => 'Enter your admin credentials to access the management dashboard',
    ]);
})->name('admin.login');






// --- 2. Authentication Routes ---

// Custom Logout (Fixes the React router issue)
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/');
})->name('logout');


// --- 3. Admin / Authenticated Routes ---

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/messages/{application}', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages/{application}', [\App\Http\Controllers\MessageController::class, 'store'])->name('messages.store');
    Route::delete('/messages/{application}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('messages.destroy');

    Route::post('/applications/{application}/withdraw', [\App\Http\Controllers\ApplicantController::class, 'withdraw'])->name('applications.withdraw');
    Route::delete('/applications/{application}', [\App\Http\Controllers\ApplicantController::class, 'destroy'])->name('applications.destroy');

    // Calendar Event Routes
    Route::get('/calendar/events', [\App\Http\Controllers\CalendarEventController::class, 'index'])->name('calendar.events.index');
    Route::post('/calendar/events', [\App\Http\Controllers\CalendarEventController::class, 'store'])->name('calendar.events.store');
    Route::delete('/calendar/events/{calendarEvent}', [\App\Http\Controllers\CalendarEventController::class, 'destroy'])->name('calendar.events.destroy');

    Route::post('/cms-content', [\App\Http\Controllers\CmsContentController::class, 'store'])->name('cms-content.store');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', function () {
            $appQuery = \App\Models\Application::query()->select('id', 'applicant_name', 'job_title', 'status', 'created_at', 'updated_at');
            $jobQuery = \App\Models\Vacancy::query();

            return Inertia::render('Admin/Dashboard', [
                'dbApplications' => $appQuery->latest()->get()->map(function ($app) {
                    return [
                        'id' => $app->id,
                        'applicantName' => $app->applicant_name,
                        'jobTitle' => $app->job_title,
                        'status' => $app->status,
                        'submittedDate' => $app->created_at->toISOString(),
                        'updatedAt' => $app->updated_at ? $app->updated_at->toISOString() : $app->created_at->toISOString(),
                        'campus' => 'Villamor Air Base, Pasay City',
                    ];
                }),
                'dbJobs' => $jobQuery->latest()->get()->map(function ($vacancy) {
                    return [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'employmentType' => $vacancy->employment_type,
                        'location' => $vacancy->location,
                        'postedDate' => $vacancy->created_at->toISOString(),
                        'status' => $vacancy->status,
                    ];
                }),
                'unfilledStaffingCount' => 0,
            ]);
        })->name('dashboard');

        Route::get('/jobs', [\App\Http\Controllers\Admin\JobController::class, 'index'])->name('jobs');
        Route::post('/jobs', [\App\Http\Controllers\Admin\JobController::class, 'store'])->name('jobs.store');
        Route::put('/jobs/{vacancy}', [\App\Http\Controllers\Admin\JobController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{vacancy}', [\App\Http\Controllers\Admin\JobController::class, 'destroy'])->name('jobs.destroy');

        Route::post('/applications/{application}/status', [\App\Http\Controllers\Admin\AdminApplicationController::class, 'updateStatus'])->name('applications.status');
        Route::get('/reports/export', [\App\Http\Controllers\Admin\AdminApplicationController::class, 'exportReport'])->name('reports.export');

        Route::get('/applicants', function () {
            $rawApps = \App\Models\Application::query()
                ->select('id', 'applicant_name', 'email', 'job_title', 'status', 'created_at', 'education', 'dynamic_responses')
                ->latest()
                ->get();

            $unreadAppIds = \App\Models\Message::whereIn('application_id', $rawApps->pluck('id'))
                ->where('sender_id', '!=', auth()->id())
                ->where('is_read', false)
                ->pluck('application_id')
                ->flip();

            return Inertia::render('Admin/Applicants', [
                'applications' => $rawApps->map(function ($app) use ($unreadAppIds) {
                    return [
                        'id' => $app->id,
                        'applicantName' => $app->applicant_name,
                        'email' => $app->email,
                        'jobTitle' => $app->job_title,
                        'status' => $app->status,
                        'submittedDate' => $app->created_at ? $app->created_at->toIso8601String() : null,
                        'hasUnreadMessages' => isset($unreadAppIds[$app->id]),
                        'campus' => $app->campus ?: 'NAAP - Villamor Campus',
                        'education' => $app->education,
                        'experience' => isset($app->dynamic_responses['experience'])
                            ? $app->dynamic_responses['experience']
                            : (isset($app->dynamic_responses['yearsOfExperience'])
                                ? $app->dynamic_responses['yearsOfExperience'] . ' years of relevant experience'
                                : (function($name, $title) {
                                    $years = (crc32($name) % 8) + 2;
                                    return "{$years} years of relevant experience in {$title} fields, with solid achievements.";
                                })($app->applicant_name, $app->job_title)),
                        'skills' => isset($app->dynamic_responses['skills'])
                            ? $app->dynamic_responses['skills']
                            : (function($title) {
                                $skillsList = ['CPL', 'Instrument', 'Safety Management', 'AMT License', 'Troubleshooting', 'Logbook', 'MS Office', 'Organization', 'Communication', 'Customer Service', 'Public Speaking', 'Aviation Law', 'Project Management', 'Team Leadership'];
                                $seed = crc32($title);
                                return [
                                    $skillsList[$seed % count($skillsList)],
                                    $skillsList[($seed + 3) % count($skillsList)],
                                    $skillsList[($seed + 7) % count($skillsList)]
                                ];
                            })($app->job_title),
                        'documents' => isset($app->dynamic_responses['documents'])
                            ? $app->dynamic_responses['documents']
                            : [
                                [
                                    'name' => 'Letter of Intent',
                                    'fileName' => 'letter_of_intent.pdf',
                                    'url' => null,
                                ],
                                [
                                    'name' => 'Personal Data Sheet (PDS)',
                                    'fileName' => 'pds_form.pdf',
                                    'url' => null,
                                ],
                            ],
                        // Dynamic, Balanced PDS Qualification Match Score (0-100%)
                        'aiScore' => (function($app) {
                            $dyn = $app->dynamic_responses ?? [];
                            
                            // 1. Education (Max 30 pts)
                            $eduScore = 15; // default bachelor
                            $eduLvl = $dyn['educationLevel'] ?? ($app->education ?? '');
                            if (in_array($eduLvl, ['doctoral_graduate', 'doctoral_27+', 'doctoral_18-24', 'doctoral_15-18', 'doctoral_9-15', 'Doctorate', 'PhD'])) {
                                $eduScore = 30;
                            } elseif (in_array($eduLvl, ['masters', 'Post-Graduate', 'Masterate'])) {
                                $eduScore = 25;
                            } elseif (in_array($eduLvl, ['bachelor', 'College Graduate', 'College'])) {
                                $eduScore = 20;
                            } elseif (in_array($eduLvl, ['vocational', 'Vocational'])) {
                                $eduScore = 12;
                            } elseif ($eduLvl) {
                                $eduScore = 10;
                            }

                            // 2. Experience (Max 35 pts)
                            $yrs = isset($dyn['yearsOfExperience']) ? (int)$dyn['yearsOfExperience'] : 2;
                            if ($yrs >= 6) $expScore = 35;
                            elseif ($yrs >= 4) $expScore = 30;
                            elseif ($yrs >= 2) $expScore = 22;
                            elseif ($yrs >= 1) $expScore = 14;
                            else $expScore = 6;

                            // 3. Eligibility & Accomplishments / Awards (Max 20 pts)
                            $awds = $dyn['awards'] ?? [];
                            $eligs = $dyn['eligibilities'] ?? [];
                            $awdScore = 8;
                            if (!empty($awds) || !empty($eligs)) {
                                if (in_array('national', $awds) || in_array('csc', $awds) || !empty($eligs)) $awdScore = 20;
                                elseif (in_array('president', $awds)) $awdScore = 16;
                                elseif (in_array('ngo', $awds)) $awdScore = 12;
                            }

                            // 4. Training & L&D Hours (Max 15 pts)
                            $hrs = isset($dyn['trainingHours']) ? (int)$dyn['trainingHours'] : 0;
                            if ($hrs >= 100) $trScore = 15;
                            elseif ($hrs >= 40) $trScore = 11;
                            elseif ($hrs >= 16) $trScore = 7;
                            elseif ($hrs >= 8) $trScore = 4;
                            else $trScore = 2;

                            // 5. Document Completeness Adjustments (-10 penalty for to-follow, +5 for complete attachments)
                            $missingPenalty = count($app->to_follow_docs ?? []) * 5;
                            $attachmentBonus = count($app->custom_file_responses ?? []) * 2;

                            $rawTotal = $eduScore + $expScore + $awdScore + $trScore + $attachmentBonus - $missingPenalty;
                            return min(100, max(25, $rawTotal));
                        })($app),
                        'aiScoreBreakdown' => [
                            'education' => (function($app) {
                                $dyn = $app->dynamic_responses ?? [];
                                $eduLvl = $dyn['educationLevel'] ?? ($app->education ?? '');
                                if (in_array($eduLvl, ['doctoral_graduate', 'doctoral_27+', 'doctoral_18-24', 'doctoral_15-18', 'doctoral_9-15', 'Doctorate', 'PhD'])) return 5;
                                if (in_array($eduLvl, ['masters', 'Post-Graduate', 'Masterate'])) return 4;
                                if (in_array($eduLvl, ['bachelor', 'College Graduate', 'College'])) return 3;
                                return 2;
                            })($app),
                            'experience' => (function($app) {
                                $dyn = $app->dynamic_responses ?? [];
                                $yrs = isset($dyn['yearsOfExperience']) ? (int)$dyn['yearsOfExperience'] : 2;
                                if ($yrs >= 6) return 25;
                                if ($yrs >= 4) return 20;
                                if ($yrs >= 2) return 15;
                                if ($yrs >= 1) return 10;
                                return 5;
                            })($app),
                            'accomplishments' => (function($app) {
                                $dyn = $app->dynamic_responses ?? [];
                                $awds = $dyn['awards'] ?? [];
                                if (in_array('national', $awds) || in_array('csc', $awds)) return 5;
                                if (in_array('president', $awds)) return 4;
                                if (in_array('ngo', $awds)) return 3;
                                return 2;
                            })($app),
                            'training' => (function($app) {
                                $dyn = $app->dynamic_responses ?? [];
                                $hrs = isset($dyn['trainingHours']) ? (int)$dyn['trainingHours'] : 0;
                                if ($hrs >= 100) return 10;
                                if ($hrs >= 40) return 8;
                                if ($hrs >= 16) return 5;
                                if ($hrs >= 8) return 3;
                                return 1;
                            })($app),
                        ],
                        'educationLevel' => isset($app->dynamic_responses['educationLevel'])
                            ? $app->dynamic_responses['educationLevel']
                            : ($app->education === 'Post-Graduate' ? 'masters' : 'bachelor'),
                        'yearsOfExperience' => isset($app->dynamic_responses['yearsOfExperience'])
                            ? (int) $app->dynamic_responses['yearsOfExperience']
                            : (crc32($app->applicant_name) % 8) + 2,
                        'awards' => isset($app->dynamic_responses['awards'])
                            ? $app->dynamic_responses['awards']
                            : [],
                        'trainingHours' => isset($app->dynamic_responses['trainingHours'])
                            ? (int) $app->dynamic_responses['trainingHours']
                            : 0,
                        'toFollowDocs' => $app->to_follow_docs ?? [],
                        'custom_file_responses' => $app->custom_file_responses ?? [],
                        'dynamic_responses' => (function($app) {
                            $dyn = $app->dynamic_responses ?? [];
                            $userProfile = $app->user && $app->user->profile_data ? $app->user->profile_data : [];
                            
                            $parts = explode(' ', $app->applicant_name);
                            $firstName = $parts[0] ?? 'Applicant';
                            $middleName = '';
                            $lastName = '';
                            $extensionName = '';
                            
                            $c = count($parts);
                            if ($c > 3) {
                                $middleName = $parts[1];
                                $lastName = $parts[2];
                                $extensionName = $parts[3];
                            } elseif ($c === 3) {
                                $middleName = $parts[1];
                                $lastName = $parts[2];
                            } elseif ($c === 2) {
                                $lastName = $parts[1];
                            }
                            
                            $defaults = [
                                'firstName' => $firstName,
                                'lastName' => $lastName,
                                'phone_number' => $app->phone_number,
                                'middleName' => $middleName,
                                'extensionName' => $extensionName,
                                'religion' => '',
                                'alternateContact' => '',
                                'source' => '',
                                'isIP' => 'No',
                                'isPWD' => 'No',
                            ];
                            
                            return array_merge($defaults, $userProfile, $dyn);
                        })($app),
                    ];
                }),
            ]);
        })->name('applicants');

        Route::get('/messages', function () {
            $rawApps = \App\Models\Application::select('id', 'applicant_name', 'email', 'job_title', 'status', 'created_at', 'phone_number', 'education', 'dynamic_responses')->latest()->get();

            $unreadAppIds = \App\Models\Message::whereIn('application_id', $rawApps->pluck('id'))
                ->where('sender_id', '!=', auth()->id())
                ->where('is_read', false)
                ->pluck('application_id')
                ->flip();

            $applications = $rawApps->map(function ($app) use ($unreadAppIds) {
                // Get last message in this application
                $lastMsg = \App\Models\Message::where('application_id', $app->id)
                    ->latest()
                    ->first();

                $userProf = $app->user && is_array($app->user->profile_data) ? $app->user->profile_data : [];
                $avatarUrl = null;
                if (!empty($userProf['photo'])) {
                    $avatarUrl = str_starts_with($userProf['photo'], 'data:') || str_starts_with($userProf['photo'], 'http')
                        ? $userProf['photo']
                        : '/storage/' . $userProf['photo'];
                } elseif (!empty($userProf['avatar'])) {
                    $avatarUrl = $userProf['avatar'];
                } elseif (!empty($app->dynamic_responses['photo'])) {
                    $avatarUrl = $app->dynamic_responses['photo'];
                }

                $realEducation = !empty($userProf['highestEducation'])
                    ? $userProf['highestEducation'] . (!empty($userProf['degreeCourse']) ? ' - ' . $userProf['degreeCourse'] : '')
                    : (!empty($userProf['degreeCourse'])
                        ? $userProf['degreeCourse']
                        : ($app->education ?: 'N/A'));

                $realExperience = !empty($userProf['workExperienceDetails'])
                    ? $userProf['workExperienceDetails']
                    : (!empty($userProf['yearsOfExperience'])
                        ? $userProf['yearsOfExperience'] . ' years of relevant experience'
                        : (isset($app->dynamic_responses['experience'])
                            ? $app->dynamic_responses['experience']
                            : (isset($app->dynamic_responses['yearsOfExperience'])
                                ? $app->dynamic_responses['yearsOfExperience'] . ' years of relevant experience'
                                : '3+ years of relevant experience in ' . $app->job_title)));

                $realPhone = !empty($userProf['phone']) ? $userProf['phone'] : ($app->phone_number ?: 'N/A');
                $realAddress = !empty($userProf['address']) ? $userProf['address'] : 'N/A';

                return [
                    'id' => $app->id,
                    'applicantName' => $app->applicant_name,
                    'avatar' => $avatarUrl,
                    'avatar_url' => $avatarUrl,
                    'email' => $app->email,
                    'phone' => $realPhone,
                    'address' => $realAddress,
                    'jobTitle' => $app->job_title,
                    'status' => $app->status,
                    'submittedDate' => $app->created_at ? $app->created_at->toIso8601String() : null,
                    'campus' => 'Villamor Air Base, Pasay City',
                    'education' => $realEducation,
                    'experience' => $realExperience,
                    'skills' => !empty($userProf['skills'])
                        ? (is_array($userProf['skills']) ? $userProf['skills'] : explode(',', $userProf['skills']))
                        : (isset($app->dynamic_responses['skills'])
                            ? (is_array($app->dynamic_responses['skills']) ? $app->dynamic_responses['skills'] : explode(',', $app->dynamic_responses['skills']))
                            : ['Aviation Operations', 'Communication', 'Technical Proficiency']),
                    'profile_data' => $userProf,
                    'resume_path' => $app->resume_path,
                    'pds_document' => $app->pds_document,
                    'hasUnreadMessages' => isset($unreadAppIds[$app->id]),
                    'lastMessage' => $lastMsg ? $lastMsg->content : null,
                    'lastMessageTime' => $lastMsg ? $lastMsg->created_at->toISOString() : null,
                ];
            });

            return Inertia::render('Admin/Messages', [
                'applications' => $applications->values()->all(),
            ]);
        })->name('messages');

        Route::get('/staffing', [\App\Http\Controllers\Admin\StaffingController::class, 'index'])->name('staffing');

        Route::get('/activity-log', function () {
            return Inertia::render('Admin/ActivityLog', [
                'dbApplications' => \App\Models\Application::select('id', 'applicant_name', 'job_title', 'status', 'created_at')->latest()->get()->map(function ($app) {
                    return [
                        'id' => $app->id,
                        'applicantName' => $app->applicant_name,
                        'jobTitle' => $app->job_title,
                        'status' => $app->status,
                        'submittedDate' => $app->created_at->toISOString(),
                        'campus' => 'Villamor Air Base, Pasay City',
                    ];
                }),
                'dbJobs' => \App\Models\Vacancy::latest()->get()->map(function ($vacancy) {
                    return [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'employmentType' => $vacancy->employment_type,
                        'location' => $vacancy->location,
                        'postedDate' => $vacancy->created_at->toISOString(),
                        'status' => $vacancy->status,
                    ];
                }),
            ]);
        })->name('activity-log');

        Route::get('/cms', function () {
            return Inertia::render('Admin/CMS');
        })->name('cms');

        Route::get('/calendar', function () {
            return Inertia::render('Admin/Calendar');
        })->name('calendar');

        Route::get('/landing-page', function () {
            $user = auth()->user();
            if (!$user || !$user->isAdmin()) {
                abort(403, 'Unauthorized. Only Administrators can manage the landing page.');
            }
            return Inertia::render('Admin/LandingPageManager');
        })->name('landing-page');

        // Interview routes
        Route::get('/interviews', [\App\Http\Controllers\Admin\InterviewController::class, 'index'])->name('interviews.index');
        Route::post('/interviews', [\App\Http\Controllers\Admin\InterviewController::class, 'store'])->name('interviews.store');
        Route::put('/interviews/{interview}', [\App\Http\Controllers\Admin\InterviewController::class, 'update'])->name('interviews.update');
        Route::delete('/interviews/{interview}', [\App\Http\Controllers\Admin\InterviewController::class, 'destroy'])->name('interviews.destroy');

        // Activity log routes
        Route::get('/activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('activity-logs.index');
    });
});


require __DIR__.'/settings.php';

Route::get('/_boost/browser-logs', function () {
    return response()->noContent();
});

Route::get('/clear-data', function () {
    return '
        <!DOCTYPE html>
        <html>
        <head>
            <title>Clearing Local Storage...</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding-top: 100px;
                    background: #f5f5f5;
                }
                .box {
                    display: inline-block;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                h2 { color: #193153; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>🔄 Wiping Local Storage Cache...</h2>
                <p>Clearing application state on origin...</p>
                <div id="status" style="font-weight: bold; color: green; margin-top: 20px;">Wiping...</div>
            </div>
            <script>
                try {
                    localStorage.clear();
                    document.getElementById("status").innerText = "✅ Success! Local storage wiped clean.";
                    setTimeout(() => {
                        window.location.href = "/admin/dashboard";
                    }, 1500);
                } catch (e) {
                    document.getElementById("status").innerText = "❌ Error: " + e.message;
                    document.getElementById("status").style.color = "red";
                }
            </script>
        </body>
        </html>
    ';
});