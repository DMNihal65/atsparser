import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM applications');
        const statusResult = await pool.query('SELECT status, COUNT(*) as count FROM applications GROUP BY status');
        const weekResult = await pool.query(`SELECT COUNT(*) as count FROM applications WHERE created_at >= date_trunc('week', CURRENT_DATE)`);
        const monthResult = await pool.query(`SELECT COUNT(*) as count FROM applications WHERE created_at >= date_trunc('month', CURRENT_DATE)`);
        const avgScoreResult = await pool.query('SELECT ROUND(AVG(ats_score)) as avg_score FROM applications WHERE ats_score IS NOT NULL');

        return res.status(200).json({
            total: parseInt(totalResult.rows[0].total),
            byStatus: statusResult.rows.reduce((acc, row) => { acc[row.status] = parseInt(row.count); return acc; }, {}),
            thisWeek: parseInt(weekResult.rows[0].count),
            thisMonth: parseInt(monthResult.rows[0].count),
            avgScore: parseInt(avgScoreResult.rows[0].avg_score) || 0
        });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
