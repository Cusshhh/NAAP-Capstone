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

        $data = [
            // --- NAAP POSITIONS ---
            ['campus' => 'NAAP', 'office' => 'Legal Unit', 'position' => 'Attorney IV', 'sg' => 23, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Administrative and Finance', 'position' => 'Supervising Administrative Officer', 'sg' => 22, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'ICT Unit', 'position' => 'Information Technology Officer I', 'sg' => 19, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Procurement Unit', 'position' => 'Administrative Officer V', 'sg' => 18, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Information Unit', 'position' => 'Information Officer III', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Internal Audit Unit', 'position' => 'Internal Auditor III', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Planning Unit', 'position' => 'Planning Officer III', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Project Management Unit', 'position' => 'Project Development Officer III', 'sg' => 18, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Accounting Unit', 'position' => 'Accountant II', 'sg' => 16, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'ICT Unit', 'position' => 'Information Systems Analyst II', 'sg' => 16, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Budget Unit', 'position' => 'Administrative Officer IV', 'sg' => 15, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'HR Management Unit', 'position' => 'Administrative Officer IV', 'sg' => 15, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Records Unit', 'position' => 'Administrative Officer III', 'sg' => 14, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Supply Management Unit', 'position' => 'Administrative Officer III', 'sg' => 14, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Board Secretary', 'position' => 'Board Secretary I', 'sg' => 14, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'Legal Unit', 'position' => 'Legal Assistant III', 'sg' => 14, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'ICT Unit', 'position' => 'Information Systems Analyst I', 'sg' => 12, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Legal Unit', 'position' => 'Legal Assistant II', 'sg' => 12, 'status' => 'Unfilled'],
            ['campus' => 'NAAP', 'office' => 'HR Management Unit', 'position' => 'Administrative Officer II', 'sg' => 11, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'Information Officer I', 'position' => 'Information Officer I', 'sg' => 11, 'status' => 'Filled'],
            ['campus' => 'NAAP', 'office' => 'SUC Vice President', 'position' => 'Administrative Aide VI', 'sg' => 6, 'status' => 'Unfilled'],
        ];

        foreach ($data as $item) {
            $item['campus'] = 'Villamor';
            \App\Models\StaffingPosition::create($item);
        }
    }
}
