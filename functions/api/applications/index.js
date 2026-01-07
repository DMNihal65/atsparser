import { Pool } from '@neondatabase/serverless';

// Helper to get DB connection
const getDb = (env) => {
    return new Pool({
        connectionString: env.DATABASE_URL,
    });
};

export const onRequestGet = async (context) => {
    const pool = getDb(context.env);
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');

    try {
        let queryText = 'SELECT * FROM applications ORDER BY created_at DESC';
        let params = [];

        if (status && status !== 'all') {
            queryText = 'SELECT * FROM applications WHERE status = $1 ORDER BY created_at DESC';
            params = [status];
        }

        const { rows } = await pool.query(queryText, params);
        context.waitUntil(pool.end()); // Close connection after response is sent
        return Response.json(rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
};

export const onRequestPost = async (context) => {
    const pool = getDb(context.env);

    try {
        const body = await context.request.json();
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
        } = body;

        // 1. Create Application
        const result = await pool.query(
            `INSERT INTO applications 
       (company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score]
        );

        // 2. Update Daily Goal
        const today = new Date().toISOString().split('T')[0];
        await pool.query(
            `INSERT INTO daily_goals (goal_date, achieved) 
       VALUES ($1, 1) 
       ON CONFLICT (goal_date) 
       DO UPDATE SET achieved = daily_goals.achieved + 1`,
            [today]
        );

        context.waitUntil(pool.end());
        return Response.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating application:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to create application' }, { status: 500 });
    }
};
