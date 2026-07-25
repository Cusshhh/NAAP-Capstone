// --- SALARY GRADE MAPPING (Updated SSL) ---
export const SALARY_GRADE_MAP: Record<number, number> = {
    1: 13000, 2: 13819, 3: 14678, 4: 15586, 5: 16543,
    6: 17553, 7: 18620, 8: 19744, 9: 21211, 10: 23176,
    11: 27000, 12: 29165, 13: 31320, 14: 33843, 15: 36619,
    16: 39672, 17: 43030, 18: 46725, 19: 51357, 20: 57347,
    21: 63997, 22: 71511, 23: 80003, 24: 90078, 25: 102690,
    26: 116040, 27: 131124, 28: 148171, 29: 167432, 30: 189199,
    31: 273278, 32: 325307, 33: 411161
};

export const mockJobs = [
    {
        id: '1',
        title: 'Chief Flight Instructor',
        department: 'Flight Training',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Oversee all flight training operations and ensure compliance with CAAP regulations. Mentor senior instructors and manage the training syllabus.',
        responsibilities: [
            'Manage flight training department.',
        ],
        salaryGrade: 24,
        postedDate: '2026-01-15',
        deadline: '2026-03-01',
        applicantCount: 8,
        status: 'Open'
    },
    {
        id: '2', // Fixed: changed duplicate ID from '1' to '2'
        title: 'Senior Flight Instructor',
        department: 'Flight Training',
        location: 'NAAP - Basa Air Base Campus',
        employmentType: 'Full-time',
        description: 'Experienced instructor needed to handle advanced flight phases and instrument ratings for cadets.',
        responsibilities: [
            'Conduct instrument flight training.',
            'Perform stage checks.',
            'Mentor student pilots.',
            'Assist Chief Flight Instructor.'
        ],
        requirements: [
            'CPL with Instrument Rating.',
            'Flight Instructor License.',
            'Minimum 1,500 flight hours.',
            'Class 1 Medical.'
        ],
        salaryGrade: 23,
        postedDate: '2026-01-20',
        deadline: '2026-03-01',
        applicantCount: 15,
        status: 'Open'
    },
    {
        id: '3',
        title: 'Flight Instructor (Basic)',
        department: 'Flight Training',
        location: 'NAAP - Fernando Air Base Campus',
        employmentType: 'Full-time',
        description: 'Provide primary flight instruction to new student pilots in Cessna 172 aircraft.',
        responsibilities: [
            'Teach basic flight maneuvers.',
            'Conduct pre-flight briefings.',
            'Ensure safe flight operations.',
            'Grade student performance.'
        ],
        requirements: [
            'CPL holder.',
            'Flight Instructor License.',
            'Minimum 500 flight hours.',
            'Passion for teaching.'
        ],
        salaryGrade: 21,
        postedDate: '2026-02-01',
        deadline: '2026-03-15',
        applicantCount: 22,
        status: 'Open'
    },
    {
        id: '4',
        title: 'Flight Instructor (Multi-Engine)',
        department: 'Flight Training',
        location: 'NAAP - Mactan Campus',
        employmentType: 'Full-time',
        description: 'Specialized instructor for Multi-Engine training modules on the Piper Seneca simulator and aircraft.',
        responsibilities: [
            'Conduct multi-engine training.',
            'Teach asymmetric flight procedures.',
            'Verify student proficiency.',
            'Safety management.'
        ],
        requirements: [
            'CPL with Multi-Engine Rating.',
            'Flight Instructor License.',
            'Minimum 1,000 flight hours.',
            'Multi-engine teaching experience.'
        ],
        salaryGrade: 24,
        postedDate: '2026-02-02',
        deadline: '2026-03-20',
        applicantCount: 10,
        status: 'Open'
    },
    {
        id: '5',
        title: 'Aircraft Mechanic (Airframe)',
        department: 'Maintenance',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Perform scheduled structural repairs and inspections on academy aircraft.',
        responsibilities: [
            'Riveting and sheet metal repair.',
            'Composite material repair.',
            'Corrosion control.',
            'Landing gear maintenance.'
        ],
        requirements: [
            'AMT License (Airframe rating).',
            '3 years aviation experience.',
            'Ability to read blueprints.',
            'Physical fitness.'
        ],
        salaryGrade: 15,
        postedDate: '2026-01-25',
        deadline: '2026-02-28',
        applicantCount: 18,
        status: 'Open'
    },
    {
        id: '6',
        title: 'Aircraft Mechanic (Powerplant)',
        department: 'Maintenance',
        location: 'NAAP - Basa-Palmayo Extension Campus',
        employmentType: 'Full-time',
        description: 'Maintain and overhaul piston engines for training aircraft.',
        responsibilities: [
            'Engine inspection and tuning.',
            'Propeller balancing.',
            'Oil system analysis.',
            'Troubleshooting engine issues.'
        ],
        requirements: [
            'AMT License (Powerplant rating).',
            'Experience with Lycoming engines.',
            'Safety conscious.',
            'Troubleshooting skills.'
        ],
        salaryGrade: 15,
        postedDate: '2026-01-28',
        deadline: '2026-03-05',
        applicantCount: 12,
        status: 'Open'
    },
    {
        id: '7',
        title: 'Avionics Technician',
        department: 'Maintenance',
        location: 'NAAP - Fernando Air Base Campus',
        employmentType: 'Full-time',
        description: 'Install, troubleshoot, and repair aircraft communication and navigation systems.',
        responsibilities: [
            'Test radio and navigation equipment.',
            'Repair wiring and electrical systems.',
            'Calibrate flight instruments.',
            'Software updates.'
        ],
        requirements: [
            'AMS License (Avionics).',
            'Electronics knowledge.',
            'Experience with Garmin G1000 is a plus.',
            'Detail oriented.'
        ],
        salaryGrade: 15,
        postedDate: '2026-02-03',
        deadline: '2026-03-10',
        applicantCount: 9,
        status: 'Open'
    },
    {
        id: '8',
        title: 'Maintenance Supervisor',
        department: 'Maintenance',
        location: 'NAAP - Mactan-Medellin Extension Campus',
        employmentType: 'Full-time',
        description: 'Lead the maintenance team at the extension campus and ensure aircraft availability.',
        responsibilities: [
            'Schedule maintenance shifts.',
            'Manage spare parts inventory.',
            'Sign off maintenance releases.',
            'Supervise mechanics.'
        ],
        requirements: [
            'AMT License with Airframe & Powerplant.',
            '5+ years experience.',
            'Leadership skills.',
            'Knowledge of CAAP airworthiness regs.'
        ],
        salary: '₱60,000 - ₱75,000 per month',
        postedDate: '2026-01-30',
        deadline: '2026-03-01',
        applicantCount: 6,
        status: 'Open'
    },
    {
        id: '9',
        title: 'Ground Instructor (Meteorology)',
        department: 'Academics',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Part-time',
        description: 'Teach aviation meteorology responsibilities to student pilots.',
        responsibilities: [
            'Lecture on performing weather analysis.',
            'Teach METAR/TAF decoding.',
            'Explain hazardous weather phenomena.',
            'Prepare exams.'
        ],
        requirements: [
            'Ground Instructor License.',
            'Meteorology background preferred.',
            'Teaching experience.',
            'Good presentation skills.'
        ],
        salary: '₱700 - ₱1,000 per hour',
        postedDate: '2026-02-04',
        deadline: '2026-03-15',
        applicantCount: 14,
        status: 'Open'
    },
    {
        id: '10',
        title: 'Ground Instructor (Air Law)',
        department: 'Academics',
        location: 'NAAP - Basa Air Base Campus',
        employmentType: 'Part-time',
        description: 'Instruct students on Civil Aviation Regulations and international aviation laws.',
        responsibilities: [
            'Teach PCARs and ICAO annexes.',
            'Discuss license privileges and limitations.',
            'Explain air traffic rules.',
            'Conduct assessments.'
        ],
        requirements: [
            'Ground Instructor License.',
            'Deep knowledge of aviation law.',
            'Attention to detail.',
            'Communication skills.'
        ],
        salary: '₱700 - ₱1,000 per hour',
        postedDate: '2026-02-05',
        deadline: '2026-03-20',
        applicantCount: 11,
        status: 'Open'
    },
    {
        id: '11',
        title: 'Flight Simulator Technician',
        department: 'Maintenance',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Maintain and repair flight training devices and full flight simulators.',
        responsibilities: [
            'Perform daily simulator qualification tests.',
            'Troubleshoot hardware and software issues.',
            'Replace faulty components.',
            'Assist instructors with sim setup.'
        ],
        requirements: [
            'Electronics or Computer Engineering degree.',
            'Experience with simulation systems.',
            'Networking skills.',
            'Shift work required.'
        ],
        salary: '₱45,000 - ₱60,000 per month',
        postedDate: '2026-01-18',
        deadline: '2026-02-28',
        applicantCount: 7,
        status: 'Open'
    },
    {
        id: '12',
        title: 'Aviation Safety Officer',
        department: 'Safety',
        location: 'NAAP - Mactan Campus',
        employmentType: 'Full-time',
        description: 'Monitor safety metrics and conduct risk assessments for flight operations.',
        responsibilities: [
            'Maintain Safety Management System.',
            'Investigate hazards and incidents.',
            'Promote safety awareness.',
            'Audit compliance.'
        ],
        requirements: [
            'Aviation Safety certification.',
            'Knowledge of SMS.',
            'Analytical mindset.',
            'Experience in flight ops.'
        ],
        salary: '₱50,000 - ₱70,000 per month',
        postedDate: '2026-02-01',
        deadline: '2026-03-10',
        applicantCount: 9,
        status: 'Open'
    },
    {
        id: '13',
        title: 'Flight Operations Officer',
        department: 'Flight Operations',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Support flight planning and dispatch duties.',
        responsibilities: [
            'File flight plans with ATS.',
            'Check NOTAMs and weather.',
            'Coordinate aircraft refueling.',
            'Track fleet movement.'
        ],
        requirements: [
            'Flight Dispatcher License or training.',
            'Radio Operator License.',
            'Computer literate.',
            'Ability to work under pressure.'
        ],
        salary: '₱25,000 - ₱35,000 per month',
        postedDate: '2026-01-22',
        deadline: '2026-02-25',
        applicantCount: 25,
        status: 'Open'
    },
    {
        id: '14',
        title: 'Admissions Officer',
        department: 'Administration',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Process student applications and conduct campus tours for prospective cadets.',
        responsibilities: [
            'Review application documents.',
            'Answer student inquiries.',
            'Organize orientation events.',
            'Maintain applicant database.'
        ],
        requirements: [
            'Bachelor’s degree.',
            'Customer service experience.',
            'Organized and friendly.',
            'Communication skills.'
        ],
        salary: '₱22,000 - ₱28,000 per month',
        postedDate: '2026-02-03',
        deadline: '2026-03-05',
        applicantCount: 35,
        status: 'Open'
    },
    {
        id: '15',
        title: 'School Registrar',
        department: 'Administration',
        location: 'NAAP - Basa Air Base Campus',
        employmentType: 'Full-time',
        description: 'Manage student records, grades, and licensing documentation for CAAP.',
        responsibilities: [
            'Maintain student 201 files.',
            'Process transcript requests.',
            'Liaise with CAAP Licensing department.',
            'Ensure data privacy.'
        ],
        requirements: [
            'Bachelor’s degree.',
            'Experience in records management.',
            'Strict attention to detail.',
            'Integrity.'
        ],
        salary: '₱30,000 - ₱40,000 per month',
        postedDate: '2026-01-15',
        deadline: '2026-02-28',
        applicantCount: 12,
        status: 'Open'
    },
    {
        id: '16',
        title: 'School Nurse',
        department: 'Medical',
        location: 'NAAP - Basa-Palmayo Extension Campus',
        employmentType: 'Full-time',
        description: 'Provide basic medical care and first aid to students and staff.',
        responsibilities: [
            'Manage campus clinic.',
            'Provide first aid.',
            'Monitor student health records.',
            'Assist in annual medical exams.'
        ],
        requirements: [
            'Registered Nurse (RN).',
            'BLS/ACLS certified.',
            'Experience in school setting preferred.',
            'Caring attitude.'
        ],
        salary: '₱25,000 - ₱35,000 per month',
        postedDate: '2026-02-01',
        deadline: '2026-03-10',
        applicantCount: 20,
        status: 'Open'
    },
    {
        id: '17',
        title: 'Guidance Counselor',
        department: 'Student Affairs',
        location: 'NAAP - Fernando Air Base Campus',
        employmentType: 'Full-time',
        description: 'Provide counseling and psychological support to student pilots.',
        responsibilities: [
            'Conduct individual counseling.',
            'Assess student mental fitness.',
            'Facilitate stress management workshops.',
            'Support student retention.'
        ],
        requirements: [
            'Registered Guidance Counselor (RGC).',
            'Experience with students.',
            'Empathy and confidentiality.',
            'Understanding of aviation stress factors.'
        ],
        salary: '₱30,000 - ₱45,000 per month',
        postedDate: '2026-01-30',
        deadline: '2026-03-15',
        applicantCount: 8,
        status: 'Open'
    },
    {
        id: '18',
        title: 'Librarian',
        department: 'Academics',
        location: 'NAAP - Mactan-Medellin Extension Campus',
        employmentType: 'Full-time',
        description: 'Manage the aviation library and technical publications.',
        responsibilities: [
            'Catalog books and manuals.',
            'Assist students with research.',
            'Update technical library subscriptions.',
            'Maintain quiet study environment.'
        ],
        requirements: [
            'Licensed Librarian.',
            'Organizational skills.',
            'Computer literate.',
            'Interest in aviation.'
        ],
        salary: '₱22,000 - ₱28,000 per month',
        postedDate: '2026-02-02',
        deadline: '2026-03-05',
        applicantCount: 10,
        status: 'Open'
    },
    {
        id: '19',
        title: 'IT Support Specialist',
        department: 'IT',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Provide technical support for campus computers, networks, and smart classrooms.',
        responsibilities: [
            'Troubleshoot PC and network issues.',
            'Maintain classroom AV equipment.',
            'Install software updates.',
            'Assist users with technical problems.'
        ],
        requirements: [
            'IT-related degree.',
            'Networking knowledge.',
            'Problem-solving skills.',
            'Customer service oriented.'
        ],
        salary: '₱25,000 - ₱35,000 per month',
        postedDate: '2026-01-20',
        deadline: '2026-02-28',
        applicantCount: 28,
        status: 'Open'
    },
    {
        id: '20',
        title: 'Marketing Specialist',
        department: 'Administration',
        location: 'NAAP - Villamor Campus',
        employmentType: 'Full-time',
        description: 'Develop marketing campaigns to attract new aspiring pilots.',
        responsibilities: [
            'Create social media content.',
            'Design brochures and flyers.',
            'Coordinate school visits.',
            'Analyze marketing metrics.'
        ],
        requirements: [
            'Marketing degree.',
            'Graphic design skills (Canva/Adobe).',
            'Social media savvy.',
            'Creativity.'
        ],
        salary: '₱30,000 - ₱40,000 per month',
        postedDate: '2026-02-05',
        deadline: '2026-03-20',
        applicantCount: 30,
        status: 'Open'
    },
    {
        id: '21',
        title: 'Dormitory Manager',
        department: 'Administration',
        location: 'NAAP - Basa Air Base Campus',
        employmentType: 'Full-time',
        description: 'Oversee the operation and maintenance of the student cadet dormitory.',
        responsibilities: [
            'Enforce dorm rules and regulations.',
            'Manage room assignments.',
            'Coordinate cleaning and repairs.',
            'Ensure resident safety.'
        ],
        requirements: [
            'Experience in property or hospitality management.',
            'Strong leadership.',
            'Ability to handle discipline.',
            'Live-in option available.'
        ],
        salary: '₱25,000 - ₱35,000 per month',
        postedDate: '2026-01-12',
        deadline: '2026-02-25',
        applicantCount: 15,
        status: 'Closed'
    },
    {
        id: '22',
        title: 'Utility Staff',
        department: 'Maintenance',
        location: 'NAAP - Fernando Air Base Campus',
        employmentType: 'Full-time',
        description: 'Ensure cleanliness and orderliness of the hangar and campus grounds.',
        responsibilities: [
            'Clean hangars and classrooms.',
            'Assist in moving equipment.',
            'Groundskeeping duties.',
            'Dispose of waste properly.'
        ],
        requirements: [
            'High school diploma.',
            'Hardworking and reliable.',
            'Physically fit.',
            'Honest.'
        ],
        salary: '₱16,000 - ₱20,000 per month',
        postedDate: '2026-02-01',
        deadline: '2026-03-30',
        applicantCount: 40,
        status: 'Closed'
    }
];

