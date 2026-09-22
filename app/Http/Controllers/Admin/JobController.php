<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            if (! empty(trim($deptName))) {
                Department::firstOrCreate(['name' => trim($deptName)]);
            }
        }

        return Inertia::render('Admin/JobManagement', [
            'dbDepartments' => Department::orderBy('name')->get(),
            'dbApplications' => \App\Models\Application::select('id', 'applicant_name', 'job_title', 'status', 'created_at')->latest()->get()->map(function ($app) {
                return [
                    'id' => $app->id,
                    'applicantName' => $app->applicant_name,
                    'jobTitle' => $app->job_title,
                    'status' => $app->status,
                    'submittedDate' => $app->created_at ? $app->created_at->toISOString() : null,
                ];
            }),
            'jobs' => $query->latest()->get()->map(function ($vacancy) {
                return [
                    'id' => $vacancy->id,
                    'title' => $vacancy->title,
                    'plantilla_item' => $vacancy->plantilla_item,
                    'department' => $vacancy->department,
                    'employmentType' => $vacancy->employment_type,
                    'location' => $vacancy->location,
                    'description' => $vacancy->description,
                    'competency' => $vacancy->competency,
                    'responsibilities' => $vacancy->responsibilities,
                    'requirements' => $vacancy->requirements,
                    'qs_education' => $vacancy->qs_education,
                    'qs_experience' => $vacancy->qs_experience,
                    'qs_eligibility' => $vacancy->qs_eligibility,
                    'qs_training' => $vacancy->qs_training,
                    'salaryGrade' => $vacancy->salary_grade,
                    'custom_file_requirements' => $vacancy->custom_file_requirements,
                    'deadline' => $vacancy->deadline ? $vacancy->deadline->toDateString() : null,
                    'status' => $vacancy->status,
                    'postedDate' => $vacancy->created_at ? $vacancy->created_at->toDateString() : null,
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
                'plantilla_item' => 'nullable|string|max:255',
                'department' => 'required|string|max:255',
                'employmentType' => 'required|string',
                'description' => 'required|string',
                'competency' => 'nullable|string',
                'responsibilities' => 'nullable',
                'requirements' => 'nullable',
                'qs_education' => 'nullable|string',
                'qs_experience' => 'nullable|string',
                'qs_eligibility' => 'nullable|string',
                'qs_training' => 'nullable|string',
                'salaryGrade' => 'nullable|integer',
                'deadline' => 'nullable|date',
                'custom_file_requirements' => 'nullable',
                'status' => 'nullable|string|in:Open,Closed',
            ]);

            $vacancy = Vacancy::create([
                'staffing_id' => $validated['staffing_id'] ?? null,
                'title' => $validated['title'],
                'plantilla_item' => $validated['plantilla_item'] ?? null,
                'department' => $validated['department'],
                'employment_type' => $validated['employmentType'],
                'location' => 'Villamor Air Base, Pasay City',
                'description' => $validated['description'],
                'competency' => $validated['competency'] ?? null,
                'responsibilities' => $validated['responsibilities'] ?? null,
                'requirements' => $validated['requirements'] ?? null,
                'qs_education' => $validated['qs_education'] ?? null,
                'qs_experience' => $validated['qs_experience'] ?? null,
                'qs_eligibility' => $validated['qs_eligibility'] ?? null,
                'qs_training' => $validated['qs_training'] ?? null,
                'salary_grade' => $validated['salaryGrade'] ?? null,
                'deadline' => $validated['deadline'] ?? null,
                'custom_file_requirements' => $validated['custom_file_requirements'] ?? null,
                'status' => $validated['status'] ?? 'Open',
            ]);

            \App\Models\ActivityLog::write('Created Job Vacancy', "Posted new vacancy position '{$vacancy->title}' in {$vacancy->department}.", 'Job Management', 'Briefcase', 'text-blue-600 bg-blue-100');

            return back()->with('message', 'Job posted successfully.');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error('Error creating vacancy: '.$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to post job vacancy: '.$ex->getMessage()]);
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
                'plantilla_item' => 'nullable|string|max:255',
                'department' => 'required|string|max:255',
                'employmentType' => 'required|string',
                'description' => 'required|string',
                'competency' => 'nullable|string',
                'responsibilities' => 'nullable',
                'requirements' => 'nullable',
                'qs_education' => 'nullable|string',
                'qs_experience' => 'nullable|string',
                'qs_eligibility' => 'nullable|string',
                'qs_training' => 'nullable|string',
                'salaryGrade' => 'nullable|integer',
                'deadline' => 'nullable|date',
                'status' => 'nullable|string|in:Open,Closed',
            ]);

            $vacancy->update([
                'title' => $validated['title'],
                'plantilla_item' => $validated['plantilla_item'] ?? $vacancy->plantilla_item,
                'department' => $validated['department'],
                'employment_type' => $validated['employmentType'],
                'location' => 'Villamor Air Base, Pasay City',
                'description' => $validated['description'],
                'competency' => $validated['competency'] ?? $vacancy->competency,
                'responsibilities' => $validated['responsibilities'] ?? $vacancy->responsibilities,
                'requirements' => $validated['requirements'] ?? $vacancy->requirements,
                'qs_education' => $validated['qs_education'] ?? $vacancy->qs_education,
                'qs_experience' => $validated['qs_experience'] ?? $vacancy->qs_experience,
                'qs_eligibility' => $validated['qs_eligibility'] ?? $vacancy->qs_eligibility,
                'qs_training' => $validated['qs_training'] ?? $vacancy->qs_training,
                'salary_grade' => $validated['salaryGrade'] ?? $vacancy->salary_grade,
                'deadline' => $validated['deadline'] ?? $vacancy->deadline,
                'custom_file_requirements' => $request->custom_file_requirements ?? $vacancy->custom_file_requirements,
                'status' => $validated['status'] ?? $vacancy->status,
            ]);

            \App\Models\ActivityLog::write('Updated Job Vacancy', "Updated details for job vacancy '{$vacancy->title}'.", 'Job Management', 'Briefcase', 'text-indigo-600 bg-indigo-100');

            return back()->with('message', 'Job updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error("Error updating vacancy ID {$vacancy->id}: ".$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to update job vacancy: '.$ex->getMessage()]);
        }
    }

    /**
     * Remove the specified vacancy.
     */
    public function destroy(Vacancy $vacancy)
    {
        try {
            $title = $vacancy->title;
            \App\Models\Application::where('job_id', $vacancy->id)->delete();
            $vacancy->delete();

            \App\Models\ActivityLog::write('Deleted Job Vacancy', "Deleted job vacancy position '{$title}'.", 'Job Management', 'Trash2', 'text-red-600 bg-red-100');

            return back()->with('message', 'Job deleted successfully.');
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error("Error deleting vacancy ID {$vacancy->id}: ".$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to delete job vacancy: '.$ex->getMessage()]);
        }
    }

    /**
     * Store a newly created Department folder in MySQL.
     */
    public function storeDepartment(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'parent_id' => 'nullable|exists:departments,id',
            ]);

            $name = trim($validated['name']);
            $parentId = $validated['parent_id'] ?? null;
            $code = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 4));

            $existing = Department::where('name', $name)
                ->where('parent_id', $parentId)
                ->first();

            if ($existing) {
                return back()->withErrors(['name' => 'A folder with this name already exists in this location.']);
            }

            Department::create([
                'name' => $name,
                'parent_id' => $parentId,
                'code' => $code,
            ]);

            return back()->with('message', "Program folder '{$name}' created successfully.");
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::error('Error creating department folder: '.$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to create department folder: '.$ex->getMessage()]);
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
            \Illuminate\Support\Facades\Log::error("Error deleting department ID {$department->id}: ".$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to delete department folder: '.$ex->getMessage()]);
        }
    }
}
