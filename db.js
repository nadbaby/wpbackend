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
    try {
        await pool.query(checkTableQuery);
        console.log('Users table ready');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

module.exports = {
    pool,
    createUsersTable,
};
