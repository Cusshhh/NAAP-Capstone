<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Vacancy;

class JobController extends Controller
{
    /**
     * Display the Job Management view.
     */
    public function index()
    {
        return Inertia::render('Admin/JobManagement', [
            'jobs' => Vacancy::latest()->get()->map(function ($vacancy) {
                return [
                    'id' => $vacancy->id,
                    'title' => $vacancy->title,
                    'department' => $vacancy->department,
                    'employmentType' => $vacancy->employment_type,
                    'location' => $vacancy->location,
                    'description' => $vacancy->description,
                    'responsibilities' => $vacancy->responsibilities,
                    'requirements' => $vacancy->requirements,
                    'salaryGrade' => $vacancy->salary_grade,
                    'custom_file_requirements' => $vacancy->custom_file_requirements,
                    'deadline' => $vacancy->deadline ? $vacancy->deadline->toDateString() : null,
                    'status' => $vacancy->status,
                    'postedDate' => $vacancy->created_at->toDateString(),
                    'applicantCount' => $vacancy->applications()->count(),
                ];
            })
        ]);
    }

    /**
     * Store a newly created vacancy.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'staffing_id' => 'nullable|exists:staffing_positions,id',
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'employmentType' => 'required|string|in:Full-time,Part-time,Contract',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'responsibilities' => 'nullable|array',
            'requirements' => 'nullable|array',
            'salaryGrade' => 'nullable|integer',
            'deadline' => 'nullable|date',
            'custom_file_requirements' => 'nullable|array',
            'status' => 'nullable|string|in:Open,Closed',
        ]);

        $vacancy = Vacancy::create([
            'staffing_id' => $validated['staffing_id'],
            'title' => $validated['title'],
            'department' => $validated['department'],
            'employment_type' => $validated['employmentType'],
            'location' => $validated['location'],
            'description' => $validated['description'],
            'responsibilities' => $validated['responsibilities'],
            'requirements' => $validated['requirements'],
            'salary_grade' => $validated['salaryGrade'],
            'deadline' => $validated['deadline'],
            'custom_file_requirements' => $validated['custom_file_requirements'],
            'status' => $validated['status'] ?? 'Open',
        ]);

        // If created from staffing monitoring, update that status to On-process
        if ($validated['staffing_id']) {
            $staffing = \App\Models\StaffingPosition::find($validated['staffing_id']);
            if ($staffing) {
                $staffing->update(['status' => 'On-process']);
            }
        }

        return back()->with('message', 'Job posted successfully.');
    }

    /**
     * Update the specified vacancy.
     */
    public function update(Request $request, Vacancy $vacancy)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'employmentType' => 'required|string|in:Full-time,Part-time,Contract',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'responsibilities' => 'nullable|array',
            'requirements' => 'nullable|array',
            'salaryGrade' => 'nullable|integer',
            'deadline' => 'nullable|date',
            'status' => 'nullable|string|in:Open,Closed',
        ]);

        $vacancy->update([
            'title' => $validated['title'],
            'department' => $validated['department'],
            'employment_type' => $validated['employmentType'],
            'location' => $validated['location'],
            'description' => $validated['description'],
            'responsibilities' => $validated['responsibilities'],
            'requirements' => $validated['requirements'],
            'salary_grade' => $validated['salaryGrade'],
            'deadline' => $validated['deadline'],
            'custom_file_requirements' => $validated['custom_file_requirements'] ?? $vacancy->custom_file_requirements,
            'status' => $validated['status'] ?? $vacancy->status,
        ]);

        return back()->with('message', 'Job updated successfully.');
    }

    /**
     * Remove the specified vacancy.
     */
    public function destroy(Vacancy $vacancy)
    {
        $vacancy->delete();
        return back()->with('message', 'Job deleted successfully.');
    }
}