export interface RecentlyHiredApplicant {
    id: number;
    name: string;
    position: string;
    image: string;
    hiredDate: string;
}

const recentlyHiredApplicants: RecentlyHiredApplicant[] = [
    { id: 1, name: 'John Paul F. Vivar', position: 'IT Instructor', image: '/images/hired_pilot_1.png', hiredDate: '2026-03-01' },
    { id: 2, name: 'Maria Elena S. Cruz', position: 'HR Specialist', image: '/images/hired_admin_1.png', hiredDate: '2026-03-10' },
    { id: 3, name: 'Roberto G. Santos', position: 'Aircraft Mechanic', image: '/images/hired_mechanic_1.png', hiredDate: '2026-03-12' },
];

export const getRecentlyHired = (): RecentlyHiredApplicant[] => {
    if (typeof window === 'undefined') return recentlyHiredApplicants;
    try {
        const localHired = localStorage.getItem('mock_recently_hired');
        return localHired ? JSON.parse(localHired) : recentlyHiredApplicants;
    } catch (e) {
        return recentlyHiredApplicants;
    }
};

export const updateRecentlyHired = (updated: RecentlyHiredApplicant[]) => {
    if (typeof window === 'undefined') return;
    const newValue = JSON.stringify(updated);
    localStorage.setItem('mock_recently_hired', newValue);
    const storageEvent = new StorageEvent('storage', {
        key: 'mock_recently_hired',
        oldValue: null,
        newValue,
        url: window.location.href,
        storageArea: localStorage,
    });
    window.dispatchEvent(storageEvent);
};


