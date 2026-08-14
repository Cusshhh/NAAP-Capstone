<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    /**
     * Retrieve all activity logs from database.
     */
    public function index()
    {
        $logs = ActivityLog::with('user')->latest()->get();

        return response()->json($logs);
    }
}
