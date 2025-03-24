import { google } from 'googleapis';
import { config } from '../config/env';
import { Candidate } from '../models/candidate';

export class GoogleSheetsService {
    private sheets;

    constructor(credentialsPath: string) {
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    async fetchCandidates(sheetId: string): Promise<Candidate[]> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'Sheet1!A2:D', // Name, Email, Answers, Resume Link
            });

            const rows = response.data.values || [];
            return rows.map(row => ({
                name: row[0],
                email: row[1],
                screeningAnswers: row[2],
                resumeLink: row[3],
            }));
        } catch (error) {
            console.error('Error fetching candidates from Sheets:', error);
            throw error;
        }
    }
}