import sqlite3 from 'sqlite3';
import {Candidate} from '../models/candidate';

export class DatabaseService {
    private db: sqlite3.Database;

    constructor(dbPath: string) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) console.error('Error opening database:', err);
        });
        this.initializeDb();
    }

    private initializeDb(): void {

        this.db.run(`DROP TABLE IF NOT EXISTS candidates`,
            (err) => {
                if (err) console.error('Error creating table:', err);
            })

        this.db.run(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        score INTEGER NOT NULL
      )
    `, (err) => {
            if (err) console.error('Error creating table:', err);
        })
    }

    saveCandidate(candidate: Candidate): void {
        this.db.run(
            'INSERT INTO candidates (name, email, score) VALUES (?, ?, ?)',
            [candidate.fullName, candidate.email, candidate.score],
            (err) => {
                if (err) console.error('Error saving candidate:', err);
            }
        )
    }

    getAllCandidates(callback: (rows: any[]) => void): void {
        this.db.all('SELECT * FROM candidates ORDER BY score DESC', (err, rows) => {
            if (err) {
                console.error('Error fetching candidates:', err);
            }
            callback(rows || []);
        });
    }
}