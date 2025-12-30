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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    await initDb();

    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await pool.query('SELECT * FROM daily_goals WHERE goal_date = $1', [today]);

        if (result.rows.length === 0) {
            return res.status(200).json({ goal_date: today, target: 10, achieved: 0 });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
