<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicantAccountCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_multiple_applicant_accounts_maintains_correct_user_identity_and_profile_data()
    {
        // 1. Register Applicant A
        $responseA = $this->post('/register', [
            'name' => 'Applicant Alpha',
            'email' => 'alpha@naap.edu.ph',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $responseA->assertRedirect(route('dashboard'));
        $userA = User::where('email', 'alpha@naap.edu.ph')->first();
        $this->assertNotNull($userA);
        $this->assertEquals('Applicant Alpha', $userA->name);
        $this->assertEquals('alpha@naap.edu.ph', $userA->email);
        $this->assertIsArray($userA->profile_data);
        $this->assertEquals('Applicant Alpha', $userA->profile_data['fullName']);
        $this->assertEquals('alpha@naap.edu.ph', $userA->profile_data['email']);

        // Logout
        $this->post('/logout');

        // 2. Register Applicant B
        $responseB = $this->post('/register', [
            'name' => 'Applicant Bravo',
            'email' => 'bravo@naap.edu.ph',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $responseB->assertRedirect(route('dashboard'));
        $userB = User::where('email', 'bravo@naap.edu.ph')->first();
        $this->assertNotNull($userB);
        $this->assertNotEquals($userA->id, $userB->id);
        $this->assertEquals('Applicant Bravo', $userB->name);
        $this->assertEquals('bravo@naap.edu.ph', $userB->email);
        $this->assertEquals('Applicant Bravo', $userB->profile_data['fullName']);
        $this->assertEquals('bravo@naap.edu.ph', $userB->profile_data['email']);

        // Logout
        $this->post('/logout');

        // 3. Register Applicant C (Glaiven Tampoco test case)
        $responseC = $this->post('/register', [
            'name' => 'Glaiven Tampoco',
            'email' => 'glaiven@naap.edu.ph',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $responseC->assertRedirect(route('dashboard'));
        $userC = User::where('email', 'glaiven@naap.edu.ph')->first();
        $this->assertNotNull($userC);
        $this->assertEquals('Glaiven Tampoco', $userC->name);
        $this->assertEquals('glaiven@naap.edu.ph', $userC->email);
        $this->assertEquals('Glaiven Tampoco', $userC->profile_data['fullName']);
        $this->assertEquals('glaiven@naap.edu.ph', $userC->profile_data['email']);

        // 4. Verify saving profile for User C does NOT affect User A or B
        $this->actingAs($userC)->post('/profile/save', [
            'profile_data' => [
                'firstName' => 'Glaiven',
                'lastName' => 'Tampoco',
                'phone' => '09171234567',
            ],
        ]);

        $userC->refresh();
        $this->assertEquals('Glaiven Tampoco', $userC->name);
        $this->assertEquals('glaiven@naap.edu.ph', $userC->email);
        $this->assertEquals('glaiven@naap.edu.ph', $userC->profile_data['email']);
        $this->assertNotEquals($userA->name, $userC->name);
        $this->assertNotEquals($userB->name, $userC->name);
    }
}
