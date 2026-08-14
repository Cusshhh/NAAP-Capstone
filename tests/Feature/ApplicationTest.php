<?php

use App\Models\Application;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can withdraw their own application', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Submitted',
    ]);

    $response = $this->postJson("/applications/{$application->id}/withdraw");

    $response->assertOk();
    $response->assertJson(['success' => true]);
    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
        'status' => 'Withdrawn',
    ]);
});

test('authenticated user cannot withdraw someone else application', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user2->email,
        'applicant_name' => $user2->name,
        'status' => 'Submitted',
    ]);

    $this->actingAs($user1);
    $response = $this->postJson("/applications/{$application->id}/withdraw");

    $response->assertStatus(403);
    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
        'status' => 'Submitted',
    ]);
});

test('authenticated user can delete their own application permanently', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Withdrawn',
    ]);

    $response = $this->deleteJson("/applications/{$application->id}");

    $response->assertOk();
    $response->assertJson(['success' => true]);
    $this->assertDatabaseMissing('applications', [
        'id' => $application->id,
    ]);
});

test('authenticated user cannot delete someone else application', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user2->email,
        'applicant_name' => $user2->name,
        'status' => 'Withdrawn',
    ]);

    $this->actingAs($user1);
    $response = $this->deleteJson("/applications/{$application->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
    ]);
});

test('deleting an application cascades and deletes related messages', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create(['email' => 'admin@naap.edu.ph']);

    $this->actingAs($user);

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Withdrawn',
    ]);

    $message = Message::create([
        'application_id' => $application->id,
        'sender_id' => $admin->id,
        'receiver_id' => $user->id,
        'content' => 'Hello message',
        'is_read' => false,
    ]);

    $this->assertDatabaseHas('messages', [
        'id' => $message->id,
    ]);

    $response = $this->deleteJson("/applications/{$application->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('applications', [
        'id' => $application->id,
    ]);
    $this->assertDatabaseMissing('messages', [
        'id' => $message->id,
    ]);
});
