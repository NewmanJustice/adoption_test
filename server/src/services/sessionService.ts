import { AuthRequest, SessionUser, UserRole } from '../types/auth';

/**
 * Create a new session for a user
 *
 * @param req - Express request with session
 * @param userId - The user's identifier (username)
 * @param role - The user's role
 */
export function createSession(
  req: AuthRequest,
  userId: string,
  role: UserRole
): void {
  const now = new Date().toISOString();

  const sessionUser: SessionUser = {
    userId,
    role,
    createdAt: now,
    lastAccessedAt: now,
  };

  req.session.user = sessionUser;
}

/**
 * Destroy the current session
 *
 * @param req - Express request with session
 * @returns Promise that resolves when session is destroyed
 */
export function destroySession(req: AuthRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get the current session data
 *
 * @param req - Express request with session
 * @returns The session user data or null if not authenticated
 */
export function getSessionData(req: AuthRequest): SessionUser | null {
  if (!req.session || !req.session.user) {
    return null;
  }
  return req.session.user;
}
