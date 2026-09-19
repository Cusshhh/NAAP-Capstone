<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaffingPosition;
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
            'status' => 'required|string|in:Filled,Unfilled,On-process',
            'campus' => 'nullable|string|max:255',
        ]);

        StaffingPosition::create([
            'campus' => $validated['campus'] ?? 'Villamor Air Base, Pasay City',
            'office' => $validated['office'],
            'position' => $validated['position'],
            'sg' => $validated['sg'],
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Staffing position created successfully.');
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
