import { query } from '../_lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    try {
        // GET - Get single application
        if (req.method === 'GET') {
            const result = await query('SELECT * FROM applications WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }

            return res.status(200).json(result.rows[0]);
        }

        // PUT - Update application
        if (req.method === 'PUT') {
            const { company_name, job_title, application_link, status } = req.body;

            const result = await query(
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
                return res.status(404).json({ error: 'Application not found' });
            }

            return res.status(200).json(result.rows[0]);
        }

        // DELETE - Delete application
        if (req.method === 'DELETE') {
            const result = await query('DELETE FROM applications WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }

            return res.status(200).json({ message: 'Application deleted', application: result.rows[0] });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
