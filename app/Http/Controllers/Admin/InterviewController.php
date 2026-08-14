<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InterviewController extends Controller
{
    /**
     * Display a listing of scheduled interviews.
     */
    public function index()
    {
        try {
            $interviews = Interview::latest()->get();

            return response()->json($interviews);
        } catch (\Throwable $ex) {
            Log::error('Error fetching interviews: '.$ex->getMessage());

            return response()->json(['error' => 'Failed to fetch interviews'], 500);
        }
    }

    /**
     * Store a newly scheduled interview.
     */
    public function store(Request $request)
    {
        try {
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

            // Update application status to Interview Scheduled
            $application = Application::find($validated['application_id']);
            if ($application) {
                $application->update(['status' => 'Interview Scheduled']);
            }

            // Also write activity log
            try {
                ActivityLog::write(
                    'Interview Scheduled',
                    "Scheduled interview with {$interview->candidate_name} for {$interview->position}",
                    $interview->application ? $interview->application->campus : 'System',
                    'Calendar',
                    'text-purple-500 bg-purple-100'
                );
            } catch (\Throwable $logEx) {
                Log::warning('ActivityLog failed: '.$logEx->getMessage());
            }

            return response()->json($interview, 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            Log::error('Error storing interview: '.$ex->getMessage());

            return response()->json(['error' => 'Failed to schedule interview: '.$ex->getMessage()], 500);
        }
    }

    /**
     * Update an interview resource.
     */
    public function update(Request $request, Interview $interview)
    {
        try {
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
            try {
                ActivityLog::write(
                    'Interview Updated',
                    "Updated interview with {$interview->candidate_name} for {$interview->position}",
                    $interview->application ? $interview->application->campus : 'System',
                    'Calendar',
                    'text-blue-500 bg-blue-100'
                );
            } catch (\Throwable $logEx) {
                Log::warning('ActivityLog failed: '.$logEx->getMessage());
            }

            return response()->json($interview);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            Log::error("Error updating interview ID {$interview->id}: ".$ex->getMessage());

            return response()->json(['error' => 'Failed to update interview: '.$ex->getMessage()], 500);
        }
    }

    /**
     * Delete an interview.
     */
    public function destroy(Interview $interview)
    {
        try {
            $candidate = $interview->candidate_name;
            $position = $interview->position;
            $campus = $interview->application ? $interview->application->campus : 'System';

            $interview->delete();

            // Write activity log
            try {
                ActivityLog::write(
                    'Interview Cancelled',
                    "Cancelled interview with {$candidate} for {$position}",
                    $campus,
                    'XCircle',
                    'text-red-500 bg-red-100'
                );
            } catch (\Throwable $logEx) {
                Log::warning('ActivityLog failed: '.$logEx->getMessage());
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $ex) {
            Log::error("Error deleting interview ID {$interview->id}: ".$ex->getMessage());

            return response()->json(['error' => 'Failed to delete interview: '.$ex->getMessage()], 500);
        }
    }
}
