import { Pool } from '@neondatabase/serverless';

const getDb = (env) => {
    return new Pool({
        connectionString: env.DATABASE_URL,
    });
};

export const onRequestGet = async (context) => {
    const pool = getDb(context.env);

    try {
        // Total applications
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM applications');

        // By status
        const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);

        // This week's applications
        const weekResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE created_at >= date_trunc('week', CURRENT_DATE)
    `);

        // This month's applications
        const monthResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    `);

        // Average ATS score
        const avgScoreResult = await pool.query(`
      SELECT ROUND(AVG(ats_score)) as avg_score 
      FROM applications 
      WHERE ats_score IS NOT NULL
    `);

        context.waitUntil(pool.end());

        return Response.json({
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
        console.error('Error fetching stats:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
};
