import {config} from './config/env';
import {Candidate} from './models/candidate';
import {GoogleSheetsService} from './services/googleSheets';
import {GoogleDriveService} from './services/googleDrive';
import {OpenAiService} from './services/openai';
import {DatabaseService} from './services/database';
import {GmailService} from './services/gmail';
import {Server} from 'socket.io';

export class FreddieApp {
    constructor(
        private sheetsService: GoogleSheetsService,
        private driveService: GoogleDriveService,
        private openAiService: OpenAiService,
        private dbService: DatabaseService,
        private gmailService: GmailService,
        private io: Server
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
                    this.io.emit('email_sent', {
                        message: `Email sent successfully to ${candidate.fullName} (${candidate.email} with score ${candidate.score})`
                    });
                }else{
                    this.io.emit('low_score', {
                        message: `${candidate.fullName} has a low score ${candidate.score}. Email not sent to them.)`
                    });
                }
            }
            console.log('Candidate processing completed successfully.');
        } catch (error) {
            console.error('Error processing candidates:', error);
            this.io.emit('error', { message: 'Error processing candidates' });
        }
    }
}