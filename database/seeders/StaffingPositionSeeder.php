<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StaffingPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            // --- VILLAMOR CAMPUS ---
            ['campus' => 'Villamor', 'office' => 'Legal Unit', 'position' => 'Attorney IV', 'sg' => 23, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Administrative and Finance', 'position' => 'Supervising Administrative Officer', 'sg' => 22, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'ICT Unit', 'position' => 'Information Technology Officer I', 'sg' => 19, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Procurement Unit', 'position' => 'Administrative Officer V', 'sg' => 18, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Information Unit', 'position' => 'Information Officer III', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Internal Audit Unit', 'position' => 'Internal Auditor III', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Planning Unit', 'position' => 'Planning Officer III', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Project Management Unit', 'position' => 'Project Development Officer III', 'sg' => 18, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Accounting Unit', 'position' => 'Accountant II', 'sg' => 16, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'ICT Unit', 'position' => 'Information Systems Analyst II', 'sg' => 16, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Budget Unit', 'position' => 'Administrative Officer IV', 'sg' => 15, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'HR Management Unit', 'position' => 'Administrative Officer IV', 'sg' => 15, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Records Unit', 'position' => 'Administrative Officer III', 'sg' => 14, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Supply Management Unit', 'position' => 'Administrative Officer III', 'sg' => 14, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Board Secretary', 'position' => 'Board Secretary I', 'sg' => 14, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'Legal Unit', 'position' => 'Legal Assistant III', 'sg' => 14, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'ICT Unit', 'position' => 'Information Systems Analyst I', 'sg' => 12, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Legal Unit', 'position' => 'Legal Assistant II', 'sg' => 12, 'status' => 'Unfilled'],
            ['campus' => 'Villamor', 'office' => 'HR Management Unit', 'position' => 'Administrative Officer II', 'sg' => 11, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'Information Officer I', 'position' => 'Information Officer I', 'sg' => 11, 'status' => 'Filled'],
            ['campus' => 'Villamor', 'office' => 'SUC Vice President', 'position' => 'Administrative Aide VI', 'sg' => 6, 'status' => 'Unfilled'],

            // --- BAB CAMPUS ---
            ['campus' => 'BAB', 'office' => 'Campus Director', 'position' => 'Administrative Officer V', 'sg' => 18, 'status' => 'Filled'],
            ['campus' => 'BAB', 'office' => 'Accounting Unit', 'position' => 'Accountant II', 'sg' => 16, 'status' => 'Unfilled'],
            ['campus' => 'BAB', 'office' => 'Budget Unit', 'position' => 'Administrative Officer IV', 'sg' => 15, 'status' => 'Filled'],
            ['campus' => 'BAB', 'office' => 'Procurement Unit', 'position' => 'Administrative Officer III', 'sg' => 14, 'status' => 'Unfilled'],

            // --- FAB CAMPUS ---
            ['campus' => 'FAB', 'office' => 'Campus Director', 'position' => 'Administrative Officer V', 'sg' => 18, 'status' => 'Filled'],
            ['campus' => 'FAB', 'office' => 'Accounting Unit', 'position' => 'Accountant II', 'sg' => 16, 'status' => 'Unfilled'],

            // --- MBEAB CAMPUS ---
            ['campus' => 'MBEAB', 'office' => 'Campus Director', 'position' => 'Administrative Officer V', 'sg' => 18, 'status' => 'Unfilled'],
            ['campus' => 'MBEAB', 'office' => 'Budget Unit', 'position' => 'Administrative Officer IV', 'sg' => 15, 'status' => 'Unfilled'],
            ['campus' => 'MBEAB', 'office' => 'Procurement Unit', 'position' => 'Administrative Officer III', 'sg' => 14, 'status' => 'Unfilled'],
            ['campus' => 'MBEAB', 'office' => 'Supply Unit', 'position' => 'Administrative Officer I', 'sg' => 10, 'status' => 'Unfilled'],
            ['campus' => 'MBEAB', 'office' => 'Supply Unit', 'position' => 'Administrative Assistant II', 'sg' => 8, 'status' => 'Unfilled'],
            ['campus' => 'MBEAB', 'office' => 'Records Unit', 'position' => 'Administrative Aide VI', 'sg' => 6, 'status' => 'Unfilled'],
        ];

        foreach ($data as $item) {
            \App\Models\StaffingPosition::create($item);
        }
    }
}
