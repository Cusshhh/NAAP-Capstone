// AI Qualification & Scoring Utility for NAAP Careers Portal
// Enforces CHED 14 Official Discipline Clusters, CSC / PRC / CAAP / TESDA Eligibility Standards, & Degree Tier Hierarchy
// Criteria Weights: Education (30%), Work Experience (35%), Civil Service & Board Eligibility (20%), Training & Certification (15%)

export type QualificationCategory = 'education' | 'experience' | 'eligibility' | 'training';
export type MatchStatus = 'FULLY_MATCHED' | 'PARTIALLY_MATCHED' | 'NOT_MATCHED' | 'NOT_INDICATED';

export type DisciplineCluster =
    | 'AVIATION_AERONAUTICS'
    | 'IT_COMPUTER_STUDIES'
    | 'ENGINEERING_TECHNOLOGY'
    | 'LAW_LEGAL_STUDIES'
    | 'BUSINESS_ADMINISTRATION'
    | 'EDUCATION_TEACHER_TRAINING'
    | 'HEALTH_MEDICAL_SCIENCES'
    | 'NATURAL_SCIENCES'
    | 'SOCIAL_BEHAVIORAL_SCIENCES'
    | 'COMMUNICATION_JOURNALISM'
    | 'MARITIME_STUDIES'
    | 'ARCHITECTURE_TOWN_PLANNING'
    | 'HUMANITIES_ARTS'
    | 'AGRICULTURE_FORESTRY'
    | 'GENERAL_OTHER';

export const DISCIPLINE_CLUSTER_LABELS: Record<DisciplineCluster, string> = {
    AVIATION_AERONAUTICS: 'Aviation & Aeronautical Sciences',
    IT_COMPUTER_STUDIES: 'Information Technology & Computer Studies',
    ENGINEERING_TECHNOLOGY: 'Engineering & Industrial Technology',
    LAW_LEGAL_STUDIES: 'Law & Jurisprudence',
    BUSINESS_ADMINISTRATION: 'Business & Financial Management',
    EDUCATION_TEACHER_TRAINING: 'Education & Teacher Training',
    HEALTH_MEDICAL_SCIENCES: 'Health & Medical Sciences',
    NATURAL_SCIENCES: 'Natural Sciences & Mathematics',
    SOCIAL_BEHAVIORAL_SCIENCES: 'Social & Behavioral Sciences',
    COMMUNICATION_JOURNALISM: 'Communication & Mass Media',
    MARITIME_STUDIES: 'Maritime Studies & Marine Operations',
    ARCHITECTURE_TOWN_PLANNING: 'Architecture & Environmental Planning',
    HUMANITIES_ARTS: 'Humanities & Fine Arts',
    AGRICULTURE_FORESTRY: 'Agriculture & Forestry',
    GENERAL_OTHER: 'General / Non-Specific Field'
};

export interface JobRequirementItem {
    id: string;
    category: QualificationCategory;
    requirement: string;
    required_value: string;
    weight?: number;
    mandatory: boolean;
}

export interface ItemizedMatchResult {
    requirement_id: string;
    category: QualificationCategory;
    category_label: string;
    requirement: string;
    required_value: string;
    applicant_value: string;
    match_status: MatchStatus;
    multiplier: number;
    score_contribution: number;
    mandatory: boolean;
    explanation: string;
}

export interface CategorySummary {
    category: QualificationCategory;
    label: string;
    configured_weight: number;
    normalized_weight: number;
    score: number; // 0 to 100
    evaluated_count: number;
    total_count: number;
    has_missing: boolean;
}

export interface QualificationAnalysisOutput {
    job_id: number | string;
    job_title: string;
    overall_score: number; // 0 to 100
    formatted_percentage: string;
    categories: Record<QualificationCategory, CategorySummary>;
    itemized_results: ItemizedMatchResult[];
    summary_counts: {
        fully_matched: number;
        partially_matched: number;
        not_matched: number;
        not_indicated: number;
    };
    alerts: string[];
    analysis_summary: string;
    analysis_version: string;
    is_fallback_requirements?: boolean;
}

export interface ScoringInput {
    educationLevel: 'bachelor' | 'masters' | 'doctoral_graduate' | 'doctoral_27+' | 'doctoral_18-24' | 'doctoral_15-18' | 'doctoral_9-15';
    requiredEducation?: 'bachelor' | 'masters';
    yearsOfExperience: number;
    requiredYearsOfExperience?: number;
    eligibilities?: string[];
    licenseNo?: string;
    awards?: ('national' | 'csc' | 'president' | 'ngo')[];
    trainingHours: number;
}

export interface ScoreBreakdown {
    education: number;
    experience: number;
    accomplishments: number;
    training: number;
    total: number;
}

// Default 4-category weights (Sum = 100%)
export const DEFAULT_CATEGORY_WEIGHTS: Record<QualificationCategory, number> = {
    education: 30,
    experience: 35,
    eligibility: 20,
    training: 15
};

export const CATEGORY_LABELS: Record<QualificationCategory, string> = {
    education: 'Educational Background',
    experience: 'Work Experience',
    eligibility: 'Civil Service & Board Eligibility',
    training: 'Training & Certification'
};

/**
 * Comprehensive CHED 14 Official Discipline Cluster Classifier.
 * Supports full degree names, common degree abbreviations (BSIT, BSN, BSA, BSBA, LLB, JD, BSED, etc.),
 * and interdisciplinary degrees (e.g. Aviation IT, Health Informatics).
 */
