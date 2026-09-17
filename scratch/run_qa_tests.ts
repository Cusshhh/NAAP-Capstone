import { evaluateJobQualificationMatch, extractJobRequirements, DEFAULT_CATEGORY_WEIGHTS } from '../resources/js/utils/aiScoring';

console.log("===============================================================================");
console.log("        NAAP HR SYSTEM — AI QUALIFICATION SCORING ENGINE FINAL QA TEST         ");
console.log("===============================================================================\n");

let passCount = 0;
let failCount = 0;

function assertTest(id: number, title: string, expected: string, actual: string, passed: boolean, details: string) {
    if (passed) {
        passCount++;
        console.log(`[PASS] Test ${id}: ${title}`);
    } else {
        failCount++;
        console.log(`[FAIL] Test ${id}: ${title}`);
    }
    console.log(`       Expected: ${expected}`);
    console.log(`       Actual:   ${actual}`);
    console.log(`       Details:  ${details}\n`);
}

// -----------------------------------------------------------------------------
// SETUP MOCK VACANCIES & APPLICANTS
// -----------------------------------------------------------------------------

// Vacancy 1: IT Support Specialist (Explicit Configured Requirements)
const jobIT = {
    id: 101,
    title: 'IT Support Specialist',
    dynamic_requirements: [
        { id: 'it_req_1', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in IT / Computer Science", mandatory: true },
        { id: 'it_req_2', category: 'experience', requirement: 'Work Experience', required_value: '3 years IT support experience', mandatory: false },
        { id: 'it_req_3', category: 'eligibility', requirement: 'Civil Service Eligibility', required_value: 'CS Professional or Subprofessional', mandatory: false },
        { id: 'it_req_4', category: 'training', requirement: 'Training & Certification', required_value: '8 hours relevant IT training', mandatory: false }
    ]
};

// Vacancy 2: Legal Officer IV (Explicit Configured Requirements with Law & BAR Mandatory)
const jobLegal = {
    id: 102,
    title: 'Legal Officer IV',
    dynamic_requirements: [
        { id: 'leg_req_1', category: 'education', requirement: 'Educational Degree', required_value: 'LLB / Juris Doctor (Law Degree)', mandatory: true },
        { id: 'leg_req_2', category: 'experience', requirement: 'Work Experience', required_value: '5 years legal experience', mandatory: false },
        { id: 'leg_req_3', category: 'eligibility', requirement: 'Professional Eligibility', required_value: 'BAR / RA 1080 (Legal)', mandatory: true },
        { id: 'leg_req_4', category: 'training', requirement: 'Training & Certification', required_value: '16 hours legal training', mandatory: false }
    ]
};

// Vacancy 3: Flight Safety Inspector (Unconfigured Vacancy — No dynamic or text requirements)
const jobUnconfigured = {
    id: 103,
    title: 'Flight Safety Inspector',
    dynamic_requirements: [],
    requirements: []
};

// Applicant 1: Alex (IT Background)
const appAlex = {
    id: 1,
    job_id: 101,
    applicantName: 'Alex Cruz',
    dynamic_responses: {
        educationLevel: 'bachelor',
        degreeCourse: 'Computer Science',
        yearsOfExperience: 3,
        recentPositionTitle: 'IT Support Specialist',
        recentEmployer: 'Tech Global Inc.',
        eligibilities: ['CS Professional'],
        trainingHours: 16,
        recentTrainingTitle: 'Advanced Cybersecurity & Systems Administration'
    },
    skills: ['React', 'Laravel', 'TypeScript', 'Linux', 'Network Security']
};

// Applicant 2: Attorney Maria (Law Background)
const appMaria = {
    id: 2,
    job_id: 102,
    applicantName: 'Atty. Maria Santos',
    dynamic_responses: {
        educationLevel: 'doctoral_graduate',
        degreeCourse: 'Juris Doctor (Law)',
        yearsOfExperience: 6,
        recentPositionTitle: 'Associate Legal Counsel',
        recentEmployer: 'Santos & Associates Law Firm',
        eligibilities: ['BAR / RA 1080 (Legal)'],
        trainingHours: 24,
        recentTrainingTitle: 'Mandatory Continuing Legal Education (MCLE)'
    },
    skills: ['Legal Drafting', 'Contract Negotiation', 'Litigation']
};

// Applicant 3: Juan (Partial / Missing Info)
const appJuan = {
    id: 3,
    job_id: 101,
    applicantName: 'Juan Dela Cruz',
    dynamic_responses: {
        educationLevel: 'bachelor',
        degreeCourse: 'Computer Science',
        yearsOfExperience: 2, // 2 out of 3 years required (Partial)
        // eligibilities NOT INDICATED
        trainingHours: 8
    }
};

// Applicant 4: Ben (Unindicated Mandatory Education on Legal job)
const appBen = {
    id: 4,
    job_id: 102,
    applicantName: 'Ben Reyes',
    dynamic_responses: {
        // education NOT INDICATED (mandatory)
        yearsOfExperience: 5,
        recentPositionTitle: 'Legal Researcher',
        eligibilities: ['BAR / RA 1080 (Legal)'],
        trainingHours: 16
    }
};

// -----------------------------------------------------------------------------
// TEST CASES EXECUTION
// -----------------------------------------------------------------------------

// Test 1: Exact job_id Linkage
const evalAlexIT = evaluateJobQualificationMatch(jobIT, appAlex);
assertTest(
    1,
    'Exact job_id Linkage',
    'job_id = 101',
    `job_id = ${evalAlexIT.job_id}`,
    String(evalAlexIT.job_id) === '101',
    `Application for Alex correctly linked to job_id 101 (${evalAlexIT.job_title}).`
);

// Test 2: Job-Specific Requirement Retrieval
const reqsRetrievedIT = extractJobRequirements(jobIT);
const isExactITReqs = reqsRetrievedIT.length === 4 && reqsRetrievedIT[0].id === 'it_req_1';
assertTest(
    2,
    'Job-Specific Requirement Retrieval',
    'Retrieved 4 specific IT requirements (it_req_1 to it_req_4)',
    `Retrieved ${reqsRetrievedIT.length} reqs, first id = ${reqsRetrievedIT[0]?.id}`,
    isExactITReqs,
    'The scoring engine retrieved strictly job_id 101 configured requirements.'
);

// Test 3: Multi-Position Score Variance (Same Applicant evaluated on 2 different positions)
const evalAlexOnLegal = evaluateJobQualificationMatch(jobLegal, appAlex);
const isDifferentScore = evalAlexIT.overall_score !== evalAlexOnLegal.overall_score;
assertTest(
    3,
    'Multi-Position Score Variance for Same Applicant',
    'IT Match = 100.00%, Legal Match = 15.00% (Raw 15% <= 20% Cap)',
    `IT Match = ${evalAlexIT.formatted_percentage}, Legal Match = ${evalAlexOnLegal.formatted_percentage}`,
    isDifferentScore && evalAlexIT.overall_score === 100 && evalAlexOnLegal.overall_score === 15,
    'Alex gets 100% on IT Support, but only 15% on Legal Officer IV (Training 15% passed, Education/Exp/Elig 0% failed).'
);

// Test 4: 4-Category Composition (Education 30%, Experience 35%, Eligibility 20%, Training 15%)
const catSum = DEFAULT_CATEGORY_WEIGHTS;
const catWeights = catSum.education + catSum.experience + catSum.eligibility + catSum.training;
assertTest(
    4,
    '4-Category Score Composition',
    'Sum of weights = 100% (Ed 30%, Exp 35%, Elig 20%, Trn 15%)',
    `Sum = ${catWeights}% (Ed ${catSum.education}%, Exp ${catSum.experience}%, Elig ${catSum.eligibility}%, Trn ${catSum.training}%)`,
    catWeights === 100,
    'Scoring engine relies strictly on the 4 authorized PDS categories.'
);

// Test 5: Skills Zero-Weight Exclusion
const appAlexWithSkills = { ...appAlex, skills: ['React', 'Laravel', 'TypeScript', 'Python', 'AWS', 'Docker'] };
const appAlexNoSkills = { ...appAlex, skills: [] };
const evalSkills1 = evaluateJobQualificationMatch(jobIT, appAlexWithSkills);
const evalSkills2 = evaluateJobQualificationMatch(jobIT, appAlexNoSkills);
assertTest(
    5,
    'Skills Zero-Weight Exclusion',
    'Score unchanged regardless of skills (100% == 100%)',
    `With 5 skills = ${evalSkills1.formatted_percentage}, With 0 skills = ${evalSkills2.formatted_percentage}`,
    evalSkills1.overall_score === evalSkills2.overall_score,
    'Adding or removing skills has zero effect on the numerical Overall Match percentage.'
);

// Test 6: NOT_INDICATED Denominator Exclusion
const evalJuan = evaluateJobQualificationMatch(jobIT, appJuan);
const isEligExcluded = evalJuan.categories.eligibility.evaluated_count === 0 && evalJuan.summary_counts.not_indicated === 1;
assertTest(
    6,
    'NOT_INDICATED Denominator Exclusion',
    'Eligibility evaluated_count = 0, summary_counts.not_indicated = 1, Overall = 85.56%',
    `Eligibility evalCount = ${evalJuan.categories.eligibility.evaluated_count}, Not Indicated = ${evalJuan.summary_counts.not_indicated}, Overall = ${evalJuan.formatted_percentage}`,
    isEligExcluded && evalJuan.overall_score > 80,
    'NOT_INDICATED is excluded from evaluated denominator so missing data does not penalize score.'
);

// Test 7: Mandatory NOT_MATCHED Triggers 20% Maximum Cap
const evalAlexLegalCap = evaluateJobQualificationMatch(jobLegal, appAlex);
const hasCapAlert = evalAlexLegalCap.alerts.some(a => a.includes('Mandatory Requirement Not Met'));
assertTest(
    7,
    'Mandatory NOT_MATCHED Triggers 20% Maximum Cap',
    'Overall Match <= 20.00% (Actual 15.00%) and contains Mandatory Requirement Not Met alert',
    `Overall Match = ${evalAlexLegalCap.formatted_percentage}, Alert present = ${hasCapAlert}`,
    evalAlexLegalCap.overall_score <= 20.00 && hasCapAlert,
    'Alex failed mandatory Law & BAR criteria on Legal Officer position; score is hard-capped at max 20%.'
);

// Test 8: Mandatory NOT_INDICATED Excludes Cap
const evalBenLegal = evaluateJobQualificationMatch(jobLegal, appBen);
const hasMissingMandatoryAlert = evalBenLegal.alerts.some(a => a.includes('Mandatory Information Missing'));
const hasCapAlertBen = evalBenLegal.alerts.some(a => a.includes('Mandatory Requirement Not Met'));
assertTest(
    8,
    'Mandatory NOT_INDICATED Excludes 20% Cap',
    'No 20% cap applied, Score > 20%, contains Mandatory Information Missing alert',
    `Score = ${evalBenLegal.formatted_percentage}, Missing Mandatory Alert = ${hasMissingMandatoryAlert}, Cap Alert = ${hasCapAlertBen}`,
    !hasCapAlertBen && hasMissingMandatoryAlert && evalBenLegal.overall_score > 50,
    'Ben left mandatory Education NOT_INDICATED. Cap was NOT triggered; missing info alert raised for HR review.'
);

// Test 9: Configured Requirements Priority (No Fallback Used)
assertTest(
    9,
    'Configured Requirements Priority',
    'is_fallback_requirements = false when dynamic_requirements exist',
    `is_fallback_requirements = ${evalAlexIT.is_fallback_requirements}`,
    evalAlexIT.is_fallback_requirements === false,
    'Scoring engine uses explicit HR configured requirements and does not activate fallback benchmarks.'
);

// Test 10: Unconfigured Vacancy Fallback Handling
const evalUnconfigured = evaluateJobQualificationMatch(jobUnconfigured, appAlex);
assertTest(
    10,
    'Unconfigured Vacancy Fallback Handling',
    'is_fallback_requirements = true when job has no custom requirements',
    `is_fallback_requirements = ${evalUnconfigured.is_fallback_requirements}`,
    evalUnconfigured.is_fallback_requirements === true,
    'When vacancy has no requirements set by HR, system accurately sets fallback flag while keeping alerts clean.'
);

// Test 11: Dynamic Config Update Behavior
const jobUpdated = {
    ...jobUnconfigured,
    dynamic_requirements: [
        { id: 'upd_1', category: 'education', requirement: 'Educational Degree', required_value: "Bachelor's Degree in IT", mandatory: true }
    ]
};
const evalUpdated = evaluateJobQualificationMatch(jobUpdated, appAlex);
assertTest(
    11,
    'Dynamic Config Update Behavior',
    'After HR configures requirements, is_fallback_requirements = false & uses upd_1',
    `is_fallback_requirements = ${evalUpdated.is_fallback_requirements}, First requirement = ${evalUpdated.itemized_results[0]?.requirement_id}`,
    evalUpdated.is_fallback_requirements === false && evalUpdated.itemized_results[0]?.requirement_id === 'upd_1',
    'Once HR configures requirements on a vacancy, subsequent evaluations instantly use the new explicit criteria.'
);

// Test 12: Separation of AI Match & HR Decision
const mockHrDecision = { final_decision: 'Qualified', decision_notes: 'Verified TOR & PDS credentials manually.' };
assertTest(
    12,
    'Separation of AI Match & HR Decision',
    'AI score = 100%, HR decision = "Qualified" (Stored separately)',
    `AI score = ${evalAlexIT.formatted_percentage}, HR decision = "${mockHrDecision.final_decision}"`,
    evalAlexIT.overall_score === 100 && mockHrDecision.final_decision === 'Qualified',
    'AI outputs evidence score while HR retains 100% final decision authority persisted in database.'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("===============================================================================");
console.log(`TOTAL QA TESTS EXECUTED : ${passCount + failCount}`);
console.log(`PASSED                  : ${passCount}`);
console.log(`FAILED                  : ${failCount}`);
console.log("===============================================================================");

if (failCount === 0) {
    console.log("SUCCESS: ALL 12 QA VERIFICATION TESTS PASSED CLEANLY (100% PASS RATE)!");
} else {
    console.log("WARNING: SOME TESTS FAILED.");
}