// Helper to generate mock applicants
const generateMockApplications = (count: number) => {
    const firstNames = ['Juan', 'Maria', 'Pedro', 'Ana', 'Carlos', 'John', 'Sarah', 'Michael', 'Emma', 'David', 'James', 'Emily', 'Robert', 'Linda', 'William', 'Elizabeth', 'Joseph', 'Jennifer', 'Thomas', 'Susan', 'Daniel', 'Margaret', 'Matthew', 'Lisa', 'Anthony', 'Nancy', 'Mark', 'Karen', 'Donald', 'Betty'];
    const lastNames = ['Dela Cruz', 'Santos', 'Penduko', 'Reyes', 'Garcia', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'];
    const positions = ['Flight Instructor', 'Aircraft Mechanic', 'Ground Instructor', 'Administrative Assistant', 'HR Specialist', 'Maintenance Technician', 'Safety Officer', 'Operations Manager', 'student Pilot'];
    const statuses = ['Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'];
    const educationList = ['BS Aviation Major in Flying', 'BS Aircraft Maintenance Technology', 'BS Business Administration', 'BS Tourism', 'BS Psychology', 'BS Education', 'Vocational Diploma'];
    const skillsList = ['CPL', 'Instrument', 'Safety Management', 'AMT License', 'Troubleshooting', 'Logbook', 'MS Office', 'Organization', 'Communication', 'Customer Service', 'Public Speaking', 'Aviation Law', 'Project Management', 'Team Leadership'];

    const apps = [];

    // Status weights for realistic distribution
    const getWeightedStatus = () => {
        const rand = Math.random();
        if (rand < 0.30) return 'Submitted';
        if (rand < 0.55) return 'Under Review';
        if (rand < 0.80) return 'Rejected';
        if (rand < 0.92) return 'Shortlisted';
        return 'Hired';
    };

    for (let i = 1; i <= count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        // Pick a real job from mockJobs to get accurate location/campus
        const randomJob = mockJobs[Math.floor(Math.random() * mockJobs.length)];
        const jobTitle = randomJob.title;
        const campus = randomJob.location;

        const status = getWeightedStatus();

        // Generate realistic AI score based on status
        let targetScore = 0;
        if (status === 'Hired') {
            targetScore = 35 + Math.floor(Math.random() * 11); // 35-45
        } else if (status === 'Shortlisted') {
            targetScore = 28 + Math.floor(Math.random() * 13); // 28-40
        } else if (status === 'Under Review') {
            targetScore = 15 + Math.floor(Math.random() * 21); // 15-35
        } else if (status === 'Rejected') {
            targetScore = Math.floor(Math.random() * 26); // 0-25
        } else {
            targetScore = Math.floor(Math.random() * 46); // 0-45 for Submitted
        }

        // Ensure score doesn't exceed 45
        targetScore = Math.min(45, targetScore);

        // Distribute the score across components realistically
        // Education: 0-5 (11% of max), Experience: 0-25 (56% of max), 
        // Accomplishments: 0-5 (11% of max), Training: 0-10 (22% of max)
        const educationScore = Math.min(5, Math.floor(targetScore * 0.11));
        const experienceScore = Math.min(25, Math.floor(targetScore * 0.56));
        const accomplishmentsScore = Math.min(5, Math.floor(targetScore * 0.11));

        // Calculate remaining for training
        let trainingScore = targetScore - educationScore - experienceScore - accomplishmentsScore;
        trainingScore = Math.max(0, Math.min(10, trainingScore));

        // Final check: ensure total doesn't exceed 45
        let totalScore = educationScore + experienceScore + accomplishmentsScore + trainingScore;

        // If somehow total exceeds 45, adjust by reducing training first, then others
        if (totalScore > 45) {
            const excess = totalScore - 45;
            trainingScore = Math.max(0, trainingScore - excess);
            totalScore = educationScore + experienceScore + accomplishmentsScore + trainingScore;
        }

        // Date within last 180 days (6 months) for better trend data
        const daysAgo = Math.floor(Math.random() * 180);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];

        // Generate realistic applicant data that matches the scores
        // Education level based on education score
        let educationLevel = 'bachelor';
        if (educationScore === 5) educationLevel = 'doctoral_graduate';
        else if (educationScore === 4) educationLevel = 'doctoral_27+';
        else if (educationScore === 3) educationLevel = 'doctoral_18-24';
        else if (educationScore === 2) educationLevel = 'masters';
        else if (educationScore === 1) educationLevel = 'bachelor';

        // Years of experience based on experience score (2 points per year above requirement)
        const yearsOfExperience = Math.floor(experienceScore / 2);

        // Awards based on accomplishments score
        const awardsList = [];
        if (accomplishmentsScore >= 4) awardsList.push('national', 'csc');
        else if (accomplishmentsScore === 3) awardsList.push('national');
        else if (accomplishmentsScore === 2) awardsList.push('csc');
        else if (accomplishmentsScore === 1) awardsList.push('ngo');

        // Training hours based on training score
        let trainingHours = 0;
        if (trainingScore === 10) trainingHours = 40 + Math.floor(Math.random() * 20); // 40+
        else if (trainingScore === 5) trainingHours = 24 + Math.floor(Math.random() * 16); // 24-39
        else if (trainingScore === 3) trainingHours = 8 + Math.floor(Math.random() * 16); // 8-23


        // Generate mock documents
        const documentTypes = [
            'Letter of Intent',
            'Personal Data Sheet (PDS)',
            'Work Experience Sheet',
            'Certificate of Eligibility',
            'Transcript of Records (TOR)',
            'Training Certificates',
            'Performance Rating'
        ];

        const numDocs = 3 + Math.floor(Math.random() * 4); // 3 to 6 documents
        const docs = [];
        const shuffled = documentTypes.sort(() => 0.5 - Math.random());
        for (let k = 0; k < numDocs; k++) {
            docs.push({
                name: shuffled[k],
                url: '#', // Placeholder link
                date: dateStr
            });
        }


        apps.push({
            id: i,
            applicantName: `${firstName} ${lastName}`,
            applicantEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@example.com`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@example.com`,
            phone: `09${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 10000)}`,
            jobTitle: jobTitle,
            jobId: parseInt(randomJob.id),
            campus: campus,
            status: status,
            submittedDate: dateStr,
            aiScore: totalScore,
            aiScoreBreakdown: {
                education: educationScore,
                experience: experienceScore,
                accomplishments: accomplishmentsScore,
                training: trainingScore
            },
            // AI scoring input fields for verification
            educationLevel: educationLevel,
            yearsOfExperience: yearsOfExperience,
            awards: awardsList,
            trainingHours: trainingHours,
            // Legacy fields
            education: educationList[Math.floor(Math.random() * educationList.length)],
            experience: `${Math.floor(Math.random() * 10)} years experience`,

            skills: [
                skillsList[Math.floor(Math.random() * skillsList.length)],
                skillsList[Math.floor(Math.random() * skillsList.length)],
                skillsList[Math.floor(Math.random() * skillsList.length)]
            ],
            resumeUrl: '#',
            documents: docs
        });
    }
    return apps.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
};

