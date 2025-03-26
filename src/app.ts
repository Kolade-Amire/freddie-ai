import { config } from './config/env';
import { Candidate } from './models/candidate';
import { GoogleSheetsService } from './services/googleSheets';
import { GoogleDriveService } from './services/googleDrive';
import { OpenAiService } from './services/openai';
import { DatabaseService } from './services/database';
import { GmailService } from './services/gmail';

export class FreddieApp {
    constructor(
        private sheetsService: GoogleSheetsService,
        private driveService: GoogleDriveService,
        private openAiService: OpenAiService,
        private dbService: DatabaseService,
        private gmailService: GmailService
    ) {}

    async processCandidates(): Promise<void> {
        try {
            const candidates: Candidate[] = await this.sheetsService.fetchCandidates(config.sheetId);

            for (const candidate of candidates) {
                candidate.resumeText = await this.driveService.downloadResume(candidate.resumeLink);
                candidate.score = await this.openAiService.evaluateCandidate(candidate, "marketing officer");

                this.dbService.saveCandidate(candidate);

                if (candidate.score && candidate.score > 70) {
                    await this.gmailService.sendEmail(candidate);
                }
            }
            console.log('Candidate processing completed successfully.');
        } catch (error) {
            console.error('Error processing candidates:', error);
        }
    }
}