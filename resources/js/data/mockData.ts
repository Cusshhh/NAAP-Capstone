// --- SALARY GRADE MAPPING (Official DBM SSL Schedule / Executive Order No. 64) ---
export const SALARY_GRADE_MAP: Record<number, number> = {
    1: 14634, 2: 15522, 3: 16486, 4: 17506, 5: 18581,
    6: 19716, 7: 20914, 8: 22423, 9: 24329, 10: 26917,
    11: 31705, 12: 33947, 13: 36125, 14: 38764, 15: 42178,
    16: 45694, 17: 49562, 18: 53818, 19: 59153, 20: 66052,
    21: 73303, 22: 81796, 23: 91306, 24: 102603, 25: 116643,
    26: 131807, 27: 148940, 28: 167129, 29: 187531, 30: 210718,
    31: 300961, 32: 356237, 33: 449157
};

export const mockJobs: any[] = [];

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
        if (localHired) {
            const parsed = JSON.parse(localHired);
            if (Array.isArray(parsed)) return parsed;
        }
        return recentlyHiredApplicants;
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
    const statuses = ['Submitted', 'Under Review', 'Interview Scheduled', 'Rejected', 'Hired'];
    const educationList = ['BS Aviation Major in Flying', 'BS Aircraft Maintenance Technology', 'BS Business Administration', 'BS Tourism', 'BS Psychology', 'BS Education', 'Vocational Diploma'];
    const skillsList = ['CPL', 'Instrument', 'Safety Management', 'AMT License', 'Troubleshooting', 'Logbook', 'MS Office', 'Organization', 'Communication', 'Customer Service', 'Public Speaking', 'Aviation Law', 'Project Management', 'Team Leadership'];

    const apps = [];

    // Status weights for realistic distribution
    const getWeightedStatus = () => {
        const rand = Math.random();
        if (rand < 0.35) return 'Submitted';
        if (rand < 0.65) return 'Under Review';
        if (rand < 0.85) return 'Rejected';
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

            skills: [],
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
        const statusDateStr = app.updatedAt || app.updated_at || app.submittedDate;
        const dateObj = new Date(statusDateStr);
        const formattedStatusDate = dateObj.toISOString();

        if (app.status === 'Hired') {
            activities.push({
                id: `db_app_hired_${app.id}`,
                action: 'Candidate Hired',
                details: `${app.applicantName} has been officially hired as ${app.jobTitle}`,
                time: getTimeAgo(formattedStatusDate),
                date: formattedStatusDate,
                icon: 'UserCheck',
                color: 'text-green-600 bg-green-50',
                campus: app.campus || 'Pasay City',
                timestamp: dateObj.getTime()
            });
        } else if (app.status === 'Rejected') {
            activities.push({
                id: `db_app_rejected_${app.id}`,
                action: 'Application Rejected',
                details: `${app.applicantName} - ${app.jobTitle}`,
                time: getTimeAgo(formattedStatusDate),
                date: formattedStatusDate,
                icon: 'XCircle',
                color: 'text-red-500 bg-red-100',
                campus: app.campus || 'Pasay City',
                timestamp: dateObj.getTime()
            });
        } else if (app.status === 'Interview' || app.status === 'Interview Scheduled' || app.status === 'Under Review') {
            const isInterview = app.status === 'Interview' || app.status === 'Interview Scheduled';
            const actionName = isInterview
                ? 'Interview Scheduled' 
                : 'Application Under Review';

            const iconName = isInterview
                ? 'Calendar' 
                : 'FileText';

            const colorClass = isInterview
                ? 'text-purple-500 bg-purple-50' 
                : 'text-amber-600 bg-amber-50';

            activities.push({
                id: `db_app_short_${app.id}`,
                action: actionName,
                details: `${app.applicantName} status updated to ${app.status} for ${app.jobTitle}`,
                time: getTimeAgo(formattedStatusDate),
                date: formattedStatusDate,
                icon: iconName,
                color: colorClass,
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
            let awards = app.awards || [];

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
    const shortlistedCandidates = 0;
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
        { name: 'Interview Scheduled', value: statusCounts['Interview Scheduled'] || statusCounts['Interview'] || 0 },
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

        // Data for "Applicants per Position" Bar Chart (Dynamic & formatted)
        applicantsPerPosition: filteredJobs.map(job => {
            const safeJobId = parseInt(String(job.id)) || 0;
            const count = filteredApplications.filter(app => {
                const appJobId = parseInt(String(app.jobId || app.job_id)) || 0;
                const appJobTitle = (app.jobTitle || app.job_title || '').trim().toLowerCase();
                return (safeJobId > 0 && appJobId === safeJobId) || (appJobTitle && appJobTitle === job.title.trim().toLowerCase());
            }).length;
            
            const shortTitle = job.title.length > 24 ? job.title.substring(0, 21) + '...' : job.title;
            return {
                position: shortTitle,
                fullPosition: job.title,
                applicants: isNaN(count) ? 0 : count
            };
        }).sort((a, b) => b.applicants - a.applicants).slice(0, 5),

        // Data for "Time to Hire (Days)" Line Chart (Dynamic last 6 months based on hired applicants)
        hiringTimeline: (() => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last6 = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6.push({ name: monthNames[d.getMonth()], mIdx: d.getMonth(), year: d.getFullYear() });
            }
            return last6.map(m => {
                const hiredInMonth = filteredApplications.filter(app => {
                    if (app.status !== 'Hired') return false;
                    const rawDate = app.updatedAt || app.updated_at || app.submittedDate || app.created_at;
                    if (!rawDate) return false;
                    const date = new Date(rawDate);
                    return date.getMonth() === m.mIdx && date.getFullYear() === m.year;
                });

                if (hiredInMonth.length === 0) {
                    return { month: m.name, daysToHire: 0 };
                }

                const totalDays = hiredInMonth.reduce((sum, app) => {
                    const start = new Date(app.submittedDate || app.created_at || Date.now());
                    const end = new Date(app.updatedAt || app.updated_at || Date.now());
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    return sum + diffDays;
                }, 0);

                const avgDays = Math.round(totalDays / hiredInMonth.length);
                return { month: m.name, daysToHire: avgDays };
            });
        })(),

        // Data for "Application Status Distribution" Pie Chart
        applicationsByStatus,

        // Data for "Monthly / Annual Hiring Summary" Line Chart (Dynamic last 6 months)
        hiringSummary: (() => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last6 = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6.push({ name: monthNames[d.getMonth()], mIdx: d.getMonth(), year: d.getFullYear() });
            }
            return last6.map(m => {
                const monthApps = filteredApplications.filter(app => {
                    const rawDate = app.submittedDate || app.created_at;
                    if (!rawDate) return false;
                    const date = new Date(rawDate);
                    return date.getMonth() === m.mIdx && date.getFullYear() === m.year;
                });
                return {
                    month: m.name,
                    hired: monthApps.filter(a => a.status === 'Hired').length,
                    rejected: monthApps.filter(a => a.status === 'Rejected').length
                };
            });
        })(),

        // Data for "Monthly Application Trends" Line Chart (Dynamic last 6 months)
        monthlyTrends: (() => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last6 = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6.push({ name: monthNames[d.getMonth()], mIdx: d.getMonth(), year: d.getFullYear() });
            }
            return last6.map(m => ({
                month: m.name,
                applications: filteredApplications.filter(app => {
                    const rawDate = app.submittedDate || app.created_at;
                    if (!rawDate) return false;
                    const date = new Date(rawDate);
                    return date.getMonth() === m.mIdx && date.getFullYear() === m.year;
                }).length
            }));
        })(),
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
        if (localNews) {
            const parsed = JSON.parse(localNews);
            if (Array.isArray(parsed)) return parsed;
        }
        return defaultHRNews;
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
        if (localAnnouncements) {
            const parsed = JSON.parse(localAnnouncements);
            if (Array.isArray(parsed)) return parsed;
        }
        return defaultAnnouncements;
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
