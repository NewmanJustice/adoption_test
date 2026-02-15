import { Router } from 'express';
import { PilotController } from '../controllers/pilotController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { UserRole } from '../types/auth.js';

const PILOT_ROLES: UserRole[] = ['PILOT_BUILDER', 'PILOT_SME', 'PILOT_DELIVERY_LEAD', 'PILOT_OBSERVER'];

export function createPilotRoutes(controller: PilotController): Router {
  const router = Router();

  router.get('/pilot/overview', requireAuth({ allowedRoles: PILOT_ROLES }), controller.getOverview);
  router.get('/pilot/dashboard', requireAuth({ allowedRoles: PILOT_ROLES }), controller.getDashboard);
  router.get('/pilot/audit', requireAuth({ allowedRoles: ['PILOT_BUILDER', 'PILOT_DELIVERY_LEAD'] }), controller.getAuditLogs);

  router.post('/pilot/config', requireAuth({ allowedRoles: ['PILOT_BUILDER'] }), controller.createConfig);
  router.post('/pilot/spec-freeze', requireAuth({ allowedRoles: ['PILOT_BUILDER'] }), controller.setSpecFreeze);
  router.post('/pilot/phases', requireAuth({ allowedRoles: ['PILOT_DELIVERY_LEAD'] }), controller.transitionPhase);
  router.post('/pilot/metrics', requireAuth({ allowedRoles: ['PILOT_BUILDER', 'PILOT_DELIVERY_LEAD'] }), controller.createMetricEntry);
  router.patch('/pilot/metrics/:entryId', requireAuth({ allowedRoles: ['PILOT_BUILDER', 'PILOT_DELIVERY_LEAD'] }), controller.updateMetricEntry);
  router.post('/pilot/metrics/:entryId/notes', requireAuth({ allowedRoles: ['PILOT_SME'] }), controller.addMetricNote);
  router.post('/pilot/deviations', requireAuth({ allowedRoles: ['PILOT_BUILDER'] }), controller.recordDeviation);

  return router;
}
