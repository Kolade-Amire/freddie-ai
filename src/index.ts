import express from 'express';
import { config } from './config/env';
import { GoogleSheetsService } from './services/googleSheets';
import { GoogleDriveService } from './services/googleDrive';
import { OpenAiService } from './services/openai';
import { DatabaseService } from './services/database';
import { GmailService } from './services/gmail';
import { FreddieApp } from './app';
import { createRankingsRouter } from './routes/rankings';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';


const app = express();
const server = http.createServer(app);
const io = new Server(server);


const sheetsService = new GoogleSheetsService(config.googleCredentialsPath);
const driveService = new GoogleDriveService(config.googleCredentialsPath);
const openAiService = new OpenAiService(config.openaiApiKey);
const dbService = new DatabaseService();
const gmailService = new GmailService(config.gmailClientId, config.gmailClientSecret, config.gmailRefreshToken);

// Create app instance with dependencies
const freddieApp = new FreddieApp(sheetsService, driveService, openAiService, dbService, gmailService, io);


app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', createRankingsRouter(dbService));


// API endpoint to trigger candidate processing
app.post('/api/process-candidates', async (_req, res) => {
    try {
        await freddieApp.processCandidates();
        res.status(200).json({ message: 'Candidate processing started' });
    } catch (error) {
        console.error('Error in /api/process-candidates:', error);
        res.status(500).json({ error: 'Failed to process candidates' });
    }
});



server.listen(config.port, '0.0.0.0', () => {
    console.log(`Server running on port ${config.port}`);
});

export { io };