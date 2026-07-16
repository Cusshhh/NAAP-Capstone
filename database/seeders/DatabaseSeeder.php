<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create admin user
        User::factory()->create([
            'name' => 'NAAP Admin',
            'email' => 'admin@naap.edu.ph',
            'password' => 'password',
        ]);

        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create gabriel1 user for testing
        User::factory()->create([
            'name' => 'Gabriel Fontejon',
            'email' => 'gabriel1@gmail.com',
            'password' => 'Gabriel123456',
        ]);

        $this->call([
            VacancySeeder::class,
            StaffingPositionSeeder::class,
        ]);
    }
}
