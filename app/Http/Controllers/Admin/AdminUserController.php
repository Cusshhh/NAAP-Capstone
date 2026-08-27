<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * Store a newly created HR Administrator in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'designation' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $adminUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_data' => [
                'is_admin' => true,
                'role' => 'admin',
                'designation' => $request->designation ?: 'HR Officer',
                'phone_number' => $request->phone_number ?: 'N/A',
                'contact_number' => $request->phone_number ?: 'N/A',
            ],
        ]);

        // Log to Activity Log
        ActivityLog::write('Created Admin Account', "Created new official Admin account for {$adminUser->name} ({$adminUser->email}).", 'User Management', 'UserPlus', 'text-blue-600 bg-blue-100');

        return back()->with('success', 'Admin account created successfully!');
    }

    /**
     * Remove the specified HR Administrator.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Prevent deleting primary demo admin or self
        if ($user->id === $request->user()->id || $user->email === 'admin@naap.edu.ph') {
            return back()->withErrors(['message' => 'Cannot delete primary active system administrator account.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $user->delete();

        // Log to Activity Log
        ActivityLog::write('Revoked Admin Access', "Revoked admin access for {$userName} ({$userEmail}).", 'User Management', 'Trash2', 'text-red-600 bg-red-100');

        return back()->with('success', 'HR Admin account revoked successfully.');
    }
}
