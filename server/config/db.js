const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  },

  connectionTimeoutMillis: 10000, 
  idleTimeoutMillis: 30000,
  max: 20 
});

pool.on('connect', () => {
  console.log('[METHYNIX_DB] Connected to Supabase Instance.');
});

pool.on('error', (err) => {
  console.error('[METHYNIX_DB_CRITICAL] Unexpected error:', err);
});

module.exports = pool;