export const mockApplications: any[] = [];
export const mockInterviews: any[] = [];
export const mockEvents: any[] = [];

export const mockActivities: any[] = [];

export const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Fallback if date is somehow in the future or invalid
    if (diffMs < 0 || isNaN(diffMs)) return 'Just now';
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
};

export const getActivities = (dbApps: any[] = [], dbJobs: any[] = []) => {
    if (typeof window === 'undefined') return mockActivities;
    
    const activities: any[] = [];
    let idCounter = 1;

    // 1. Add real database jobs
    (dbJobs || []).forEach((job: any) => {
        if (!job.postedDate) return;
        activities.push({
            id: `db_job_${job.id}`,
            action: 'Job Posted',
            details: `New position: ${job.title} (${job.employmentType || 'Full-time'})`,
            time: getTimeAgo(job.postedDate),
            date: job.postedDate,
            icon: 'Briefcase',
            color: 'text-green-500 bg-green-100',
            campus: job.location || 'Pasay City',
            timestamp: new Date(job.postedDate).getTime()
        });
    });

    // 2. Add real database applications and status changes
    (dbApps || []).forEach((app: any) => {
        if (!app.submittedDate) return;
        
        // Base Submission
        activities.push({
            id: `db_app_sub_${app.id}`,
            action: 'New Application',
            details: `${app.applicantName} applied for ${app.jobTitle}`,
            time: getTimeAgo(app.submittedDate),
            date: app.submittedDate,
            icon: 'UserPlus',
            color: 'text-blue-500 bg-blue-100',
            campus: app.campus || 'Pasay City',
            timestamp: new Date(app.submittedDate).getTime()
        });
        
        // Status changes
        if (app.status === 'Hired') {
            const dateObj = new Date(app.submittedDate);
            dateObj.setMinutes(dateObj.getMinutes() + 5);
            const hiredDateStr = dateObj.toISOString();
            
            activities.push({
                id: `db_app_hired_${app.id}`,
                action: 'Candidate Hired',
                details: `${app.applicantName} has been officially hired as ${app.jobTitle}`,
                time: getTimeAgo(hiredDateStr),
                date: hiredDateStr,
                icon: 'UserCheck',
                color: 'text-green-600 bg-green-50',
                campus: app.campus || 'Pasay City',
                timestamp: dateObj.getTime()
            });
        } else if (app.status === 'Rejected') {
            const dateObj = new Date(app.submittedDate);
            dateObj.setMinutes(dateObj.getMinutes() + 3);
            const rejectedDateStr = dateObj.toISOString();
            
            activities.push({
                id: `db_app_rejected_${app.id}`,
                action: 'Application Rejected',
                details: `${app.applicantName} - ${app.jobTitle}`,
                time: getTimeAgo(rejectedDateStr),
                date: rejectedDateStr,
                icon: 'XCircle',
                color: 'text-red-500 bg-red-100',
                campus: app.campus || 'Pasay City',
                timestamp: dateObj.getTime()
            });
        } else if (app.status === 'Shortlisted' || app.status === 'Interview' || app.status === 'Under Review') {
            const dateObj = new Date(app.submittedDate);
            dateObj.setMinutes(dateObj.getMinutes() + 2);
            const shortStr = dateObj.toISOString();
            
            activities.push({
                id: `db_app_short_${app.id}`,
                action: app.status === 'Interview' ? 'Interview Scheduled' : 'Candidate Shortlisted',
                details: `${app.applicantName} status updated to ${app.status} for ${app.jobTitle}`,
                time: getTimeAgo(shortStr),
                date: shortStr,
                icon: app.status === 'Interview' ? 'Calendar' : 'Users',
                color: app.status === 'Interview' ? 'text-purple-500 bg-purple-50' : 'text-indigo-500 bg-indigo-50',
                campus: app.campus || 'Pasay City',
                timestamp: dateObj.getTime()
            });
        }
    });

    // Sort by descending date
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    // Ensure all have correct relative time strings based on sorting
    return activities.map(act => {
        return {
            ...act,
            campus: 'Villamor Air Base, Pasay City',
            time: getTimeAgo(act.date)
        };
    });
};

