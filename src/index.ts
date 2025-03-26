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
const dbService = new DatabaseService('./candidates.db');
const gmailService = new GmailService(config.gmailClientId, config.gmailClientSecret, config.gmailRefreshToken);

// Create app instance with dependencies
const freddieApp = new FreddieApp(sheetsService, driveService, openAiService, dbService, gmailService, io);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', createRankingsRouter(dbService));

// Start processing candidates with Socket.IO
freddieApp.processCandidates().then(() => {
    io.emit('processing_complete');
});


server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

export { io };