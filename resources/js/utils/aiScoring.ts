// AI Scoring Utility for Applicant Ranking
// Based on NAAP criteria: Education, Experience, Accomplishments, Training

export interface ScoringInput {
    // Education
    educationLevel: 'bachelor' | 'masters' | 'doctoral_graduate' | 'doctoral_27+' | 'doctoral_18-24' | 'doctoral_15-18' | 'doctoral_9-15';
    requiredEducation: 'bachelor' | 'masters';

    // Work Experience
    yearsOfExperience: number;
    requiredYearsOfExperience: number;

    // Accomplishments
    awards: ('national' | 'csc' | 'president' | 'ngo')[];

    // Training
    trainingHours: number;
}

export interface ScoreBreakdown {
    education: number;
    experience: number;
    accomplishments: number;
    training: number;
    total: number;
}

/**
 * Calculate education score based on level relative to requirement
 */
export function calculateEducationScore(
    educationLevel: ScoringInput['educationLevel'],
    requiredEducation: ScoringInput['requiredEducation']
): number {
    // Education level hierarchy
    const educationPoints: Record<string, number> = {
        'doctoral_graduate': 5,
        'doctoral_27+': 5,
        'doctoral_18-24': 4,
        'doctoral_15-18': 4,
        'doctoral_9-15': 3,
        'masters': 3,
        'bachelor': 0
    };

    // If requirement is Bachelor's
    if (requiredEducation === 'bachelor') {
        return educationPoints[educationLevel] || 0;
    }

    // If requirement is Master's
    if (requiredEducation === 'masters') {
        if (educationLevel === 'doctoral_graduate' || educationLevel === 'doctoral_27+') {
            return 5;
        }
        if (educationLevel === 'doctoral_18-24') {
            return 4;
        }
        if (educationLevel === 'doctoral_15-18' || educationLevel === 'doctoral_9-15') {
            return 3;
        }
        if (educationLevel === 'masters') {
            return 0; // Meets requirement exactly
        }
        return 0; // Below requirement
    }

    return 0;
}

/**
 * Calculate work experience score
 * 2 points per year beyond required, max 25 points
 */
export function calculateExperienceScore(
    yearsOfExperience: number,
    requiredYears: number
): number {
    const excessYears = Math.max(0, yearsOfExperience - requiredYears);
    const score = excessYears * 2;
    return Math.min(score, 25); // Cap at 25 points
}

/**
 * Calculate accomplishments score
 * Maximum 5 points even with multiple awards
 */
export function calculateAccomplishmentsScore(
    awards: ScoringInput['awards']
): number {
    if (!awards || awards.length === 0) return 0;

    const awardPoints: Record<string, number> = {
        'national': 5,
        'csc': 4,
        'president': 3,
        'ngo': 2
    };

    // Get highest award value
    const maxPoints = Math.max(...awards.map(award => awardPoints[award] || 0));
    return Math.min(maxPoints, 5); // Cap at 5 points
}

/**
 * Calculate training hours score
 */
export function calculateTrainingScore(trainingHours: number): number {
    if (trainingHours >= 300) return 10;
    if (trainingHours >= 200) return 8;
    if (trainingHours >= 100) return 4;
    if (trainingHours >= 50) return 2;
    return 0;
}

/**
 * Calculate total AI score with breakdown
 */
export function calculateAIScore(input: ScoringInput): ScoreBreakdown {
    const education = calculateEducationScore(input.educationLevel, input.requiredEducation);
    const experience = calculateExperienceScore(input.yearsOfExperience, input.requiredYearsOfExperience);
    const accomplishments = calculateAccomplishmentsScore(input.awards);
    const training = calculateTrainingScore(input.trainingHours);

    return {
        education,
        experience,
        accomplishments,
        training,
        total: education + experience + accomplishments + training
    };
}

/**
 * Convert score to percentage (out of 45 max points)
 */
export function scoreToPercentage(score: number): number {
    const maxScore = 45; // 5 + 25 + 5 + 10
    return Math.round((score / maxScore) * 100);
}

/**
 * Get score rating label
 */
export function getScoreRating(score: number): { label: string; color: string } {
    const percentage = scoreToPercentage(score);

    if (percentage >= 90) return { label: 'Excellent', color: 'green' };
    if (percentage >= 80) return { label: 'Very Good', color: 'blue' };
    if (percentage >= 70) return { label: 'Good', color: 'cyan' };
    if (percentage >= 60) return { label: 'Satisfactory', color: 'yellow' };
    return { label: 'Needs Improvement', color: 'red' };
}
