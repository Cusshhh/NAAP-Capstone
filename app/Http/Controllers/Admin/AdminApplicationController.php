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
        ]);

        $oldStatus = $application->status;
        $application->update([
            'status' => $validated['status'],
        ]);

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
}
