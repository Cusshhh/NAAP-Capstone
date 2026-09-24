<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use Inertia\Inertia;

class PublicJobController extends Controller
{
    public function index()
    {
        $query = Vacancy::withCount('applications')->latest();

        return Inertia::render('Jobs/Index', [
            'jobs' => $query->get()->map(function ($vacancy) {
                $isExpired = $vacancy->deadline && $vacancy->deadline->isPast() && ! $vacancy->deadline->isToday();

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
                    'applicantCount' => $vacancy->applications_count ?? 0,
                    'status' => $isExpired ? 'Closed' : $vacancy->status,
                ];
            }),
        ]);
    }

    public function show($id)
    {
        $vacancy = Vacancy::find($id);

        if (! $vacancy) {
            return redirect()->route('welcome')->with('error', 'The requested job posting was not found or has been closed.');
        }

        $isExpired = $vacancy->deadline && $vacancy->deadline->isPast() && ! $vacancy->deadline->isToday();

        $parseJsonArray = function ($val) {
            if (is_null($val)) return [];
            $arr = [];
            if (is_array($val)) {
                $arr = array_values($val);
            } elseif (is_string($val)) {
                $decoded = json_decode($val, true);
                if (is_array($decoded)) {
                    $arr = array_values($decoded);
                } else {
                    $arr = array_values(array_filter(array_map('trim', explode("\n", $val))));
                }
            }
            return array_values(array_unique($arr, SORT_REGULAR));
        };

        $responsibilities = $parseJsonArray($vacancy->responsibilities);
        $requirements = $parseJsonArray($vacancy->requirements);
        $customFileReqs = $parseJsonArray($vacancy->custom_file_requirements);

        $application = null;
        $interview = null;
        $restriction = null;
        if (auth()->check()) {
            $userEmail = auth()->user()->email;
            $application = \App\Models\Application::where('job_id', $vacancy->id)
                ->where('email', $userEmail)
                ->first();
            if ($application) {
                $interview = \App\Models\Interview::where('application_id', $application->id)->first();
            }

            // Check CSC Restrictions
            $hired = \App\Models\Application::where('email', $userEmail)->where('status', 'Hired')->first();
            if ($hired) {
                $restriction = [
                    'type' => 'hired',
                    'jobTitle' => $hired->job_title,
                    'message' => "You have been officially Hired for '{$hired->job_title}' at NAAP. Active employee accounts are restricted from submitting new job applications.",
                ];
            } else {
                $active = \App\Models\Application::where('email', $userEmail)
                    ->whereIn('status', ['Submitted', 'Under Review', 'Interview Scheduled', 'Interview'])
                    ->first();
                if ($active && (string)$active->job_id !== (string)$vacancy->id) {
                    $restriction = [
                        'type' => 'active_app',
                        'jobTitle' => $active->job_title,
                        'message' => "Government CSC PRIME-HRM policy permits only ONE (1) active job application at a time. You currently have an active application for '{$active->job_title}'. Please wait for its outcome or withdraw it before applying for another position.",
                    ];
                } else {
                    $rejected = \App\Models\Application::where('email', $userEmail)
                        ->where('status', 'Rejected')
                        ->latest('updated_at')
                        ->first();
                    if ($rejected && $rejected->updated_at) {
                        $cooldownEnd = $rejected->updated_at->copy()->addDays(60);
                        if (now()->lt($cooldownEnd)) {
                            $daysLeft = (int) ceil(now()->diffInSeconds($cooldownEnd) / 86400);
                            $unlockDate = $cooldownEnd->format('F d, Y');
                            $restriction = [
                                'type' => 'cooldown',
                                'daysLeft' => $daysLeft,
                                'unlockDate' => $unlockDate,
                                'jobTitle' => $rejected->job_title,
                                'message' => "Your previous application for '{$rejected->job_title}' was not selected. Pursuant to CSC government recruitment rules, a 60-day waiting period is required before applying for positions. You may apply again in {$daysLeft} day(s) on {$unlockDate}.",
                            ];
                        }
                    }
                }
            }
        }

        return Inertia::render('Jobs/Show', [
            'id' => (string) $vacancy->id,
            'job' => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'plantilla_item' => $vacancy->plantilla_item,
                'department' => $vacancy->department,
                'employmentType' => $vacancy->employment_type,
                'location' => $vacancy->location,
                'description' => $vacancy->description,
                'competency' => $vacancy->competency,
                'responsibilities' => $responsibilities,
                'requirements' => $requirements,
                'qs_education' => $vacancy->qs_education,
                'qs_experience' => $vacancy->qs_experience,
                'qs_eligibility' => $vacancy->qs_eligibility,
                'qs_training' => $vacancy->qs_training,
                'salaryGrade' => $vacancy->salary_grade,
                'custom_file_requirements' => $customFileReqs,
                'postedDate' => $vacancy->created_at ? $vacancy->created_at->toDateString() : null,
                'deadline' => $vacancy->deadline ? $vacancy->deadline->toDateString() : null,
                'applicantCount' => $vacancy->applications()->count(),
                'status' => $isExpired ? 'Closed' : $vacancy->status,
                'campus_id' => $vacancy->campus_id,
            ],
            'application' => $application ? [
                'id' => $application->id,
                'applicant_name' => $application->applicant_name,
                'email' => $application->email,
                'phone_number' => $application->phone_number,
                'education' => $application->education,
                'status' => $application->status,
                'submittedDate' => $application->created_at->toDateString(),
                'dynamic_responses' => $application->dynamic_responses,
                'to_follow_docs' => $application->to_follow_docs ?? [],
                'toFollowDocs' => $application->to_follow_docs ?? [],
                'custom_file_responses' => $application->custom_file_responses ?? [],
            ] : null,
            'interview' => $interview ? [
                'date' => $interview->date,
                'time' => $interview->time,
                'venue' => $interview->venue,
                'panelMembers' => $interview->panel_members,
                'panel_members' => $interview->panel_members,
                'result_notes' => $interview->result_notes,
            ] : null,
            'restriction' => $restriction,
        ]);
    }
}
