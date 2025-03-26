import express from 'express';
import { DatabaseService } from '../services/database';

export function createRankingsRouter(dbService: DatabaseService) {
    const router = express.Router();

    router.get('/rankings', async (req, res) => {
        try {
            const candidates = await new Promise<any[]>((resolve, reject) => {
                dbService.getAllCandidates((rows) => resolve(rows));
            });
            res.json(candidates);
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch rankings'});
        }
    });

    return router;
}