<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Mail\ApplicantHiredMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminApplicationController extends Controller
{
    public function updateStatus(Request $request, Application $application)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Submitted,Under Review,Shortlisted,Rejected,Hired,Archived',
            'rejection_reason' => 'nullable|string',
        ]);

        $oldStatus = $application->status;
        
        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'Rejected' && isset($validated['rejection_reason'])) {
            $dyn = $application->dynamic_responses ?? [];
            $dyn['rejection_reason'] = $validated['rejection_reason'];
            $updateData['dynamic_responses'] = $dyn;
        }

        $application->update($updateData);

        // Trigger email if status changed to Hired
        if ($validated['status'] === 'Hired' && $oldStatus !== 'Hired') {
            Mail::to($application->email)->send(new ApplicantHiredMail($application));
            
            // Sync with Staffing Monitoring if the vacancy is linked
            $vacancy = \App\Models\Vacancy::find($application->job_id);
            if ($vacancy && $vacancy->staffing_id) {
                $staffing = \App\Models\StaffingPosition::find($vacancy->staffing_id);
                if ($staffing) {
                    $staffing->update(['status' => 'Filled']);
                }
            }
        }

        return back()->with('message', 'Application status updated successfully.');
    }

    public function exportReport(Request $request)
    {
        $query = Application::query();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $applications = $query->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="applications_report_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($applications) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, [
                'ID',
                'Candidate Name',
                'Email',
                'Job Title',
                'Campus',
                'Education',
                'Status',
                'Submitted Date',
            ]);

            foreach ($applications as $app) {
                fputcsv($file, [
                    $app->id,
                    $app->applicant_name,
                    $app->email,
                    $app->job_title,
                    $app->campus,
                    $app->education,
                    $app->status,
                    $app->created_at ? $app->created_at->toDateString() : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
