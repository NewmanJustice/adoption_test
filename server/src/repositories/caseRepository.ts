import {
  Case,
  CaseStatus,
  AdoptionType,
  CaseAssignment,
  AuditLogEntry,
  AuditAction,
} from '../types/case';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const cases: Map<string, Case> = new Map();
const assignments: Map<string, CaseAssignment> = new Map();
const auditLogs: Map<string, AuditLogEntry[]> = new Map();
const courtSequences: Map<string, number> = new Map();

export function generateCaseId(): string {
  return generateUUID();
}

export function generateAssignmentId(): string {
  return generateUUID();
}

export function deriveCourtCode(courtName: string): string {
  return courtName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function generateCaseNumber(courtName: string): string {
  const courtCode = deriveCourtCode(courtName);
  const year = new Date().getFullYear();
  const key = `${courtCode}/${year}`;

  const currentSeq = courtSequences.get(key) || 0;
  const newSeq = currentSeq + 1;
  courtSequences.set(key, newSeq);

  return `${courtCode}/${year}/${String(newSeq).padStart(5, '0')}`;
}

export function createCase(
  caseType: AdoptionType,
  assignedCourt: string,
  createdBy: string
): Case {
  const id = generateCaseId();
  const now = new Date().toISOString();

  const newCase: Case = {
    id,
    caseNumber: generateCaseNumber(assignedCourt),
    caseType,
    status: 'APPLICATION',
    assignedCourt,
    createdBy,
    createdAt: now,
    updatedAt: now,
    version: 1,
    applicantIds: [],
  };

  cases.set(id, newCase);
  return newCase;
}

export function findCaseById(id: string): Case | undefined {
  const caseData = cases.get(id);
  if (caseData && caseData.deletedAt) {
    return undefined;
  }
  return caseData;
}

export function findCasesByFilters(filters: {
  courtAssignment?: string;
  userId?: string;
  organisationId?: string;
}): Case[] {
  const results: Case[] = [];

  cases.forEach((c) => {
    if (c.deletedAt) return;

    if (filters.courtAssignment && c.assignedCourt !== filters.courtAssignment) {
      return;
    }

    results.push(c);
  });

  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateCaseStatus(
  id: string,
  newStatus: CaseStatus,
  reason?: string
): Case | undefined {
  const caseData = cases.get(id);
  if (!caseData || caseData.deletedAt) {
    return undefined;
  }

  caseData.status = newStatus;
  caseData.updatedAt = new Date().toISOString();
  caseData.version += 1;
  if (reason) {
    caseData.statusReason = reason;
  }

  return caseData;
}

export function softDeleteCase(id: string): boolean {
  const caseData = cases.get(id);
  if (!caseData) {
    return false;
  }

  caseData.deletedAt = new Date().toISOString();
  return true;
}

export function createAssignment(
  caseId: string,
  userId: string,
  assignmentType: string,
  createdBy: string
): CaseAssignment {
  const id = generateAssignmentId();
  const now = new Date().toISOString();

  const assignment: CaseAssignment = {
    id,
    caseId,
    userId,
    assignmentType: assignmentType as CaseAssignment['assignmentType'],
    createdAt: now,
    createdBy,
  };

  assignments.set(id, assignment);

  const caseData = cases.get(caseId);
  if (caseData) {
    if (assignmentType === 'APPLICANT' && !caseData.applicantIds.includes(userId)) {
      caseData.applicantIds.push(userId);
    }
    if (assignmentType === 'JUDICIAL') {
      caseData.assignedJudge = userId;
    }
  }

  return assignment;
}

export function findAssignmentsByCaseId(caseId: string): CaseAssignment[] {
  const results: CaseAssignment[] = [];

  assignments.forEach((a) => {
    if (a.caseId === caseId) {
      results.push(a);
    }
  });

  return results;
}

export function findAssignmentByCaseAndUser(
  caseId: string,
  userId: string
): CaseAssignment | undefined {
  let found: CaseAssignment | undefined;

  assignments.forEach((a) => {
    if (a.caseId === caseId && a.userId === userId) {
      found = a;
    }
  });

  return found;
}

export function deleteAssignment(assignmentId: string): boolean {
  return assignments.delete(assignmentId);
}

export function addAuditLog(
  caseId: string,
  action: AuditAction,
  actor: string,
  changes?: { before?: string; after?: string; [key: string]: unknown }
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateUUID(),
    caseId,
    action,
    actor,
    timestamp: new Date().toISOString(),
    changes,
  };

  const existing = auditLogs.get(caseId) || [];
  existing.unshift(entry);
  auditLogs.set(caseId, existing);

  return entry;
}

export function getAuditLogs(caseId: string): AuditLogEntry[] {
  return auditLogs.get(caseId) || [];
}

export function getCaseVersion(id: string): number | undefined {
  const caseData = cases.get(id);
  return caseData?.version;
}

export function clearAllData(): void {
  cases.clear();
  assignments.clear();
  auditLogs.clear();
  courtSequences.clear();
}
