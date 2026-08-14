<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    /**
     * Get events for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([]);
        }

        $adminUserIds = \App\Models\User::whereIn('email', ['admin@naap.edu.ph', 'admin@admin.com'])
            ->pluck('id')
            ->toArray();

        if ($user->isAdmin() || in_array($user->email, ['admin@naap.edu.ph', 'admin@admin.com'])) {
            // HR Admin sees: Admin events, null user_id events, or public events
            $events = CalendarEvent::whereIn('user_id', $adminUserIds)
                ->orWhereNull('user_id')
                ->orWhere('is_public', true)
                ->latest()
                ->get();
        } else {
            // Applicant sees: ONLY their own personal events or public events
            $events = CalendarEvent::where('user_id', $user->id)
                ->orWhere('is_public', true)
                ->latest()
                ->get();
        }

        return response()->json($events);
    }

    /**
     * Store a new custom event.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string',
                'date' => 'required',
                'time' => 'required|string',
                'type' => 'required|string',
                'venue' => 'nullable|string',
                'panel_members' => 'nullable|string',
                'result_notes' => 'nullable|string',
            ]);

            // Ensure date is formatted as YYYY-MM-DD
            $dateStr = date('Y-m-d', strtotime($validated['date']));

            $event = CalendarEvent::create(array_merge(
                $validated,
                [
                    'date' => $dateStr,
                    'user_id' => Auth::id(),
                ]
            ));

            return response()->json($event, 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json(['errors' => $ve->errors(), 'message' => $ve->getMessage()], 422);
        } catch (\Throwable $ex) {
            \Log::error('CalendarEvent Store Error: '.$ex->getMessage());

            return response()->json(['error' => $ex->getMessage(), 'message' => $ex->getMessage()], 500);
        }
    }

    /**
     * Delete an event.
     */
    public function destroy(CalendarEvent $calendarEvent)
    {
        $user = Auth::user();
        if (! $user->isAdmin() && $calendarEvent->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        $calendarEvent->delete();

        return response()->json(['success' => true]);
    }
}
