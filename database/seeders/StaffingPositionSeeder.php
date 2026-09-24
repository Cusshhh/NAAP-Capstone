<?php

namespace Database\Seeders;

use App\Models\StaffingPosition;
use Illuminate\Database\Seeder;

class StaffingPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StaffingPosition::query()->delete();

        $positions = [
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Institute of Engineering & Aviation Technology',
                'position' => 'Instructor I (Aeronautical Engineering)',
                'plantilla_item' => 'NAAP-INST1-2026-001',
                'sg' => 12,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'BS Aeronautical Engineering',
                'qs_experience' => 'None required (CSC Minimum QS)',
                'qs_eligibility' => 'RA 1080 (Licensed Aeronautical Engineer)',
                'qs_training' => 'None required (CSC Minimum QS)',
                'description' => 'Teaches core courses in aerodynamics, flight mechanics, and aircraft design.',
                'responsibilities' => [
                    'Teach lectures and aerodynamics laboratory sessions.',
                    'Prepare course syllabi and instructional materials.',
                    'Supervise wind tunnel experiment practicals.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Management Information System (MIS) Center',
                'position' => 'Information Technology Officer I',
                'plantilla_item' => 'NAAP-ITO1-2026-002',
                'sg' => 19,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'BS Information Technology or Computer Science',
                'qs_experience' => '2 years of relevant IT experience',
                'qs_eligibility' => 'Career Service Professional (Second Level Eligibility)',
                'qs_training' => '8 hours of relevant IT training',
                'description' => 'Manages campus network infrastructure, cloud servers, and web portals.',
                'responsibilities' => [
                    'Supervise web server maintenance and enterprise database security.',
                    'Lead digital portal expansion and IT helpdesk operations.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Administrative & Financial Services Division',
                'position' => 'Administrative Officer V (HRMO III)',
                'plantilla_item' => 'NAAP-ADMO5-2026-003',
                'sg' => 18,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'Bachelor\'s Degree relevant to HR/Public Admin',
                'qs_experience' => '2 years of relevant HR experience',
                'qs_eligibility' => 'Career Service Professional',
                'qs_training' => '8 hours of relevant HR training',
                'description' => 'Directs human resource recruitment, plantilla audits, and CSC compliance.',
                'responsibilities' => [
                    'Oversee recruitment, selection, and placement workflows.',
                    'Manage employee benefits and performance evaluation systems.',
                ],
            ],
            [
                'campus' => 'Fernando Air Base Campus, Lipa City',
                'office' => 'Flight Operations & Pilot Training Department',
                'position' => 'Flight Instructor II (Pilot Training)',
                'plantilla_item' => 'NAAP-FLI2-2026-004',
                'sg' => 15,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Fernando Air Base Campus, Lipa City, Batangas',
                'qs_education' => 'BS Flying / Aviation',
                'qs_experience' => '1 year of instructional flight experience (500+ hours)',
                'qs_eligibility' => 'CAAP CPL with Flight Instructor Rating (FIR)',
                'qs_training' => '24 hours flight safety training',
                'description' => 'Conducts dual flight instruction and ground school for student pilots.',
                'responsibilities' => [
                    'Deliver flight training on Cessna 172 fleet.',
                    'Conduct ground school navigation and meteorology lectures.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Institute of Computer Studies & Aviation Information Systems',
                'position' => 'Associate Professor I (Computer Studies)',
                'plantilla_item' => 'NAAP-APRF1-2026-005',
                'sg' => 19,
                'status' => 'On-process',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'Master\'s Degree in Information Technology or Computer Science',
                'qs_experience' => '2 years of relevant teaching experience',
                'qs_eligibility' => 'Career Service Professional / RA 1080',
                'qs_training' => '8 hours of higher pedagogy training',
                'description' => 'Teaches software engineering, database systems, and aviation IT modules.',
                'responsibilities' => [
                    'Teach computer science lectures and supervise research capstones.',
                    'Lead curriculum development in compliance with CHED standards.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Institute of Computer Studies & Aviation Information Systems',
                'position' => 'Avionics Technician Specialist',
                'plantilla_item' => 'NAAP-AVTS-2026-006',
                'sg' => 11,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'BS Avionics Technology or Aviation Electronics',
                'qs_experience' => '1 year of avionics repair experience',
                'qs_eligibility' => 'CAAP Aircraft Maintenance License (Avionics)',
                'qs_training' => '4 hours avionics training',
                'description' => 'Maintains and calibrates aircraft communication and radar systems.',
                'responsibilities' => [
                    'Perform scheduled maintenance on aircraft radio navigation gear.',
                    'Assist instructors during avionics lab sessions.',
                ],
            ],
            [
                'campus' => 'Mactan Air Base Campus, Lapu-Lapu City',
                'office' => 'Aircraft Maintenance & Laboratory Division',
                'position' => 'Aeronautical Engineer II',
                'plantilla_item' => 'NAAP-AENG2-2026-007',
                'sg' => 16,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Mactan Air Base Campus, Lapu-Lapu City, Cebu',
                'qs_education' => 'BS Aeronautical Engineering',
                'qs_experience' => '1 year of aircraft structural inspection experience',
                'qs_eligibility' => 'RA 1080 (Licensed Aeronautical Engineer)',
                'qs_training' => '4 hours technical training',
                'description' => 'Inspects airframe structures and supervises aircraft hangar labs.',
                'responsibilities' => [
                    'Inspect airframe structural integrity and propulsion systems.',
                    'Coordinate CAAP annual airworthiness inspection renewals.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Office of the College President',
                'position' => 'Legal Officer IV',
                'plantilla_item' => 'NAAP-LGL4-2026-008',
                'sg' => 22,
                'status' => 'On-process',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'Juris Doctor (J.D.) / Bachelor of Laws (LL.B.)',
                'qs_experience' => '3 years of legal practice experience',
                'qs_eligibility' => 'RA 1080 (BAR Exam Lawyer License)',
                'qs_training' => '16 hours MCLE legal training',
                'description' => 'Provides legal counsel, drafts contracts, and ensures CSC compliance.',
                'responsibilities' => [
                    'Draft institutional MOUs and legal procurement contracts.',
                    'Represent the institution in legal and administrative hearings.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Institute of Engineering & Aviation Technology',
                'position' => 'Aircraft Maintenance Technology Instructor',
                'plantilla_item' => 'NAAP-AMTI-2026-009',
                'sg' => 13,
                'status' => 'Unfilled',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'BS Aircraft Maintenance Technology (BSAMT)',
                'qs_experience' => '1 year of hangar maintenance experience',
                'qs_eligibility' => 'CAAP Airframe & Powerplant (A&P) License',
                'qs_training' => '4 hours technical training',
                'description' => 'Teaches practical aircraft airframe and powerplant courses in hangar labs.',
                'responsibilities' => [
                    'Conduct practical workshops on reciprocating engine overhaul.',
                    'Supervise hangar safety and tool inventories.',
                ],
            ],
            [
                'campus' => 'Villamor Air Base, Pasay City',
                'office' => 'Student Affairs & Guidance Office',
                'position' => 'Guidance Counselor II',
                'plantilla_item' => 'NAAP-GC2-2026-010',
                'sg' => 12,
                'status' => 'Filled',
                'employment_type' => 'Full-time',
                'location' => 'Villamor Air Base, Pasay City',
                'qs_education' => 'Master\'s Degree in Guidance & Counseling or Psychology',
                'qs_experience' => 'None required (CSC Minimum QS)',
                'qs_eligibility' => 'RA 1080 (Registered Guidance Counselor)',
                'qs_training' => 'None required (CSC Minimum QS)',
                'description' => 'Provides counseling and career guidance for aviation students.',
                'responsibilities' => [
                    'Conduct individual student counseling and career guidance.',
                    'Administer entrance psychological evaluation tests.',
                ],
            ],
        ];

        foreach ($positions as $item) {
            StaffingPosition::create($item);
        }
    }
}