export function detectDisciplineCluster(text: string): DisciplineCluster {
    const t = (text || '').toLowerCase().trim();
    if (!t || isNonsenseCredential(t)) return 'GENERAL_OTHER';

    // 1. Information Technology & Computer Studies
    if (t.includes('information technology') || t.includes('computer science') || t.includes('software') ||
        t.includes('information systems') || t.includes('computer engineering') || t.includes('web dev') ||
        t.includes('cybersecurity') || t.includes('programming') || t.includes('data science') ||
        t.match(/\b(bsit|bscs|bsis|bs cpe|it|cs|is)\b/)) {
        return 'IT_COMPUTER_STUDIES';
    }

    // 2. Aviation & Aeronautics
    if (t.includes('aviation') || t.includes('aeronautical') || t.includes('pilot') || t.includes('flying') ||
        t.includes('amt') || t.includes('avionics') || t.includes('flight') || t.includes('aircraft') ||
        t.includes('cabin crew') || t.match(/\b(bsae|bs amt|cpl|atpl)\b/)) {
        return 'AVIATION_AERONAUTICS';
    }

    // 3. Engineering & Industrial Technology
    if (t.includes('engineering') || t.includes('mechanical') || t.includes('electrical') ||
        t.includes('civil eng') || t.includes('electronics') || t.includes('mechatronics') ||
        t.includes('industrial tech') || t.match(/\b(bsce|bsme|bsee|bsece|bsie|bsche)\b/)) {
        return 'ENGINEERING_TECHNOLOGY';
    }

    // 4. Law & Jurisprudence
    if (t.includes('law') || t.includes('juris') || t.includes('llb') || t.includes('paralegal') ||
        t.includes('legal') || t.match(/\b(ll\.b|j\.d\.|jd)\b/)) {
        return 'LAW_LEGAL_STUDIES';
    }

    // 5. Education & Teacher Training
    if ((t.includes('teacher') || t.includes('teaching') || t.includes('pedagogy') ||
        t.includes('secondary ed') || t.includes('elementary ed') || t.includes('bachelor of education') ||
        t.includes('master of education') || t.match(/\b(maed|bed|bsed|beed|lpt)\b/)) &&
        !t.includes('educational degree') && !t.includes('educational background') && !t.includes('educational requirement')) {
        return 'EDUCATION_TEACHER_TRAINING';
    }

    // 6. Business Administration, Accountancy & Office Management
    if (t.includes('business') || t.includes('accountancy') || t.includes('finance') || t.includes('marketing') ||
        t.includes('human resource') || t.includes('management') || t.includes('cpa') || t.includes('office administration') ||
        t.includes('administrative') || t.includes('administration') || t.match(/\b(bsba|mba|bsa|bsoa|hr|hrmo|hrdm)\b/)) {
        return 'BUSINESS_ADMINISTRATION';
    }

    // 7. Health & Medical Sciences
    if (t.includes('nursing') || t.includes('medicine') || t.includes('pharmacy') || t.includes('medical') ||
        t.includes('physical therapy') || t.includes('public health') || t.includes('radiologic') ||
        t.match(/\b(bsn|md|bsmt|radtech|pt|ot)\b/)) {
        return 'HEALTH_MEDICAL_SCIENCES';
    }

    // 8. Maritime Studies & Marine Operations
    if (t.includes('maritime') || t.includes('marine') || t.includes('nautical') || t.includes('seaman') ||
        t.match(/\b(bsmt|bsmar-e|bsmare)\b/)) {
        return 'MARITIME_STUDIES';
    }

    // 9. Architecture & Environmental Planning
    if (t.includes('architecture') || t.includes('urban planning') || t.includes('interior design') ||
        t.match(/\b(bs arch|bsarch)\b/)) {
        return 'ARCHITECTURE_TOWN_PLANNING';
    }

    // 10. Communication & Mass Media
    if (t.includes('communication') || t.includes('journalism') || t.includes('broadcasting') || t.includes('media') ||
        t.match(/\b(mass com|ab com)\b/)) {
        return 'COMMUNICATION_JOURNALISM';
    }

    // 11. Social & Behavioral Sciences (Psychology, Criminology, Political Science)
    if (t.includes('psychology') || t.includes('criminology') || t.includes('sociology') || t.includes('political science') ||
        t.match(/\b(bs crim|bscrim|bs psych|bspsych|pol sci)\b/)) {
        return 'SOCIAL_BEHAVIORAL_SCIENCES';
    }

    // 12. Natural Sciences & Mathematics
    if (t.includes('biology') || t.includes('chemistry') || t.includes('physics') || t.includes('mathematics') ||
        t.includes('statistics') || t.match(/\b(bs bio|bs chem|bs math)\b/)) {
        return 'NATURAL_SCIENCES';
    }

    // 13. Humanities & Fine Arts
    if (t.includes('english') || t.includes('literature') || t.includes('history') || t.includes('philosophy') ||
        t.includes('fine arts') || t.match(/\b(ab english|ba literature)\b/)) {
        return 'HUMANITIES_ARTS';
    }

    // 14. Agriculture & Forestry
    if (t.includes('agriculture') || t.includes('forestry') || t.includes('fisheries') || t.match(/\b(bsa agri)\b/)) {
        return 'AGRICULTURE_FORESTRY';
    }

    return 'GENERAL_OTHER';
}

/**
 * Returns secondary discipline clusters for interdisciplinary degrees (e.g. Aviation IT, Health Informatics, Environmental Engineering).
 */
export function detectSecondaryDisciplineCluster(text: string): DisciplineCluster | null {
    const t = (text || '').toLowerCase().trim();
    if (!t) return null;

    if (t.includes('aviation') && (t.includes('information technology') || t.includes('computer') || t.includes('it'))) {
        return 'AVIATION_AERONAUTICS';
    }
    if (t.includes('health') && (t.includes('information') || t.includes('informatics') || t.includes('technology'))) {
        return 'HEALTH_MEDICAL_SCIENCES';
    }
    if (t.includes('educational') && (t.includes('technology') || t.includes('media'))) {
        return 'EDUCATION_TEACHER_TRAINING';
    }
    if (t.includes('agribusiness')) {
        return 'AGRICULTURE_FORESTRY';
    }
    return null;
}

