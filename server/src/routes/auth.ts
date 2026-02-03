import { Router } from 'express';
import { login, logout, getSession } from '../controllers/authController';
import { AuthRequest } from '../types/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Create an authenticated session with username and role
 */
router.post('/auth/login', (req, res) => {
  login(req as AuthRequest, res);
});

/**
 * POST /api/auth/logout
 * Terminate the current session
 */
router.post('/auth/logout', (req, res) => {
  logout(req as AuthRequest, res);
});

/**
 * GET /api/auth/session
 * Get current session information
 */
router.get('/auth/session', (req, res) => {
  getSession(req as AuthRequest, res);
});

export default router;
