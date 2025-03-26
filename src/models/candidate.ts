export interface Candidate {
    fullName: string;
    email: string;
    screeningAnswers: Record<string, string>;
    resumeLink: string;
    resumeText?: string;
    score?: number;
}