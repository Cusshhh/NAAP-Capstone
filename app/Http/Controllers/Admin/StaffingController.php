<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\StaffingPosition;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/StaffingMonitoring', [
            'staffingData' => StaffingPosition::latest()->get(),
            'dbApplications' => \App\Models\Application::select('id', 'applicant_name', 'job_title', 'status', 'created_at')->latest()->get()->map(function ($app) {
                return [
                    'id' => $app->id,
                    'applicantName' => $app->applicant_name,
                    'jobTitle' => $app->job_title,
                    'status' => $app->status,
                    'submittedDate' => $app->created_at ? $app->created_at->toISOString() : null,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'office' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'sg' => 'required|integer',
            'status' => 'nullable|string|in:Filled,Unfilled,On-process',
            'campus' => 'nullable|string|max:255',
            'plantilla_item' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'qs_education' => 'nullable|string',
            'qs_experience' => 'nullable|string',
            'qs_eligibility' => 'nullable|string',
            'qs_training' => 'nullable|string',
            'description' => 'nullable|string',
            'competency' => 'nullable|string',
            'responsibilities' => 'nullable',
            'requirements' => 'nullable',
            'deadline' => 'nullable|date',
            'custom_file_requirements' => 'nullable|array',
        ]);

        $position = StaffingPosition::create([
            'campus' => $validated['campus'] ?? 'Villamor Air Base, Pasay City',
            'office' => $validated['office'],
            'position' => $validated['position'],
            'sg' => $validated['sg'],
            'status' => $validated['status'] ?? 'Unfilled',
            'plantilla_item' => $validated['plantilla_item'] ?? null,
            'employment_type' => $validated['employment_type'] ?? 'Full-time',
            'location' => $validated['location'] ?? 'Villamor Air Base, Pasay City',
            'qs_education' => $validated['qs_education'] ?? null,
            'qs_experience' => $validated['qs_experience'] ?? null,
            'qs_eligibility' => $validated['qs_eligibility'] ?? null,
            'qs_training' => $validated['qs_training'] ?? null,
            'description' => $validated['description'] ?? null,
            'competency' => $validated['competency'] ?? null,
            'responsibilities' => is_array($validated['responsibilities'] ?? null) ? $validated['responsibilities'] : (is_string($validated['responsibilities'] ?? null) ? array_filter(explode("\n", $validated['responsibilities'])) : null),
            'requirements' => is_array($validated['requirements'] ?? null) ? $validated['requirements'] : null,
            'deadline' => $validated['deadline'] ?? null,
            'custom_file_requirements' => $validated['custom_file_requirements'] ?? null,
        ]);

        ActivityLog::write('Saved Staffing Position', "Saved new staffing position '{$position->position}' for {$position->office}.", 'Staffing Monitoring', 'Building2', 'text-blue-600 bg-blue-100');

        return redirect()->back()->with('success', "Position '{$position->position}' saved successfully and ready for posting.");
    }

    public function postJob($id)
    {
        $position = StaffingPosition::findOrFail($id);

        $compiledRequirements = array_filter([
            $position->qs_education ? "Education: {$position->qs_education}" : null,
            $position->qs_experience ? "Experience: {$position->qs_experience}" : null,
            $position->qs_eligibility ? "Eligibility: {$position->qs_eligibility}" : null,
            $position->qs_training ? "Training: {$position->qs_training}" : null,
        ]);

        if (is_array($position->requirements)) {
            $compiledRequirements = array_merge($compiledRequirements, $position->requirements);
        }

        $vacancy = Vacancy::create([
            'staffing_id' => $position->id,
            'title' => $position->position,
            'department' => $position->office,
            'employment_type' => $position->employment_type ?? 'Full-time',
            'location' => $position->location ?? 'Villamor Air Base, Pasay City',
            'description' => $position->description ?: "Vacancy position for {$position->position} at {$position->office}.",
            'responsibilities' => $position->responsibilities ?? [],
            'requirements' => array_values($compiledRequirements),
            'salary_grade' => $position->sg,
            'deadline' => $position->deadline ?? null,
            'custom_file_requirements' => $position->custom_file_requirements ?? null,
            'status' => 'Open',
        ]);

        $position->update(['status' => 'On-process']);

        ActivityLog::write('Created Job Vacancy from Staffing', "Automatically posted vacancy position '{$vacancy->title}' from Staffing Monitoring.", 'Job Management', 'Briefcase', 'text-green-600 bg-green-100');

        return redirect()->route('admin.jobs')->with('message', "Position '{$vacancy->title}' posted successfully!");
    }

    public function destroy($id)
    {
        StaffingPosition::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Staffing position deleted successfully.');
    }

    public function clearAll()
    {
        StaffingPosition::query()->delete();
        return redirect()->back()->with('success', 'All staffing positions cleared successfully.');
    }
}
