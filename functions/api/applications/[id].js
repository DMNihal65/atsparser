import { Pool } from '@neondatabase/serverless';

const getDb = (env) => {
    return new Pool({
        connectionString: env.DATABASE_URL,
    });
};

export const onRequestGet = async (context) => {
    const pool = getDb(context.env);
    const id = context.params.id;

    try {
        const { rows } = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);

        if (rows.length === 0) {
            context.waitUntil(pool.end());
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        context.waitUntil(pool.end());
        return Response.json(rows[0]);
    } catch (error) {
        console.error('Error fetching application:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to fetch application' }, { status: 500 });
    }
};

export const onRequestPut = async (context) => {
    const pool = getDb(context.env);
    const id = context.params.id;

    try {
        const body = await context.request.json();
        const {
            company_name,
            job_title,
            application_link,
            status
        } = body;

        const result = await pool.query(
            `UPDATE applications 
       SET company_name = COALESCE($1, company_name),
           job_title = COALESCE($2, job_title),
           application_link = COALESCE($3, application_link),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
            [company_name, job_title, application_link, status, id]
        );

        if (result.rows.length === 0) {
            context.waitUntil(pool.end());
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        context.waitUntil(pool.end());
        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating application:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to update application' }, { status: 500 });
    }
};

export const onRequestDelete = async (context) => {
    const pool = getDb(context.env);
    const id = context.params.id;

    try {
        const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            context.waitUntil(pool.end());
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        context.waitUntil(pool.end());
        return Response.json({ message: 'Application deleted', application: result.rows[0] });
    } catch (error) {
        console.error('Error deleting application:', error);
        context.waitUntil(pool.end());
        return Response.json({ error: 'Failed to delete application' }, { status: 500 });
    }
};
