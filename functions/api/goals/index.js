import { Pool } from '@neondatabase/serverless';

const getDb = (env) => {
    return new Pool({
        connectionString: env.DATABASE_URL,
    });
};

export const onRequestGet = async (context) => {
    const pool = getDb(context.env);
    const url = new URL(context.request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    try {
        let queryText = `SELECT * FROM daily_goals ORDER BY goal_date DESC LIMIT 30`;
        let params = [];

        if (start && end) {
            queryText = `SELECT * FROM daily_goals WHERE goal_date BETWEEN $1 AND $2 ORDER BY goal_date DESC`;
            params = [start, end];
        }

        const { rows } = await pool.query(queryText, params);
        context.waitUntil(pool.end());
        return Response.json(rows);
    } catch (error) {
        console.error('Error fetching goals:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
};

export const onRequestPost = async (context) => {
    const pool = getDb(context.env);

    try {
        const body = await context.request.json();
        const { goal_date, target = 10, achieved = 0 } = body;

        const result = await pool.query(
            `INSERT INTO daily_goals (goal_date, target, achieved) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (goal_date) 
       DO UPDATE SET target = $2, achieved = $3
       RETURNING *`,
            [goal_date, target, achieved]
        );

        context.waitUntil(pool.end());
        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating goal:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to update goal' }, { status: 500 });
    }
};
