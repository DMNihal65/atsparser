import { query } from './_lib/db.js';

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
        // Total applications
        const totalResult = await query('SELECT COUNT(*) as total FROM applications');

        // By status
        const statusResult = await query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);

        // This week's applications
        const weekResult = await query(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE created_at >= date_trunc('week', CURRENT_DATE)
    `);

        // This month's applications
        const monthResult = await query(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    `);

        // Average ATS score
        const avgScoreResult = await query(`
      SELECT ROUND(AVG(ats_score)) as avg_score 
      FROM applications 
      WHERE ats_score IS NOT NULL
    `);

        return res.status(200).json({
            total: parseInt(totalResult.rows[0].total),
            byStatus: statusResult.rows.reduce((acc, row) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {}),
            thisWeek: parseInt(weekResult.rows[0].count),
            thisMonth: parseInt(monthResult.rows[0].count),
            avgScore: parseInt(avgScoreResult.rows[0].avg_score) || 0
        });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
