import { Router, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/auth';

const router = Router();

/**
 * GET /api/protected
 * Test endpoint that requires any authenticated user
 */
router.get(
  '/protected',
  requireAuth({ allowedRoles: '*' }),
  (req: AuthRequest, res: Response) => {
    res.json({
      message: 'Access granted',
      user: req.user,
    });
  }
);

/**
 * GET /api/admin-only
 * Test endpoint that requires HMCTS_CASE_OFFICER role
 */
router.get(
  '/admin-only',
  requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER'] }),
  (req: AuthRequest, res: Response) => {
    res.json({
      message: 'Admin access granted',
      user: req.user,
    });
  }
);

export default router;
