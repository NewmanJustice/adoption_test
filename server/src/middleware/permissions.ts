import { Response, NextFunction } from 'express';
import { AuthRequest, SessionUser, UserRole } from '../types/auth.js';
import * as caseService from '../services/caseService.js';

export interface AuthenticatedRequest extends AuthRequest {
  user?: {
    userId: string;
    role: UserRole;
    sessionId: string;
  };
}

export function canUploadToCase(user?: SessionUser): boolean {
  if (!user) return false;
  return [
    'HMCTS_CASE_OFFICER',
    'LA_SOCIAL_WORKER',
    'CAFCASS_OFFICER',
    'VAA_WORKER',
    'ADOPTER'
  ].includes(user.role);
}

export function canViewDocument(documentType: string, documentUploadedBy: string, user?: SessionUser): boolean {
  if (!user) return false;

  if (['HMCTS_CASE_OFFICER', 'LA_SOCIAL_WORKER', 'CAFCASS_OFFICER', 'VAA_WORKER', 'JUDGE_LEGAL_ADVISER'].includes(user.role)) {
    return true;
  }

  if (user.role === 'ADOPTER') {
    return documentUploadedBy === user.userId;
  }

  return false;
}

export function canDownloadDocument(documentType: string, documentUploadedBy: string, virusStatus: string, user?: SessionUser): boolean {
  if (virusStatus === 'infected') return false;
  return canViewDocument(documentType, documentUploadedBy, user);
}

export async function requireCaseAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const caseId = req.params.caseId;
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const caseData = await caseService.getCase(caseId);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const assignments = await caseService.getAssignments(caseId);
  const hasAccess = caseService.checkCaseAccess(sessionUser, caseData, assignments);

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied: You are not assigned to this case' });
  }

  req.user = {
    userId: sessionUser.userId,
    role: sessionUser.role,
    sessionId: req.sessionID
  };

  next();
}

export function requireUploadPermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!canUploadToCase(sessionUser)) {
    return res.status(403).json({ error: 'Access denied: You cannot upload to this case' });
  }

  if (!req.user) {
    req.user = {
      userId: sessionUser.userId,
      role: sessionUser.role,
      sessionId: req.sessionID
    };
  }

  next();
}
