import dotenv from 'dotenv';

dotenv.config();

export const config = {
    googleCredentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || '',
    sheetId: process.env.SHEET_ID || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    gmailClientId: process.env.GMAIL_CLIENT_ID || '',
    gmailClientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
    port: parseInt(process.env.PORT || '3000', 10),
};