// Helper to get raw jobs list (Internal use)
const getRawJobs = () => {
    if (typeof window === 'undefined') return mockJobs;
    try {
        const localJobs = JSON.parse(localStorage.getItem('mock_jobs_custom') || '[]');
        const archivedIds = JSON.parse(localStorage.getItem('mock_jobs_archived') || '[]');
        const activeMockJobs = mockJobs.filter(job => !archivedIds.includes(job.id) && !localJobs.some((lj: any) => lj.id === job.id));
        return [...localJobs, ...activeMockJobs];
    } catch (e) { return mockJobs; }
};

export const getJobs = () => {
    const allJobs = getRawJobs();
    const applications = getApplications();
    return allJobs.map((job: any) => {
        const safeJobId = parseInt(String(job.id)) || 0;
        const applicantCount = applications.filter((app: any) =>
            app.jobTitle === job.title || app.jobId === safeJobId
        ).length;
        return { ...job, applicantCount };
    });
};

// Helper to get merged applications (Mock + LocalStorage)
export const getApplications = () => {
    if (typeof window === 'undefined') return mockApplications;

    try {
        const localApps = JSON.parse(localStorage.getItem('mock_applications_custom') || '[]');

        // Filter out mock applications that have local overrides
        const activeMockApps = mockApplications.filter(app =>
            !localApps.some((la: any) => la.id === app.id)
        );

        // Combine and sanitize scores, assign to variable first
        const allProcessedApps = [...localApps, ...activeMockApps].map((app: any) => {
            // Safety check: specific component caps
            const education = Math.min(app.aiScoreBreakdown?.education || 0, 5);
            const experience = Math.min(app.aiScoreBreakdown?.experience || 0, 25);
            const accomplishments = Math.min(app.aiScoreBreakdown?.accomplishments || 0, 5);
            const training = Math.min(app.aiScoreBreakdown?.training || 0, 10);

            // Re-calculate strictly based on capped components
            const total = education + experience + accomplishments + training;

            // If the stored total is wildly different (like 98), likely using old logic. 
            // We'll trust the capped components logic or hard cap the existing score.
            let finalScore = Math.min(app.aiScore || 0, 45);

            // If the breakdown sums up to something valid, prefer that to sync them
            if (total <= 45 && total > 0) {
                finalScore = total;
            }

            // --- BACKFILL MISSING DETAILS IF "DATA NOT AVAILABLE" ---

            // 1. Education Level
            let educationLevel = app.educationLevel;
            if (!educationLevel) {
                if (education >= 5) educationLevel = 'doctoral_graduate';
                else if (education === 4) educationLevel = 'doctoral_27+';
                else if (education === 3) educationLevel = 'doctoral_18-24';
                else if (education === 2) educationLevel = 'masters';
                else educationLevel = 'bachelor';
            }

            // 2. Years of Experience
            let yearsOfExperience = app.yearsOfExperience;
            if (yearsOfExperience === undefined || yearsOfExperience === null) {
                // Approximate: 1 year experience = 1 point roughly
                yearsOfExperience = Math.max(1, experience);
            }

            // 3. Awards
            let awards = app.awards;
            if (!awards || awards.length === 0) {
                if (accomplishments > 0) {
                    const possibleAwards = ['national', 'csc', 'president', 'ngo'];
                    // Give them 'accomplishments' number of awards, up to length of possibleAwards
                    awards = possibleAwards.slice(0, Math.min(accomplishments, 4));
                } else {
                    awards = [];
                }
            }

            // 4. Training Hours
            let trainingHours = app.trainingHours;
            if (trainingHours === undefined || trainingHours === null) {
                if (training >= 10) trainingHours = 45;
                else if (training >= 5) trainingHours = 30;
                else if (training >= 3) trainingHours = 15;
                else if (training >= 1) trainingHours = 5;
                else trainingHours = 0;
            }

            return {
                ...app,
                aiScore: finalScore,
                aiScoreBreakdown: {
                    education,
                    experience,
                    accomplishments,
                    training
                },
                // Ensure these fields exist
                educationLevel,
                yearsOfExperience,
                awards,
                trainingHours
            };
        });

        // Filter: Ensure consistency - only include apps for Open Jobs
        const rawJobs = getRawJobs();
        const openJobIds = new Set(rawJobs.filter((j: any) => j.status === 'Open').map((j: any) => String(j.id)));
        const openJobTitles = new Set(rawJobs.filter((j: any) => j.status === 'Open').map((j: any) => j.title));

        return allProcessedApps.filter((app: any) => openJobIds.has(String(app.jobId)) || openJobTitles.has(app.jobTitle));
    } catch (e) {
        console.error("Error reading from localStorage", e);
        return mockApplications;
    }
};

// Helper for dynamic notifications
export const getDynamicNotifications = (userEmail?: string) => {
    if (typeof window === 'undefined' || !userEmail) return [];

    const notifications: any[] = [];
    const allApps = getApplications().filter((app: any) => app.applicantEmail === userEmail);
    const allJobs = getJobs();
    const readNotifications = JSON.parse(localStorage.getItem('read_notifications') || '[]');

    // 1. Application-based notifications
    allApps.forEach((app: any) => {
        // Application Submitted
        notifications.push({
            id: `sub_${app.id}`,
            text: `Your application for ${app.jobTitle} was successfully submitted.`,
            time: app.submittedDate,
            isRead: readNotifications.includes(`sub_${app.id}`),
            type: 'success'
        });

        // Application Status Changes
        if (app.status !== 'Submitted') {
            notifications.push({
                id: `status_${app.id}_${app.status}`,
                text: `Update: Your application for ${app.jobTitle} is now "${app.status}".`,
                time: new Date().toISOString().split('T')[0], // Simulate recent update
                isRead: readNotifications.includes(`status_${app.id}_${app.status}`),
                type: 'info'
            });
        }
    });

    // 2. New Job Openings (Mocking recent ones)
    allJobs.slice(0, 2).forEach((job: any) => {
        notifications.push({
            id: `job_${job.id}`,
            text: `New career opportunity: ${job.title} in ${job.department}.`,
            time: job.postedDate,
            isRead: readNotifications.includes(`job_${job.id}`),
            type: 'new'
        });
    });

    // Sort by id (newer first usually for this demo)
    return notifications.sort((a, b) => b.id.localeCompare(a.id));
};

