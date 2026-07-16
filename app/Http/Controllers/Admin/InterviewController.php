<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Interview;
use App\Models\Application;
use App\Models\ActivityLog;

class InterviewController extends Controller
{
    /**
     * Display a listing of scheduled interviews.
     */
    public function index()
    {
        $interviews = Interview::latest()->get();
        return response()->json($interviews);
    }

    /**
     * Store a newly scheduled interview.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'date' => 'required|date',
            'time' => 'required|string',
            'panel_members' => 'nullable|string',
            'venue' => 'required|string',
            'notify_applicant' => 'boolean',
            'result_notes' => 'nullable|string',
            'candidate_name' => 'required|string',
            'position' => 'required|string',
            'applicant_email' => 'required|string',
        ]);

        $interview = Interview::updateOrCreate(
            ['application_id' => $validated['application_id']],
            $validated
        );

        // Also write activity log
        ActivityLog::write(
            'Interview Scheduled',
            "Scheduled interview with {$interview->candidate_name} for {$interview->position}",
            $interview->application ? $interview->application->campus : 'System',
            'Calendar',
            'text-purple-500 bg-purple-100'
        );

        return response()->json($interview, 201);
    }

    /**
     * Update an interview resource.
     */
    public function update(Request $request, Interview $interview)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required|string',
            'panel_members' => 'nullable|string',
            'venue' => 'required|string',
            'notify_applicant' => 'boolean',
            'result_notes' => 'nullable|string',
        ]);

        $interview->update($validated);

        // Write activity log
        ActivityLog::write(
            'Interview Updated',
            "Updated interview with {$interview->candidate_name} for {$interview->position}",
            $interview->application ? $interview->application->campus : 'System',
            'Calendar',
            'text-blue-500 bg-blue-100'
        );

        return response()->json($interview);
    }

    /**
     * Delete an interview.
     */
    public function destroy(Interview $interview)
    {
        $candidate = $interview->candidate_name;
        $position = $interview->position;
        $campus = $interview->application ? $interview->application->campus : 'System';

        $interview->delete();

        // Write activity log
        ActivityLog::write(
            'Interview Cancelled',
            "Cancelled interview with {$candidate} for {$position}",
            $campus,
            'XCircle',
            'text-red-500 bg-red-100'
        );

        return response()->json(['success' => true]);
    }
}
