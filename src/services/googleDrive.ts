import { google } from 'googleapis';
import pdfParse from 'pdf-parse';
import { config } from '../config/env';

export class GoogleDriveService {
    private drive;

    constructor(credentialsPath: string) {
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        this.drive = google.drive({ version: 'v3', auth });
    }

    async downloadResume(resumeLink: string): Promise<string> {
        try {
            const fileId = resumeLink.split('/d/')[1].split('/')[0];
            const response = await this.drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'arraybuffer' }
            );
            const buffer = Buffer.from(response.data as ArrayBuffer);
            const pdfData = await pdfParse(buffer);
            return pdfData.text;
        } catch (error) {
            console.error('Error downloading resume from Drive:', error);
            throw error;
        }
    }
}