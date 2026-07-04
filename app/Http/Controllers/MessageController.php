<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Application;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index($application)
    {
        $application_id = $application;
        $application = Application::findOrFail($application_id);
        
        // Ensure user is authorized
        $user = Auth::user();
        $adminEmails = ['admin@naap.edu.ph', 'admin@admin.com'];
        $isAdmin = in_array($user->email, $adminEmails);
        
        if (!$isAdmin && $application->email !== $user->email) {
            abort(403, 'Unauthorized access to messages.');
        }

        // Mark other party's unread messages as read
        Message::where('application_id', $application_id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Fetch messages with sender data
        $messages = Message::with('sender:id,name,email')
            ->where('application_id', $application_id)
            ->oldest()
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, $application)
    {
        $application_id = $application;
        $application = Application::findOrFail($application_id);
        $user = Auth::user();
        
        $adminEmails = ['admin@naap.edu.ph', 'admin@admin.com'];
        $isAdmin = in_array($user->email, $adminEmails);
        
        if (!$isAdmin && $application->email !== $user->email) {
            abort(403, 'Unauthorized access to messages.');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        // Determine receiver. If Admin sends -> Applicant. If Applicant sends -> Admin.
        // Wait, multiple admins could exist. We can just set receiver_id to the applicant's user ID if admin sends,
        // and if applicant sends, we set it to the primary admin's ID (or nullable, but schema requires it).
        // Let's find the applicant's user model and the admin user model.
        
        $applicantUser = \App\Models\User::where('email', $application->email)->first();
        // Removed the strict 404 check so Admins can still "send" messages to offline/mock applicants

        try {
            $adminUser = \App\Models\User::whereIn('email', $adminEmails)->first();

            $receiverId = $isAdmin ? ($applicantUser ? $applicantUser->id : null) : ($adminUser ? $adminUser->id : null);

            $message = Message::create([
                'application_id' => $application->id,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'content' => $validated['content'],
                'is_read' => false
            ]);

            return response()->json($message->load('sender:id,name,email'), 201);
        } catch (\Exception $e) {
            \Log::error('SendMessage Error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}
