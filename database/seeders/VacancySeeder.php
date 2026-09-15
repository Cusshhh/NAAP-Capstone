<?php

namespace Database\Seeders;

use App\Models\Vacancy;
use Illuminate\Database\Seeder;

class VacancySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clean array for live system
        $jobs = [];

        foreach ($jobs as $job) {
            $job['location'] = 'Villamor Air Base, Pasay City';
            Vacancy::updateOrCreate(['id' => $job['id']], $job);
        }
    }
}
