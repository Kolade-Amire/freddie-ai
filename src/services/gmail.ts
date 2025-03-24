import { google } from 'googleapis';
import { Candidate } from '../models/candidate';

export class GmailService {
    private gmail;

    constructor(clientId: string, clientSecret: string, refreshToken: string) {
        const auth = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
        auth.setCredentials({ refresh_token: refreshToken });
        this.gmail = google.gmail({ version: 'v1', auth });
    }

    async sendEmail(candidate: Candidate): Promise<void> {
        try {
            const email = [
                `To: ${candidate.email}`,
                'Subject: Interview Invitation',
                '',
                `Hi ${candidate.name}, thanks for applying! Based on our initial screening, we'd like to move forward with your application.`,
            ].join('\n');

            const encodedEmail = Buffer.from(email)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');

            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: encodedEmail },
            });
            console.log(`Email sent to ${candidate.email}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}