import postgres from 'postgres';

/**
 * Direct Database Client for High-Performance Queries
 * Bypasses Payload CMS middleware for ultra-low latency searches.
 */

const connectionString = import.meta.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Singleton connection to prevent exhausting pool in serverless/dev environments
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: true // Improves performance for repeated queries
});

export default sql;
