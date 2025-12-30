import { query } from '../_lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await query(
            'SELECT * FROM daily_goals WHERE goal_date = $1',
            [today]
        );

        if (result.rows.length === 0) {
            // Return default goal if none exists
            return res.status(200).json({ goal_date: today, target: 10, achieved: 0 });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
