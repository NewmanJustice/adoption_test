import {
  Case,
  CaseStatus,
  AdoptionType,
  VALID_ADOPTION_TYPES,
  TERMINAL_STATUSES,
  CasePermissions,
  CaseResponse,
  CaseAssignment,
} from '../types/case';
import { UserRole, SessionUser } from '../types/auth';
import * as caseRepo from '../repositories/caseRepository';

const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  APPLICATION: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
  DIRECTIONS: ['CONSENT_AND_REPORTING', 'ON_HOLD', 'ADJOURNED', 'APPLICATION_WITHDRAWN'],
  CONSENT_AND_REPORTING: ['FINAL_HEARING', 'ON_HOLD', 'ADJOURNED', 'APPLICATION_WITHDRAWN'],
  FINAL_HEARING: ['ORDER_GRANTED', 'APPLICATION_REFUSED', 'ADJOURNED', 'APPLICATION_WITHDRAWN'],
  ON_HOLD: ['APPLICATION', 'DIRECTIONS', 'CONSENT_AND_REPORTING', 'FINAL_HEARING', 'APPLICATION_WITHDRAWN'],
  ADJOURNED: ['DIRECTIONS', 'CONSENT_AND_REPORTING', 'FINAL_HEARING', 'APPLICATION_WITHDRAWN'],
  ORDER_GRANTED: [],
  APPLICATION_REFUSED: [],
  APPLICATION_WITHDRAWN: [],
};

const JUDICIAL_ONLY_STATUSES: CaseStatus[] = ['ORDER_GRANTED', 'APPLICATION_REFUSED'];

export function isValidAdoptionType(type: string): type is AdoptionType {
  return VALID_ADOPTION_TYPES.includes(type as AdoptionType);
}

