<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class StaffingPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\StaffingPosition::query()->delete();

        $data = [];

        foreach ($data as $item) {
            $item['campus'] = 'Villamor';
            \App\Models\StaffingPosition::create($item);
        }
    }
}
