import pg from 'pg';
const { Pool } = pg;

// Neon PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize database tables
export async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // Create applications table
        await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        job_title VARCHAR(255),
        application_link TEXT,
        status VARCHAR(50) DEFAULT 'applied',
        resume_latex TEXT,
        optimized_latex TEXT,
        job_description TEXT,
        analysis JSONB,
        ats_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create daily_goals table
        await client.query(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id SERIAL PRIMARY KEY,
        goal_date DATE UNIQUE NOT NULL,
        target INTEGER DEFAULT 10,
        achieved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Query helper
export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
}

export default pool;
