import { Response, NextFunction } from 'express';
import { AuthRequest, RequireAuthOptions, UserRole, AuthErrorResponse } from '../types/auth';

/**
 * Middleware factory for protecting routes with authentication and role-based access control
 *
 * @param options - Configuration options for the middleware
 * @param options.allowedRoles - Array of allowed roles or '*' for any authenticated user
 * @returns Express middleware function
 */
export function requireAuth(options: RequireAuthOptions = {}) {
  const { allowedRoles = '*' } = options;

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.session || !req.session.user) {
      const response: AuthErrorResponse = {
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      };
      res.status(401).json(response);
      return;
    }

    const { user } = req.session;

    // Update last accessed time
    user.lastAccessedAt = new Date().toISOString();

    // Attach user to request for downstream use
    req.user = {
      userId: user.userId,
      role: user.role,
      sessionId: req.sessionID,
    };

    // Check role permissions if specific roles are required
    if (allowedRoles !== '*') {
      const allowedRolesList = allowedRoles as UserRole[];
      if (!allowedRolesList.includes(user.role)) {
        const response: AuthErrorResponse = {
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          requiredRoles: allowedRolesList,
          userRole: user.role,
        };
        res.status(403).json(response);
        return;
      }
    }

    next();
  };
}
