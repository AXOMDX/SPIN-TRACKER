const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100),
        category VARCHAR(50),
        icon VARCHAR(10),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_rounds (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id),
        round_id VARCHAR(100) UNIQUE NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        result JSONB NOT NULL,
        metadata JSONB
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_stats (
        game_id INTEGER REFERENCES games(id),
        stat_type VARCHAR(50),
        stat_data JSONB,
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (game_id, stat_type)
      );
    `);
    
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database init error:', error);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDatabase };
