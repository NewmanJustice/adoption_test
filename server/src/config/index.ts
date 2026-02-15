import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

type AppEnvironment = 'LOCAL' | 'DEV' | 'TEST' | 'PROD';

const appEnv = (process.env.APP_ENV as AppEnvironment) || 'LOCAL';

const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  switch (appEnv) {
    case 'LOCAL':
      return process.env.LOCAL_DATABASE_URL || 'postgresql://adoption:adoption@localhost:5432/adoption';
    case 'DEV':
      if (!process.env.DEV_DATABASE_URL) {
        throw new Error('DEV_DATABASE_URL is required when APP_ENV=DEV');
      }
      return process.env.DEV_DATABASE_URL;
    case 'TEST':
      if (!process.env.TEST_DATABASE_URL) {
        throw new Error('TEST_DATABASE_URL is required when APP_ENV=TEST');
      }
      return process.env.TEST_DATABASE_URL;
    case 'PROD':
      if (!process.env.PROD_DATABASE_URL) {
        throw new Error('PROD_DATABASE_URL is required when APP_ENV=PROD');
      }
      return process.env.PROD_DATABASE_URL;
    default:
      return 'postgresql://adoption:adoption@localhost:5432/adoption';
  }
};

export const config = {
  appEnv,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: getDatabaseUrl(),
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  sessionSecret: process.env.SESSION_SECRET || 'development-secret',
};

/**
 * Validate required environment variables based on APP_ENV
 */
export function validateEnv(): void {
  if (process.env.DATABASE_URL) {
    return;
  }

  const envDbVarMap: Record<AppEnvironment, string> = {
    LOCAL: 'LOCAL_DATABASE_URL',
    DEV: 'DEV_DATABASE_URL',
    TEST: 'TEST_DATABASE_URL',
    PROD: 'PROD_DATABASE_URL',
  };

  const requiredDbVar = envDbVarMap[appEnv];

  // LOCAL has a default, others require explicit config
  if (appEnv !== 'LOCAL' && !process.env[requiredDbVar]) {
    throw new Error(`${requiredDbVar} is required when APP_ENV=${appEnv}`);
  }
}
