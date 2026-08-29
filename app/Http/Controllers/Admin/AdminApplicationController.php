<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ApplicantHiredMail;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminApplicationController extends Controller
{
    public function updateStatus(Request $request, Application $application)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:Submitted,Under Review,Shortlisted,Interview,Interview Scheduled,Rejected,Hired,Archived',
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

            try {
                \App\Models\ActivityLog::write(
                    "Status Updated: {$validated['status']}",
                    "{$application->applicant_name}'s application status for {$application->job_title} was updated to {$validated['status']}",
                    'Villamor Campus',
                    'UserCheck',
                    'text-indigo-600 bg-indigo-50'
                );
            } catch (\Exception $ex) {
                Log::warning('Failed writing ActivityLog: '.$ex->getMessage());
            }

            // Trigger email if status changed to Hired
            if ($validated['status'] === 'Hired' && $oldStatus !== 'Hired') {
                try {
                    Mail::to($application->email)->send(new ApplicantHiredMail($application));
                } catch (\Throwable $mailEx) {
                    Log::error("Failed sending Hired email to {$application->email}: ".$mailEx->getMessage());
                }
            }

            return back()->with('message', 'Application status updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $ex) {
            Log::error("Error updating status for application ID {$application->id}: ".$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to update application status: '.$ex->getMessage()]);
        }
    }

    public function exportReport(Request $request)
    {
        try {
            $query = Application::query();

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('job_title') && $request->job_title !== 'all') {
                $query->where('job_title', $request->job_title);
            }

            if ($request->filled('position') && $request->position !== 'all') {
                $query->where('job_title', $request->position);
            }

            // Order chronologically for clean 1, 2, 3... numbering
            $applications = $query->orderBy('id', 'asc')->get();

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="naap_hr_applications_report_'.date('Y-m-d').'.csv"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            $callback = function () use ($applications) {
                $file = fopen('php://output', 'w');

                // Add UTF-8 BOM so Excel opens special characters correctly
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

                fputcsv($file, [
                    'No.',
                    'Application ID',
                    'Candidate Name',
                    'Email Address',
                    'Contact Number',
                    'Position Applied For',
                    'Campus / Station',
                    'Educational Attainment',
                    'Eligibilities & Licenses',
                    'Years of Relevant Experience',
                    'Training / Seminar Hours',
                    'Awards & Recognitions',
                    'Skills & Competencies',
                    'Complete Address',
                    'Age',
                    'Sex / Gender',
                    'Civil Status',
                    'Indigenous People (IP)',
                    'Person with Disability (PWD)',
                    'Uploaded Documents Summary',
                    'Custom Extra Documents Uploaded',
                    'Documents to Follow',
                    'Application Status',
                    'Status Notes / Rejection Reason',
                    'Submission Date',
                    'Last Updated Date',
                ]);

                $rowNum = 1;
                foreach ($applications as $app) {
                    $dyn = $app->dynamic_responses ?? [];
                    
                    // Format Eligibilities
                    $eligibilities = isset($dyn['eligibilities']) && is_array($dyn['eligibilities'])
                        ? implode('; ', $dyn['eligibilities'])
                        : ($dyn['eligibilities'] ?? 'N/A');

                    // Format Skills
                    $skills = isset($dyn['skills']) && is_array($dyn['skills'])
                        ? implode(', ', $dyn['skills'])
                        : ($dyn['skills'] ?? 'N/A');

                    // Format Awards
                    $awards = isset($dyn['awards']) && is_array($dyn['awards'])
                        ? implode(', ', $dyn['awards'])
                        : ($dyn['awards'] ?? 'N/A');

                    // Format Uploaded Standard Documents
                    $uploadedDocsList = isset($dyn['documents']) && is_array($dyn['documents'])
                        ? implode(', ', array_map(fn($d) => is_array($d) ? ($d['name'] ?? 'Document') : $d, $dyn['documents']))
                        : 'N/A';

                    // Format Custom File Uploads
                    $customFilesList = 'None';
                    if (!empty($app->custom_file_responses) && is_array($app->custom_file_responses)) {
                        $customFilesList = implode(', ', array_keys($app->custom_file_responses));
                    }

                    // Format Documents to Follow
                    $toFollow = is_array($app->to_follow_docs) && !empty($app->to_follow_docs)
                        ? implode(', ', $app->to_follow_docs)
                        : 'None';

                    // Clean phone number formatting for Excel text display (prevents 9.22E+09)
                    $rawPhone = $app->phone_number ?? ($dyn['contactNumber'] ?? 'N/A');
                    $phoneFormatted = ($rawPhone !== 'N/A') ? ' '.$rawPhone : 'N/A';

                    // Standardize capitalization (Male/Female, Married/Single)
                    $sexFormatted = isset($dyn['sex']) && $dyn['sex'] ? ucfirst(strtolower($dyn['sex'])) : 'N/A';
                    $civilFormatted = isset($dyn['civilStatus']) && $dyn['civilStatus'] ? ucfirst(strtolower($dyn['civilStatus'])) : 'N/A';
                    $educationFormatted = $app->education ? ucfirst($app->education) : 'N/A';

                    // Standardize IP and PWD
                    $isIPFormatted = isset($dyn['isIP']) && $dyn['isIP'] ? ucfirst($dyn['isIP']) : 'No';
                    $isPWDFormatted = isset($dyn['isPWD']) && $dyn['isPWD'] ? ucfirst($dyn['isPWD']) : 'No';

                    // Format dates cleanly to prevent ### hashtag display in Excel
                    $submittedDate = $app->created_at ? $app->created_at->format('Y-m-d H:i:s') : 'N/A';
                    $updatedDate = $app->updated_at ? $app->updated_at->format('Y-m-d H:i:s') : 'N/A';

                    fputcsv($file, [
                        $rowNum++,
                        $app->id,
                        $app->applicant_name,
                        $app->email,
                        $phoneFormatted,
                        $app->job_title,
                        'Villamor Air Base, Pasay City',
                        $educationFormatted,
                        $eligibilities,
                        $dyn['yearsOfExperience'] ?? 'N/A',
                        $dyn['trainingHours'] ?? 'N/A',
                        $awards,
                        $skills,
                        $dyn['address'] ?? 'N/A',
                        $dyn['age'] ?? 'N/A',
                        $sexFormatted,
                        $civilFormatted,
                        $isIPFormatted,
                        $isPWDFormatted,
                        $uploadedDocsList,
                        $customFilesList,
                        $toFollow,
                        $app->status,
                        $dyn['rejection_reason'] ?? 'N/A',
                        $submittedDate,
                        $updatedDate,
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Throwable $ex) {
            Log::error('Error exporting application CSV report: '.$ex->getMessage());

            return back()->withErrors(['error' => 'Failed to export CSV report: '.$ex->getMessage()]);
        }
    }
}