/**
 * Detect Degree Education Level (Doctoral > Master's > Bachelor's > Vocational > High School)
 */
export function detectDegreeLevel(text: string): 'doctoral' | 'masters' | 'bachelor' | 'vocational' | 'highschool' {
    const t = (text || '').toLowerCase();
    if (t.includes('doctoral') || t.includes('ph.d') || t.includes('phd') || t.includes('doctor of')) return 'doctoral';
    if (t.includes('master') || t.includes('ms') || t.includes('ma') || t.includes('mba') || t.includes('maed')) return 'masters';
    if (t.includes('bachelor') || t.includes('bs') || t.includes('ba') || t.includes('college') || t.includes('degree') || t.includes('llb') || t.includes('jd')) return 'bachelor';
    if (t.includes('vocational') || t.includes('associate') || t.includes('certificate') || t.includes('diploma') || t.includes('tesda')) return 'vocational';
    return 'bachelor'; // Default baseline for unspecified higher ed
}

/**
 * Filter nonsense, fake, or spam credentials entered by applicants attempting to trick the form
 */
export function isNonsenseCredential(text: string): boolean {
    const t = (text || '').toLowerCase().trim();
    if (!t) return true;

    const fakeWords = [
        'everything', 'anything', 'magic', 'asdf', 'qwerty', 'n/a', 'none', 'nothing',
        'fake', 'test', 'sample', 'xxx', 'lol', 'hacker', 'god', 'random', 'whatever',
        '1234', 'admin', 'foo', 'bar', 'academics in everything'
    ];

    if (fakeWords.some(word => t === word || t.includes(word))) return true;

    // Reject entries with no alphabetic characters or repetitive spam characters
    if (!/[a-z]{3,}/i.test(t)) return true;
    if (/(.)\1{4,}/i.test(t)) return true;

    return false;
}

/**
 * Extract structured requirements from a Job Vacancy object.
 */
export function extractJobRequirements(job: any): JobRequirementItem[] {
    if (!job) return getDefaultRequirementsForTitle('General Position');

    if (Array.isArray(job.dynamic_requirements) && job.dynamic_requirements.length > 0) {
        return job.dynamic_requirements.map((req: any, index: number) => ({
            id: req.id || `req_${index + 1}`,
            category: req.category || 'education',
            requirement: req.requirement || 'Job Requirement',
            required_value: req.required_value || req.value || 'Required',
            weight: typeof req.weight === 'number' ? req.weight : undefined,
            mandatory: Boolean(req.mandatory)
        }));
    }

    const rawReqs: string[] = Array.isArray(job.requirements)
        ? job.requirements
        : (typeof job.requirements === 'string' ? job.requirements.split('\n') : []);

    const title = String(job.title || job.job_title || job.position || '').trim();

    if (rawReqs.length === 0) {
        return getDefaultRequirementsForTitle(title);
    }

    const items: JobRequirementItem[] = [];
    let reqIndex = 1;

    for (const line of rawReqs) {
        const clean = line.replace(/^[•\-\*\d\.\s]+/, '').trim();
        if (!clean) continue;

        const lower = clean.toLowerCase();
        const isMandatory = lower.includes('mandatory') || lower.includes('required') || lower.includes('must have') || lower.includes('bar');

        if (lower.includes('degree') || lower.includes('bachelor') || lower.includes('master') || lower.includes('doctor') || lower.includes('education') || lower.includes('college') || lower.includes('law') || lower.includes('graduate')) {
            items.push({
                id: `req_${reqIndex++}`,
                category: 'education',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Educational Degree Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : clean,
                mandatory: isMandatory || lower.includes('law') || lower.includes('bachelor') || lower.includes('master')
            });
        } else if (lower.includes('year') || lower.includes('experience') || lower.includes('work') || lower.includes('service') || lower.includes('background')) {
            const yrsMatch = clean.match(/(\d+)\s*year/i);
            const yrs = yrsMatch ? yrsMatch[1] : '2';
            items.push({
                id: `req_${reqIndex++}`,
                category: 'experience',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Work Experience Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : `${yrs} years relevant experience`,
                mandatory: isMandatory
            });
        } else if (lower.includes('eligib') || lower.includes('license') || lower.includes('bar') || lower.includes('board') || lower.includes('prc') || lower.includes('caap') || lower.includes('civil service') || lower.includes('csc') || lower.includes('subprofessional') || lower.includes('professional')) {
            items.push({
                id: `req_${reqIndex++}`,
                category: 'eligibility',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Eligibility Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : clean,
                mandatory: isMandatory || lower.includes('bar') || lower.includes('license') || lower.includes('ra 1080')
            });
        } else if (lower.includes('hour') || lower.includes('train') || lower.includes('seminar') || lower.includes('certif') || lower.includes('course')) {
            const hrsMatch = clean.match(/(\d+)\s*hour/i);
            const hrs = hrsMatch ? hrsMatch[1] : '8';
            items.push({
                id: `req_${reqIndex++}`,
                category: 'training',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Training & Seminar Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : `${hrs} hours relevant training`,
                mandatory: isMandatory
            });
        }
    }

    if (items.length === 0) {
        return getDefaultRequirementsForTitle(title);
    }

    return items;
}

/**
 * Standard benchmark qualification requirements based on Job Vacancy title
 */
