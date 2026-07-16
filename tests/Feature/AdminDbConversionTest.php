<?php

use App\Models\User;
use App\Models\Vacancy;
use App\Models\Application;
use App\Models\Interview;
use App\Models\CalendarEvent;
use App\Models\ActivityLog;

beforeEach(function () {
    $this->admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@naap.edu.ph',
        'password' => bcrypt('password'),
    ]);

    $this->applicant = User::create([
        'name' => 'Applicant User',
        'email' => 'applicant@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->vacancy = Vacancy::create([
        'title' => 'Flight Instructor',
        'description' => 'Test flight instructor position',
        'department' => 'Aviation',
        'employment_type' => 'Full-time',
        'location' => 'Villamor Campus',
        'status' => 'Open',
        'requirements' => [],
    ]);

    $this->application = Application::create([
        'job_id' => $this->vacancy->id,
        'job_title' => $this->vacancy->title,
        'email' => $this->applicant->email,
        'applicant_name' => $this->applicant->name,
        'phone_number' => '1234567890',
        'education' => 'Bachelor of Science in Aviation',
        'status' => 'Submitted',
    ]);
});

// --- Scheduled Interviews ---

test('authenticated user can schedule an interview and retrieve it', function () {
    $this->actingAs($this->admin);

    $response = $this->postJson('/admin/interviews', [
        'application_id' => $this->application->id,
        'date' => '2026-08-01',
        'time' => '10:00 AM',
        'panel_members' => 'Captain Jack, Captain Cook',
        'venue' => 'Villamor Boardroom',
        'notify_applicant' => true,
        'candidate_name' => $this->application->applicant_name,
        'position' => $this->application->job_title,
        'applicant_email' => $this->application->email,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('interviews', [
        'application_id' => $this->application->id,
        'venue' => 'Villamor Boardroom',
    ]);

    // Also assert activity log was created
    $this->assertDatabaseHas('activity_logs', [
        'action' => 'Interview Scheduled',
    ]);

    // Get interviews
    $getRes = $this->getJson('/admin/interviews');
    $getRes->assertStatus(200);
    $getRes->assertJsonFragment(['venue' => 'Villamor Boardroom']);
});

test('authenticated user can update and delete an interview', function () {
    $this->actingAs($this->admin);

    $interview = Interview::create([
        'application_id' => $this->application->id,
        'date' => '2026-08-01',
        'time' => '10:00 AM',
        'venue' => 'Old Room',
        'candidate_name' => $this->application->applicant_name,
        'position' => $this->application->job_title,
        'applicant_email' => $this->application->email,
    ]);

    $updateRes = $this->putJson("/admin/interviews/{$interview->id}", [
        'date' => '2026-08-02',
        'time' => '11:00 AM',
        'venue' => 'New Room',
        'notify_applicant' => false,
    ]);

    $updateRes->assertStatus(200);
    $this->assertDatabaseHas('interviews', [
        'id' => $interview->id,
        'venue' => 'New Room',
    ]);

    $deleteRes = $this->deleteJson("/admin/interviews/{$interview->id}");
    $deleteRes->assertStatus(200);
    $this->assertDatabaseMissing('interviews', [
        'id' => $interview->id,
    ]);
});

// --- Calendar Events ---

test('authenticated user can create, retrieve, and delete calendar events', function () {
    $this->actingAs($this->applicant);

    $response = $this->postJson('/calendar/events', [
        'title' => 'My Interview Prep',
        'date' => '2026-07-20',
        'time' => '09:00 AM',
        'type' => 'Personal',
        'venue' => 'My House',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('calendar_events', [
        'title' => 'My Interview Prep',
        'user_id' => $this->applicant->id,
    ]);

    $getRes = $this->getJson('/calendar/events');
    $getRes->assertStatus(200);
    $getRes->assertJsonFragment(['title' => 'My Interview Prep']);

    $event = CalendarEvent::where('title', 'My Interview Prep')->first();
    
    // Non-owner cannot delete
    $this->actingAs($this->admin);
    $deleteRes = $this->deleteJson("/calendar/events/{$event->id}");
    $deleteRes->assertStatus(403);

    // Owner can delete
    $this->actingAs($this->applicant);
    $deleteRes = $this->deleteJson("/calendar/events/{$event->id}");
    $deleteRes->assertStatus(200);
    $this->assertDatabaseMissing('calendar_events', [
        'id' => $event->id,
    ]);
});

// --- Activity Logs ---

test('authenticated user can retrieve activity logs', function () {
    $this->actingAs($this->admin);

    ActivityLog::create([
        'user_id' => $this->admin->id,
        'action' => 'Test Log',
        'details' => 'Detailed test message',
        'time' => 'Just now',
        'date' => '2026-07-16',
        'icon' => 'Shield',
        'color' => 'blue',
        'campus' => 'System',
    ]);

    $response = $this->getJson('/admin/activity-logs');
    $response->assertStatus(200);
    $response->assertJsonFragment(['action' => 'Test Log']);
});