export const getAnalyticsData = (campus?: string, dbApps?: any[], dbJobs?: any[], unfilledCount?: number) => {
    // Exclude 'Archived' applications to match visible applicant list
    const allApplications = dbApps 
        ? dbApps.filter((app: any) => app.status !== 'Archived') 
        : getApplications().filter((app: any) => app.status !== 'Archived');
        
    const allJobs = dbJobs ? dbJobs : getJobs();

    // If using mock data (no dbApps), filter valid apps to match public listings
    let validApps = allApplications;
    if (!dbApps) {
        const openJobs = allJobs.filter((j: any) => j.status === 'Open');
        const activeIds = new Set(openJobs.map((j: any) => String(j.id)));
        const activeTitles = new Set(openJobs.map((j: any) => j.title));
        validApps = allApplications.filter((app: any) =>
            activeIds.has(String(app.jobId)) || activeTitles.has(app.jobTitle)
        );
    }

    // Filter by campus if provided
    const filteredApplications = campus
        ? validApps.filter((app: any) => app.campus === campus)
        : validApps;

    const filteredJobs = campus
        ? allJobs.filter(job => job.location === campus)
        : allJobs;

    // Dynamic calculations based on filtered data
    const totalCount = Array.isArray(filteredApplications) ? filteredApplications.length : 0;
    const totalApplicants = isNaN(totalCount) ? 0 : totalCount;
    const openPositions = filteredJobs.filter(job => job.status === 'Open').length;
    const pendingApplications = filteredApplications.filter(app => ['Submitted', 'Under Review'].includes(app.status)).length;
    const shortlistedCandidates = filteredApplications.filter(app => app.status === 'Shortlisted').length;
    const rejectedApplications = filteredApplications.filter(app => app.status === 'Rejected').length;

    // Calculate trends based on the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const hiredThisMonth = filteredApplications.filter(app => {
        const date = new Date(app.submittedDate);
        return app.status === 'Hired' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const rejectedThisMonth = filteredApplications.filter(app => {
        const date = new Date(app.submittedDate);
        return app.status === 'Rejected' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const staffingData = getStaffingData();
    const unfilledPositions = unfilledCount !== undefined
        ? unfilledCount
        : (campus
            ? staffingData.filter(i => {
                const mapping: Record<string, string[]> = {
                    'NAAP - Villamor Campus': ['Villamor'],
                    'NAAP - Basa Air Base Campus': ['BAB', 'Basa'],
                    'NAAP - Basa-Palmayo Extension Campus': ['Basa-Palmayo'],
                    'NAAP - Fernando Air Base Campus': ['FAB', 'Fernando'],
                    'NAAP - Mactan Campus': ['MBEAB', 'Mactan'],
                    'NAAP - Mactan-Medellin Extension Campus': ['Mactan-Medellin']
                };
                const aliases = mapping[campus] || [campus];
                return i.status === 'Unfilled' && (aliases.includes(i.campus) || i.campus === campus);
            }).length
            : staffingData.filter(i => i.status === 'Unfilled').length);

    // Calculate distribution dynamically
    const statusCounts = filteredApplications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const applicationsByStatus = [
        { name: 'Submitted', value: statusCounts['Submitted'] || 0 },
        { name: 'Under Review', value: statusCounts['Under Review'] || 0 },
        { name: 'Shortlisted', value: statusCounts['Shortlisted'] || 0 },
        { name: 'Rejected', value: statusCounts['Rejected'] || 0 },
        { name: 'Hired', value: statusCounts['Hired'] || 0 },
    ];

    return {
        totalApplicants,
        openPositions,
        pendingApplications,
        shortlistedCandidates,
        rejectedApplications,
        hiredThisMonth,
        rejectedThisMonth,
        unfilledPositions,

        // Data for "Applicants per Position" Bar Chart (Now dynamic)
        applicantsPerPosition: filteredJobs.map(job => {
            const safeJobId = parseInt(String(job.id)) || 0;
            const count = filteredApplications.filter(app => app.jobTitle === job.title || app.jobId === safeJobId).length;
            return {
                position: job.title,
                applicants: isNaN(count) ? 0 : count
            };
        }).sort((a, b) => b.applicants - a.applicants).slice(0, 5),

        // Data for "Hiring Timeline" Line Chart (Static)
        hiringTimeline: [
            { month: 'Jan', daysToHire: 45 },
            { month: 'Feb', daysToHire: 42 },
            { month: 'Mar', daysToHire: 38 },
            { month: 'Apr', daysToHire: 35 },
            { month: 'May', daysToHire: 30 },
            { month: 'Jun', daysToHire: 28 },
        ],

        // Data for "Application Status Distribution" Pie Chart
        applicationsByStatus,

        // Data for "Monthly / Annual Hiring Summary" Line Chart (Dynamic from apps)
        hiringSummary: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => {
            const monthApps = filteredApplications.filter(app => {
                const date = new Date(app.submittedDate);
                return date.getMonth() === i;
            });
            return {
                month: m,
                hired: monthApps.filter(a => a.status === 'Hired').length,
                rejected: monthApps.filter(a => a.status === 'Rejected').length
            };
        }),

        // Data for "Monthly Application Trends" Line Chart (Dynamic from apps)
        monthlyTrends: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => ({
            month: m,
            applications: filteredApplications.filter(app => {
                const date = new Date(app.submittedDate);
                return date.getMonth() === i;
            }).length
        })),
        jobs: filteredJobs
    };
};

