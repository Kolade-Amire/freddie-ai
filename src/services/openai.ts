import OpenAI from 'openai';
import {Candidate} from '../models/candidate';
import {FreddieException} from "../FreddieException";

export class OpenAiService {
    private openai: OpenAI

    constructor(apiKey: string) {
        this.openai = new OpenAI({apiKey})
    }

    async evaluateCandidate(candidate: Candidate, role:string): Promise<number> {
        try {
            const prompt = `
        Rate this candidate's fit for a marketing officer role on a scale of 0-100.
        Consider experience, skills, and cultural fit.
        Resume: ${candidate.resumeText}
        Screening Answers: ${candidate.screeningAnswers}
      `;
            const systemInstruction = `You are an AI hiring assistant specialized in evaluating candidates for a ${role} role. Your task is to assess candidates based on their experience(40%), skills(30%), and cultural fit(30%).
                        Provide a **numerical score** between **0 and 100**, where:
                        - 0 means a very poor fit
                        - 100 means a perfect fit
                        Do not include decimals, explanations, comments, or additional text. Only return a score.
                        Returning any response other than a number is a violation and it disrupts business execution.
                        If the provided information is not valid, return -1.`;


            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages: [
                    {role: "system", content: systemInstruction},
                    {role: 'user', content: prompt}],
            })

            // Extract response content
            const content = response.choices[0]?.message?.content?.trim()

            // Parse content to an integer
            const score = Number.parseInt(content ?? "")

            // Ensure the score is a valid number within range (-1 to 100)
            if (isNaN(score) || score < -1 || score > 100) {
                console.warn(`Invalid AI response: "${content}". Defaulting to -1.`);
                return -1; // Fallback for unexpected responses
            }

            return score
        } catch (error) {
            console.error('Error evaluating candidate with OpenAI:', error);
            throw new FreddieException(`An unexpected error occurred while evaluating candidate: ${candidate.fullName} with AI`);
        }
    }
}