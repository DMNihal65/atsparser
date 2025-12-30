import express from 'express';
import cors from 'cors';
import pool, { initializeDatabase, query } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database on startup
initializeDatabase().catch(console.error);

// =====================
// APPLICATIONS API
// =====================

// Get all applications
app.get('/api/applications', async (req, res) => {
    try {
        const { status } = req.query;
        let queryText = 'SELECT * FROM applications ORDER BY created_at DESC';
        let params = [];

        if (status && status !== 'all') {
            queryText = 'SELECT * FROM applications WHERE status = $1 ORDER BY created_at DESC';
            params = [status];
        }

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get single application
app.get('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM applications WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Create new application
app.post('/api/applications', async (req, res) => {
    try {
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
        } = req.body;

        const result = await query(
            `INSERT INTO applications 
       (company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [company_name, job_title, application_link, status, resume_latex, optimized_latex, job_description, analysis, ats_score]
        );

        // Update daily goal count
        const today = new Date().toISOString().split('T')[0];
        await query(
            `INSERT INTO daily_goals (goal_date, achieved) 
       VALUES ($1, 1) 
       ON CONFLICT (goal_date) 
       DO UPDATE SET achieved = daily_goals.achieved + 1`,
            [today]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// Update application
app.put('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            company_name,
            job_title,
            application_link,
            status
        } = req.body;

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

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM applications WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Application deleted', application: result.rows[0] });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// =====================
// GOALS API
// =====================

// Get goals for a date range
app.get('/api/goals', async (req, res) => {
    try {
        const { start, end } = req.query;

        let queryText = `SELECT * FROM daily_goals ORDER BY goal_date DESC LIMIT 30`;
        let params = [];

        if (start && end) {
            queryText = `SELECT * FROM daily_goals WHERE goal_date BETWEEN $1 AND $2 ORDER BY goal_date DESC`;
            params = [start, end];
        }

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Get today's goal
app.get('/api/goals/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await query(
            'SELECT * FROM daily_goals WHERE goal_date = $1',
            [today]
        );

        if (result.rows.length === 0) {
            // Return default goal if none exists
            res.json({ goal_date: today, target: 10, achieved: 0 });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching today\'s goal:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s goal' });
    }
});

// Update or create goal
app.post('/api/goals', async (req, res) => {
    try {
        const { goal_date, target = 10, achieved = 0 } = req.body;

        const result = await query(
            `INSERT INTO daily_goals (goal_date, target, achieved) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (goal_date) 
       DO UPDATE SET target = $2, achieved = $3
       RETURNING *`,
            [goal_date, target, achieved]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// =====================
// STATS API
// =====================

app.get('/api/stats', async (req, res) => {
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

        res.json({
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
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
