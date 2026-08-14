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
        ]);
    }
}
