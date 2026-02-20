import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { AuthRequest, UserRole } from '../types/auth.js';
import { PilotPulseController } from '../controllers/pilotPulseController.js';

const BUILDER_SME: UserRole[] = ['PILOT_BUILDER', 'PILOT_SME'];
const ALL_PILOT: UserRole[] = ['PILOT_BUILDER', 'PILOT_SME', 'PILOT_OBSERVER'];

type AsyncHandler = (req: AuthRequest, res: Response) => Promise<unknown>;

function wrapAsync(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as AuthRequest, res)).catch(next);
  };
}

export function createPilotPulseRoutes(controller: PilotPulseController): Router {
  const router = Router();

  router.post('/api/pilot/pulse', requireAuth({ allowedRoles: BUILDER_SME }), wrapAsync(controller.submit));
  router.get('/api/pilot/pulse/trends', requireAuth({ allowedRoles: ALL_PILOT }), wrapAsync(controller.getTrends));
  router.put('/api/pilot/pulse/:id', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));
  router.patch('/api/pilot/pulse/:id', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));
  router.delete('/api/pilot/pulse/:id', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));

  return router;
}
