import express from 'express';
import { DatabaseService } from '../services/database';

export function createRankingsRouter(dbService: DatabaseService) {
    const router = express.Router();

    router.get('/rankings', (req, res) => {
        dbService.getAllCandidates((rows) => {
            res.json(rows);
        });
    });

    return router;
}