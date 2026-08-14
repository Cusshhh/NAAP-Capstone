<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index($application)
    {
        try {
            $application_id = $application;
            $application = Application::findOrFail($application_id);

            // Ensure user is authorized
            $user = Auth::user();
            $adminEmails = ['admin@naap.edu.ph', 'admin@admin.com'];
            $isAdmin = $user->isAdmin() || in_array($user->email, $adminEmails);

            if (! $isAdmin && $application->email !== $user->email) {
                abort(403, 'Unauthorized access to messages.');
            }

            // Fetch all applications belonging to this applicant to unify the conversation thread
            $applicantAppIds = Application::where('email', $application->email)->pluck('id');

            // Mark unread messages across all applicant's applications as read
            Message::whereIn('application_id', $applicantAppIds)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            // Fetch all messages for this applicant with sender & application data
            $messages = Message::with(['sender:id,name,email', 'application:id,job_title'])
                ->whereIn('application_id', $applicantAppIds)
                ->oldest()
                ->get();

            return response()->json($messages);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $he) {
            throw $he;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $me) {
            return response()->json(['error' => 'Application not found'], 404);
        } catch (\Throwable $ex) {
            Log::error('FetchMessages Error: '.$ex->getMessage());

            return response()->json(['error' => 'Failed to fetch messages'], 500);
        }
    }

    public function store(Request $request, $application)
    {
        $application_id = $application;
        $application = Application::findOrFail($application_id);
        $user = Auth::user();

        $adminEmails = ['admin@naap.edu.ph', 'admin@admin.com'];
        $isAdmin = $user->isAdmin() || in_array($user->email, $adminEmails);

        if (! $isAdmin && $application->email !== $user->email) {
            abort(403, 'Unauthorized access to messages.');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // Determine receiver. If Admin sends -> Applicant. If Applicant sends -> Admin.

        $applicantUser = \App\Models\User::where('email', $application->email)->first();

        try {
            $adminUser = \App\Models\User::whereIn('email', $adminEmails)->first();

            $receiverId = $isAdmin ? ($applicantUser ? $applicantUser->id : null) : ($adminUser ? $adminUser->id : null);

            $message = Message::create([
                'application_id' => $application->id,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'content' => $validated['content'],
                'is_read' => false,
            ]);

            return response()->json($message->load(['sender:id,name,email', 'application:id,job_title']), 201);
        } catch (\Exception $e) {
            Log::error('SendMessage Error: '.$e->getMessage().' | Trace: '.$e->getTraceAsString());

            return response()->json(['error' => 'Server Error: '.$e->getMessage()], 500);
        }
    }

    public function destroy($application)
    {
        try {
            $user = Auth::user();
            $adminEmails = ['admin@naap.edu.ph', 'admin@admin.com'];
            $isAdmin = $user->isAdmin() || in_array($user->email, $adminEmails);

            if (! $isAdmin) {
                return response()->json(['error' => 'Unauthorized action.'], 403);
            }

            // Delete all messages for this application ID
            Message::where('application_id', $application)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Conversation cleared successfully.',
            ]);
        } catch (\Throwable $ex) {
            Log::error('DeleteMessages Error: '.$ex->getMessage());

            return response()->json(['error' => 'Failed to clear conversation'], 500);
        }
    }
}
