<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CalendarEvent;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    /**
     * Get events for the authenticated user.
     */
    public function index()
    {
        $events = CalendarEvent::where('user_id', Auth::id())
            ->orWhereNull('user_id')
            ->latest()
            ->get();
            
        return response()->json($events);
    }

    /**
     * Store a new custom event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'type' => 'required|string',
            'venue' => 'nullable|string',
            'panel_members' => 'nullable|string',
            'result_notes' => 'nullable|string',
        ]);

        $event = CalendarEvent::create(array_merge(
            $validated,
            ['user_id' => Auth::id()]
        ));

        return response()->json($event, 201);
    }

    /**
     * Delete an event.
     */
    public function destroy(CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized action.'], 403);
        }

        $calendarEvent->delete();

        return response()->json(['success' => true]);
    }
}
