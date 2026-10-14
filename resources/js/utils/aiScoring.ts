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
    weighted_score: number; // (score / 100) * configured_weight
    evaluated_count: number;
    total_count: number;
    has_missing: boolean;
}

export interface QualificationAnalysisOutput {
    job_id: number | string;
    job_title: string;
    overall_score: number; // 0 to 100
    formatted_percentage: string;
    assessment_label: 'Meets Indicated Qualifications' | 'Does Not Meet Indicated Qualifications' | 'For HR Review';
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

    // 11. Social & Behavioral Sciences (Psychology, Counseling, Guidance, Criminology, Political Science)
    if (t.includes('psychology') || t.includes('counseling') || t.includes('counselor') || t.includes('guidance') || t.includes('criminology') || t.includes('sociology') || t.includes('political science') || t.includes('behavioral') ||
        t.match(/\b(bs crim|bscrim|bs psych|bspsych|pol sci|rgc)\b/)) {
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

    if (t.includes('aviation') && (t.includes('information technology') || t.includes('computer') || /\b(it|bsit|ict|software)\b/i.test(t))) {
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
    if (t.includes('doctoral') || t.includes('ph.d') || t.includes('phd') || t.includes('doctor of') || /\b(edd|dpa|dba)\b/i.test(t)) return 'doctoral';
    if (t.includes('master') || /\b(ms|ma|mba|maed|mit|msc|mpa|llm|mst)\b/i.test(t)) return 'masters';
    if (t.includes('bachelor') || t.includes('college') || t.includes('degree') || /\b(bs|ba|ab|bse|bsit|bscs|bsed|bsba|bsa|bsn|bsce|bsme|bsee|bsece|bsae|bsamt|llb|jd)\b/i.test(t)) return 'bachelor';
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
            category: (req.category || 'education').toLowerCase() as QualificationCategory,
            requirement: req.requirement || req.title || 'Job Requirement',
            required_value: req.required_value || req.value || req.title || 'Required',
            weight: typeof req.weight === 'number' ? req.weight : undefined,
            mandatory: Boolean(req.mandatory || req.is_mandatory)
        }));
    }

    const title = String(job.title || job.job_title || job.position || '').trim();
    const rawReqs: any[] = Array.isArray(job.requirements)
        ? job.requirements
        : (typeof job.requirements === 'string' ? job.requirements.split('\n') : []);

    const items: JobRequirementItem[] = [];
    let reqIndex = 1;

    for (const rawItem of rawReqs) {
        if (!rawItem) continue;

        if (typeof rawItem === 'object') {
            const catRaw = String(rawItem.category || rawItem.type || '').toLowerCase();
            const normalizedCat: QualificationCategory = 
                catRaw.includes('edu') ? 'education' :
                catRaw.includes('exp') ? 'experience' :
                catRaw.includes('elig') || catRaw.includes('lic') ? 'eligibility' :
                catRaw.includes('train') || catRaw.includes('l&d') || catRaw.includes('seminar') ? 'training' :
                (String(rawItem.title || rawItem.requirement || '').toLowerCase().match(/degree|master|bachelor|education|doctor/i) ? 'education' :
                 String(rawItem.title || rawItem.requirement || '').toLowerCase().match(/year|experience|work|service/i) ? 'experience' :
                 String(rawItem.title || rawItem.requirement || '').toLowerCase().match(/eligib|license|ra 1080|board|prc|caap|civil service|csc/i) ? 'eligibility' :
                 String(rawItem.title || rawItem.requirement || '').toLowerCase().match(/hour|train|seminar|certif/i) ? 'training' : 'education');

            const reqTitle = String(rawItem.title || rawItem.requirement || rawItem.name || 'Job Requirement').trim();
            const reqVal = String(rawItem.required_value || rawItem.value || rawItem.title || reqTitle).trim();
            const isMandatory = rawItem.mandatory !== undefined 
                ? Boolean(rawItem.mandatory) 
                : (rawItem.is_mandatory !== undefined ? Boolean(rawItem.is_mandatory) : true);

            items.push({
                id: String(rawItem.id || `req_${reqIndex++}`),
                category: normalizedCat,
                requirement: reqTitle,
                required_value: reqVal,
                weight: typeof rawItem.weight === 'number' ? rawItem.weight : undefined,
                mandatory: isMandatory
            });
            continue;
        }

        const line = String(rawItem);
        const clean = line.replace(/^[•\-\*\d\.\s]+/, '').trim();
        if (!clean) continue;

        const lower = clean.toLowerCase();
        const isMandatory = lower.includes('mandatory') || lower.includes('required') || lower.includes('must have') || lower.includes('bar');

        if (lower.startsWith('education:') || (!lower.includes('service') && !lower.includes('license') && (lower.includes('degree') || lower.includes('bachelor') || lower.includes('master') || lower.includes('doctor') || lower.includes('education') || lower.includes('college') || lower.includes('graduate')))) {
            items.push({
                id: `req_${reqIndex++}`,
                category: 'education',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Educational Degree Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : clean,
                mandatory: isMandatory || lower.includes('law') || lower.includes('bachelor') || lower.includes('master') || lower.startsWith('education:')
            });
        } else if (lower.startsWith('eligibility:') || lower.includes('eligib') || lower.includes('career service') || lower.includes('civil service') || lower.includes('csc') || lower.includes('license') || lower.includes('board') || lower.includes('bar') || lower.includes('prc') || lower.includes('caap') || lower.includes('subprofessional') || lower.includes('professional')) {
            items.push({
                id: `req_${reqIndex++}`,
                category: 'eligibility',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Eligibility Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : clean,
                mandatory: isMandatory || lower.includes('bar') || lower.includes('license') || lower.includes('ra 1080') || lower.startsWith('eligibility:')
            });
        } else if (lower.startsWith('training:') || lower.includes('training') || lower.includes('seminar') || lower.includes('certif') || lower.includes('course') || lower.includes('hour')) {
            const hrsMatch = clean.match(/(\d+)\s*hour/i);
            const hrs = hrsMatch ? hrsMatch[1] : (lower.includes('none required') ? '0' : '8');
            items.push({
                id: `req_${reqIndex++}`,
                category: 'training',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Training & Seminar Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : (lower.includes('none required') ? 'None required (CSC Minimum QS)' : `${hrs} hours relevant training`),
                mandatory: isMandatory
            });
        } else if (lower.startsWith('experience:') || lower.includes('experience') || lower.includes('work') || lower.includes('year') || lower.includes('background') || lower.includes('government service')) {
            const yrsMatch = clean.match(/(\d+)\s*year/i);
            const yrs = yrsMatch ? yrsMatch[1] : (lower.includes('none required') ? '0' : '2');
            items.push({
                id: `req_${reqIndex++}`,
                category: 'experience',
                requirement: clean.includes(':') ? clean.split(':')[0].trim() : 'Work Experience Requirement',
                required_value: clean.includes(':') ? clean.split(':').slice(1).join(':').trim() : (lower.includes('none required') ? 'None required (CSC Minimum QS)' : `${yrs} years relevant experience`),
                mandatory: isMandatory
            });
        }
    }

    // Also check QS explicit fields if available on Job model (e.g., job.qs_education, etc.)
    if (items.length === 0) {
        if (job.qs_education || job.qs_experience || job.qs_eligibility || job.qs_training) {
            if (job.qs_education) {
                items.push({ id: `req_${reqIndex++}`, category: 'education', requirement: 'Educational Degree Requirement', required_value: String(job.qs_education), mandatory: true });
            }
            if (job.qs_experience) {
                items.push({ id: `req_${reqIndex++}`, category: 'experience', requirement: 'Work Experience Requirement', required_value: String(job.qs_experience), mandatory: false });
            }
            if (job.qs_eligibility) {
                items.push({ id: `req_${reqIndex++}`, category: 'eligibility', requirement: 'Eligibility Requirement', required_value: String(job.qs_eligibility), mandatory: true });
            }
            if (job.qs_training) {
                items.push({ id: `req_${reqIndex++}`, category: 'training', requirement: 'Training & L&D Requirement', required_value: String(job.qs_training), mandatory: false });
            }
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

    if (t.includes('counselor') || t.includes('counseling') || t.includes('guidance') || t.includes('psycholog')) {
        return [
            { id: 'gc_edu', category: 'education', requirement: 'Educational Degree', required_value: "Master's Degree in Guidance & Counseling or Psychology", mandatory: true },
            { id: 'gc_exp', category: 'experience', requirement: 'Work Experience', required_value: 'None required (CSC Minimum QS)', mandatory: false },
            { id: 'gc_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'RA 1080 (Registered Guidance Counselor)', mandatory: true },
            { id: 'gc_trn', category: 'training', requirement: 'Training & L&D', required_value: 'None required (CSC Minimum QS)', mandatory: false }
        ];
    } else if (t.includes('attorney') || t.includes('legal')) {
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
    } else if (t.includes('amt') || t.includes('aircraft maintenance') || t.includes('mechanic')) {
        return [
            { id: 'eng_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Aircraft Maintenance Technology (BSAMT)", mandatory: true },
            { id: 'eng_exp', category: 'experience', requirement: 'Work Experience', required_value: '1 year aircraft maintenance hangar experience', mandatory: false },
            { id: 'eng_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'CAAP Airframe & Powerplant (A&P) License', mandatory: true },
            { id: 'eng_trn', category: 'training', requirement: 'Training & L&D', required_value: '4 hours technical training', mandatory: false }
        ];
    } else if (t.includes('engineer') || t.includes('technician') || t.includes('aeronautical') || t.includes('avionics')) {
        return [
            { id: 'eng_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Engineering / Avionics", mandatory: true },
            { id: 'eng_exp', category: 'experience', requirement: 'Work Experience', required_value: '1 year aircraft structural or maintenance experience', mandatory: false },
            { id: 'eng_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'RA 1080 Board Engineer / CAAP License', mandatory: true },
            { id: 'eng_trn', category: 'training', requirement: 'Training & L&D', required_value: '4 hours technical training', mandatory: false }
        ];
    } else if (t.includes('instructor') || t.includes('professor') || t.includes('faculty') || t.includes('teacher')) {
        return [
            { id: 'fac_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Relevant Discipline", mandatory: true },
            { id: 'fac_exp', category: 'experience', requirement: 'Work Experience', required_value: '1 year teaching or industry experience', mandatory: false },
            { id: 'fac_elig', category: 'eligibility', requirement: 'Professional Eligibility', required_value: 'RA 1080 / CS Professional / Industry License', mandatory: false },
            { id: 'fac_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours pedagogical or technical training', mandatory: false }
        ];
    } else if (t.includes('it support') || t.includes('programmer') || t.includes('software') || t.includes('computer') || t.includes('information technology')) {
        return [
            { id: 'it_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Information Technology / Computer Science", mandatory: true },
            { id: 'it_exp', category: 'experience', requirement: 'Work Experience', required_value: '2 years relevant IT experience', mandatory: false },
            { id: 'it_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'Career Service Professional (Second Level)', mandatory: false },
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
    } else if (t.includes('human resource') || t.includes('hrmo') || t.includes('administrative officer')) {
        return [
            { id: 'hr_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Human Resource Management / Public Administration / Business", mandatory: true },
            { id: 'hr_exp', category: 'experience', requirement: 'Work Experience', required_value: '1 year relevant HR / administrative experience', mandatory: false },
            { id: 'hr_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'Career Service Professional (Second Level)', mandatory: true },
            { id: 'hr_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours relevant HR / administrative training', mandatory: false }
        ];
    } else if (t.includes('administrative aide') || t.includes('clerk') || t.includes('office assistant')) {
        return [
            { id: 'aide_edu', category: 'education', requirement: 'Educational Degree', required_value: "Completion of 2 years in College or Vocational Diploma", mandatory: true },
            { id: 'aide_exp', category: 'experience', requirement: 'Work Experience', required_value: 'None required (CSC Minimum QS)', mandatory: false },
            { id: 'aide_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'Career Service Subprofessional (First Level)', mandatory: true },
            { id: 'aide_trn', category: 'training', requirement: 'Training & L&D', required_value: 'None required (CSC Minimum QS)', mandatory: false }
        ];
    } else if (t.includes('civil engineer') || t.includes('mechanical engineer') || t.includes('electrical engineer')) {
        return [
            { id: 'eng_field_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in Civil / Mechanical / Electrical Engineering", mandatory: true },
            { id: 'eng_field_exp', category: 'experience', requirement: 'Work Experience', required_value: '1 year relevant engineering practice', mandatory: false },
            { id: 'eng_field_elig', category: 'eligibility', requirement: 'Professional License', required_value: 'RA 1080 PRC Engineering Board License', mandatory: true },
            { id: 'eng_field_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours technical engineering training', mandatory: false }
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
    const jobTitleLower = jobTitle.toLowerCase();

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

    let yrsExp = parseFloat(String(dyn.yearsOfExperience || app?.yearsOfExperience || '0')) || 0;
    let recentPos = String(dyn.recentPositionTitle || app?.recentPositionTitle || '').trim();
    let recentEmp = String(dyn.recentEmployer || app?.recentEmployer || '').trim();
    const expSummary = String(dyn.experience || app?.experience || '').trim();

    // Smart fallback if workExperiences array is present
    const workExpList = Array.isArray(dyn.workExperiences) ? dyn.workExperiences : (Array.isArray(app?.workExperiences) ? app?.workExperiences : []);
    if (workExpList.length > 0) {
        if (!recentPos && workExpList[0].position) recentPos = String(workExpList[0].position).trim();
        if (!recentEmp && workExpList[0].company) recentEmp = String(workExpList[0].company).trim();
        if (yrsExp === 0) {
            yrsExp = Math.max(1, workExpList.length * 2);
        }
    }

    // Smart fallback from narrative text (e.g. "Worked as Information Technology Instructor at NAAP for 6 years...")
    if (yrsExp === 0 && expSummary) {
        const yrMatch = expSummary.match(/(\d+)\s*(?:years?|yrs?)/i);
        if (yrMatch) yrsExp = parseFloat(yrMatch[1]);
    }
    if (!recentPos && expSummary) {
        const posMatch = expSummary.match(/(?:worked as|as|position:?)\s+([A-Za-z\s]+?)(?:\s+at|\s+for|\s+in|,|\.)/i);
        if (posMatch) recentPos = posMatch[1].trim();
    }
    if (!recentEmp && expSummary) {
        const empMatch = expSummary.match(/(?:at|for|company:?)\s+([A-Za-z\s]+?)(?:\s+for|\s+in|,|\.)/i);
        if (empMatch) recentEmp = empMatch[1].trim();
    }

    const fullExpText = recentPos || recentEmp ? `${yrsExp} years experience (${recentPos}${recentEmp ? ` at ${recentEmp}` : ''})` : (yrsExp > 0 ? `${yrsExp} years declared experience` : '');

    const eligsList: string[] = Array.isArray(dyn.eligibilities) ? dyn.eligibilities : (Array.isArray(app?.eligibilities) ? app?.eligibilities : []);
    const licNo = String(dyn.licenseNo || app?.licenseNo || '').trim();
    const fullEligText = eligsList.length > 0 ? eligsList.join('; ') : (licNo ? `License/Reg No: ${licNo}` : '');

    let trnHrs = parseFloat(String(dyn.trainingHours || app?.trainingHours || '0')) || 0;
    let recentTrn = String(dyn.recentTrainingTitle || app?.recentTrainingTitle || '').trim();

    // Smart fallback if trainings array is present
    const trnList = Array.isArray(dyn.trainings) ? dyn.trainings : (Array.isArray(app?.trainings) ? app?.trainings : []);
    if (trnList.length > 0) {
        if (!recentTrn && trnList[0].title) recentTrn = String(trnList[0].title).trim();
        if (trnHrs === 0) {
            const sumHrs = trnList.reduce((sum: number, t: any) => sum + (parseFloat(t.hours) || 0), 0);
            if (sumHrs > 0) trnHrs = sumHrs;
        }
    }

    // Smart fallback from narrative text (e.g. "Completed 70 hours of training (Software Engineer)")
    if (trnHrs === 0 && expSummary) {
        const hrMatch = expSummary.match(/(\d+)\s*(?:hours?|hrs?)/i);
        if (hrMatch) trnHrs = parseFloat(hrMatch[1]);
    }
    if ((!recentTrn || recentTrn === 'N/A') && expSummary) {
        const trnMatch = expSummary.match(/training\s*\(([^)]+)\)/i) || expSummary.match(/training\s+in\s+([^,.]+)/i);
        if (trnMatch) recentTrn = trnMatch[1].trim();
    }

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
                const detectedReqDiscipline = detectDisciplineCluster(req.required_value);
                const detectedJobDiscipline = detectDisciplineCluster(jobTitle);

                const isExplicitAnyBachelor = reqValClean.includes('any bachelor') || 
                    reqValClean.includes('bachelor\'s degree in any') ||
                    reqValClean.includes('in any field') ||
                    reqValClean.includes('any course') ||
                    reqValClean.includes('any 4-year');

                const isGenericBachelorReq = isExplicitAnyBachelor || (
                    detectedReqDiscipline === 'GENERAL_OTHER' && 
                    detectedJobDiscipline === 'GENERAL_OTHER' &&
                    !reqValClean.includes('relevant') &&
                    !reqValClean.includes('(')
                );

                const reqDiscipline = isGenericBachelorReq 
                    ? 'GENERAL_OTHER' 
                    : (detectedReqDiscipline !== 'GENERAL_OTHER' ? detectedReqDiscipline : detectedJobDiscipline);

                const appDiscipline = detectDisciplineCluster(fullEduText);
                const appSecondaryDiscipline = detectSecondaryDisciplineCluster(fullEduText);
                const reqLevel = detectDegreeLevel(req.required_value);
                const appLevel = detectDegreeLevel(fullEduText);
                const appLower = fullEduText.toLowerCase();
                const reqLowerText = req.required_value.toLowerCase();

                // 1. Check specific technical sub-discipline constraints
                const isAeroMaintenanceReq = reqLowerText.includes('aircraft maintenance') || reqLowerText.includes('bsamt') || reqLowerText.includes('airframe') || reqLowerText.includes('powerplant') || jobTitleLower.includes('aircraft maintenance');
                const isAvionicsReq = reqLowerText.includes('avionics') || jobTitleLower.includes('avionics');
                const isAeroEngReq = reqLowerText.includes('aeronautical engineering') || reqLowerText.includes('aerospace engineering') || reqLowerText.includes('bsae');
                const isFlyingReq = reqLowerText.includes('flying') || reqLowerText.includes('pilot') || jobTitleLower.includes('pilot') || jobTitleLower.includes('flight instructor');
                const isLawDegreeReq = reqLowerText.includes('bachelor of laws') || reqLowerText.includes('juris doctor') || reqLowerText.includes('ll.b') || reqLowerText.includes('j.d.') || (reqLowerText.includes('law') && jobTitleLower.includes('legal'));
                const isAccountancyReq = reqLowerText.includes('accountancy') || reqLowerText.includes('accounting') || jobTitleLower.includes('accountant');
                const isCounselingReq = reqLowerText.includes('guidance & counseling') || reqLowerText.includes('guidance and counseling') || (reqLowerText.includes('counseling') && jobTitleLower.includes('counselor'));
                const isNursingReq = reqLowerText.includes('nursing') || jobTitleLower.includes('nurse');
                const isItReq = (reqLowerText.includes('information technology') || reqLowerText.includes('computer science') || reqLowerText.includes('bsit') || reqLowerText.includes('bscs') || reqLowerText.includes('software engineering') || jobTitleLower.includes('programmer') || jobTitleLower.includes('software engineer') || jobTitleLower.includes('it officer') || jobTitleLower.includes('web developer')) && !isGenericBachelorReq;
                const isCivilEngReq = reqLowerText.includes('civil engineering') || reqLowerText.includes('bsce') || jobTitleLower.includes('civil engineer');
                const isMechEngReq = (reqLowerText.includes('mechanical engineering') || reqLowerText.includes('bsme') || jobTitleLower.includes('mechanical engineer')) && !isAeroMaintenanceReq;
                const isElecEngReq = reqLowerText.includes('electrical engineering') || reqLowerText.includes('bsee') || reqLowerText.includes('electronics engineering') || reqLowerText.includes('bsece') || jobTitleLower.includes('electrical engineer') || jobTitleLower.includes('electronics engineer');
                const isTeachingEdReq = (reqLowerText.includes('secondary education') || reqLowerText.includes('elementary education') || reqLowerText.includes('bsed') || reqLowerText.includes('beed') || reqLowerText.includes('bachelor of education') || reqLowerText.includes('master of arts in education') || reqLowerText.includes('maed')) && !jobTitleLower.includes('amt') && !jobTitleLower.includes('flight') && !jobTitleLower.includes('avionics');
                const isHrReq = (reqLowerText.includes('human resource') || reqLowerText.includes('personnel') || reqLowerText.includes('public admin') || jobTitleLower.includes('human resource') || jobTitleLower.includes('hrmo') || jobTitleLower.includes('administrative officer')) && !isGenericBachelorReq;

                let hasSubDisciplineMismatch = false;
                let subDisciplineMismatchReason = '';

                if (isAeroMaintenanceReq) {
                    const hasAmtDegree = appLower.includes('aircraft maintenance') || appLower.includes('bsamt') || (appLower.includes('amt') && !appLower.includes('aviation information')) || appLower.includes('airframe') || appLower.includes('powerplant') || appLower.includes('aeronautical engineering');
                    if (!hasAmtDegree && (appLower.includes('information technology') || appLower.includes('computer') || appLower.includes('software') || appLower.includes('tourism') || appLower.includes('cabin crew') || appLower.includes('hospitality') || appLower.includes('counseling') || appLower.includes('business'))) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) is in Information Technology/Software, which does not satisfy the technical Aircraft Maintenance Technology (BSAMT) / Airframe & Powerplant curriculum requirement.`;
                    }
                } else if (isAeroEngReq) {
                    const hasAeroEngDegree = appLower.includes('aeronautical engineering') || appLower.includes('aerospace engineering') || appLower.includes('bsae');
                    if (!hasAeroEngDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Bachelor of Science in Aeronautical Engineering (BSAE) requirement.`;
                    }
                } else if (isAvionicsReq) {
                    const hasAvionicsDegree = appLower.includes('avionics') || appLower.includes('aviation electronics') || appLower.includes('electronics engineering') || appLower.includes('electrical engineering');
                    if (!hasAvionicsDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Avionics Technology / Aviation Electronics requirement.`;
                    }
                } else if (isFlyingReq) {
                    const hasFlyingDegree = appLower.includes('flying') || appLower.includes('pilot') || appLower.includes('flight');
                    if (!hasFlyingDegree && (appLower.includes('information technology') || appLower.includes('computer') || appLower.includes('maintenance'))) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) is not a Commercial Flying / Pilot training degree.`;
                    }
                } else if (isLawDegreeReq) {
                    const hasLawDegree = appLower.includes('juris doctor') || appLower.includes('bachelor of laws') || appLower.includes('ll.b') || appLower.includes('j.d.') || appLower.includes('llb') || /\bjd\b/i.test(appLower) || (appLower.includes('law') && !appLower.includes('criminology'));
                    if (!hasLawDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Bachelor of Laws (LL.B.) / Juris Doctor (J.D.) professional law degree requirement.`;
                    }
                } else if (isAccountancyReq) {
                    const hasAccountingDegree = appLower.includes('accountancy') || appLower.includes('accounting') || appLower.includes('bsa');
                    if (!hasAccountingDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Bachelor of Science in Accountancy curriculum requirement.`;
                    }
                } else if (isCounselingReq) {
                    const hasCounselingDegree = appLower.includes('guidance') || appLower.includes('counseling') || appLower.includes('psychology') || appLower.includes('behavioral');
                    if (!hasCounselingDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Master's / Degree requirement in Guidance & Counseling or Psychology.`;
                    }
                } else if (isNursingReq) {
                    const hasNursingDegree = appLower.includes('nursing') || appLower.includes('bsn');
                    if (!hasNursingDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Bachelor of Science in Nursing requirement.`;
                    }
                } else if (isItReq) {
                    const hasItDegree = appLower.includes('information technology') || appLower.includes('computer science') || appLower.includes('software') || appLower.includes('information systems') || appLower.includes('computer engineering') || /\b(bsit|bscs|bsis|bscpe)\b/i.test(appLower);
                    if (!hasItDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Information Technology / Computer Science curriculum requirement.`;
                    }
                } else if (isCivilEngReq) {
                    const hasCivilDegree = appLower.includes('civil engineering') || appLower.includes('bsce');
                    if (!hasCivilDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Bachelor of Science in Civil Engineering (BSCE) requirement.`;
                    }
                } else if (isMechEngReq) {
                    const hasMechDegree = appLower.includes('mechanical engineering') || appLower.includes('bsme');
                    if (!hasMechDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Bachelor of Science in Mechanical Engineering (BSME) requirement.`;
                    }
                } else if (isElecEngReq) {
                    const hasElecDegree = appLower.includes('electrical engineering') || appLower.includes('electronics engineering') || appLower.includes('bsee') || appLower.includes('bsece');
                    if (!hasElecDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Electrical / Electronics Engineering requirement.`;
                    }
                } else if (isTeachingEdReq) {
                    const hasEdDegree = appLower.includes('education') || appLower.includes('bsed') || appLower.includes('beed') || appLower.includes('maed') || appLower.includes('pedagogy') || appLower.includes('teaching');
                    if (!hasEdDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Teacher Education curriculum (BSED/BEED/MAEd) requirement.`;
                    }
                } else if (isHrReq) {
                    const hasHrDegree = appLower.includes('human resource') || appLower.includes('public administration') || appLower.includes('psychology') || appLower.includes('business administration') || appLower.includes('management') || appLower.includes('bsba') || appLower.includes('bsoa');
                    if (!hasHrDegree) {
                        hasSubDisciplineMismatch = true;
                        subDisciplineMismatchReason = `Applicant's degree (${fullEduText}) does not satisfy the Human Resource Management, Public Administration, Psychology, or Business Administration curriculum requirement.`;
                    }
                }

                // Flexible discipline matching (Primary Cluster, Secondary Cluster, or General Degree acceptance)
                const isDisciplineMatched = !hasSubDisciplineMismatch && (
                    reqDiscipline === 'GENERAL_OTHER' ||
                    isGenericBachelorReq ||
                    reqLowerText.includes('any bachelor') || reqLowerText.includes('bachelor\'s degree in any') ||
                    reqDiscipline === appDiscipline ||
                    (appSecondaryDiscipline !== null && reqDiscipline === appSecondaryDiscipline) ||
                    (reqDiscipline === 'IT_COMPUTER_STUDIES' && (appLower.includes('information technology') || appLower.includes('computer science') || appLower.includes('software') || /\b(it|bsit|bscs|bsis|ict)\b/i.test(appLower))) ||
                    (reqDiscipline === 'AVIATION_AERONAUTICS' && (appLower.includes('aviation') || appLower.includes('aeronautical') || appLower.includes('flight'))) ||
                    (reqDiscipline === 'BUSINESS_ADMINISTRATION' && (appLower.includes('business') || appLower.includes('administration') || appLower.includes('management') || appLower.includes('commerce') || appLower.includes('finance') || appLower.includes('human resource') || appLower.includes('personnel') || appLower.includes('public admin'))) ||
                    (reqDiscipline === 'SOCIAL_BEHAVIORAL_SCIENCES' && (appLower.includes('counseling') || appLower.includes('guidance') || appLower.includes('psychology') || appLower.includes('behavioral')))
                );

                const acceptsBachelor = reqLowerText.includes('bachelor') || reqLevel === 'bachelor';

                const degreeRank: Record<string, number> = { doctoral: 4, masters: 3, bachelor: 2, vocational: 1, highschool: 0 };
                const appRank = degreeRank[appLevel] || 2;
                const reqRank = acceptsBachelor ? 2 : (degreeRank[reqLevel] || 2);

                const isOngoingOrIncomplete = edLevelRaw.includes('undergrad') || 
                    edLevelRaw.includes('incomplete') || 
                    edLevelRaw.includes('ongoing') || 
                    appLower.includes('undergraduate') || 
                    appLower.includes('ongoing') || 
                    appLower.includes('incomplete') ||
                    appLower.includes('units earned') ||
                    appLower.includes('currently enrolled');

                if (!isDisciplineMatched) {
                    status = 'NOT_MATCHED';
                    multiplier = 0.00;
                    explanation = hasSubDisciplineMismatch
                        ? subDisciplineMismatchReason
                        : `Applicant's degree field (${fullEduText}) belongs to ${DISCIPLINE_CLUSTER_LABELS[appDiscipline]}, which does NOT match the required ${DISCIPLINE_CLUSTER_LABELS[reqDiscipline]} discipline for this position.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
                } else if (isOngoingOrIncomplete && reqRank >= 2) {
                    status = req.mandatory ? 'NOT_MATCHED' : 'PARTIALLY_MATCHED';
                    multiplier = req.mandatory ? 0.00 : 0.40;
                    explanation = `Applicant's degree is ongoing / incomplete (${fullEduText}), which does not satisfy the completed ${reqLevel === 'bachelor' || acceptsBachelor ? "Bachelor's Degree" : "degree"} requirement.`;
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
            const reqLower = req.required_value.toLowerCase();
            const isNoneRequired = reqLower.includes('none required') || reqLower.includes('fresh graduate') || reqLower.includes('entry level') || reqLower.includes('0 year');

            if (isNoneRequired) {
                applicantValue = fullExpText || 'No prior experience required';
                status = 'FULLY_MATCHED';
                multiplier = 1.00;
                explanation = 'Meets the work experience standard (None required under CSC Minimum QS).';
            } else if (yrsExp === 0 && !expSummary && !recentPos) {
                status = 'NOT_INDICATED';
                applicantValue = 'No work experience submitted';
                explanation = 'No relevant work experience information was provided in the submitted records.';
                if (req.mandatory) hasMissingMandatory = true;
            } else {
                applicantValue = fullExpText || `${yrsExp} years experience`;
                const requiredYrsMatch = req.required_value.match(/(\d+)/);
                const reqYrs = requiredYrsMatch ? parseFloat(requiredYrsMatch[1]) : 2;

                const posLower = (recentPos || '').toLowerCase();
                const roleAndDescLower = (recentPos + ' ' + expSummary).toLowerCase();

                const isLegalExpReq = reqLower.includes('legal') || reqLower.includes('law');
                const isFltExpReq = reqLower.includes('flight') || reqLower.includes('flying') || reqLower.includes('pilot');
                const isItExpReq = /\b(it|ict|software|programmer|programming|developer|sysadmin|systems admin|database|network engineer)\b/i.test(reqLower) || jobTitleLower.includes('programmer') || jobTitleLower.includes('software');
                const isCounselingExpReq = reqLower.includes('counsel') || reqLower.includes('guidance') || reqLower.includes('psycholog') || jobTitleLower.includes('counsel') || jobTitleLower.includes('guidance');
                const isAeroExpReq = reqLower.includes('hangar') || reqLower.includes('aircraft') || reqLower.includes('avionics') || reqLower.includes('aeronautical') || jobTitleLower.includes('maintenance') || jobTitleLower.includes('amt');
                const isAccountancyExpReq = reqLower.includes('accounting') || reqLower.includes('accountancy') || reqLower.includes('audit') || reqLower.includes('financial') || reqLower.includes('bookkeep') || jobTitleLower.includes('accountan') || jobTitleLower.includes('auditor') || jobTitleLower.includes('cashier') || jobTitleLower.includes('budget');
                const isMedicalExpReq = reqLower.includes('clinical') || reqLower.includes('medical') || reqLower.includes('hospital') || reqLower.includes('nursing') || jobTitleLower.includes('nurse') || jobTitleLower.includes('medical') || jobTitleLower.includes('physician');
                const isTeachingExpReq = (reqLower.includes('teaching') || reqLower.includes('pedagog') || reqLower.includes('instructional') || ((jobTitleLower.includes('instructor') || jobTitleLower.includes('professor') || jobTitleLower.includes('faculty') || jobTitleLower.includes('teacher')) && (reqLower.includes('experience') || reqLower.includes('teaching'))));
                const isEngineeringExpReq = !isAeroExpReq && !isItExpReq && (reqLower.includes('civil engineering') || reqLower.includes('mechanical engineering') || reqLower.includes('electrical engineering') || reqLower.includes('electronics engineering') || jobTitleLower.includes('civil engineer') || jobTitleLower.includes('mechanical engineer') || jobTitleLower.includes('electrical engineer'));
                const isHrAdminExpReq = (reqLower.includes('human resource') || reqLower.includes('personnel') || reqLower.includes('hrmo') || jobTitleLower.includes('human resource') || jobTitleLower.includes('hrmo'));

                let isFieldRelevant = true;
                let fieldIrrelevanceReason = '';

                if (isAeroExpReq) {
                    const isSoftwareOrItRole = posLower.includes('software') || posLower.includes('developer') || posLower.includes('programmer') || posLower.includes('web') || posLower.includes('database') || posLower.includes('it support') || posLower.includes('system admin');
                    const isClericalOrUnrelated = posLower.includes('counselor') || posLower.includes('nurse') || posLower.includes('accountant') || posLower.includes('cashier') || posLower.includes('clerk');
                    const hasAeroTechnicalRole = roleAndDescLower.includes('maintenance') || roleAndDescLower.includes('hangar') || roleAndDescLower.includes('mechanic') || roleAndDescLower.includes('technician') || roleAndDescLower.includes('amt') || roleAndDescLower.includes('a&p') || roleAndDescLower.includes('avionics') || roleAndDescLower.includes('airframe') || roleAndDescLower.includes('powerplant') || roleAndDescLower.includes('structural') || roleAndDescLower.includes('inspector') || roleAndDescLower.includes('aeronautical');

                    if (isSoftwareOrItRole || isClericalOrUnrelated || !hasAeroTechnicalRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos || 'Non-technical'}) is in ${isSoftwareOrItRole ? 'IT / Software Development' : 'an unrelated field'}, not technical aircraft maintenance hangar operations.`;
                    }
                } else if (isItExpReq) {
                    const isUnrelatedRole = posLower.includes('mechanic') || posLower.includes('counselor') || posLower.includes('nurse') || posLower.includes('pilot') || posLower.includes('flight attendant') || posLower.includes('driver');
                    const hasItRole = /\b(it|ict|tech|support|developer|dev|programmer|programming|systems|software|web|network|database|qa|devops|engineer)\b/i.test(roleAndDescLower);

                    if (isUnrelatedRole || !hasItRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos}) is not relevant to ${req.required_value}.`;
                    }
                } else if (isCounselingExpReq) {
                    const isUnrelatedRole = posLower.includes('software') || posLower.includes('developer') || posLower.includes('mechanic') || posLower.includes('engineer') || posLower.includes('pilot') || posLower.includes('accountant');
                    const hasCounselingRole = roleAndDescLower.includes('counsel') || roleAndDescLower.includes('guidance') || roleAndDescLower.includes('psycholog') || roleAndDescLower.includes('mental health') || roleAndDescLower.includes('student affairs') || roleAndDescLower.includes('advising');

                    if (isUnrelatedRole || !hasCounselingRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos}) is not relevant to Guidance & Counseling.`;
                    }
                } else if (isLegalExpReq) {
                    const hasLegalRole = roleAndDescLower.includes('legal') || roleAndDescLower.includes('law') || roleAndDescLower.includes('attorney') || roleAndDescLower.includes('court') || roleAndDescLower.includes('litigation') || roleAndDescLower.includes('paralegal');
                    if (!hasLegalRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos}) is not relevant to legal practice.`;
                    }
                } else if (isFltExpReq) {
                    const hasFltRole = roleAndDescLower.includes('pilot') || roleAndDescLower.includes('flying') || roleAndDescLower.includes('flight') || roleAndDescLower.includes('instructor') || roleAndDescLower.includes('first officer') || roleAndDescLower.includes('captain');
                    if (!hasFltRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos}) is not relevant to flight operations or instructional flying.`;
                    }
                } else if (isAccountancyExpReq) {
                    const isUnrelatedRole = posLower.includes('mechanic') || posLower.includes('counselor') || posLower.includes('nurse') || posLower.includes('pilot') || posLower.includes('flight attendant') || posLower.includes('developer') || posLower.includes('software') || posLower.includes('driver');
                    const hasAccountancyRole = roleAndDescLower.includes('account') || roleAndDescLower.includes('audit') || roleAndDescLower.includes('finance') || roleAndDescLower.includes('bookkeep') || roleAndDescLower.includes('cashier') || roleAndDescLower.includes('tax') || roleAndDescLower.includes('budget') || roleAndDescLower.includes('payroll') || roleAndDescLower.includes('disbursement') || roleAndDescLower.includes('billing') || roleAndDescLower.includes('gam') || roleAndDescLower.includes('coa');

                    if (isUnrelatedRole || !hasAccountancyRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos || 'Non-financial'}) is not relevant to accounting, auditing, or financial management.`;
                    }
                } else if (isMedicalExpReq) {
                    const isUnrelatedRole = posLower.includes('developer') || posLower.includes('mechanic') || posLower.includes('counselor') || posLower.includes('accountant') || posLower.includes('pilot') || posLower.includes('flight attendant') || posLower.includes('clerk');
                    const hasMedicalRole = roleAndDescLower.includes('nurse') || roleAndDescLower.includes('nursing') || roleAndDescLower.includes('clinical') || roleAndDescLower.includes('hospital') || roleAndDescLower.includes('triage') || roleAndDescLower.includes('patient') || roleAndDescLower.includes('health') || roleAndDescLower.includes('medical') || roleAndDescLower.includes('clinic') || roleAndDescLower.includes('ward') || roleAndDescLower.includes('vital sign');

                    if (isUnrelatedRole || !hasMedicalRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos || 'Non-medical'}) is not relevant to clinical nursing or healthcare practice.`;
                    }
                } else if (isTeachingExpReq) {
                    const isUnrelatedRole = posLower.includes('cashier') || posLower.includes('waiter') || posLower.includes('driver') || posLower.includes('security') || posLower.includes('clerk');
                    const hasTeachingRole = roleAndDescLower.includes('teach') || roleAndDescLower.includes('instructor') || roleAndDescLower.includes('professor') || roleAndDescLower.includes('faculty') || roleAndDescLower.includes('lecturer') || roleAndDescLower.includes('pedagogy') || roleAndDescLower.includes('academic') || roleAndDescLower.includes('classroom') || roleAndDescLower.includes('tutor') || roleAndDescLower.includes('trainer') || roleAndDescLower.includes('training officer') || roleAndDescLower.includes('industry practice');

                    if (isUnrelatedRole && !hasTeachingRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos || 'Non-instructional'}) is not relevant to academic teaching or instruction.`;
                    }
                } else if (isEngineeringExpReq) {
                    const isUnrelatedRole = posLower.includes('counselor') || posLower.includes('nurse') || posLower.includes('accountant') || posLower.includes('cashier') || posLower.includes('flight attendant');
                    const hasEngineeringRole = roleAndDescLower.includes('engineer') || roleAndDescLower.includes('construction') || roleAndDescLower.includes('electrical') || roleAndDescLower.includes('mechanical') || roleAndDescLower.includes('civil') || roleAndDescLower.includes('electronics') || roleAndDescLower.includes('structural') || roleAndDescLower.includes('cad') || roleAndDescLower.includes('site');

                    if (isUnrelatedRole || !hasEngineeringRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos || 'Non-engineering'}) is not relevant to engineering technical practice.`;
                    }
                } else if (isHrAdminExpReq) {
                    const isUnrelatedRole = posLower.includes('mechanic') || posLower.includes('pilot') || posLower.includes('flight attendant') || posLower.includes('developer') || posLower.includes('software') || posLower.includes('programmer') || posLower.includes('instructor') || posLower.includes('teacher') || posLower.includes('nurse');
                    const hasHrRole = roleAndDescLower.includes('hr') || roleAndDescLower.includes('human resource') || roleAndDescLower.includes('personnel') || roleAndDescLower.includes('recruitment') || roleAndDescLower.includes('talent') || roleAndDescLower.includes('staffing') || roleAndDescLower.includes('admin') || roleAndDescLower.includes('administrative') || roleAndDescLower.includes('clerk') || roleAndDescLower.includes('office') || roleAndDescLower.includes('records') || roleAndDescLower.includes('payroll') || roleAndDescLower.includes('hiring') || roleAndDescLower.includes('compensation') || roleAndDescLower.includes('employee relations');

                    if (isUnrelatedRole || !hasHrRole) {
                        isFieldRelevant = false;
                        fieldIrrelevanceReason = `Applicant's declared work experience role (${recentPos || 'Unrelated'}) is not relevant to human resource management or administrative operations.`;
                    }
                }

                if (!isFieldRelevant) {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = fieldIrrelevanceReason || `Applicant's declared work experience field (${recentPos || fullExpText}) is not relevant to ${req.required_value}.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
                } else if (yrsExp >= reqYrs) {
                    status = 'FULLY_MATCHED'; multiplier = 1.00;
                    explanation = `Applicant has ${yrsExp} years of relevant experience, meeting or exceeding the required ${reqYrs} years.`;
                } else if (yrsExp > 0) {
                    status = 'PARTIALLY_MATCHED';
                    multiplier = yrsExp / reqYrs;
                    explanation = `Applicant has ${yrsExp} years of relevant experience, meeting ${Math.round((yrsExp / reqYrs) * 100)}% of the required ${reqYrs} years.`;
                } else {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant declared 0 years of relevant experience vs ${reqYrs} years required.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
                }
            }
        } else if (cat === 'eligibility') {
            const reqLower = req.required_value.toLowerCase();
            const isNoneRequired = reqLower.includes('none required') || reqLower.includes('not required');

            if (isNoneRequired) {
                applicantValue = fullEligText || 'No eligibility required';
                status = 'FULLY_MATCHED';
                multiplier = 1.00;
                explanation = 'Meets the eligibility standard (None required under CSC Minimum QS).';
            } else if (!fullEligText) {
                status = 'NOT_INDICATED';
                applicantValue = 'No CS eligibility or professional license submitted';
                explanation = 'No Civil Service eligibility or professional license was declared in submitted records.';
                if (req.mandatory) {
                    hasMissingMandatory = true;
                    hasUnmatchedMandatory = true;
                }
            } else {
                applicantValue = fullEligText;
                const appEligLower = fullEligText.toLowerCase();

                const isCounselingLicReq = reqLower.includes('guidance counselor') || reqLower.includes('rgc') || ((reqLower.includes('ra 1080') || reqLower.includes('license') || reqLower.includes('board')) && (jobTitleLower.includes('counselor') || jobTitleLower.includes('guidance')));
                const hasCounselingLicense = /\b(rgc|registered guidance counselor|licensed guidance counselor|psychologist|rpm)\b/i.test(appEligLower);

                const hasBar = /\b(bar|lawyer|attorney)\b/i.test(appEligLower) || (licNo && /\bbar\b/i.test(licNo));
                const hasPilot = /\b(cpl|atpl|fi rating|commercial pilot|flight instructor)\b/i.test(appEligLower) || (appEligLower.includes('caap') && (appEligLower.includes('pilot') || appEligLower.includes('license')));
                const hasEng = appEligLower.includes('engineer') || /\b(amt|a&p|ame|pece|ece|me|ee|ce)\b/i.test(appEligLower) || (appEligLower.includes('board') && !appEligLower.includes('teacher') && !appEligLower.includes('nurs'));
                const hasCpa = /\b(cpa|certified public accountant)\b/i.test(appEligLower);
                const hasNurse = appEligLower.includes('nurse') || /\b(rn|registered nurse|prc nurse)\b/i.test(appEligLower);
                const hasTeacher = appEligLower.includes('teacher') || /\b(lpt|let|licensed professional teacher)\b/i.test(appEligLower);
                const hasPD907 = appEligLower.includes('pd 907') || appEligLower.includes('honor graduate') || appEligLower.includes('summa cum laude') || appEligLower.includes('magna cum laude') || appEligLower.includes('cum laude');

                const hasProCS = (appEligLower.includes('professional') && !appEligLower.includes('sub professional') && !appEligLower.includes('subprofessional')) ||
                    (appEligLower.includes('ra1080') && !appEligLower.includes('7160')) ||
                    hasPD907 || hasCpa || hasNurse || hasTeacher || appEligLower.includes('csc professional');

                const hasSubPro = appEligLower.includes('sub professional') || appEligLower.includes('subprofessional') ||
                    appEligLower.includes('barangay') || appEligLower.includes('health worker') || appEligLower.includes('nutrition scholar') ||
                    appEligLower.includes('sanggunian') || appEligLower.includes('category ii') || appEligLower.includes('tesda') || appEligLower.includes('nc ii');

                const acceptsSubPro = reqLower.includes('subprofessional') || reqLower.includes('sub professional') || reqLower.includes('sub-professional') || reqLower.includes('1st level') || reqLower.includes('first level') || reqLower.includes('or cs subprofessional');

                const isNursingLicReq = reqLower.includes('nurse') || /\brn\b/i.test(reqLower) || (jobTitleLower.includes('nurse') && (reqLower.includes('ra 1080') || reqLower.includes('prc') || reqLower.includes('license') || reqLower.includes('board')));
                const isTeachingLicReq = (reqLower.includes('lpt') || reqLower.includes('let') || reqLower.includes('licensure examination for teacher') || reqLower.includes('board teacher')) && !jobTitleLower.includes('amt') && !jobTitleLower.includes('flight');
                const isMandatoryCpaReq = (reqLower.includes('cpa') || reqLower.includes('certified public accountant')) && (jobTitleLower.includes('accountant') || jobTitleLower.includes('auditor') || req.mandatory);

                if (isCounselingLicReq) {
                    if (hasCounselingLicense) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses RA 1080 Registered Guidance Counselor (RGC) / Psychologist License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the RA 1080 Registered Guidance Counselor (RGC) license requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (isNursingLicReq) {
                    if (hasNurse) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses PRC Registered Nurse (RN) / RA 1080 License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the PRC Registered Nurse (RN) license requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (isTeachingLicReq) {
                    if (hasTeacher) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses PRC Licensure Examination for Teachers (LET/LPT) / RA 1080.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the PRC Teacher Board (LET/LPT) requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (reqLower.includes('bar') || reqLower.includes('ra 1080 (legal)')) {
                    if (hasBar) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses BAR / RA 1080 Legal eligibility.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy BAR / RA 1080 Legal eligibility.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (reqLower.includes('cpl') || reqLower.includes('fi rating') || reqLower.includes('caap license') || reqLower.includes('pilot')) {
                    if (hasPilot || licNo.length > 3) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses required CAAP Pilot / FI License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CAAP Pilot License requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (reqLower.includes('board engineer') || reqLower.includes('amt license') || reqLower.includes('a&p') || reqLower.includes('airframe')) {
                    if (hasEng || hasPilot) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses PRC Engineering Board / CAAP AMT License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy Engineering Board / AMT License requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (isMandatoryCpaReq) {
                    if (hasCpa) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses PRC Certified Public Accountant (CPA) Board License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the mandatory PRC CPA Board requirement for Accountant positions.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (reqLower.includes('cpa') || reqLower.includes('accountant')) {
                    if (hasCpa) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses CPA Board License.";
                    } else if (hasProCS) {
                        status = 'PARTIALLY_MATCHED'; multiplier = 0.70;
                        explanation = "Applicant possesses CS Professional, partially satisfying the general accounting requirement.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CPA / Financial Board requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else if (reqLower.includes('professional') && !acceptsSubPro) {
                    if (hasProCS || hasBar || hasEng || hasPilot || hasCpa || hasNurse || hasCounselingLicense || hasTeacher) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses 2nd level CS Professional / Board Rating / License.";
                    } else if (hasSubPro) {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses 1st level CS Subprofessional / Barangay eligibility, which does not satisfy 2nd level CS Professional requirements.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CS Professional requirement.`;
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                } else {
                    if (hasProCS || hasSubPro || hasBar || hasEng || hasPilot || hasCpa || hasNurse || hasCounselingLicense || hasTeacher) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses Civil Service / Board eligibility.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = "Applicant eligibility does not match the requirement.";
                        if (req.mandatory) hasUnmatchedMandatory = true;
                    }
                }
            }
        } else if (cat === 'training') {
            const reqLower = req.required_value.toLowerCase();
            const isNoneRequired = reqLower.includes('none required') || reqLower.includes('0 hour') || reqLower.includes('not required');

            if (isNoneRequired) {
                applicantValue = fullTrnText || 'No training required';
                status = 'FULLY_MATCHED'; multiplier = 1.00;
                explanation = 'Meets the training standard (None required under CSC Minimum QS).';
            } else if (trnHrs === 0 && !recentTrn) {
                status = 'NOT_INDICATED';
                applicantValue = 'No training or L&D hours submitted';
                explanation = 'No training hours or seminar certificates were provided in submitted records.';
                if (req.mandatory) {
                    hasMissingMandatory = true;
                    hasUnmatchedMandatory = true;
                }
            } else {
                applicantValue = fullTrnText || `${trnHrs} hours training`;
                const reqHrsMatch = req.required_value.match(/(\d+)/);
                const reqHrs = reqHrsMatch ? parseFloat(reqHrsMatch[1]) : 8;

                const isCounselingJob = jobTitleLower.includes('counselor') || jobTitleLower.includes('guidance');
                const isLegalJob = jobTitleLower.includes('attorney') || jobTitleLower.includes('legal');
                const isFltJob = jobTitleLower.includes('pilot') || jobTitleLower.includes('flight');
                const isAeroJob = jobTitleLower.includes('maintenance') || jobTitleLower.includes('amt') || jobTitleLower.includes('avionics') || jobTitleLower.includes('aeronautical');
                const isItJob = jobTitleLower.includes('programmer') || jobTitleLower.includes('software') || jobTitleLower.includes('information technology') || jobTitleLower.includes('it support') || jobTitleLower.includes('web');
                const isAccountancyJob = jobTitleLower.includes('accountant') || jobTitleLower.includes('auditor') || jobTitleLower.includes('finance') || jobTitleLower.includes('budget') || jobTitleLower.includes('cashier');
                const isMedicalJob = jobTitleLower.includes('nurse') || jobTitleLower.includes('medical') || jobTitleLower.includes('clinic');
                const isTeachingJob = (jobTitleLower.includes('instructor') || jobTitleLower.includes('professor') || jobTitleLower.includes('faculty') || jobTitleLower.includes('teacher')) && !isAeroJob && !isFltJob;
                const isHrJob = jobTitleLower.includes('human resource') || jobTitleLower.includes('hrmo') || jobTitleLower.includes('administrative officer') || jobTitleLower.includes('personnel') || reqLower.includes('hrd') || reqLower.includes('personnel') || reqLower.includes('human resource');

                const trnLower = (fullTrnText + ' ' + recentTrn).toLowerCase();
                let isTrnRelevant = true;
                if (isCounselingJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('counsel') && !trnLower.includes('guidance') && !trnLower.includes('psycholog') && !trnLower.includes('mental health') && !trnLower.includes('student') && !trnLower.includes('crisis') && !trnLower.includes('wellness') && !trnLower.includes('behavioral')) {
                        isTrnRelevant = false;
                    }
                } else if (isLegalJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('law') && !trnLower.includes('legal') && !trnLower.includes('juris') && !trnLower.includes('court') && !trnLower.includes('litigation') && !trnLower.includes('statutory') && !trnLower.includes('mcle')) {
                        isTrnRelevant = false;
                    }
                } else if (isFltJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('flight') && !trnLower.includes('aviation') && !trnLower.includes('pilot') && !trnLower.includes('flying') && !trnLower.includes('safety') && !trnLower.includes('aircraft')) {
                        isTrnRelevant = false;
                    }
                } else if (isAeroJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('aviation') && !trnLower.includes('aircraft') && !trnLower.includes('maintenance') && !trnLower.includes('avionics') && !trnLower.includes('hangar') && !trnLower.includes('powerplant') && !trnLower.includes('airframe') && !trnLower.includes('safety') && !trnLower.includes('technical') && !trnLower.includes('quality') && !trnLower.includes('caap')) {
                        isTrnRelevant = false;
                    }
                } else if (isItJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('it') && !trnLower.includes('software') && !trnLower.includes('programming') && !trnLower.includes('network') && !trnLower.includes('web') && !trnLower.includes('database') && !trnLower.includes('cyber') && !trnLower.includes('computer') && !trnLower.includes('cloud') && !trnLower.includes('tech') && !trnLower.includes('system')) {
                        isTrnRelevant = false;
                    }
                } else if (isAccountancyJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('account') && !trnLower.includes('finance') && !trnLower.includes('tax') && !trnLower.includes('audit') && !trnLower.includes('budget') && !trnLower.includes('bookkeep') && !trnLower.includes('gam') && !trnLower.includes('excel') && !trnLower.includes('procurement') && !trnLower.includes('cashier')) {
                        isTrnRelevant = false;
                    }
                } else if (isMedicalJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('health') && !trnLower.includes('clinical') && !trnLower.includes('nursing') && !trnLower.includes('medical') && !trnLower.includes('bls') && !trnLower.includes('acls') && !trnLower.includes('first aid') && !trnLower.includes('infection') && !trnLower.includes('triage') && !trnLower.includes('patient care')) {
                        isTrnRelevant = false;
                    }
                } else if (isTeachingJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('pedagog') && !trnLower.includes('teach') && !trnLower.includes('curriculum') && !trnLower.includes('instruction') && !trnLower.includes('education') && !trnLower.includes('assessment') && !trnLower.includes('classroom') && !trnLower.includes('syllabus')) {
                        isTrnRelevant = false;
                    }
                } else if (isHrJob && trnHrs > 0 && recentTrn) {
                    if (!trnLower.includes('hr') && !trnLower.includes('human resource') && !trnLower.includes('personnel') && !trnLower.includes('leadership') && !trnLower.includes('supervisory') && !trnLower.includes('public admin') && !trnLower.includes('spms') && !trnLower.includes('recruitment') && !trnLower.includes('csc') && !trnLower.includes('administrative') && !trnLower.includes('records') && !trnLower.includes('management') && !trnLower.includes('customer service')) {
                        isTrnRelevant = false;
                    }
                }

                if (!isTrnRelevant) {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant's declared training (${recentTrn}) is in a different discipline and not relevant to ${jobTitle}.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
                } else if (trnHrs >= reqHrs) {
                    status = 'FULLY_MATCHED'; multiplier = 1.00;
                    explanation = `Applicant completed ${trnHrs} hours of training, meeting or exceeding the required ${reqHrs} hours.`;
                } else if (trnHrs > 0) {
                    status = 'PARTIALLY_MATCHED';
                    multiplier = trnHrs / reqHrs;
                    explanation = `Applicant completed ${trnHrs} hours of training, meeting ${Math.round((trnHrs / reqHrs) * 100)}% of the required ${reqHrs} hours.`;
                } else {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant declared 0 hours training vs ${reqHrs} hours required.`;
                    if (req.mandatory) hasUnmatchedMandatory = true;
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

    // 4. Calculate Category Scores & Fixed Weight Aggregation (Sum = 100%)
    // Approved CSC Qualification Standards Weights:
    // Education (30%), Work Experience (35%), Civil Service & Board Eligibility (20%), Training (15%)
    const categories: Record<QualificationCategory, CategorySummary> = {
        education: { 
            category: 'education', 
            label: CATEGORY_LABELS.education, 
            configured_weight: DEFAULT_CATEGORY_WEIGHTS.education, 
            normalized_weight: DEFAULT_CATEGORY_WEIGHTS.education, 
            score: 0, 
            weighted_score: 0, 
            evaluated_count: 0, 
            total_count: 0, 
            has_missing: false 
        },
        experience: { 
            category: 'experience', 
            label: CATEGORY_LABELS.experience, 
            configured_weight: DEFAULT_CATEGORY_WEIGHTS.experience, 
            normalized_weight: DEFAULT_CATEGORY_WEIGHTS.experience, 
            score: 0, 
            weighted_score: 0, 
            evaluated_count: 0, 
            total_count: 0, 
            has_missing: false 
        },
        eligibility: { 
            category: 'eligibility', 
            label: CATEGORY_LABELS.eligibility, 
            configured_weight: DEFAULT_CATEGORY_WEIGHTS.eligibility, 
            normalized_weight: DEFAULT_CATEGORY_WEIGHTS.eligibility, 
            score: 0, 
            weighted_score: 0, 
            evaluated_count: 0, 
            total_count: 0, 
            has_missing: false 
        },
        training: { 
            category: 'training', 
            label: CATEGORY_LABELS.training, 
            configured_weight: DEFAULT_CATEGORY_WEIGHTS.training, 
            normalized_weight: DEFAULT_CATEGORY_WEIGHTS.training, 
            score: 0, 
            weighted_score: 0, 
            evaluated_count: 0, 
            total_count: 0, 
            has_missing: false 
        }
    };

    (Object.keys(categoryScores) as QualificationCategory[]).forEach(cat => {
        const data = categoryScores[cat];
        const catSummary = categories[cat];
        catSummary.total_count = data.totalCount;
        catSummary.evaluated_count = data.evalCount;
        catSummary.has_missing = data.hasMissing;

        if (data.evalCount > 0) {
            catSummary.score = Math.round((data.totalScore / data.evalCount) * 10000) / 100;
        } else {
            catSummary.score = 0;
        }

        // Weighted score = (Criterion Score / 100) * Category Weight
        catSummary.weighted_score = Math.round((catSummary.score / 100) * catSummary.configured_weight * 100) / 100;
    });

    // Final qualification score = Education weighted score + Work Experience weighted score + Eligibility weighted score + Training weighted score
    let calculatedOverallScore = Math.round((
        categories.education.weighted_score +
        categories.experience.weighted_score +
        categories.eligibility.weighted_score +
        categories.training.weighted_score
    ) * 100) / 100;

    calculatedOverallScore = Math.min(100.00, Math.max(0.00, calculatedOverallScore));

    // 5. Build HR Assessment Label and Review Alerts
    let assessmentLabel: 'Meets Indicated Qualifications' | 'Does Not Meet Indicated Qualifications' | 'For HR Review' = 'For HR Review';

    if (hasUnmatchedMandatory) {
        const failedCats: string[] = [];
        if (itemizedResults.some(r => r.category === 'education' && r.mandatory && (r.match_status === 'NOT_MATCHED' || r.match_status === 'NOT_INDICATED'))) failedCats.push("educational degree discipline");
        if (itemizedResults.some(r => r.category === 'eligibility' && r.mandatory && (r.match_status === 'NOT_MATCHED' || r.match_status === 'NOT_INDICATED'))) failedCats.push("required professional license/eligibility");
        if (itemizedResults.some(r => r.category === 'experience' && r.mandatory && (r.match_status === 'NOT_MATCHED' || r.match_status === 'NOT_INDICATED'))) failedCats.push("required relevant work experience");
        if (itemizedResults.some(r => r.category === 'training' && r.mandatory && (r.match_status === 'NOT_MATCHED' || r.match_status === 'NOT_INDICATED'))) failedCats.push("required relevant training");

        alerts.push(`⚠️ Unmet Mandatory Requirement: Applicant does not meet mandatory qualification criteria for ${failedCats.join(', ')}. Recommended for HR Review.`);
        assessmentLabel = 'Does Not Meet Indicated Qualifications';
    }

    if (hasMissingMandatory && !hasUnmatchedMandatory) {
        alerts.push("ℹ Mandatory Information Missing: A mandatory requirement is not indicated in the applicant's submitted records. Recommended for HR Review.");
        if (assessmentLabel !== 'Does Not Meet Indicated Qualifications') {
            assessmentLabel = 'For HR Review';
        }
    }

    if (notIndicatedCount > 0) {
        const missingCats = itemizedResults
            .filter(r => r.match_status === 'NOT_INDICATED')
            .map(r => r.category_label);
        alerts.push(`ℹ Missing Information: Applicant submitted no records for ${missingCats.join(', ')}. Criteria awarded 0 points; flagged for HR review.`);
    }

    if (!hasUnmatchedMandatory && !hasMissingMandatory) {
        if (calculatedOverallScore >= 80) {
            assessmentLabel = 'Meets Indicated Qualifications';
        } else if (calculatedOverallScore < 50) {
            assessmentLabel = 'Does Not Meet Indicated Qualifications';
        } else {
            assessmentLabel = 'For HR Review';
        }
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
        assessment_label: assessmentLabel,
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
        analysis_version: 'v2.2',
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
