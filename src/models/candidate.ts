export interface Candidate {
    name: string;
    email: string;
    screeningAnswers: string;
    resumeLink: string;
    resumeText?: string;
    score?: number;
}