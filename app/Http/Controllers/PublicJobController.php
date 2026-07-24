<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use Inertia\Inertia;

class PublicJobController extends Controller
{
    public function index()
    {
        $query = Vacancy::latest();

        return Inertia::render('Jobs/Index', [
            'jobs' => $query->get()->map(function ($vacancy) {
                $isExpired = $vacancy->deadline && $vacancy->deadline->isPast() && !$vacancy->deadline->isToday();
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
                    'status' => $isExpired ? 'Closed' : $vacancy->status,
                ];
            })
        ]);
    }

    public function show($id)
    {
        $vacancy = Vacancy::find($id);
        
        if (!$vacancy) {
            return redirect()->route('welcome')->with('error', 'The requested job posting was not found or has been closed.');
        }
        
        $isExpired = $vacancy->deadline && $vacancy->deadline->isPast() && !$vacancy->deadline->isToday();
        
        $application = null;
        $interview = null;
        if (auth()->check()) {
            $application = \App\Models\Application::where('job_id', $vacancy->id)
                ->where('email', auth()->user()->email)
                ->first();
            if ($application) {
                $interview = \App\Models\Interview::where('application_id', $application->id)->first();
            }
        }
        
        return Inertia::render('Jobs/Show', [
            'id' => (string) $vacancy->id,
            'job' => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'department' => $vacancy->department,
                'employmentType' => $vacancy->employment_type,
                'location' => $vacancy->location,
                'description' => $vacancy->description,
                'responsibilities' => $vacancy->responsibilities,
                'requirements' => $vacancy->requirements,
                'salaryGrade' => $vacancy->salary_grade,
                'postedDate' => $vacancy->created_at->toDateString(),
                'deadline' => $vacancy->deadline ? $vacancy->deadline->toDateString() : null,
                'applicantCount' => $vacancy->applications()->count(),
                'status' => $isExpired ? 'Closed' : $vacancy->status,
                'campus_id' => $vacancy->campus_id,
            ],
            'application' => $application ? [
                'id' => $application->id,
                'status' => $application->status,
                'submittedDate' => $application->created_at->toDateString(),
                'dynamic_responses' => $application->dynamic_responses,
                'toFollowDocs' => $application->to_follow_docs ?? [],
            ] : null,
            'interview' => $interview ? [
                'date' => $interview->date,
                'time' => $interview->time,
                'venue' => $interview->venue,
                'panel_members' => $interview->panel_members,
                'result_notes' => $interview->result_notes,
            ] : null
        ]);
    }
}
