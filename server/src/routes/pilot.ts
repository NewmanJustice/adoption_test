import { Router, Request, Response, NextFunction } from 'express';
import { PilotController } from '../controllers/pilotController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { AuthRequest, UserRole } from '../types/auth.js';

const PILOT_ROLES: UserRole[] = ['PILOT_BUILDER', 'PILOT_SME', 'PILOT_DELIVERY_LEAD', 'PILOT_OBSERVER'];

type AsyncHandler = (req: AuthRequest, res: Response) => Promise<unknown>;

function wrapAsync(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as AuthRequest, res)).catch(next);
  };
}

export function createPilotRoutes(controller: PilotController): Router {
  const router = Router();

  router.get('/pilot/overview', requireAuth({ allowedRoles: PILOT_ROLES }), wrapAsync(controller.getOverview));
  router.get('/pilot/dashboard', requireAuth({ allowedRoles: PILOT_ROLES }), wrapAsync(controller.getDashboard));
  router.get(
    '/pilot/audit',
    requireAuth({ allowedRoles: ['PILOT_BUILDER', 'PILOT_DELIVERY_LEAD'] }),
    wrapAsync(controller.getAuditLogs)
  );

  router.post('/pilot/config', requireAuth({ allowedRoles: ['PILOT_BUILDER'] }), wrapAsync(controller.createConfig));
  router.post('/pilot/spec-freeze', requireAuth({ allowedRoles: ['PILOT_BUILDER'] }), wrapAsync(controller.setSpecFreeze));
  router.post('/pilot/phases', requireAuth({ allowedRoles: ['PILOT_DELIVERY_LEAD'] }), wrapAsync(controller.transitionPhase));
  router.post(
    '/pilot/metrics',
    requireAuth({ allowedRoles: ['PILOT_BUILDER', 'PILOT_DELIVERY_LEAD'] }),
    wrapAsync(controller.createMetricEntry)
  );
  router.patch(
    '/pilot/metrics/:entryId',
    requireAuth({ allowedRoles: ['PILOT_BUILDER', 'PILOT_DELIVERY_LEAD'] }),
    wrapAsync(controller.updateMetricEntry)
  );
  router.post(
    '/pilot/metrics/:entryId/notes',
    requireAuth({ allowedRoles: ['PILOT_SME'] }),
    wrapAsync(controller.addMetricNote)
  );
  router.post('/pilot/deviations', requireAuth({ allowedRoles: ['PILOT_BUILDER'] }), wrapAsync(controller.recordDeviation));

  return router;
}
