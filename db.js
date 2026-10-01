const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  try {
    await pool.query(checkTableQuery);
    await pool.query(createAgentProfilesQuery);
    console.log('Database tables ready');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
};

module.exports = {
  pool,
  createUsersTable,
};
