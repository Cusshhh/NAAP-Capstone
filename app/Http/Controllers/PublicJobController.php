<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use Inertia\Inertia;

class PublicJobController extends Controller
{
    public function index()
    {
        return Inertia::render('Jobs/Index', [
            'jobs' => Vacancy::where('status', 'Open')->latest()->get()->map(function ($vacancy) {
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
        ]);
    }

    public function show($id)
    {
        $vacancy = Vacancy::find($id);
        
        if (!$vacancy) {
            return redirect()->route('welcome')->with('error', 'The requested job posting was not found or has been closed.');
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
                'status' => $vacancy->status,
            ]
        ]);
    }
}
