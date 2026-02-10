import { Response } from 'express';
import {
  AuthRequest,
  LoginRequestBody,
  LoginSuccessResponse,
  LoginErrorResponse,
  LogoutResponse,
  SessionInfoResponse,
  UserRole,
} from '../types/auth.js';
import { isValidRole, getRedirectForRole } from '../config/roles.js';
import { createSession, destroySession, getSessionData } from '../services/sessionService.js';
import { sanitizeReturnUrl } from '../utils/urlSanitiser.js';

/**
 * Handle login request
 * POST /api/auth/login
 */
export async function login(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const body = req.body as LoginRequestBody;
  const { username, role, returnUrl } = body;

  // Validate username
  if (!username || typeof username !== 'string' || username.trim() === '') {
    const response: LoginErrorResponse = {
      success: false,
      error: 'Username is required',
      code: 'VALIDATION_ERROR',
    };
    res.status(400).json(response);
    return;
  }

  // Validate role
  if (!role || !isValidRole(role)) {
    const response: LoginErrorResponse = {
      success: false,
      error: 'Invalid role selected',
      code: 'VALIDATION_ERROR',
    };
    res.status(400).json(response);
    return;
  }

  // Create session
  const validRole = role as UserRole;
  createSession(req, username.trim(), validRole, {
    courtAssignment: body.courtAssignment,
    organisationId: body.organisationId,
  });

  // Determine redirect URL
  let redirectUrl = getRedirectForRole(validRole);
  const sanitizedReturnUrl = sanitizeReturnUrl(returnUrl);
  if (sanitizedReturnUrl) {
    redirectUrl = sanitizedReturnUrl;
  }

  const response: LoginSuccessResponse = {
    success: true,
    user: {
      userId: username.trim(),
      role: validRole,
    },
    redirectUrl,
  };

  res.status(200).json(response);
}

/**
 * Handle logout request
 * POST /api/auth/logout
 */
export async function logout(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    await destroySession(req);
  } catch {
    // Ignore errors - logout should be idempotent
  }

  const response: LogoutResponse = {
    success: true,
  };

  res.status(200).json(response);
}

/**
 * Get current session information
 * GET /api/auth/session
 */
export async function getSession(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const sessionData = getSessionData(req);

  const response: SessionInfoResponse = {
    authenticated: sessionData !== null,
    authMode: 'mock',
  };

  if (sessionData) {
    response.user = {
      userId: sessionData.userId,
      role: sessionData.role,
      courtAssignment: sessionData.courtAssignment,
      organisationId: sessionData.organisationId,
    };
  }

  res.status(200).json(response);
}
