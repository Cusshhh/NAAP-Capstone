<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaffingPosition;
use Inertia\Inertia;

class StaffingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/StaffingMonitoring', [
            'staffingData' => StaffingPosition::all(),
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
}
