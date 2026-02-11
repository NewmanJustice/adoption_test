import {
  Case,
  CaseStatus,
  AdoptionType,
  CaseAssignment,
  AuditLogEntry,
  AuditAction,
} from '../types/case.js';
import { pool } from '../config/database.js';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export async function generateCaseNumber(courtName: string): Promise<string> {
  const courtCode = deriveCourtCode(courtName);
  const year = new Date().getFullYear();

  const result = await pool.query(
    `INSERT INTO court_sequences (court_code, current_year, current_sequence)
     VALUES ($1, $2, 1)
     ON CONFLICT (court_code, current_year)
     DO UPDATE SET current_sequence = court_sequences.current_sequence + 1
     RETURNING current_sequence`,
    [courtCode, year]
  );

  const seq = result.rows[0].current_sequence;
  return `${courtCode}/${year}/${String(seq).padStart(5, '0')}`;
}

export async function createCase(
  caseType: AdoptionType,
  assignedCourt: string,
  createdBy: string
): Promise<Case> {
  const id = generateCaseId();
  const caseNumber = await generateCaseNumber(assignedCourt);
  const now = new Date().toISOString();

  const result = await pool.query(
    `INSERT INTO cases (
      id, case_number, case_type, status, court, created_by, 
      created_at, updated_at, version, applicant_ids
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [id, caseNumber, caseType, 'APPLICATION', assignedCourt, createdBy, now, now, 1, '[]']
  );

  await addAuditLog(id, 'CREATE', createdBy);

  return dbRowToCase(result.rows[0]);
}

export async function findCaseById(id: string): Promise<Case | undefined> {
  const result = await pool.query(
    'SELECT * FROM cases WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );

  if (result.rows.length === 0) {
    return undefined;
  }

  return dbRowToCase(result.rows[0]);
}

export async function findCasesByFilters(filters: {
  courtAssignment?: string;
  userId?: string;
  organisationId?: string;
}): Promise<Case[]> {
  const conditions = ['deleted_at IS NULL'];
  const params: string[] = [];

  if (filters.courtAssignment) {
    params.push(filters.courtAssignment);
    conditions.push(`court = $${params.length}`);
  }

  if (filters.organisationId) {
    params.push(filters.organisationId);
    conditions.push(`organisation_id = $${params.length}`);
  }

  const query = `
    SELECT * FROM cases 
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows.map(dbRowToCase);
}

export async function updateCaseStatus(
  id: string,
  newStatus: CaseStatus,
  reason?: string
): Promise<Case | undefined> {
  const caseData = await findCaseById(id);
  if (!caseData) {
    return undefined;
  }

  const updates = ['status = $1', 'updated_at = $2', 'version = version + 1'];
  const params: (string | number)[] = [newStatus, new Date().toISOString()];

  if (reason) {
    params.push(reason);
    updates.push(`status_reason = $${params.length}`);
  }

  params.push(id);
  params.push(caseData.version);

  const result = await pool.query(
    `UPDATE cases SET ${updates.join(', ')}
     WHERE id = $${params.length - 1} AND version = $${params.length}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new Error('Optimistic locking failed: case was modified');
  }

  await addAuditLog(id, 'UPDATE', 'system', {
    field: 'status',
    before: caseData.status,
    after: newStatus,
  });

  return dbRowToCase(result.rows[0]);
}

export async function softDeleteCase(id: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE cases SET deleted_at = $1 
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [new Date().toISOString(), id]
  );

  if (result.rows.length > 0) {
    await addAuditLog(id, 'DELETE', 'system');
    return true;
  }

  return false;
}

export async function createAssignment(
  caseId: string,
  userId: string,
  assignmentType: string,
  createdBy: string
): Promise<CaseAssignment> {
  const id = generateAssignmentId();
  const now = new Date().toISOString();

  const result = await pool.query(
    `INSERT INTO case_assignments (id, case_id, user_id, role, assigned_at, assigned_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, caseId, userId, assignmentType, now, createdBy]
  );

  if (assignmentType === 'APPLICANT') {
    await pool.query(
      `UPDATE cases 
       SET applicant_ids = COALESCE(applicant_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND NOT applicant_ids @> $1::jsonb`,
      [JSON.stringify([userId]), caseId]
    );
  }

  if (assignmentType === 'JUDICIAL') {
    await pool.query(
      'UPDATE cases SET assigned_judge = $1 WHERE id = $2',
      [userId, caseId]
    );
  }

  return dbRowToAssignment(result.rows[0]);
}

export async function findAssignmentsByCaseId(caseId: string): Promise<CaseAssignment[]> {
  const result = await pool.query(
    'SELECT * FROM case_assignments WHERE case_id = $1',
    [caseId]
  );

  return result.rows.map(dbRowToAssignment);
}

export async function findAssignmentByCaseAndUser(
  caseId: string,
  userId: string
): Promise<CaseAssignment | undefined> {
  const result = await pool.query(
    'SELECT * FROM case_assignments WHERE case_id = $1 AND user_id = $2',
    [caseId, userId]
  );

  if (result.rows.length === 0) {
    return undefined;
  }

  return dbRowToAssignment(result.rows[0]);
}

export async function deleteAssignment(assignmentId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM case_assignments WHERE id = $1 RETURNING id',
    [assignmentId]
  );

  return result.rows.length > 0;
}

export async function addAuditLog(
  caseId: string,
  action: AuditAction,
  actor: string,
  changes?: { before?: string; after?: string; [key: string]: unknown }
): Promise<AuditLogEntry> {
  const id = generateUUID();
  const timestamp = new Date().toISOString();

  await pool.query(
    `INSERT INTO audit_log (id, action, entity_type, entity_id, user_id, timestamp, changes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, action, 'case', caseId, actor, timestamp, changes ? JSON.stringify(changes) : null]
  );

  return {
    id,
    caseId,
    action,
    actor,
    timestamp,
    changes,
  };
}

export async function getAuditLogs(caseId: string): Promise<AuditLogEntry[]> {
  const result = await pool.query(
    `SELECT * FROM audit_log 
     WHERE entity_type = 'case' AND entity_id = $1 
     ORDER BY timestamp DESC`,
    [caseId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    caseId: row.entity_id,
    action: row.action,
    actor: row.user_id,
    timestamp: row.timestamp,
    changes: row.changes,
  }));
}

export async function getCaseVersion(id: string): Promise<number | undefined> {
  const result = await pool.query(
    'SELECT version FROM cases WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return undefined;
  }

  return result.rows[0].version;
}

export async function clearAllData(): Promise<void> {
  await pool.query('TRUNCATE TABLE case_assignments, cases, audit_log, court_sequences RESTART IDENTITY CASCADE');
}

function dbRowToCase(row: any): Case {
  return {
    id: row.id,
    caseNumber: row.case_number,
    caseType: row.case_type,
    status: row.status,
    assignedCourt: row.court,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    deletedAt: row.deleted_at || undefined,
    internalNotes: row.internal_notes || undefined,
    staffComments: row.staff_comments || undefined,
    assignedJudge: row.assigned_judge || undefined,
    organisationId: row.organisation_id || undefined,
    statusReason: row.status_reason || undefined,
    applicantIds: Array.isArray(row.applicant_ids) ? row.applicant_ids : [],
  };
}

function dbRowToAssignment(row: any): CaseAssignment {
  return {
    id: row.id,
    caseId: row.case_id,
    userId: row.user_id,
    assignmentType: row.role,
    createdAt: row.assigned_at,
    createdBy: row.assigned_by || 'system',
  };
}