export function isTerminalStatus(status: CaseStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isValidTransition(from: CaseStatus, to: CaseStatus): boolean {
  const allowed = STATUS_TRANSITIONS[from];
  return allowed.includes(to);
}

export function canRolePerformTransition(role: UserRole, toStatus: CaseStatus): boolean {
  if (JUDICIAL_ONLY_STATUSES.includes(toStatus)) {
    return role === 'JUDGE_LEGAL_ADVISER';
  }
  return role === 'HMCTS_CASE_OFFICER' || role === 'JUDGE_LEGAL_ADVISER';
}

export function requiresReason(status: CaseStatus): boolean {
  return status === 'ON_HOLD' || status === 'APPLICATION_WITHDRAWN';
}

export function getPermissions(user: SessionUser, caseData: Case): CasePermissions {
  const isHMCTS = user.role === 'HMCTS_CASE_OFFICER';
  const isJudge = user.role === 'JUDGE_LEGAL_ADVISER';
  const isAdopter = user.role === 'ADOPTER';

  return {
    canEdit: isHMCTS,
    canUpdateStatus: isHMCTS || isJudge,
    canDelete: isHMCTS,
    canViewAudit: isHMCTS || isJudge,
  };
}

export function checkCaseAccess(
  user: SessionUser,
  caseData: Case,
  assignments: CaseAssignment[]
): boolean {
  const { role, userId, courtAssignment, organisationId } = user;

  if (role === 'HMCTS_CASE_OFFICER') {
    return caseData.assignedCourt === courtAssignment;
  }

  if (role === 'JUDGE_LEGAL_ADVISER') {
    return assignments.some(
      (a) => a.userId === userId && a.assignmentType === 'JUDICIAL'
    );
  }

  if (role === 'ADOPTER') {
    return assignments.some(
      (a) => a.userId === userId && a.assignmentType === 'APPLICANT'
    );
  }

  if (role === 'LA_SOCIAL_WORKER' || role === 'VAA_WORKER' || role === 'CAFCASS_OFFICER') {
    return true;
  }

  return false;
}

export function redactCaseForAdopter(caseData: Case): CaseResponse {
  const { internalNotes, staffComments, ...rest } = caseData;
  return {
    ...rest,
    redacted: true,
  };
}

export function createCase(
  caseType: AdoptionType,
  assignedCourt: string,
  user: SessionUser
): Case {
  const newCase = caseRepo.createCase(caseType, assignedCourt, user.userId);

  caseRepo.addAuditLog(newCase.id, 'CREATE', user.userId, {
    caseType,
    assignedCourt,
  });

  return newCase;
}

export function getCase(id: string): Case | undefined {
  return caseRepo.findCaseById(id);
}

export function listCasesForUser(user: SessionUser): Case[] {
  const { role, userId, courtAssignment, organisationId } = user;

  if (role === 'HMCTS_CASE_OFFICER') {
    return caseRepo.findCasesByFilters({ courtAssignment });
  }

  if (role === 'JUDGE_LEGAL_ADVISER') {
    const allCases = caseRepo.findCasesByFilters({});
    return allCases.filter((c) => c.assignedJudge === userId);
  }

  if (role === 'ADOPTER') {
    const allCases = caseRepo.findCasesByFilters({});
    return allCases.filter((c) => c.applicantIds.includes(userId));
  }

  return [];
}

export interface UpdateStatusResult {
  success: boolean;
  error?: string;
  code?: string;
  case?: Case;
  previousStatus?: CaseStatus;
  currentVersion?: number;
}

export function updateStatus(
  caseId: string,
  newStatus: CaseStatus,
  user: SessionUser,
  reason?: string,
  expectedVersion?: number
): UpdateStatusResult {
  const caseData = caseRepo.findCaseById(caseId);
  if (!caseData) {
    return { success: false, error: 'Case not found', code: 'NOT_FOUND' };
  }

  if (expectedVersion !== undefined && expectedVersion !== caseData.version) {
    return {
      success: false,
      error: 'Version conflict',
      code: 'CONFLICT',
      currentVersion: caseData.version,
    };
  }

  if (isTerminalStatus(caseData.status)) {
    return {
      success: false,
      error: 'Cannot change status of a terminal case',
      code: 'TERMINAL_STATUS',
    };
  }

  if (!isValidTransition(caseData.status, newStatus)) {
    return {
      success: false,
      error: 'Invalid status transition',
      code: 'INVALID_TRANSITION',
    };
  }

  if (!canRolePerformTransition(user.role, newStatus)) {
    return {
      success: false,
      error: 'Insufficient permissions for this transition',
      code: 'FORBIDDEN',
    };
  }

  if (requiresReason(newStatus) && !reason) {
    return {
      success: false,
      error: 'Reason is required for this status',
      code: 'REASON_REQUIRED',
    };
  }

  const previousStatus = caseData.status;
  const updated = caseRepo.updateCaseStatus(caseId, newStatus, reason);

  caseRepo.addAuditLog(caseId, 'STATUS_CHANGE', user.userId, {
    before: previousStatus,
    after: newStatus,
    reason,
  });

  return {
    success: true,
    case: updated,
    previousStatus,
  };
}

export function deleteCase(caseId: string, user: SessionUser): boolean {
  const result = caseRepo.softDeleteCase(caseId);
  if (result) {
    caseRepo.addAuditLog(caseId, 'DELETE', user.userId);
  }
  return result;
}

export function createAssignment(
  caseId: string,
  userId: string,
  assignmentType: string,
  createdBy: SessionUser
): CaseAssignment {
  const assignment = caseRepo.createAssignment(
    caseId,
    userId,
    assignmentType,
    createdBy.userId
  );

  caseRepo.addAuditLog(caseId, 'ASSIGNMENT_CREATE', createdBy.userId, {
    userId,
    assignmentType,
  });

  return assignment;
}

export function getAssignments(caseId: string): CaseAssignment[] {
  return caseRepo.findAssignmentsByCaseId(caseId);
}

export function getAuditLogs(caseId: string) {
  return caseRepo.getAuditLogs(caseId);
}
