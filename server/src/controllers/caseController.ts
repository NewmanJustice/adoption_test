import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import {
  CreateCaseRequest,
  UpdateStatusRequest,
  CaseResponse,
  CaseListResponse,
  AuditLogResponse,
  AssignmentRequest,
  AssignmentResponse,
} from '../types/case';
import * as caseService from '../services/caseService';
import * as caseRepo from '../repositories/caseRepository';

export async function createCase(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  if (user.role !== 'HMCTS_CASE_OFFICER') {
    res.status(403).json({ error: 'Permission denied', code: 'FORBIDDEN' });
    return;
  }

  const body = req.body as Partial<CreateCaseRequest>;
  const caseType = body.caseType as string | undefined;
  const assignedCourt = body.assignedCourt as string | undefined;

  if (!caseType || caseType === '') {
    res.status(400).json({ error: 'caseType is required' });
    return;
  }

  if (!caseService.isValidAdoptionType(caseType)) {
    res.status(400).json({ error: 'Invalid caseType' });
    return;
  }

  if (!assignedCourt || assignedCourt === '') {
    res.status(400).json({ error: 'assignedCourt is required' });
    return;
  }

  const newCase = caseService.createCase(caseType, assignedCourt, user);
  res.status(201).json(newCase);
}

export async function listCases(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  const cases = caseService.listCasesForUser(user);

  const response: CaseListResponse = {
    cases: cases.map((c) => ({
      ...c,
      permissions: caseService.getPermissions(user, c),
    })),
    pagination: {
      total: cases.length,
      page: 1,
      pageSize: cases.length || 20,
      totalPages: 1,
    },
  };

  res.status(200).json(response);
}

export async function getCase(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  const { id } = req.params;
  const caseData = caseService.getCase(id);

  if (!caseData) {
    res.status(404).json({ error: 'Case not found', code: 'NOT_FOUND' });
    return;
  }

  const assignments = caseService.getAssignments(id);
  const hasAccess = caseService.checkCaseAccess(user, caseData, assignments);

  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
    return;
  }

  const permissions = caseService.getPermissions(user, caseData);

  if (user.role === 'ADOPTER') {
    const redacted = caseService.redactCaseForAdopter(caseData);
    res.status(200).json({ ...redacted, permissions });
    return;
  }

  res.status(200).json({ ...caseData, permissions });
}

export async function updateCaseStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  const { id } = req.params;
  const caseData = caseService.getCase(id);

  if (!caseData) {
    res.status(404).json({ error: 'Case not found', code: 'NOT_FOUND' });
    return;
  }

  const assignments = caseService.getAssignments(id);
  const hasAccess = caseService.checkCaseAccess(user, caseData, assignments);

  if (!hasAccess && user.role !== 'HMCTS_CASE_OFFICER' && user.role !== 'JUDGE_LEGAL_ADVISER') {
    res.status(403).json({ error: 'Permission denied', code: 'FORBIDDEN' });
    return;
  }

  if (user.role === 'ADOPTER' || user.role === 'LA_SOCIAL_WORKER' || user.role === 'VAA_WORKER') {
    res.status(403).json({ error: 'Permission denied', code: 'FORBIDDEN' });
    return;
  }

  const body = req.body as UpdateStatusRequest;
  const result = caseService.updateStatus(
    id,
    body.status,
    user,
    body.reason,
    body.version
  );

  if (!result.success) {
    if (result.code === 'CONFLICT') {
      res.status(409).json({
        error: result.error,
        code: result.code,
        currentVersion: result.currentVersion,
      });
      return;
    }
    if (result.code === 'FORBIDDEN') {
      res.status(403).json({ error: result.error, code: result.code });
      return;
    }
    res.status(400).json({ error: result.error, code: result.code });
    return;
  }

  res.status(200).json({
    ...result.case,
    previousStatus: result.previousStatus,
  });
}

export async function deleteCase(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  if (user.role !== 'HMCTS_CASE_OFFICER') {
    res.status(403).json({ error: 'Permission denied', code: 'FORBIDDEN' });
    return;
  }

  const { id } = req.params;
  const deleted = caseService.deleteCase(id, user);

  if (!deleted) {
    res.status(404).json({ error: 'Case not found', code: 'NOT_FOUND' });
    return;
  }

  res.status(200).json({ success: true });
}

export async function getAuditLog(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  const { id } = req.params;
  const caseData = caseService.getCase(id);

  if (!caseData) {
    res.status(404).json({ error: 'Case not found', code: 'NOT_FOUND' });
    return;
  }

  if (user.role !== 'HMCTS_CASE_OFFICER' && user.role !== 'JUDGE_LEGAL_ADVISER') {
    res.status(403).json({ error: 'Permission denied', code: 'FORBIDDEN' });
    return;
  }

  const entries = caseService.getAuditLogs(id);
  const response: AuditLogResponse = { entries };

  res.status(200).json(response);
}

export async function createAssignment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  if (user.role !== 'HMCTS_CASE_OFFICER') {
    res.status(403).json({ error: 'Permission denied', code: 'FORBIDDEN' });
    return;
  }

  const { id } = req.params;
  const caseData = caseService.getCase(id);

  if (!caseData) {
    res.status(404).json({ error: 'Case not found', code: 'NOT_FOUND' });
    return;
  }

  const body = req.body as AssignmentRequest;
  const assignment = caseService.createAssignment(
    id,
    body.userId,
    body.assignmentType,
    user
  );

  const response: AssignmentResponse = {
    assignmentId: assignment.id,
    caseId: id,
    userId: body.userId,
    assignmentType: assignment.assignmentType,
  };

  res.status(201).json(response);
}

export async function listAssignments(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  const { id } = req.params;
  const assignments = caseService.getAssignments(id);

  res.status(200).json({ assignments });
}
