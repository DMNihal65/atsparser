import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

// Initialize tables
async function initDb() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        job_title VARCHAR(255),
        application_link TEXT,
        status VARCHAR(50) DEFAULT 'applied',
        resume_latex TEXT,
        optimized_latex TEXT,
        job_description TEXT,
        analysis JSONB,
        ats_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id SERIAL PRIMARY KEY,
        goal_date DATE UNIQUE NOT NULL,
        target INTEGER DEFAULT 10,
        achieved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    } catch (e) {
        console.error('Init error:', e);
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    await initDb();

    try {
        if (req.method === 'GET') {
            const { status } = req.query;
            let queryText = 'SELECT * FROM applications ORDER BY created_at DESC';
            let params = [];

            if (status && status !== 'all') {
                queryText = 'SELECT * FROM applications WHERE status = $1 ORDER BY created_at DESC';
                params = [status];
            }

            const result = await pool.query(queryText, params);
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { company_name, job_title, application_link, status = 'applied', resume_latex, optimized_latex, job_description, analysis, ats_score } = req.body;

            const result = await pool.query(
                `INSERT INTO applications (company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score]
            );

            const today = new Date().toISOString().split('T')[0];
            await pool.query(
                `INSERT INTO daily_goals (goal_date, achieved) VALUES ($1, 1) ON CONFLICT (goal_date) DO UPDATE SET achieved = daily_goals.achieved + 1`,
                [today]
            );

            return res.status(201).json(result.rows[0]);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
