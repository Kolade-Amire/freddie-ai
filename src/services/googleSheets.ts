import { google } from 'googleapis';
import { Candidate } from '../models/candidate';
import {FreddieException} from "../FreddieException";

export class GoogleSheetsService {
    private sheets;

    constructor(credentialsPath: string) {
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    async fetchCandidates(sheetId: string): Promise<Candidate[]> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: "Sheet1!A1:Z", // google sheet range
            });

            const [headers, ...rows] = response.data.values || [];

            if (!headers || headers.length < 3) {
                console.error("Sheet doesn't have required columns");

            }

            //Identify screening question columns (everything after column C)
            const screeningQuestions = headers.slice(3)



            return rows.map(row => {
                const candidate: Candidate = {
                    fullName: row[0] || '',
                    email: row[1] || '',
                    resumeLink: row[2] || '',
                    screeningAnswers: {}
                };

                // Add screening Q&A pairs
                screeningQuestions.forEach((question, index) => {
                    if (question) { // Only process if header exists
                        const answer = row[3 + index]?.toString().trim() || '';
                        candidate.screeningAnswers[question] = answer;
                    }
                });

                return candidate;
            });
        }catch (error) {
            console.error("Error fetching candidates from Sheets: ", error);
            throw new FreddieException("An unexpected error occurred while trying to fetch candidates from Google Sheets");
        }
    }
}