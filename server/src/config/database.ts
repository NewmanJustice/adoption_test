import { Pool } from 'pg';
import { config } from './index.js';

// Create connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test database connection
 * @returns true if connected, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Gracefully close the pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}