// Staffing Monitoring Data from Google Sheet
export const mockStaffingData = [
    // --- VILLAMOR CAMPUS ---
    { id: 1, campus: 'Villamor', office: 'Legal Unit', position: 'Attorney IV', sg: 23, status: 'Unfilled' },
    { id: 2, campus: 'Villamor', office: 'Administrative and Finance', position: 'Supervising Administrative Officer', sg: 22, status: 'Filled' },
    { id: 3, campus: 'Villamor', office: 'ICT Unit', position: 'Information Technology Officer I', sg: 19, status: 'Unfilled' },
    { id: 4, campus: 'Villamor', office: 'Procurement Unit', position: 'Administrative Officer V', sg: 18, status: 'Filled' },
    { id: 5, campus: 'Villamor', office: 'Information Unit', position: 'Information Officer III', sg: 18, status: 'Unfilled' },
    { id: 6, campus: 'Villamor', office: 'Internal Audit Unit', position: 'Internal Auditor III', sg: 18, status: 'Unfilled' },
    { id: 7, campus: 'Villamor', office: 'Planning Unit', position: 'Planning Officer III', sg: 18, status: 'Unfilled' },
    { id: 8, campus: 'Villamor', office: 'Project Management Unit', position: 'Project Development Officer III', sg: 18, status: 'Filled' },
    { id: 9, campus: 'Villamor', office: 'Accounting Unit', position: 'Accountant II', sg: 16, status: 'Filled' },
    { id: 10, campus: 'Villamor', office: 'ICT Unit', position: 'Information Systems Analyst II', sg: 16, status: 'Unfilled' },
    { id: 11, campus: 'Villamor', office: 'Budget Unit', position: 'Administrative Officer IV', sg: 15, status: 'Filled' },
    { id: 12, campus: 'Villamor', office: 'HR Management Unit', position: 'Administrative Officer IV', sg: 15, status: 'Filled' },
    { id: 13, campus: 'Villamor', office: 'Records Unit', position: 'Administrative Officer III', sg: 14, status: 'Filled' },
    { id: 14, campus: 'Villamor', office: 'Supply Management Unit', position: 'Administrative Officer III', sg: 14, status: 'Filled' },
    { id: 15, campus: 'Villamor', office: 'Board Secretary', position: 'Board Secretary I', sg: 14, status: 'Unfilled' },
    { id: 16, campus: 'Villamor', office: 'Legal Unit', position: 'Legal Assistant III', sg: 14, status: 'Unfilled' },
    { id: 17, campus: 'Villamor', office: 'ICT Unit', position: 'Information Systems Analyst I', sg: 12, status: 'Filled' },
    { id: 18, campus: 'Villamor', office: 'Legal Unit', position: 'Legal Assistant II', sg: 12, status: 'Unfilled' },
    { id: 19, campus: 'Villamor', office: 'HR Management Unit', position: 'Administrative Officer II', sg: 11, status: 'Filled' },
    { id: 20, campus: 'Villamor', office: 'Information Unit', position: 'Information Officer I', sg: 11, status: 'Filled' },
    { id: 32, campus: 'Villamor', office: 'SUC Vice President', position: 'Administrative Aide VI', sg: 6, status: 'Unfilled' },

    // --- BAB CAMPUS ---
    { id: 101, campus: 'BAB', office: 'Campus Director', position: 'Administrative Officer V', sg: 18, status: 'Filled' },
    { id: 102, campus: 'BAB', office: 'Accounting Unit', position: 'Accountant II', sg: 16, status: 'Unfilled' },
    { id: 103, campus: 'BAB', office: 'Budget Unit', position: 'Administrative Officer IV', sg: 15, status: 'Filled' },
    { id: 104, campus: 'BAB', office: 'Procurement Unit', position: 'Administrative Officer III', sg: 14, status: 'Unfilled' },

    // --- FAB CAMPUS ---
    { id: 201, campus: 'FAB', office: 'Campus Director', position: 'Administrative Officer V', sg: 18, status: 'Filled' },
    { id: 202, campus: 'FAB', office: 'Accounting Unit', position: 'Accountant II', sg: 16, status: 'Unfilled' },

    // --- MBEAB CAMPUS ---
    { id: 301, campus: 'MBEAB', office: 'Campus Director', position: 'Administrative Officer V', sg: 18, status: 'Unfilled' },
    { id: 303, campus: 'MBEAB', office: 'Budget Unit', position: 'Administrative Officer IV', sg: 15, status: 'Unfilled' },
    { id: 304, campus: 'MBEAB', office: 'Procurement Unit', position: 'Administrative Officer III', sg: 14, status: 'Unfilled' },
    { id: 305, campus: 'MBEAB', office: 'Supply Unit', position: 'Administrative Officer I', sg: 10, status: 'Unfilled' },
    { id: 306, campus: 'MBEAB', office: 'Supply Unit', position: 'Administrative Assistant II', sg: 8, status: 'Unfilled' },
    { id: 308, campus: 'MBEAB', office: 'Records Unit', position: 'Administrative Aide VI', sg: 6, status: 'Unfilled' },
];

export const getStaffingData = () => {
    if (typeof window === 'undefined') return mockStaffingData;
    try {
        const localStaffing = JSON.parse(localStorage.getItem('mock_staffing_custom') || '[]');
        return mockStaffingData.map(item => {
            const override = localStaffing.find((l: any) => l.id === item.id);
            return override ? { ...item, ...override } : item;
        });
    } catch (e) {
        return mockStaffingData;
    }
};




// --- LANDING PAGE CMS DATA ---
export interface CMSPost {
    id: string;
    title: string;
    description: string;
    date?: string;
}

export interface CMSSection {
    title: string;
    subtitle: string;
    posts: CMSPost[];
}

export interface LandingPageContent {
    hired: CMSSection;
    perks: CMSSection;
    achievements: CMSSection;
}

const defaultCMSContent: LandingPageContent = {
    hired: {
        title: "Professionals Hired",
        subtitle: "Successful placements in the aviation industry",
        posts: [
            { id: '1', title: 'Top Gun Pilot', description: 'Joined as Chief Flight Instructor last month.', date: '2026-01-15' },
            { id: '2', title: 'Aviation Tech', description: 'Now leading the maintenance crew at Mactan.', date: '2026-02-01' }
        ]
    },
    perks: {
        title: "Perks",
        subtitle: "Employee Benefits & Rewards",
        posts: []
    },
    achievements: {
        title: "Level 2",
        subtitle: "CSC PRIME-HRM Recognition",
        posts: [
            { id: '1', title: 'Maturity Level 2', description: 'Recognized for excellent HR management systems.', date: '2025-11-20' }
        ]
    }
};

export const getLandingPageContent = (): LandingPageContent => {
    if (typeof window === 'undefined') return defaultCMSContent;
    try {
        const localContent = localStorage.getItem('mock_cms_content');
        return localContent ? JSON.parse(localContent) : defaultCMSContent;
    } catch (e) {
        return defaultCMSContent;
    }
};

export const updateLandingPageContent = (newContent: LandingPageContent) => {
    if (typeof window === 'undefined') return;
    const newValue = JSON.stringify(newContent);
    localStorage.setItem('mock_cms_content', newValue);
    const storageEvent = new StorageEvent('storage', {
        key: 'mock_cms_content',
        oldValue: null,
        newValue,
        url: window.location.href,
        storageArea: localStorage,
    });
    window.dispatchEvent(storageEvent);
};

// --- HR NEWS DATA ---
export interface HRNewsItem {
    id: number;
    title: string;
    date: string;
    category: string;
    summary: string;
    author?: string;
    content?: string;
    image?: string;
    fullContent?: string; // Full HTML content for article page
}

