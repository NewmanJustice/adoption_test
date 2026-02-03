import { Router, Request, Response } from 'express';
import { testConnection } from '../config/database';
import { formatDate, HealthResponse } from '@adoption/shared';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint that returns server and database status
 */
router.get('/health', async (_req: Request, res: Response) => {
  const isDbConnected = await testConnection();

  const response: HealthResponse = {
    status: isDbConnected ? 'healthy' : 'degraded',
    timestamp: formatDate(),
    services: {
      database: isDbConnected ? 'connected' : 'disconnected',
    },
  };

  res.json(response);
});

export default router;
