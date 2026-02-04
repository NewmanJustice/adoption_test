import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (nodeEnv !== 'production' && process.env.DEV_DATABASE_URL) {
    return process.env.DEV_DATABASE_URL;
  }
  return 'postgresql://adoption:adoption@localhost:5432/adoption';
};

export const config = {
  nodeEnv,
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: getDatabaseUrl(),
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  sessionSecret: process.env.SESSION_SECRET || 'development-secret',
};

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required = ['DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
