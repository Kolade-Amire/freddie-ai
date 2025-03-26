// src/services/database.ts
import sqlite3 from 'sqlite3';
import { Candidate } from '../models/candidate';
import { FreddieException } from '../FreddieException';

export class DatabaseService {
    private db: sqlite3.Database;
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void>;

    constructor() {
        this.db = new sqlite3.Database(':memory:', (err) => {
            if (err) {
                console.error('Error opening database:', err);
                throw new FreddieException(`Failed to open database: ${err.message}`);
            }
            console.log(`Database opened successfully`);
        });
        this.initializationPromise = this.initializeDb();
    }

    private initializeDb(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(`
                CREATE TABLE candidates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    score INTEGER NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(new FreddieException(`Failed to create table: ${err.message}`));
                } else {
                    console.log('Database initialized successfully');
                    this.isInitialized = true;
                    resolve();
                }
            });
        });
    }

    // Method to wait for initialization
    waitForInitialization(): Promise<void> {
        return this.initializationPromise;
    }

    saveCandidate(candidate: Candidate): void {
        if (!this.isInitialized) {
            console.error('Database not initialized yet, attempting to save candidate:', candidate.email);
            throw new FreddieException('Database not initialized yet');
        }

        this.db.run(
            'INSERT INTO candidates (name, email, score) VALUES (?, ?, ?)',
            [candidate.fullName, candidate.email, candidate.score],
            (err) => {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        // Update the existing record if email already exists
                        this.db.run(
                            'UPDATE candidates SET name = ?, score = ? WHERE email = ?',
                            [candidate.fullName, candidate.score, candidate.email],
                            (updateErr) => {
                                if (updateErr) {
                                    console.error('Error updating candidate:', updateErr);
                                } else {
                                    console.log(`Updated candidate with email ${candidate.email}`);
                                }
                            }
                        );
                    } else {
                        console.error('Error saving candidate:', err);
                    }
                } else {
                    console.log(`Saved candidate: ${candidate.fullName} (${candidate.email})`);
                }
            }
        );
    }

    getAllCandidates(callback: (rows: any[]) => void): void {
        if (!this.isInitialized) {
            console.error('Database not initialized yet, attempting to fetch candidates');
            callback([]);
            return;
        }

        this.db.all('SELECT * FROM candidates ORDER BY score DESC', (err, rows) => {
            if (err) {
                console.error('Error fetching candidates:', err);
                throw new FreddieException(`Failed to fetch candidates: ${err.message}`);
            }
            callback(rows || []);
        });
    }
}