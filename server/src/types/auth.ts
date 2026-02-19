import { Request } from 'express';
import { Session, SessionData } from 'express-session';

/**
 * Valid user roles in the system
 */
export type UserRole =
  | 'HMCTS_CASE_OFFICER'
  | 'JUDGE_LEGAL_ADVISER'
  | 'CAFCASS_OFFICER'
  | 'LA_SOCIAL_WORKER'
  | 'VAA_WORKER'
  | 'ADOPTER'
  | 'PILOT_BUILDER'
  | 'PILOT_SME'
  | 'PILOT_OBSERVER';

/**
 * User data stored in session
 */
export interface SessionUser {
  userId: string;
  role: UserRole;
  createdAt: string;
  lastAccessedAt: string;
  courtAssignment?: string;
  organisationId?: string;
}

/**
 * User object attached to request
 */
export interface RequestUser {
  userId: string;
  role: UserRole;
  sessionId: string;
}

/**
 * Extended session data with user information
 */
export interface AuthSessionData extends SessionData {
  user?: SessionUser;
  siteAccessGranted?: boolean;
}

/**
 * Extended Express Request with user and session
 */
export interface AuthRequest extends Request {
  user?: RequestUser;
  session: Session & AuthSessionData;
}

/**
 * Options for requireAuth middleware
 */
export interface RequireAuthOptions {
  allowedRoles?: UserRole[] | '*';
}

/**
 * Login request body
 */
export interface LoginRequestBody {
  username?: string;
  role?: string;
  returnUrl?: string;
  courtAssignment?: string;
  organisationId?: string;
}

/**
 * Login success response
 */
export interface LoginSuccessResponse {
  success: true;
  user: {
    userId: string;
    role: UserRole;
  };
  redirectUrl: string;
}

/**
 * Login error response
 */
export interface LoginErrorResponse {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR';
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: true;
}

/**
 * Session info response
 */
export interface SessionInfoResponse {
  authenticated: boolean;
  user?: {
    userId: string;
    role: UserRole;
    courtAssignment?: string;
    organisationId?: string;
  };
  authMode: 'mock';
}

/**
 * Auth error response
 */
export interface AuthErrorResponse {
  error: string;
  code: 'AUTH_REQUIRED' | 'FORBIDDEN';
  requiredRoles?: UserRole[];
  userRole?: UserRole;
}
