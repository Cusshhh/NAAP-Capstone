<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Vacancy;
use App\Models\Department;

class JobController extends Controller
{
    /**
     * Display the Job Management view.
     */
    public function index()
    {
        $query = Vacancy::query();

        // Ensure all departments present in vacancies exist in departments table
        $existingDeptNames = Vacancy::whereNotNull('department')->pluck('department')->unique();
        foreach ($existingDeptNames as $deptName) {
            if (!empty(trim($deptName))) {
                Department::firstOrCreate(['name' => trim($deptName)]);
            }
        }

        return Inertia::render('Admin/JobManagement', [
            'dbDepartments' => Department::orderBy('name')->get(),
            'jobs' => $query->latest()->get()->map(function ($vacancy) {
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
            }),
        ]);
    }

    /**
     * Store a newly created vacancy.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'staffing_id' => 'nullable|exists:staffing_positions,id',
                'title' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'employmentType' => 'required|string|in:Full-time,Part-time,Contract',
                'description' => 'required|string',
                'responsibilities' => 'nullable|array',
                'requirements' => 'nullable|array',
                'salaryGrade' => 'nullable|integer',
                'deadline' => 'nullable|date',
                'custom_file_requirements' => 'nullable|array',
                'status' => 'nullable|string|in:Open,Closed',
            ]);

            $vacancy = Vacancy::create([
                'staffing_id' => $validated['staffing_id'] ?? null,
                'title' => $validated['title'],
                'department' => $validated['department'],
                'employment_type' => $validated['employmentType'],
                'location' => 'Villamor Air Base, Pasay City',
                'description' => $validated['description'],
                'responsibilities' => $validated['responsibilities'] ?? null,
                'requirements' => $validated['requirements'] ?? null,
                'salary_grade' => $validated['salaryGrade'] ?? null,
                'deadline' => $validated['deadline'] ?? null,
                'custom_file_requirements' => $validated['custom_file_requirements'] ?? null,
                'status' => $validated['status'] ?? 'Open',
            ]);

            return back()->with('message', 'Job posted successfully.');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error('Error creating vacancy: ' . $ex->getMessage());
            return back()->withErrors(['error' => 'Failed to post job vacancy: ' . $ex->getMessage()]);
        }
    }

    /**
     * Update the specified vacancy.
     */
    public function update(Request $request, Vacancy $vacancy)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'employmentType' => 'required|string|in:Full-time,Part-time,Contract',
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
                'location' => 'Villamor Air Base, Pasay City',
                'description' => $validated['description'],
                'responsibilities' => $validated['responsibilities'] ?? $vacancy->responsibilities,
                'requirements' => $validated['requirements'] ?? $vacancy->requirements,
                'salary_grade' => $validated['salaryGrade'] ?? $vacancy->salary_grade,
                'deadline' => $validated['deadline'] ?? $vacancy->deadline,
                'custom_file_requirements' => $request->custom_file_requirements ?? $vacancy->custom_file_requirements,
                'status' => $validated['status'] ?? $vacancy->status,
            ]);

            return back()->with('message', 'Job updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error("Error updating vacancy ID {$vacancy->id}: " . $ex->getMessage());
            return back()->withErrors(['error' => 'Failed to update job vacancy: ' . $ex->getMessage()]);
        }
    }

    /**
     * Remove the specified vacancy.
     */
    public function destroy(Vacancy $vacancy)
    {
        try {
            \App\Models\Application::where('job_id', $vacancy->id)->delete();
            $vacancy->delete();
            return back()->with('message', 'Job deleted successfully.');
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error("Error deleting vacancy ID {$vacancy->id}: " . $ex->getMessage());
            return back()->withErrors(['error' => 'Failed to delete job vacancy: ' . $ex->getMessage()]);
        }
    }

    /**
     * Store a newly created Department folder in MySQL.
     */
    public function storeDepartment(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:departments,name',
            ]);

            $name = trim($validated['name']);
            $code = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 4));

            Department::create([
                'name' => $name,
                'code' => $code,
            ]);

            return back()->with('message', "Department folder '{$name}' created successfully.");
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error("Error creating department folder: " . $ex->getMessage());
            return back()->withErrors(['error' => 'Failed to create department folder: ' . $ex->getMessage()]);
        }
    }

    /**
     * Remove the specified Department folder from MySQL.
     */
    public function destroyDepartment(Department $department)
    {
        try {
            $deptName = $department->name;
            $department->delete();
            return back()->with('message', "Department folder '{$deptName}' deleted successfully.");
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error("Error deleting department ID {$department->id}: " . $ex->getMessage());
            return back()->withErrors(['error' => 'Failed to delete department folder: ' . $ex->getMessage()]);
        }
    }
}