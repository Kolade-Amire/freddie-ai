import express from 'express';
import { config } from './config/env';
import { GoogleSheetsService } from './services/googleSheets';
import { GoogleDriveService } from './services/googleDrive';
import { OpenAiService } from './services/openai';
import { DatabaseService } from './services/database';
import { GmailService } from './services/gmail';
import { FreddieApp } from './app';
import { createRankingsRouter } from './routes/rankings';

const sheetsService = new GoogleSheetsService(config.googleCredentialsPath);
const driveService = new GoogleDriveService(config.googleCredentialsPath);
const openAiService = new OpenAiService(config.openaiApiKey);
const dbService = new DatabaseService('./candidates.db');
const gmailService = new GmailService(config.gmailClientId, config.gmailClientSecret, config.gmailRefreshToken);

// Create app instance with dependencies
const app = new FreddieApp(sheetsService, driveService, openAiService, dbService, gmailService);

// Start processing candidates
app.processCandidates()
    .then();

// Setup Express server for API
const server = express();
server.use('/api', createRankingsRouter(dbService));
server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});