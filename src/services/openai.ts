import OpenAI from 'openai';
import { Candidate } from '../models/candidate';

export class OpenAiService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async evaluateCandidate(candidate: Candidate): Promise<number> {
        try {
            const prompt = `
        Rate this candidate's fit for a marketing officer role on a scale of 0-100.
        Consider experience, skills, and cultural fit.
        Resume: ${candidate.resumeText}
        Screening Answers: ${candidate.screeningAnswers}
      `;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            });
            const score = parseInt(response.choices[0].message.content || '0', 10);
            return Math.min(Math.max(score, 0), 100); // Clamp score between 0-100
        } catch (error) {
            console.error('Error evaluating candidate with OpenAI:', error);
            throw error;
        }
    }
}