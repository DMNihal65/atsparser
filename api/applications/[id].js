import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;

    try {
        if (req.method === 'GET') {
            const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const { company_name, job_title, application_link, status } = req.body;
            const result = await pool.query(
                `UPDATE applications SET company_name = COALESCE($1, company_name), job_title = COALESCE($2, job_title),
         application_link = COALESCE($3, application_link), status = COALESCE($4, status), updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 RETURNING *`,
                [company_name, job_title, application_link, status, id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
            return res.status(200).json({ message: 'Deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
