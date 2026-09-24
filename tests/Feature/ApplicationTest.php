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

test('authenticated user cannot delete application permanently due to government retention rules', function () {
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

    $response->assertStatus(403);
    $response->assertJsonStructure(['error']);
    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
    ]);
});

test('admin cannot modify status of a withdrawn application', function () {
    $admin = User::factory()->create(['email' => 'admin@naap.edu.ph']);
    $user = User::factory()->create();

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Withdrawn',
    ]);

    $this->actingAs($admin);
    $response = $this->postJson("/admin/applications/{$application->id}/status", [
        'status' => 'Hired',
    ]);

    $response->assertStatus(422);
    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
        'status' => 'Withdrawn',
    ]);
});

test('authenticated user can upload a to-follow document', function () {
    \Illuminate\Support\Facades\Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    $application = Application::create([
        'job_id' => 1,
        'job_title' => 'Test Job',
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Submitted',
        'to_follow_docs' => ['PDS', 'Transcript of Records'],
        'custom_file_responses' => [],
    ]);

    $file = \Illuminate\Http\UploadedFile::fake()->create('pds.pdf', 100, 'application/pdf');

    $response = $this->post("/applications/{$application->id}/upload-to-follow", [
        'document_label' => 'PDS',
        'file' => $file,
    ]);

    $response->assertRedirect();

    $application->refresh();

    expect($application->to_follow_docs)->toEqual(['Transcript of Records']);
    expect(array_keys($application->custom_file_responses))->toContain('PDS');
});

test('applicant cannot submit multiple active applications simultaneously', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $vacancy1 = \App\Models\Vacancy::create(['title' => 'Position 1', 'department' => 'HR', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '11', 'status' => 'Open']);
    $vacancy2 = \App\Models\Vacancy::create(['title' => 'Position 2', 'department' => 'IT', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '12', 'status' => 'Open']);

    Application::create([
        'job_id' => $vacancy1->id,
        'job_title' => $vacancy1->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Under Review',
    ]);

    $response = $this->post('/applications', [
        'job_id' => $vacancy2->id,
        'job_title' => $vacancy2->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'phone_number' => '09123456789',
        'education' => 'bachelor',
    ]);

    $response->assertSessionHasErrors(['error']);
});

test('hired applicant cannot submit new job applications', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $vacancy1 = \App\Models\Vacancy::create(['title' => 'Position 1', 'department' => 'HR', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '11', 'status' => 'Open']);
    $vacancy2 = \App\Models\Vacancy::create(['title' => 'Position 2', 'department' => 'IT', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '12', 'status' => 'Open']);

    Application::create([
        'job_id' => $vacancy1->id,
        'job_title' => $vacancy1->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Hired',
    ]);

    $response = $this->post('/applications', [
        'job_id' => $vacancy2->id,
        'job_title' => $vacancy2->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'phone_number' => '09123456789',
        'education' => 'bachelor',
    ]);

    $response->assertSessionHasErrors(['error']);
});

test('applicant cannot apply within 60-day rejection cooldown period', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $vacancy1 = \App\Models\Vacancy::create(['title' => 'Position 1', 'department' => 'HR', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '11', 'status' => 'Open']);
    $vacancy2 = \App\Models\Vacancy::create(['title' => 'Position 2', 'department' => 'IT', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '12', 'status' => 'Open']);

    $rejectedApp = Application::create([
        'job_id' => $vacancy1->id,
        'job_title' => $vacancy1->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Rejected',
    ]);
    $rejectedApp->updated_at = now()->subDays(10);
    $rejectedApp->save();

    $response = $this->post('/applications', [
        'job_id' => $vacancy2->id,
        'job_title' => $vacancy2->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'phone_number' => '09123456789',
        'education' => 'bachelor',
    ]);

    $response->assertSessionHasErrors(['error']);
});

test('applicant can apply after 60-day rejection cooldown expires', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $vacancy1 = \App\Models\Vacancy::create(['title' => 'Position 1', 'department' => 'HR', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '11', 'status' => 'Open']);
    $vacancy2 = \App\Models\Vacancy::create(['title' => 'Position 2', 'department' => 'IT', 'employment_type' => 'Full-time', 'location' => 'Main', 'description' => 'Test', 'salary_grade' => '12', 'status' => 'Open']);

    $rejectedApp = Application::create([
        'job_id' => $vacancy1->id,
        'job_title' => $vacancy1->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'status' => 'Rejected',
    ]);
    $rejectedApp->updated_at = now()->subDays(61);
    $rejectedApp->save();

    $response = $this->post('/applications', [
        'job_id' => $vacancy2->id,
        'job_title' => $vacancy2->title,
        'email' => $user->email,
        'applicant_name' => $user->name,
        'phone_number' => '09123456789',
        'education' => 'bachelor',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('applications', [
        'job_id' => $vacancy2->id,
        'email' => $user->email,
        'status' => 'Submitted',
    ]);
});

