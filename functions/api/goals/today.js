import { Pool } from '@neondatabase/serverless';

const getDb = (env) => {
    return new Pool({
        connectionString: env.DATABASE_URL,
    });
};

export const onRequestGet = async (context) => {
    const pool = getDb(context.env);
    const today = new Date().toISOString().split('T')[0];

    try {
        const { rows } = await pool.query(
            'SELECT * FROM daily_goals WHERE goal_date = $1',
            [today]
        );

        context.waitUntil(pool.end());

        if (rows.length === 0) {
            return Response.json({ goal_date: today, target: 10, achieved: 0 });
        } else {
            return Response.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching today\'s goal:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to fetch today\'s goal' }, { status: 500 });
    }
};