const defaultHRNews: HRNewsItem[] = [
    {
        id: 1,
        title: "NAAP Launches New Employee Wellness Program",
        date: "June 05, 2026",
        category: "Employee Welfare",
        summary: "A comprehensive wellness initiative designed to support the physical and mental health of all NAAP employees. Features include gym memberships, mental health workshops, and flexible work arrangements.",
        author: "HR Department",
        content: "The National Aviation Academy of the Philippines (NAAP) is proud to announce the launch of its comprehensive Employee Wellness Program...",
        fullContent: `The National Aviation Academy of the Philippines (NAAP) is proud to announce the launch of its comprehensive Employee Wellness Program, designed to prioritize the physical, mental, and emotional well-being of its workforce.

Recognizing that a healthy team is a productive team, this initiative introduces a suite of benefits aimed at fostering a balanced work-life environment.

Key Features of the Program:

- Gym Memberships: Subsidized access to partner fitness centers.
- Mental Health Support: Free access to counseling services and mental health workshops.
- Flexible Work Arrangements: Options for remote work and flexible hours for eligible roles.
- Annual Health Screenings: Comprehensive executive check-ups covered by the academy.

"Our employees are our greatest asset," said the HR Director. "This program is a testament to our commitment to creating a supportive and nurturing environment where everyone can thrive."

The program takes effect immediately, and employees are encouraged to visit the HR portal for enrollment details.`
    },
    {
        id: 2,
        title: "Mass Recruitment for Senior Instructors Begins",
        date: "May 22, 2026",
        category: "Recruitment",
        summary: "In response to growing student enrollment, NAAP is opening positions for Senior Flight Instructors. We are looking for experienced pilots with a passion for teaching the next generation of aviators.",
        author: "Talent Acquisition",
        content: "In response to the surge in student enrollment for the upcoming academic year, NAAP is kicking off a Mass Recruitment Drive...",
        fullContent: `In response to the surge in student enrollment for the upcoming academic year, NAAP is kicking off a Mass Recruitment Drive for Senior Flight Instructors.

We are looking for experienced aviators with a passion for teaching to help shape the next generation of world-class pilots.

Qualifications:

- Valid Commercial Pilot License (CPL) with Instrument Rating.
- Flight Instructor License (FI).
- Minimum of 1,500 flight hours.
- Strong communication and mentorship skills.

Successful candidates will enjoy competitive compensation packages, opportunities for career advancement, and the chance to work with state-of-the-art flight simulation technology.

Interested applicants may submit their CVs through the NAAP Careers Portal or visit the HR office for walk-in interviews starting June 1st.`
    },
    {
        id: 3,
        title: "Advanced Leadership Training for Admin Staff",
        date: "May 10, 2026",
        category: "Training & Dev",
        summary: "Selected administrative staff will undergo a 3-day intensive leadership workshop. This program aims to enhance management skills and foster a culture of continuous improvement within the academy.",
        author: "Learning & Development",
        content: "NAAP invests in its future leaders with the rollout of the Advanced Leadership Training Workshop...",
        fullContent: `NAAP invests in its future leaders with the rollout of the Advanced Leadership Training Workshop for selected administrative staff.

This 3-day intensive program, held in partnership with top management consultants, aims to equip our admin team with the strategic skills needed to navigate the evolving aviation education landscape.

Workshop Modules:

- Strategic Decision Making
- Conflict Resolution and Negotiation
- Change Management
- Innovation in Educational Administration

Participants will engage in case studies, role-playing simulations, and peer coaching sessions. This initiative underscores NAAP's dedication to continuous professional development and internal promotion.`
    },
    {
        id: 4,
        title: "NAAP Achieves CSC PRIME-HRM Level 2 Maturity",
        date: "June 12, 2026",
        category: "Recognition",
        summary: "The National Aviation Academy of the Philippines has been officially recognized by the Civil Service Commission for achieving Level 2 Maturity in the Program to Institutionalize Meritocracy and Excellence in Human Resource Management.",
        author: "Office of the President",
        content: "The National Aviation Academy of the Philippines has been officially recognized by the Civil Service Commission (CSC) for achieving Level 2 Maturity in PRIME-HRM...",
        fullContent: `The National Aviation Academy of the Philippines has been officially recognized by the Civil Service Commission (CSC) for achieving Level 2 Maturity in the Program to Institutionalize Meritocracy and Excellence in Human Resource Management (PRIME-HRM).

CORE HR SYSTEMS

Recruitment, Selection & Placement
Merit-based hiring ensuring only the most qualified aviation professionals join our ranks. We follow strict standards to uphold the quality of our force.

Learning & Development
Continuous capacity building through scholarships, trainings, and industry partnerships. We invest in the growth of our people.

Performance Management
Data-driven performance reviews that align individual goals with the Academy's mission. Transparency and objectiveness are key.

Rewards & Recognition
Recognizing excellence and service through a structured and transparent awards system. Motivating our workforce to reach greater heights.

---

MATURITY LEVEL 2
Achieved: 2025-11-20
Recognized for excellent HR management systems.

---

MEMORANDUM

Office of the President

To: All Department Heads, Faculty, and Staff
From: Dr. Rolando A. Solis, Ph.D., College President
Date: June 12, 2026
Subject: GRANT OF CSC PRIME-HRM LEVEL 2 MATURITY STATUS

I am pleased to announce that the Civil Service Commission (CSC) has officially conferred the Program to Institutionalize Meritocracy and Excellence in Human Resource Management (PRIME-HRM) Level 2 Maturity status to the National Aviation Academy of the Philippines.

This recognition is a testament to our unwavering commitment to excellence in public service. The Academy has successfully met the rigorous standards set by the Commission in the four (4) core HRM systems:

- Recruitment, Selection & Placement: Upholding meritocracy and fitness in our hiring processes.
- Learning & Development: Ensuring continuous professional growth for our workforce.
- Performance Management: Aligning individual performance with our organizational strategic goals.
- Rewards & Recognition: Valuing the outstanding contributions of our employees.

This achievement belongs to every member of the NAAP community. Your dedication and hard work have placed our institution among the elite agencies in the country with this level of HR maturity.

Let this milestone inspire us to continue serving with integrity, excellence, and dedication.

Signed,
Dr. Rolando A. Solis, Ph.D.
College President

---

EVENT HIGHLIGHTS

MOA Signing Event
Official MOA Signing Ceremony

Assessment and Review
CSC Assessment and Compliance Review`
    }
];

export const getHRNews = (): HRNewsItem[] => {
    if (typeof window === 'undefined') return defaultHRNews;
    try {
        const localNews = localStorage.getItem('mock_hr_news');
        return localNews ? JSON.parse(localNews) : defaultHRNews;
    } catch (e) {
        return defaultHRNews;
    }
};

export const updateHRNews = (newsItems: HRNewsItem[]) => {
    if (typeof window === 'undefined') return;
    const newValue = JSON.stringify(newsItems);
    localStorage.setItem('mock_hr_news', newValue);
    const storageEvent = new StorageEvent('storage', {
        key: 'mock_hr_news',
        oldValue: null,
        newValue,
        url: window.location.href,
        storageArea: localStorage,
    });
    window.dispatchEvent(storageEvent);
};

// --- WELCOME PAGE ANNOUNCEMENTS ---
export interface Announcement {
    id: number;
    image: string;
    title: string;
    description: string;
}

const defaultAnnouncements: Announcement[] = [
    {
        id: 1,
        image: '/images/Dorm1.jpg',
        title: "Enrollment Now Open for AY 2026-2027",
        description: "Join the next generation of aviation professionals. Applications are now being accepted for all programs."
    },
    {
        id: 2,
        image: '/images/Dorm2.jpg',
        title: "New Campus Facilities Unveiled",
        description: "State-of-the-art flight simulators and modernized dormitories now available for student use."
    },
    {
        id: 3,
        image: '/images/dorm3.jpg',
        title: "Career Fair: February 20, 2026",
        description: "Meet with top aviation employers and explore exciting career opportunities in the industry."
    }
];

export const getAnnouncements = (): Announcement[] => {
    if (typeof window === 'undefined') return defaultAnnouncements;
    try {
        const localAnnouncements = localStorage.getItem('mock_announcements');
        return localAnnouncements ? JSON.parse(localAnnouncements) : defaultAnnouncements;
    } catch (e) {
        return defaultAnnouncements;
    }
};

export const updateAnnouncements = (announcements: Announcement[]) => {
    if (typeof window === 'undefined') return;
    const newValue = JSON.stringify(announcements);
    localStorage.setItem('mock_announcements', newValue);
    const storageEvent = new StorageEvent('storage', {
        key: 'mock_announcements',
        oldValue: null,
        newValue,
        url: window.location.href,
        storageArea: localStorage,
    });
    window.dispatchEvent(storageEvent);
};
