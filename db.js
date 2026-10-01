const { neon } = require('@neondatabase/serverless');

// Use Neon serverless HTTP driver (connects via HTTPS on port 443, no TCP)
const sql = neon(process.env.DATABASE_URL);

// Adapter to keep the same pool.query() interface used throughout the codebase
const pool = {
  query: (text, params) => sql(text, params),
};

const createUsersTable = async () => {
  const checkTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createAgentProfilesQuery = `
    CREATE TABLE IF NOT EXISTS agent_profiles (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      features JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createOrganizationsQuery = `
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      features JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createMediaItemsQuery = `
    CREATE TABLE IF NOT EXISTS media_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      size VARCHAR(50) NOT NULL,
      s3_key VARCHAR(500) NOT NULL,
      url VARCHAR(500),
      author VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(checkTableQuery);
    await pool.query(createAgentProfilesQuery);
    await pool.query(createOrganizationsQuery);
    await pool.query(createMediaItemsQuery);

    // Seed default organizations if none exist
    const { rows } = await pool.query('SELECT COUNT(*) FROM organizations');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`INSERT INTO organizations (name, features) VALUES 
         ('Sales Team', '["send-messages", "create-template"]'),
         ('Marketing', '["send-messages", "send-broadcasting", "schedule-broadcasting"]'),
         ('Support', '["send-messages"]')
       `);
    }

    console.log('Database tables ready');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
};

module.exports = {
  pool,
  createUsersTable,
};
