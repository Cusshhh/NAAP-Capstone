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
        $jobs = [
            [
                'id' => 101,
                'title' => 'Instructor I (Aeronautical Engineering)',
                'department' => 'Institute of Engineering & Aviation Technology',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Villamor Air Base, Pasay City',
                'salary_grade' => 12,
                'description' => 'Responsible for teaching undergraduate courses in Aeronautical Engineering, supervising laboratory activities, conducting academic research, and participating in departmental committees.',
                'responsibilities' => [
                    'Teach core subjects in Aerodynamics, Aircraft Design, and Flight Mechanics.',
                    'Supervise students during wind tunnel laboratory and hangar practical training.',
                    'Prepare course syllabi, instructional materials, and quarterly assessments.',
                    'Engage in aviation research and institutional extension services.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_1',
                        'category' => 'Education',
                        'title' => 'Bachelor of Science in Aeronautical Engineering',
                        'is_mandatory' => true,
                        'keywords' => ['BS Aeronautical Engineering', 'Aeronautical Engineering', 'BSAE'],
                    ],
                    [
                        'id' => 'req_elig_1',
                        'category' => 'Eligibility',
                        'title' => 'RA 1080 (Licensed Aeronautical Engineer)',
                        'is_mandatory' => true,
                        'keywords' => ['RA 1080', 'Aeronautical Engineer License', 'PRC Board Pass'],
                    ],
                    [
                        'id' => 'req_exp_1',
                        'category' => 'Experience',
                        'title' => 'None required (CSC Minimum QS)',
                        'is_mandatory' => false,
                        'keywords' => ['Fresh Graduate', 'Entry Level'],
                    ],
                    [
                        'id' => 'req_trn_1',
                        'category' => 'Training',
                        'title' => 'None required (CSC Minimum QS)',
                        'is_mandatory' => false,
                        'keywords' => ['Orientation Training'],
                    ],
                ],
                'deadline' => now()->addDays(30),
                'status' => 'Open',
            ],
            [
                'id' => 102,
                'title' => 'Administrative Officer V (HRMO III)',
                'department' => 'Administrative & Financial Services Division',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Villamor Air Base, Pasay City',
                'salary_grade' => 18,
                'description' => 'Directs and oversees human resource management functions including recruitment, plantilla position management, performance evaluation, personnel benefits, and CSC compliance.',
                'responsibilities' => [
                    'Supervise the recruitment, selection, and placement of academic and administrative personnel.',
                    'Manage plantilla position classification and CSC qualification standards audit.',
                    'Administer employee benefits, leave credits, and Strategic Performance Management System (SPMS).',
                    'Represent the institution in Civil Service Commission (CSC) audits and HR forums.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_2',
                        'category' => 'Education',
                        'title' => 'Bachelor\'s Degree relevant to the job (BS Human Resource Management, Public Admin, Psychology)',
                        'is_mandatory' => true,
                        'keywords' => ['BS Human Resource Management', 'Public Administration', 'Psychology', 'Business Administration'],
                    ],
                    [
                        'id' => 'req_exp_2',
                        'category' => 'Experience',
                        'title' => '2 years of relevant experience in HR management or personnel administration',
                        'is_mandatory' => true,
                        'keywords' => ['2 years experience', 'HR Management', 'Personnel Administration'],
                    ],
                    [
                        'id' => 'req_trn_2',
                        'category' => 'Training',
                        'title' => '8 hours of relevant training in HRD or Public Personnel Administration',
                        'is_mandatory' => true,
                        'keywords' => ['8 hours training', 'HRD Training', 'SPMS Training'],
                    ],
                    [
                        'id' => 'req_elig_2',
                        'category' => 'Eligibility',
                        'title' => 'Career Service Professional (Second Level Eligibility)',
                        'is_mandatory' => true,
                        'keywords' => ['Career Service Professional', 'CSC Professional Eligibility', 'RA 1080'],
                    ],
                ],
                'deadline' => now()->addDays(25),
                'status' => 'Open',
            ],
            [
                'id' => 103,
                'title' => 'Associate Professor I (Computer Studies)',
                'department' => 'Institute of Computer Studies & Aviation Information Systems',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Villamor Air Base, Pasay City',
                'salary_grade' => 19,
                'description' => 'Leads advanced computer science lectures, conducts technological research in aviation IT systems, mentors faculty members, and develops modern IT curriculum.',
                'responsibilities' => [
                    'Deliver lectures in Software Engineering, Database Systems, and Aviation Information Tech.',
                    'Publish research papers in accredited aviation and IT journals.',
                    'Lead curriculum development committees in compliance with CHED Policies and Standards.',
                    'Serve as thesis advisor for graduating aviation IT students.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_3',
                        'category' => 'Education',
                        'title' => 'Master\'s Degree in Information Technology, Computer Science, or Information Systems',
                        'is_mandatory' => true,
                        'keywords' => ['Master in Information Technology', 'MS Computer Science', 'Master\'s Degree'],
                    ],
                    [
                        'id' => 'req_exp_3',
                        'category' => 'Experience',
                        'title' => '2 years of relevant teaching or IT industry experience',
                        'is_mandatory' => true,
                        'keywords' => ['2 years teaching', 'IT Industry Experience'],
                    ],
                    [
                        'id' => 'req_trn_3',
                        'category' => 'Training',
                        'title' => '8 hours of relevant training in IT or Higher Pedagogy',
                        'is_mandatory' => false,
                        'keywords' => ['8 hours training', 'Pedagogy Training'],
                    ],
                    [
                        'id' => 'req_elig_3',
                        'category' => 'Eligibility',
                        'title' => 'Career Service Professional / RA 1080',
                        'is_mandatory' => false,
                        'keywords' => ['Career Service Professional', 'PRC License'],
                    ],
                ],
                'deadline' => now()->addDays(30),
                'status' => 'Open',
            ],
            [
                'id' => 104,
                'title' => 'Flight Instructor II (Pilot Training)',
                'department' => 'Flight Operations & Pilot Training Department',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Fernando Air Base Campus, Lipa City, Batangas',
                'salary_grade' => 15,
                'description' => 'Conducts ground and flight instruction for student pilots, performs pre-flight checkouts, maintains flight log compliance, and enforces flight safety standards.',
                'responsibilities' => [
                    'Conduct dual flight instruction on training aircraft (Cessna 172 / Piper Archer).',
                    'Teach Ground School courses including Navigation, Meteorology, and Air Regulations.',
                    'Conduct stage checks and pre-solo flight evaluations.',
                    'Ensure 100% compliance with CAAP Airworthiness and Operational Directives.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_4',
                        'category' => 'Education',
                        'title' => 'Bachelor\'s Degree in Flying, Aviation, or related field',
                        'is_mandatory' => true,
                        'keywords' => ['BS Flying', 'BS Aviation', 'Bachelor\'s Degree'],
                    ],
                    [
                        'id' => 'req_elig_4',
                        'category' => 'Eligibility',
                        'title' => 'CAAP Commercial Pilot License (CPL) with Flight Instructor Rating (FIR) & Instrument Rating (IR)',
                        'is_mandatory' => true,
                        'keywords' => ['CAAP CPL', 'Flight Instructor Rating', 'Instrument Rating', 'CPL License'],
                    ],
                    [
                        'id' => 'req_exp_4',
                        'category' => 'Experience',
                        'title' => '1 year of instructional flight experience (500+ dual flight hours)',
                        'is_mandatory' => true,
                        'keywords' => ['500 flight hours', '1 year flight instruction'],
                    ],
                    [
                        'id' => 'req_trn_4',
                        'category' => 'Training',
                        'title' => '24 hours of flight instruction & aviation safety refresher training',
                        'is_mandatory' => false,
                        'keywords' => ['24 hours training', 'Flight Safety Training'],
                    ],
                ],
                'deadline' => now()->addDays(40),
                'status' => 'Open',
            ],
            [
                'id' => 105,
                'title' => 'Information Technology Officer I',
                'department' => 'Management Information System (MIS) Center',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Villamor Air Base, Pasay City',
                'salary_grade' => 19,
                'description' => 'Leads the institutional digital transformation, manages campus network infrastructure, oversees web portal maintenance, and implements cybersecurity measures.',
                'responsibilities' => [
                    'Manage and maintain campus enterprise servers, cloud databases, and high-speed LAN/WAN infrastructure.',
                    'Oversee full-stack development of NAAP HR and Student Information Management Systems.',
                    'Implement cybersecurity safeguards and data privacy compliance per RA 10173.',
                    'Provide technical support and system upgrades across all PhilSCA campuses.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_5',
                        'category' => 'Education',
                        'title' => 'Bachelor\'s Degree in Computer Science, Information Technology, or Computer Engineering',
                        'is_mandatory' => true,
                        'keywords' => ['BS Information Technology', 'BS Computer Science', 'BS Computer Engineering'],
                    ],
                    [
                        'id' => 'req_exp_5',
                        'category' => 'Experience',
                        'title' => '2 years of relevant experience in software development or network administration',
                        'is_mandatory' => true,
                        'keywords' => ['2 years experience', 'Software Engineering', 'Network Administration'],
                    ],
                    [
                        'id' => 'req_trn_5',
                        'category' => 'Training',
                        'title' => '8 hours of relevant training in IT System Security or Cloud Architecture',
                        'is_mandatory' => true,
                        'keywords' => ['8 hours training', 'Cybersecurity Training', 'Cloud Training'],
                    ],
                    [
                        'id' => 'req_elig_5',
                        'category' => 'Eligibility',
                        'title' => 'Career Service Professional (Second Level Eligibility)',
                        'is_mandatory' => true,
                        'keywords' => ['Career Service Professional', 'CSC Professional Eligibility'],
                    ],
                ],
                'deadline' => now()->addDays(20),
                'status' => 'Open',
            ],
            [
                'id' => 106,
                'title' => 'Aeronautical Engineer II',
                'department' => 'Aircraft Maintenance & Laboratory Division',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Mactan Air Base Campus, Lapu-Lapu City, Cebu',
                'salary_grade' => 16,
                'description' => 'Oversees laboratory aircraft maintenance facilities, structural integrity testing of training aircraft, and ensures compliance with CAAP airworthiness directives.',
                'responsibilities' => [
                    'Inspect airframe structures, propulsion systems, and avionics components.',
                    'Supervise student laboratory sessions in aircraft maintenance and repair.',
                    'Prepare technical reports on aircraft fleet maintenance and parts inventory.',
                    'Coordinate with CAAP inspectors for annual aircraft airworthiness renewals.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_6',
                        'category' => 'Education',
                        'title' => 'Bachelor of Science in Aeronautical Engineering',
                        'is_mandatory' => true,
                        'keywords' => ['BS Aeronautical Engineering', 'Aeronautical Engineering'],
                    ],
                    [
                        'id' => 'req_elig_6',
                        'category' => 'Eligibility',
                        'title' => 'RA 1080 (Licensed Aeronautical Engineer)',
                        'is_mandatory' => true,
                        'keywords' => ['RA 1080', 'Aeronautical Engineer License'],
                    ],
                    [
                        'id' => 'req_exp_6',
                        'category' => 'Experience',
                        'title' => '1 year of relevant experience in aircraft structural inspection or maintenance',
                        'is_mandatory' => true,
                        'keywords' => ['1 year experience', 'Aircraft Maintenance'],
                    ],
                    [
                        'id' => 'req_trn_6',
                        'category' => 'Training',
                        'title' => '4 hours of relevant technical training',
                        'is_mandatory' => false,
                        'keywords' => ['4 hours training', 'Technical Refresher'],
                    ],
                ],
                'deadline' => now()->addDays(35),
                'status' => 'Open',
            ],
            [
                'id' => 107,
                'title' => 'Legal Officer IV',
                'department' => 'Office of the College President',
                'employment_type' => 'Permanent (Plantilla)',
                'location' => 'Villamor Air Base, Pasay City',
                'salary_grade' => 22,
                'description' => 'Serves as chief legal counsel for PhilSCA, drafting administrative contracts, representing the college in court hearings, and providing legal guidance on government procurement.',
                'responsibilities' => [
                    'Provide legal opinions on institutional policies, MOUs, and government procurement contracts.',
                    'Represent the institution in administrative, civil, and labor cases.',
                    'Conduct formal investigations into administrative complaints involving staff or students.',
                    'Ensure strict compliance with Republic Acts, CSC rules, and CHED guidelines.',
                ],
                'requirements' => [
                    [
                        'id' => 'req_edu_7',
                        'category' => 'Education',
                        'title' => 'Bachelor of Laws (LL.B.) / Juris Doctor (J.D.)',
                        'is_mandatory' => true,
                        'keywords' => ['Bachelor of Laws', 'Juris Doctor', 'Law Degree', 'LL.B.', 'J.D.'],
                    ],
                    [
                        'id' => 'req_elig_7',
                        'category' => 'Eligibility',
                        'title' => 'RA 1080 (BAR Exam Lawyer License)',
                        'is_mandatory' => true,
                        'keywords' => ['RA 1080', 'Philippine BAR Exam', 'Lawyer', 'Attorney'],
                    ],
                    [
                        'id' => 'req_exp_7',
                        'category' => 'Experience',
                        'title' => '3 years of relevant experience in legal practice or litigation',
                        'is_mandatory' => true,
                        'keywords' => ['3 years legal practice', 'Litigation Experience'],
                    ],
                    [
                        'id' => 'req_trn_7',
                        'category' => 'Training',
                        'title' => '16 hours of Mandatory Continuing Legal Education (MCLE) or legal training',
                        'is_mandatory' => false,
                        'keywords' => ['16 hours MCLE', 'Legal Seminar'],
                    ],
                ],
                'deadline' => now()->addDays(45),
                'status' => 'Open',
            ],
        ];

        foreach ($jobs as $job) {
            Vacancy::updateOrCreate(['id' => $job['id']], $job);
        }
    }
}
