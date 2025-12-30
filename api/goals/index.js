import { query } from '../_lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - Get goals for date range
        if (req.method === 'GET') {
            const { start, end } = req.query;

            let queryText = `SELECT * FROM daily_goals ORDER BY goal_date DESC LIMIT 30`;
            let params = [];

            if (start && end) {
                queryText = `SELECT * FROM daily_goals WHERE goal_date BETWEEN $1 AND $2 ORDER BY goal_date DESC`;
                params = [start, end];
            }

            const result = await query(queryText, params);
            return res.status(200).json(result.rows);
        }

        // POST - Create or update goal
        if (req.method === 'POST') {
            const { goal_date, target = 10, achieved = 0 } = req.body;

            const result = await query(
                `INSERT INTO daily_goals (goal_date, target, achieved) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (goal_date) 
         DO UPDATE SET target = $2, achieved = $3
         RETURNING *`,
                [goal_date, target, achieved]
            );

            return res.status(200).json(result.rows[0]);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
