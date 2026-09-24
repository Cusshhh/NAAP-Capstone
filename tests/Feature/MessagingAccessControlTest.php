<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessagingAccessControlTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $applicant;
    private Application $application;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'NAAP Admin',
            'email' => 'admin@naap.edu.ph',
            'profile_data' => ['role' => 'admin'],
        ]);

        $this->applicant = User::factory()->create([
            'name' => 'John Applicant',
            'email' => 'john.applicant@naap.edu.ph',
            'profile_data' => ['role' => 'applicant'],
        ]);

        $this->application = Application::create([
            'applicant_name' => 'John Applicant',
            'email' => 'john.applicant@naap.edu.ph',
            'job_title' => 'Aviation Instructor',
            'job_id' => 101,
            'status' => 'Submitted',
            'phone_number' => '09123456789',
            'education' => 'Bachelor of Science in Aviation',
        ]);
    }

    public function test_applicant_cannot_send_message_before_admin_initiates()
    {
        $this->actingAs($this->applicant);

        $response = $this->postJson("/messages/{$this->application->id}", [
            'content' => 'Hello Admin, I want to inquire about my application.',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'Messaging is unavailable until an Admin initiates communication for your application.',
        ]);

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_applicant_can_send_message_after_admin_initiates()
    {
        // Admin sends first message
        $this->actingAs($this->admin);
        $adminResponse = $this->postJson("/messages/{$this->application->id}", [
            'content' => 'Hello John, we have reviewed your application.',
        ]);

        $adminResponse->assertStatus(201);
        $this->assertDatabaseCount('messages', 1);

        // Applicant can now reply
        $this->actingAs($this->applicant);
        $applicantResponse = $this->postJson("/messages/{$this->application->id}", [
            'content' => 'Thank you Admin, I am ready for the interview.',
        ]);

        $applicantResponse->assertStatus(201);
        $this->assertDatabaseCount('messages', 2);
    }

    public function test_applicant_cannot_send_message_when_application_is_hired_or_rejected()
    {
        // Admin initiates communication
        $this->actingAs($this->admin);
        $this->postJson("/messages/{$this->application->id}", [
            'content' => 'Initial message from admin.',
        ]);

        // Change application status to Hired
        $this->application->update(['status' => 'Hired']);

        $this->actingAs($this->applicant);
        $responseHired = $this->postJson("/messages/{$this->application->id}", [
            'content' => 'Can I still send a message?',
        ]);

        $responseHired->assertStatus(403);
        $responseHired->assertJson([
            'error' => 'Messaging is closed for this application because it has been marked as Hired.',
        ]);

        // Change application status to Rejected
        $this->application->update(['status' => 'Rejected']);

        $responseRejected = $this->postJson("/messages/{$this->application->id}", [
            'content' => 'What about now?',
        ]);

        $responseRejected->assertStatus(403);
        $responseRejected->assertJson([
            'error' => 'Messaging is closed for this application because it has been marked as Rejected.',
        ]);
    }

    public function test_admin_can_send_messages_at_any_time_even_when_closed()
    {
        $this->application->update(['status' => 'Rejected']);

        $this->actingAs($this->admin);
        $response = $this->postJson("/messages/{$this->application->id}", [
            'content' => 'Official notice: Application status update.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('messages', 1);
    }
}
