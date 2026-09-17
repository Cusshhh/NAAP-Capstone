// AI Scoring Utility for Job-Specific Applicant Qualification Analysis
// Based on NAAP Criteria: Education (30%), Work Experience (35%), Eligibility (20%), Training & Certification (15%)

export type QualificationCategory = 'education' | 'experience' | 'eligibility' | 'training';
export type MatchStatus = 'FULLY_MATCHED' | 'PARTIALLY_MATCHED' | 'NOT_MATCHED' | 'NOT_INDICATED';

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
 * Extract structured requirements from a Job Vacancy object.
 * Reads explicit dynamic_requirements or parses requirements text lines.
 */
export function extractJobRequirements(job: any): JobRequirementItem[] {
    if (!job) return getDefaultRequirementsForTitle('General Position');

    // 1. If explicit structured requirements exist
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

    // 2. Parse text requirements array or newline-delimited text
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
                mandatory: isMandatory || lower.includes('law') || lower.includes('bachelor')
            });
        } else if (lower.includes('year') || lower.includes('experience') || lower.includes('work') || lower.includes('service') || lower.includes('background')) {
            const yrsMatch = clean.match(/(\d+)\s*year/i);
            const yrs = yrsMatch ? yrsMatch[1] : '3';
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
 * Default standard qualification requirements based on Job Title benchmark
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
    } else if (t.includes('it support') || t.includes('programmer') || t.includes('software') || t.includes('computer')) {
        return [
            { id: 'it_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in IT / Computer Science", mandatory: true },
            { id: 'it_exp', category: 'experience', requirement: 'Work Experience', required_value: '3 years IT support experience', mandatory: false },
            { id: 'it_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'CS Professional or CS Subprofessional', mandatory: false },
            { id: 'it_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours relevant IT training', mandatory: false }
        ];
    }

    // Default General 1st/2nd Level Position
    return [
        { id: 'gen_edu', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree", mandatory: true },
        { id: 'gen_exp', category: 'experience', requirement: 'Work Experience', required_value: '2 years relevant experience', mandatory: false },
        { id: 'gen_elig', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'CS Professional / Subprofessional', mandatory: false },
        { id: 'gen_trn', category: 'training', requirement: 'Training & L&D', required_value: '8 hours relevant training', mandatory: false }
    ];
}

/**
 * Main Deterministic Requirement-Based Qualification Evaluation Engine
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

    // 2. Applicant Data Extraction
    const degreeCourse = String(dyn.degreeCourse || dyn.course || app?.degreeCourse || app?.education || '').trim();
    const edLevelRaw = String(dyn.educationLevel || app?.educationLevel || app?.education || '').toLowerCase();

    let degreeLevelLabel = "Bachelor's Degree";
    if (edLevelRaw.includes('doctoral')) degreeLevelLabel = "Doctoral / Ph.D. Degree";
    else if (edLevelRaw.includes('master')) degreeLevelLabel = "Master's Degree";
    else if (edLevelRaw.includes('bachelor')) degreeLevelLabel = "Bachelor's Degree";
    else if (edLevelRaw.includes('vocational')) degreeLevelLabel = "Vocational Diploma";
    else if (edLevelRaw.includes('highschool')) degreeLevelLabel = "High School Graduate";

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
            if (!fullEduText) {
                status = 'NOT_INDICATED';
                applicantValue = 'No educational background submitted';
                explanation = 'No educational background information was provided in the submitted records.';
            } else {
                applicantValue = fullEduText;
                const reqLower = req.required_value.toLowerCase();
                const appLower = fullEduText.toLowerCase();

                const isLawReq = reqLower.includes('law') || reqLower.includes('llb') || reqLower.includes('juris');
                const isAviationReq = reqLower.includes('aviation') || reqLower.includes('flying') || reqLower.includes('pilot');
                const isEngReq = reqLower.includes('engineer') || reqLower.includes('amt') || reqLower.includes('mechanic');
                const isITReq = reqLower.includes('it') || reqLower.includes('computer') || reqLower.includes('software');

                if (isLawReq) {
                    if (appLower.includes('law') || appLower.includes('llb') || appLower.includes('juris')) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant's degree matches the required Law degree (LLB/JD).";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant's degree (${fullEduText}) does not match the required Law degree (${req.required_value}).`;
                    }
                } else if (isAviationReq) {
                    if (appLower.includes('aviation') || appLower.includes('flying') || appLower.includes('pilot') || appLower.includes('aero')) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant's degree matches the required Aviation field.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant's degree (${fullEduText}) does not match the required Aviation field.`;
                    }
                } else if (isEngReq) {
                    if (appLower.includes('engineer') || appLower.includes('amt') || appLower.includes('aero') || appLower.includes('aircraft')) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant's degree matches the required Engineering / AMT field.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant's degree (${fullEduText}) does not match the required Engineering / AMT field.`;
                    }
                } else if (isITReq) {
                    if (appLower.includes('it') || appLower.includes('computer') || appLower.includes('information') || appLower.includes('cs') || appLower.includes('software')) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant's degree matches the required IT / Computer Science field.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant's degree (${fullEduText}) does not match the required IT field.`;
                    }
                } else {
                    if (edLevelRaw.includes('bachelor') || edLevelRaw.includes('master') || edLevelRaw.includes('doctoral')) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant holds a Bachelor's degree or higher which satisfies the general educational requirement.";
                    } else {
                        status = 'PARTIALLY_MATCHED'; multiplier = 0.50;
                        explanation = `Applicant's educational level (${degreeLevelLabel}) partially satisfies the requirement.`;
                    }
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
                const isITExpReq = reqLower.includes('it') || reqLower.includes('support') || reqLower.includes('computer');

                let isFieldRelevant = true;
                if (isLegalExpReq && !expLower.includes('legal') && !expLower.includes('law') && !expLower.includes('attorney')) isFieldRelevant = false;
                if (isFltExpReq && !expLower.includes('flight') && !expLower.includes('pilot') && !expLower.includes('flying') && !expLower.includes('instructor')) isFieldRelevant = false;

                if (!isFieldRelevant) {
                    status = 'NOT_MATCHED'; multiplier = 0.00;
                    explanation = `Applicant's experience is not in the required field for ${req.required_value}.`;
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
                const hasProCS = appEligLower.includes('professional') || (appEligLower.includes('ra1080') && !appEligLower.includes('7160')) || appEligLower.includes('pd 907');
                const hasSubPro = appEligLower.includes('sub professional') || appEligLower.includes('barangay') || appEligLower.includes('mc 11');

                if (reqLower.includes('bar') || reqLower.includes('ra 1080 (legal)')) {
                    if (hasBar) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses BAR / RA 1080 Legal eligibility.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the required BAR / RA 1080 Legal eligibility.`;
                    }
                } else if (reqLower.includes('cpl') || reqLower.includes('fi rating') || reqLower.includes('caap license')) {
                    if (hasPilot || licNo.length > 3) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses required CAAP Pilot / FI License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the required CAAP Pilot License.`;
                    }
                } else if (reqLower.includes('board engineer') || reqLower.includes('amt license')) {
                    if (hasEng || hasPilot) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses PRC Engineering Board / CAAP AMT License.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy the required Engineering Board / AMT License.`;
                    }
                } else if (reqLower.includes('subprofessional') && reqLower.includes('professional')) {
                    if (hasProCS || hasSubPro || hasBar || hasEng || hasPilot) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses CS Professional or Subprofessional eligibility as allowed.";
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy Civil Service eligibility.`;
                    }
                } else if (reqLower.includes('professional')) {
                    if (hasProCS || hasBar || hasEng || hasPilot) {
                        status = 'FULLY_MATCHED'; multiplier = 1.00;
                        explanation = "Applicant possesses 2nd level CS Professional / Board Rating / License.";
                    } else if (hasSubPro) {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses 1st level CS Subprofessional, which does not satisfy 2nd level CS Professional requirements.`;
                    } else {
                        status = 'NOT_MATCHED'; multiplier = 0.00;
                        explanation = `Applicant possesses ${fullEligText}, which does not satisfy CS Professional requirement.`;
                    }
                } else {
                    if (hasProCS || hasSubPro || hasBar || hasEng || hasPilot) {
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
                explanation = 'No training hours or seminar certificates were provided in the submitted records.';
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
        } else { // NOT_INDICATED
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
            catSummary.score = Math.round((data.totalScore / data.evalCount) * 10000) / 100; // 0 to 100%
            totalActiveWeightSum += catSummary.configured_weight;
        } else {
            catSummary.score = 0;
            catSummary.normalized_weight = 0;
        }
    });

    // Normalize active category weights to sum up to 100%
    let calculatedOverallScore = 0;

    (Object.keys(categories) as QualificationCategory[]).forEach(cat => {
        const catSummary = categories[cat];
        if (catSummary.evaluated_count > 0 && totalActiveWeightSum > 0) {
            catSummary.normalized_weight = Math.round((catSummary.configured_weight / totalActiveWeightSum) * 10000) / 100;
            calculatedOverallScore += (catSummary.score * (catSummary.normalized_weight / 100));
        }
    });

    calculatedOverallScore = Math.round(calculatedOverallScore * 100) / 100;

    // Apply Mandatory Cap & Alerts
    if (hasUnmatchedMandatory) {
        calculatedOverallScore = Math.min(20.00, calculatedOverallScore);
        alerts.push("⚠️ Mandatory Requirement Not Met: One or more mandatory position requirements were not matched.");
    }

    if (hasMissingMandatory) {
        alerts.push("ℹ Mandatory Information Missing: A mandatory requirement is not indicated in the applicant's submitted records.");
    }

    if (notIndicatedCount > 0 && !hasMissingMandatory) {
        alerts.push(`ℹ Information Gap: ${notIndicatedCount} requirement(s) were not indicated in submitted records.`);
    }

    const hasExplicitRequirements = Boolean(
        jobObj && (
            (Array.isArray(jobObj.dynamic_requirements) && jobObj.dynamic_requirements.length > 0) ||
            (Array.isArray(jobObj.requirements) && jobObj.requirements.length > 0) ||
            (typeof jobObj.requirements === 'string' && jobObj.requirements.trim().length > 0)
        )
    );

    // Vacancy Requirements Not Configured alert removed per HR UI refinement request

    // 5. Generate AI Executive Summary Text (Strictly no "Qualified/Hired" hiring decision language)
    let summaryText = "";
    if (!hasExplicitRequirements) {
        summaryText = `Notice: This job vacancy (${jobTitle}) has no custom requirements configured by HR/Admin. Evaluation relies on standard title benchmark requirements until explicit job criteria are added in Job Management.`;
    } else if (hasUnmatchedMandatory) {
        summaryText = `The applicant's submitted qualifications do not meet mandatory requirements configured for ${jobTitle}. Critical gaps exist in required professional eligibility or degree fields.`;
    } else if (fullyMatchedCount === requirements.length) {
        summaryText = `The applicant meets or exceeds all evaluated qualification standards configured for ${jobTitle} across Education, Experience, Eligibility, and Training.`;
    } else if (partiallyMatchedCount > 0 || notMatchedCount > 0) {
        summaryText = `The applicant satisfies major requirements for ${jobTitle}, but has partial or unmatched areas (e.g. experience duration or specific training hours) requiring HR/Admin screening review.`;
    } else if (notIndicatedCount > 0) {
        summaryText = `The applicant matches evaluated areas for ${jobTitle}, but ${notIndicatedCount} requirement(s) are not indicated in submitted records and require verification during HR screening.`;
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
        analysis_version: 'v2.0',
        is_fallback_requirements: !hasExplicitRequirements
    };
}

/**
 * Backward compatibility wrapper for existing callers expecting evaluateQualificationMatch
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

/**
 * Legacy Helpers
 */
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
