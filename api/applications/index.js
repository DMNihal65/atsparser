import { query } from './_lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - List all applications
        if (req.method === 'GET') {
            const { status } = req.query;
            let queryText = 'SELECT * FROM applications ORDER BY created_at DESC';
            let params = [];

            if (status && status !== 'all') {
                queryText = 'SELECT * FROM applications WHERE status = $1 ORDER BY created_at DESC';
                params = [status];
            }

            const result = await query(queryText, params);
            return res.status(200).json(result.rows);
        }

        // POST - Create new application
        if (req.method === 'POST') {
            const {
                company_name,
                job_title,
                application_link,
                status = 'applied',
                resume_latex,
                optimized_latex,
                job_description,
                analysis,
                ats_score
            } = req.body;

            const result = await query(
                `INSERT INTO applications 
         (company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
                [company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score]
            );

            // Update daily goal count
            const today = new Date().toISOString().split('T')[0];
            await query(
                `INSERT INTO daily_goals (goal_date, achieved) 
         VALUES ($1, 1) 
         ON CONFLICT (goal_date) 
         DO UPDATE SET achieved = daily_goals.achieved + 1`,
                [today]
            );

            return res.status(201).json(result.rows[0]);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