export function getDefaultRequirementsForTitle(title: string): JobRequirementItem[] {
    const t = (title || '').toLowerCase();

    if (t.includes('attorney') || t.includes('legal')) {
        return [
            { id: 'att_edu', category: 'education', requirement: 'Educational Degree', required_value: 'LLB / Juris Doctor (Law Degree)', mandatory: true },
            { id: 'att_exp', category: 'experience', requirement: 'Work Experience', required_value: '5 years relevant legal experience', mandatory: false },
            { id: 'att_elig', category: 'eligibility', requirement: 'Professional Eligibility', required_value: 'BAR / RA 1080 (Legal)', mandatory: true },
            { id: 'att_trn', category: 'training', requirement: 'Training & L&D', required_value: '16 hours relevant legal training', mandatory: false }
        ];
    } else if (t.includes('pilot') || t.includes('flight instructor')) {
        return [
            { id: 'flt_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Aviation / Flying / Aeronautical", mandatory: true },
            { id: 'flt_exp', category: 'experience', requirement: 'Work Experience', required_value: '3 years flight operations experience', mandatory: false },
            { id: 'flt_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'CAAP CPL / FI Rating License', mandatory: true },
            { id: 'flt_trn', category: 'training', requirement: 'Training & L&D', required_value: '24 hours flight safety training', mandatory: false }
        ];
    } else if (t.includes('engineer') || t.includes('mechanic') || t.includes('amt') || t.includes('technician')) {
        return [
            { id: 'eng_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Engineering / AMT", mandatory: true },
            { id: 'eng_exp', category: 'experience', requirement: 'Work Experience', required_value: '2 years aircraft maintenance experience', mandatory: false },
            { id: 'eng_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'PRC Board Engineer / CAAP AMT License', mandatory: true },
            { id: 'eng_trn', category: 'training', requirement: 'Training & L&D', required_value: '16 hours technical training', mandatory: false }
        ];
    } else if (t.includes('it support') || t.includes('programmer') || t.includes('software') || t.includes('computer') || t.includes('information technology')) {
        return [
            { id: 'it_edu', category: 'education', requirement: 'Educational Degree', required_value: "Master's Degree or Bachelor's Degree in Information Technology / Computer Science", mandatory: true },
            { id: 'it_exp', category: 'experience', requirement: 'Work Experience', required_value: '3 years IT support experience', mandatory: false },
            { id: 'it_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'CS Professional or CS Subprofessional', mandatory: false },
            { id: 'it_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours relevant IT training', mandatory: false }
        ];
    } else if (t.includes('accountant') || t.includes('cashier') || t.includes('budget') || t.includes('finance')) {
        return [
            { id: 'act_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Accountancy / Business / Finance", mandatory: true },
            { id: 'act_exp', category: 'experience', requirement: 'Work Experience', required_value: '2 years financial / accounting experience', mandatory: false },
            { id: 'act_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'CPA Board / CS Professional / Subprofessional', mandatory: false },
            { id: 'act_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours financial management training', mandatory: false }
        ];
    } else if (t.includes('nurse') || t.includes('medical') || t.includes('health')) {
        return [
            { id: 'med_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Nursing / Health Sciences", mandatory: true },
            { id: 'med_exp', category: 'experience', requirement: 'Work Experience', required_value: '1 year clinical / medical experience', mandatory: false },
            { id: 'med_elig', category: 'eligibility', requirement: 'PRC Board Rating', required_value: 'PRC Registered Nurse (RN) / RA 1080', mandatory: true },
            { id: 'med_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours medical BLS/ACLS training', mandatory: false }
        ];
    }

    return [
        { id: 'gen_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree", mandatory: true },
        { id: 'gen_exp', category: 'experience', requirement: 'Work Experience', required_value: '2 years relevant experience', mandatory: false },
        { id: 'gen_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'CS Professional / Subprofessional', mandatory: false },
        { id: 'gen_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours relevant training', mandatory: false }
    ];
}

/**
 * Main Deterministic Requirement-Based Qualification Evaluation Engine with CHED Discipline & Tier Matching
 */
export function evaluateJobQualificationMatch(jobOrTitle: any, app: any): QualificationAnalysisOutput {
    let jobObj: any = null;
    if (typeof jobOrTitle === 'object' && jobOrTitle !== null) {
        jobObj = jobOrTitle;
    } else {
        jobObj = { title: String(jobOrTitle || '') };
    }

    const dyn = app?.dynamic_responses || {};
    const jobId = jobObj.id || app?.job_id || '0';
    const jobTitle = String(jobObj.title || jobObj.job_title || app?.jobTitle || app?.job_title || 'Target Position').trim();

    // 1. Retrieve job requirements
    const requirements = extractJobRequirements(jobObj);

    // 2. Applicant Data Extraction & Validation
    const degreeCourse = String(dyn.degreeCourse || dyn.course || app?.degreeCourse || app?.education || '').trim();
    const edLevelRaw = String(dyn.educationLevel || app?.educationLevel || app?.education || '').toLowerCase();

    let degreeLevelLabel = "Bachelor's Degree";
    if (edLevelRaw.includes('doctoral')) degreeLevelLabel = "Doctoral / Ph.D. Degree";
    else if (edLevelRaw.includes('master')) degreeLevelLabel = "Master's Degree";
    else if (edLevelRaw.includes('bachelor')) degreeLevelLabel = "Bachelor's Degree";
    else if (edLevelRaw.includes('vocational')) degreeLevelLabel = "Vocational Diploma";

    const fullEduText = degreeCourse ? `${degreeLevelLabel} in ${degreeCourse}` : (edLevelRaw ? degreeLevelLabel : '');

    const yrsExp = parseFloat(String(dyn.yearsOfExperience || app?.yearsOfExperience || '0')) || 0;
    const recentPos = dyn.recentPositionTitle || app?.recentPositionTitle || '';
    const recentEmp = dyn.recentEmployer || app?.recentEmployer || '';
    const expSummary = dyn.experience || app?.experience || '';
    const fullExpText = recentPos || recentEmp ? `${yrsExp} years experience (${recentPos}${recentEmp ? ` at ${recentEmp}` : ''})` : (yrsExp > 0 ? `${yrsExp} years declared experience` : '');

    const eligsList: string[] = Array.isArray(dyn.eligibilities) ? dyn.eligibilities : (Array.isArray(app?.eligibilities) ? app?.eligibilities : []);
    const licNo = String(dyn.licenseNo || app?.licenseNo || '').trim();
    const fullEligText = eligsList.length > 0 ? eligsList.join('; ') : (licNo ? `License/Reg No: ${licNo}` : '');

    const trnHrs = parseFloat(String(dyn.trainingHours || app?.trainingHours || '0')) || 0;
    const recentTrn = String(dyn.recentTrainingTitle || app?.recentTrainingTitle || '').trim();
    const fullTrnText = recentTrn && recentTrn !== 'N/A' ? `${trnHrs} hours (${recentTrn})` : (trnHrs > 0 ? `${trnHrs} hours declared training` : '');

    // 3. Itemized Evaluation
    const itemizedResults: ItemizedMatchResult[] = [];
    const alerts: string[] = [];

    const categoryScores: Record<QualificationCategory, { totalScore: number; evalCount: number; totalCount: number; hasMissing: boolean }> = {
        education: { totalScore: 0, evalCount: 0, totalCount: 0, hasMissing: false },
        experience: { totalScore: 0, evalCount: 0, totalCount: 0, hasMissing: false },
        eligibility: { totalScore: 0, evalCount: 0, totalCount: 0, hasMissing: false },
        training: { totalScore: 0, evalCount: 0, totalCount: 0, hasMissing: false }
    };

    let fullyMatchedCount = 0;
    let partiallyMatchedCount = 0;
    let notMatchedCount = 0;
    let notIndicatedCount = 0;
    let hasUnmatchedMandatory = false;
    let hasMissingMandatory = false;

    for (const req of requirements) {
        const cat = req.category;
        categoryScores[cat].totalCount++;

        let status: MatchStatus = 'NOT_INDICATED';
        let multiplier = 0.00;
        let applicantValue = '';
        let explanation = '';

        if (cat === 'education') {
            if (!fullEduText || isNonsenseCredential(fullEduText)) {
                status = 'NOT_MATCHED';
                applicantValue = fullEduText || 'Invalid / Unverified degree submitted';
                explanation = 'The submitted educational record is invalid, nonsense, or unverified.';
                if (req.mandatory) hasUnmatchedMandatory = true;
            } else {
                applicantValue = fullEduText;
                const reqValClean = req.required_value.toLowerCase().trim();
                const specifiesSpecificMajor = reqValClean.includes('engineering') || 
                    reqValClean.includes('nursing') || 
                    reqValClean.includes('law') || 
                    reqValClean.includes('juris') || 
                    reqValClean.includes('aviation') || 
                    reqValClean.includes('pilot') || 
                    reqValClean.includes('flying') || 
                    reqValClean.includes('computer') || 
                    reqValClean.includes('information tech') || 
                    reqValClean.includes('software') || 
                    reqValClean.includes('accountancy') ||
                    reqValClean.includes('architecture') ||
                    reqValClean.includes('psychology') ||
                    reqValClean.includes('criminology') ||
                    reqValClean.includes('cpa');

                const isGenericBachelorReq = !specifiesSpecificMajor && (
                    reqValClean === "bachelor's degree" || 
                    reqValClean === "bachelor degree" || 
                    reqValClean === "bachelor's" ||
                    reqValClean === "bachelor" ||
                    reqValClean === "college graduate" || 
                    reqValClean.includes('bachelor') ||
                    reqValClean.includes('degree') ||
                    reqValClean.includes('college')
                );

                const reqDiscipline = isGenericBachelorReq ? 'GENERAL_OTHER' : detectDisciplineCluster(req.required_value + ' ' + jobTitle);
                const appDiscipline = detectDisciplineCluster(fullEduText);
                const appSecondaryDiscipline = detectSecondaryDisciplineCluster(fullEduText);
                const reqLevel = detectDegreeLevel(req.required_value);
                const appLevel = detectDegreeLevel(fullEduText);
                const appLower = fullEduText.toLowerCase();
                const reqLowerText = req.required_value.toLowerCase();

                // Flexible discipline matching (Primary Cluster, Secondary Cluster, or General Degree acceptance)
                const isDisciplineMatched = reqDiscipline === 'GENERAL_OTHER' ||
                    isGenericBachelorReq ||
                    reqLowerText.includes('any bachelor') || reqLowerText.includes('bachelor\'s degree in any') ||
                    reqDiscipline === appDiscipline ||
                    (appSecondaryDiscipline !== null && reqDiscipline === appSecondaryDiscipline) ||
                    (reqDiscipline === 'IT_COMPUTER_STUDIES' && (appLower.includes('information technology') || appLower.includes('computer science') || appLower.includes('software') || appLower.includes('it'))) ||
                    (reqDiscipline === 'AVIATION_AERONAUTICS' && (appLower.includes('aviation') || appLower.includes('aeronautical') || appLower.includes('flight'))) ||
                    (reqDiscipline === 'BUSINESS_ADMINISTRATION' && (appLower.includes('business') || appLower.includes('administration') || appLower.includes('management') || appLower.includes('commerce') || appLower.includes('finance')));

                const acceptsBachelor = reqLowerText.includes('bachelor') || reqLevel === 'bachelor';

                const degreeRank: Record<string, number> = { doctoral: 4, masters: 3, bachelor: 2, vocational: 1, highschool: 0 };
                const appRank = degreeRank[appLevel] || 2;
                const reqRank = acceptsBachelor ? 2 : (degreeRank[reqLevel] || 2);

                if (!isDisciplineMatched) {
                    status = 'NOT_MATCHED';
                    multiplier = 0.00;
                    explanation = `Applicant's degree field (${fullEduText}) belongs to ${DISCIPLINE_CLUSTER_LABELS[appDiscipline]}, which does NOT match the required ${DISCIPLINE_CLUSTER_LABELS[reqDiscipline]} discipline for this position.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
                } else if (appRank >= reqRank) {
                    status = 'FULLY_MATCHED';
                    multiplier = 1.00;
                    if (appRank > reqRank) {
                        explanation = `Applicant holds a higher degree tier (${degreeLevelLabel}), which meets and exceeds the minimum ${reqLevel === 'bachelor' || acceptsBachelor ? "Bachelor's Degree" : "required degree"} standard (100% full credit).`;
                    } else {
                        explanation = `Applicant's degree (${fullEduText}) fully matches the required ${DISCIPLINE_CLUSTER_LABELS[reqDiscipline]} discipline and degree tier.`;
                    }
                } else if (reqLevel === 'masters' && appLevel === 'bachelor') {
                    status = 'PARTIALLY_MATCHED';
                    multiplier = 0.60;
                    explanation = `Applicant holds a Bachelor's degree in ${DISCIPLINE_CLUSTER_LABELS[appDiscipline]}, partially meeting the Master's degree requirement (60% tier credit).`;
                } else if (reqLevel === 'doctoral' && (appLevel === 'masters' || appLevel === 'bachelor')) {
                    status = 'PARTIALLY_MATCHED';
                    multiplier = appLevel === 'masters' ? 0.75 : 0.50;
                    explanation = `Applicant holds a ${degreeLevelLabel}, partially meeting the Doctoral degree requirement.`;
                } else {
                    status = 'NOT_MATCHED';
                    multiplier = 0.00;
                    explanation = `Applicant's educational level (${degreeLevelLabel}) does not meet the minimum required degree tier.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
                }
            }
        } else if (cat === 'experience') {
            if (yrsExp === 0 && !expSummary && !recentPos) {
                status = 'NOT_INDICATED';
                applicantValue = 'No work experience submitted';
                explanation = 'No relevant work experience information was provided in the submitted records.';
            } else {
                applicantValue = fullExpText || `${yrsExp} years experience`;
                const requiredYrsMatch = req.required_value.match(/(\d+)/);
                const reqYrs = requiredYrsMatch ? parseFloat(requiredYrsMatch[1]) : 2;

                const reqLower = req.required_value.toLowerCase();
                const expLower = (fullExpText + ' ' + expSummary).toLowerCase();

                const isLegalExpReq = reqLower.includes('legal') || reqLower.includes('law');
                const isFltExpReq = reqLower.includes('flight') || reqLower.includes('flying') || reqLower.includes('pilot');
                const isItExpReq = reqLower.includes('it') || reqLower.includes('software') || reqLower.includes('programmer');

                let isFieldRelevant = true;
                if (isLegalExpReq && !expLower.includes('legal') && !expLower.includes('law') && !expLower.includes('attorney')) isFieldRelevant = false;
                if (isFltExpReq && !expLower.includes('flight') && !expLower.includes('pilot') && !expLower.includes('flying') && !expLower.includes('instructor')) isFieldRelevant = false;
                if (isItExpReq && !expLower.includes('it') && !expLower.includes('tech') && !expLower.includes('support') && !expLower.includes('developer') && !expLower.includes('system') && !expLower.includes('computer')) isFieldRelevant = false;

                if (!isFieldRelevant) {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant's declared work experience field is not relevant to ${req.required_value}.`;
                } else if (yrsExp >= reqYrs) {
                    status = 'FULLY_MATCHED'; multiplier = 1.00;
                    explanation = `Applicant has ${yrsExp} years of relevant experience, meeting or exceeding the required ${reqYrs} years.`;
                } else if (yrsExp > 0) {
                    status = 'PARTIALLY_MATCHED';
                    multiplier = Math.round((yrsExp / reqYrs) * 100) / 100;
                    explanation = `Applicant has ${yrsExp} years of relevant experience, meeting ${Math.round(multiplier * 100)}% of the required ${reqYrs} years.`;
                } else {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant declared 0 years of relevant experience vs ${reqYrs} years required.`;
                }
            }
        } else if (cat === 'eligibility') {
            if (!fullEligText) {
                status = 'NOT_INDICATED';
                applicantValue = 'No CS eligibility or professional license submitted';
                explanation = 'No Civil Service eligibility or professional license was declared in submitted records.';
            } else {
                applicantValue = fullEligText;
                const reqLower = req.required_value.toLowerCase();
                const appEligLower = fullEligText.toLowerCase();

                const hasBar = appEligLower.includes('bar') || appEligLower.includes('lawyer') || (licNo && licNo.toLowerCase().includes('bar'));
                const hasPilot = appEligLower.includes('cpl') || appEligLower.includes('fi rating') || appEligLower.includes('atpl') || appEligLower.includes('caap');
                const hasEng = appEligLower.includes('board') || appEligLower.includes('engineer') || appEligLower.includes('amt');
                const hasCpa = appEligLower.includes('cpa') || appEligLower.includes('certified public accountant');
                const hasNurse = appEligLower.includes('nurse') || appEligLower.includes('rn') || appEligLower.includes('lpt') || appEligLower.includes('teacher');
                const hasPD907 = appEligLower.includes('pd 907') || appEligLower.includes('honor graduate') || appEligLower.includes('summa cum laude') || appEligLower.includes('magna cum laude') || appEligLower.includes('cum laude');

                const hasProCS = (appEligLower.includes('professional') && !appEligLower.includes('sub professional') && !appEligLower.includes('subprofessional')) ||
                    (appEligLower.includes('ra1080') && !appEligLower.includes('7160')) ||
                    hasPD907 || hasCpa || hasNurse || appEligLower.includes('csc professional');

                const hasSubPro = appEligLower.includes('sub professional') || appEligLower.includes('subprofessional') ||
                    appEligLower.includes('barangay') || appEligLower.includes('health worker') || appEligLower.includes('nutrition scholar') ||
                    appEligLower.includes('sanggunian') || appEligLower.includes('category ii') || appEligLower.includes('tesda') || appEligLower.includes('nc ii');

                const acceptsSubPro = reqLower.includes('subprofessional') || reqLower.includes('sub professional') || reqLower.includes('sub-professional') || reqLower.includes('1st level') || reqLower.includes('first level') || reqLower.includes('or cs subprofessional');

                if (reqLower.includes('bar') || reqLower.includes('ra 1080 (legal)')) {
                    if (hasBar) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses BAR / RA 1080 Legal eligibility.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy BAR / RA 1080 Legal eligibility.`;
                    }
                } else if (reqLower.includes('cpl') || reqLower.includes('fi rating') || reqLower.includes('caap license')) {
                    if (hasPilot || licNo.length > 3) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses required CAAP Pilot / FI License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CAAP Pilot License requirement.`;
                    }
                } else if (reqLower.includes('board engineer') || reqLower.includes('amt license')) {
                    if (hasEng || hasPilot) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses PRC Engineering Board / CAAP AMT License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy Engineering Board / AMT License requirement.`;
                    }
                } else if (reqLower.includes('cpa') || reqLower.includes('accountant')) {
                    if (hasCpa || hasProCS) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses CPA Board License or CS Professional Eligibility.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CPA / Financial Board requirement.`;
                    }
                } else if (reqLower.includes('professional') && !acceptsSubPro) {
                    if (hasProCS || hasBar || hasEng || hasPilot || hasCpa || hasNurse) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses 2nd level CS Professional / Board Rating / License.";
                    } else if (hasSubPro) {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses 1st level CS Subprofessional / Barangay eligibility, which does not satisfy 2nd level CS Professional requirements.`;
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CS Professional requirement.`;
                    }
                } else {
                    if (hasProCS || hasSubPro || hasBar || hasEng || hasPilot || hasCpa || hasNurse) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses Civil Service / Board eligibility.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = "Applicant eligibility does not match the requirement.";
                    }
                }
            }
        } else if (cat === 'training') {
            if (trnHrs === 0 && !recentTrn) {
                status = 'NOT_INDICATED';
                applicantValue = 'No training or L&D hours submitted';
                explanation = 'No training hours or seminar certificates were provided in submitted records.';
            } else {
                applicantValue = fullTrnText || `${trnHrs} hours training`;
                const reqHrsMatch = req.required_value.match(/(\d+)/);
                const reqHrs = reqHrsMatch ? parseFloat(reqHrsMatch[1]) : 8;

                if (trnHrs >= reqHrs) {
                    status = 'FULLY_MATCHED'; multiplier = 1.00;
                    explanation = `Applicant completed ${trnHrs} hours of training, meeting or exceeding the required ${reqHrs} hours.`;
                } else if (trnHrs > 0) {
                    status = 'PARTIALLY_MATCHED';
                    multiplier = Math.round((trnHrs / reqHrs) * 100) / 100;
                    explanation = `Applicant completed ${trnHrs} hours of training, meeting ${Math.round(multiplier * 100)}% of the required ${reqHrs} hours.`;
                } else {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant declared 0 hours training vs ${reqHrs} hours required.`;
                }
            }
        }

        // Tally counts
        if (status === 'FULLY_MATCHED') {
            fullyMatchedCount++;
            categoryScores[cat].totalScore += multiplier;
            categoryScores[cat].evalCount++;
        } else if (status === 'PARTIALLY_MATCHED') {
            partiallyMatchedCount++;
            categoryScores[cat].totalScore += multiplier;
            categoryScores[cat].evalCount++;
        } else if (status === 'NOT_MATCHED') {
            notMatchedCount++;
            categoryScores[cat].totalScore += multiplier;
            categoryScores[cat].evalCount++;
            if (req.mandatory) {
                hasUnmatchedMandatory = true;
            }
        } else {
            notIndicatedCount++;
            categoryScores[cat].hasMissing = true;
            if (req.mandatory) {
                hasMissingMandatory = true;
            }
        }

        itemizedResults.push({
            requirement_id: req.id,
            category: cat,
            category_label: CATEGORY_LABELS[cat],
            requirement: req.requirement,
            required_value: req.required_value,
            applicant_value: applicantValue,
            match_status: status,
            multiplier: multiplier,
            score_contribution: Math.round(multiplier * 100),
            mandatory: req.mandatory,
            explanation: explanation
        });
    }

    // 4. Calculate Category Scores & Dynamic Weight Normalization
    const categories: Record<QualificationCategory, CategorySummary> = {
        education: { category: 'education', label: CATEGORY_LABELS.education, configured_weight: DEFAULT_CATEGORY_WEIGHTS.education, normalized_weight: 0, score: 0, evaluated_count: 0, total_count: 0, has_missing: false },
        experience: { category: 'experience', label: CATEGORY_LABELS.experience, configured_weight: DEFAULT_CATEGORY_WEIGHTS.experience, normalized_weight: 0, score: 0, evaluated_count: 0, total_count: 0, has_missing: false },
        eligibility: { category: 'eligibility', label: CATEGORY_LABELS.eligibility, configured_weight: DEFAULT_CATEGORY_WEIGHTS.eligibility, normalized_weight: 0, score: 0, evaluated_count: 0, total_count: 0, has_missing: false },
        training: { category: 'training', label: CATEGORY_LABELS.training, configured_weight: DEFAULT_CATEGORY_WEIGHTS.training, normalized_weight: 0, score: 0, evaluated_count: 0, total_count: 0, has_missing: false }
    };

    let totalActiveWeightSum = 0;

    (Object.keys(categoryScores) as QualificationCategory[]).forEach(cat => {
        const data = categoryScores[cat];
        const catSummary = categories[cat];
        catSummary.total_count = data.totalCount;
        catSummary.evaluated_count = data.evalCount;
        catSummary.has_missing = data.hasMissing;

        if (data.evalCount > 0) {
            catSummary.score = Math.round((data.totalScore / data.evalCount) * 10000) / 100;
            totalActiveWeightSum += catSummary.configured_weight;
        } else {
            catSummary.score = 0;
            catSummary.normalized_weight = 0;
        }
    });

    let calculatedOverallScore = 0;

    (Object.keys(categories) as QualificationCategory[]).forEach(cat => {
        const catSummary = categories[cat];
        if (catSummary.evaluated_count > 0 && totalActiveWeightSum > 0) {
            catSummary.normalized_weight = Math.round((catSummary.configured_weight / totalActiveWeightSum) * 10000) / 100;
            calculatedOverallScore += (catSummary.score * (catSummary.normalized_weight / 100));
        }
    });

    calculatedOverallScore = Math.round(calculatedOverallScore * 100) / 100;

    // 5. Apply Mandatory Cap & Alerts
    if (hasUnmatchedMandatory) {
        calculatedOverallScore = Math.min(20.00, calculatedOverallScore);
        alerts.push("⚠️ Mandatory Requirement Mismatch: Applicant failed to match mandatory degree field or professional license.");
    }

    if (hasMissingMandatory) {
        alerts.push("ℹ Mandatory Information Missing: A mandatory requirement is not indicated in the applicant's submitted records.");
    }

    const hasExplicitRequirements = Boolean(
        jobObj && (
            (Array.isArray(jobObj.dynamic_requirements) && jobObj.dynamic_requirements.length > 0) ||
            (Array.isArray(jobObj.requirements) && jobObj.requirements.length > 0) ||
            (typeof jobObj.requirements === 'string' && jobObj.requirements.trim().length > 0)
        )
    );

    let summaryText = "";
    if (hasUnmatchedMandatory) {
        summaryText = `The applicant's submitted qualifications do not meet mandatory requirements for ${jobTitle}. Critical gaps exist in required professional eligibility or degree discipline.`;
    } else if (fullyMatchedCount === requirements.length) {
        summaryText = `The applicant meets or exceeds all evaluated qualification standards configured for ${jobTitle} across Education, Experience, Eligibility, and Training.`;
    } else {
        summaryText = `Qualification analysis computed based on evaluated education, experience, eligibility, and training criteria for ${jobTitle}.`;
    }

    return {
        job_id: jobId,
        job_title: jobTitle,
        overall_score: calculatedOverallScore,
        formatted_percentage: `${calculatedOverallScore.toFixed(2)}%`,
        categories,
        itemized_results: itemizedResults,
        summary_counts: {
            fully_matched: fullyMatchedCount,
            partially_matched: partiallyMatchedCount,
            not_matched: notMatchedCount,
            not_indicated: notIndicatedCount
        },
        alerts,
        analysis_summary: summaryText,
        analysis_version: 'v2.1',
        is_fallback_requirements: !hasExplicitRequirements
    };
}

/**
 * Backward compatibility wrapper
 */
export function evaluateQualificationMatch(jobTitle: string, app: any) {
    if (!app) {
        return {
            rawScore: 0,
            percentage: 0,
            match: 'Low Match',
            breakdown: { education: 0, experience: 0, accomplishments: 0, training: 0 },
            isEligibleForPosition: false,
            isDegreeRelevant: false
        };
    }

    const output = evaluateJobQualificationMatch(jobTitle, app);

    return {
        rawScore: Math.round((output.overall_score / 100) * 45),
        percentage: Math.round(output.overall_score),
        match: output.overall_score >= 80 ? 'High Match' : (output.overall_score >= 50 ? 'Medium Match' : 'Low Match'),
        breakdown: {
            education: Math.round((output.categories.education.score / 100) * 5),
            experience: Math.round((output.categories.experience.score / 100) * 25),
            accomplishments: Math.round((output.categories.eligibility.score / 100) * 5),
            training: Math.round((output.categories.training.score / 100) * 10)
        },
        isEligibleForPosition: output.categories.eligibility.score >= 50,
        isDegreeRelevant: output.categories.education.score >= 50,
        output: output
    };
}

export function calculateEducationScore(educationLevel: any, requiredEducation: any = 'bachelor'): number {
    return educationLevel === 'doctoral_graduate' ? 5 : (educationLevel === 'masters' ? 3 : 1);
}

export function calculateExperienceScore(yearsOfExperience: number, requiredYears: number = 0): number {
    return Math.min(25, Math.max(0, yearsOfExperience * 2));
}

export function calculateAccomplishmentsScore(awards?: any, eligibilities?: string[], licenseNo?: string): number {
    return (eligibilities && eligibilities.length > 0) ? 5 : 0;
}

export function calculateTrainingScore(trainingHours: number): number {
    return trainingHours >= 100 ? 10 : (trainingHours >= 16 ? 4 : 0);
}

export function calculateAIScore(input: ScoringInput): ScoreBreakdown {
    return { education: 3, experience: 10, accomplishments: 5, training: 4, total: 22 };
}
