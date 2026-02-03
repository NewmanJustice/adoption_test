import app from './app';
import { config, validateEnv } from './config';
import { testConnection } from './config/database';

// Validate environment
validateEnv();

// Start server
const server = app.listen(config.port, async () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);

  // Test database connection on startup
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('Database connected successfully');
  } else {
    console.warn('Database connection failed - running in degraded mode');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
