export type AdoptionType =
  | 'AGENCY_ADOPTION'
  | 'STEP_PARENT_ADOPTION'
  | 'INTERCOUNTRY_ADOPTION'
  | 'NON_AGENCY_ADOPTION'
  | 'FOSTER_TO_ADOPT'
  | 'ADOPTION_FOLLOWING_PLACEMENT_ORDER';

export type CaseStatus =
  | 'APPLICATION'
  | 'DIRECTIONS'
  | 'CONSENT_AND_REPORTING'
  | 'FINAL_HEARING'
  | 'ORDER_GRANTED'
  | 'APPLICATION_REFUSED'
  | 'APPLICATION_WITHDRAWN'
  | 'ON_HOLD'
  | 'ADJOURNED';

export const VALID_ADOPTION_TYPES: AdoptionType[] = [
  'AGENCY_ADOPTION',
  'STEP_PARENT_ADOPTION',
  'INTERCOUNTRY_ADOPTION',
  'NON_AGENCY_ADOPTION',
  'FOSTER_TO_ADOPT',
  'ADOPTION_FOLLOWING_PLACEMENT_ORDER',
];

export const VALID_CASE_STATUSES: CaseStatus[] = [
  'APPLICATION',
  'DIRECTIONS',
  'CONSENT_AND_REPORTING',
  'FINAL_HEARING',
  'ORDER_GRANTED',
  'APPLICATION_REFUSED',
  'APPLICATION_WITHDRAWN',
  'ON_HOLD',
  'ADJOURNED',
];

export const TERMINAL_STATUSES: CaseStatus[] = [
  'ORDER_GRANTED',
  'APPLICATION_REFUSED',
  'APPLICATION_WITHDRAWN',
];

export type AssignmentType =
  | 'JUDICIAL'
  | 'SOCIAL_WORKER'
  | 'CAFCASS'
  | 'APPLICANT';

export interface CaseAssignment {
  id: string;
  caseId: string;
  userId: string;
  assignmentType: AssignmentType;
  createdAt: string;
  createdBy: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  caseType: AdoptionType;
  status: CaseStatus;
  assignedCourt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
  internalNotes?: string;
  staffComments?: string;
  assignedJudge?: string;
  applicantIds: string[];
  organisationId?: string;
  statusReason?: string;
}

export interface CreateCaseRequest {
  caseType: AdoptionType;
  assignedCourt: string;
}

export interface UpdateStatusRequest {
  status: CaseStatus;
  reason?: string;
  version?: number;
}

export interface CasePermissions {
  canEdit: boolean;
  canUpdateStatus: boolean;
  canDelete: boolean;
  canViewAudit: boolean;
}

export interface CaseResponse extends Case {
  redacted?: boolean;
  permissions?: CasePermissions;
  previousStatus?: CaseStatus;
}

export interface CaseListResponse {
  cases: CaseResponse[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export type AuditAction = 'CREATE' | 'STATUS_CHANGE' | 'UPDATE' | 'DELETE' | 'ASSIGNMENT_CREATE' | 'ASSIGNMENT_REVOKE';

export interface AuditLogEntry {
  id: string;
  caseId: string;
  action: AuditAction;
  actor: string;
  timestamp: string;
  changes?: {
    before?: string;
    after?: string;
    [key: string]: unknown;
  };
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
}

export interface AssignmentRequest {
  userId: string;
  assignmentType: AssignmentType;
}

export interface AssignmentResponse {
  assignmentId: string;
  caseId: string;
  userId: string;
  assignmentType: AssignmentType;
}

export type AttentionLevel = 'normal' | 'approaching' | 'overdue';

export interface KeyDates {
  nextHearing?: string;
  applicationDate?: string;
  placementDate?: string;
}

export interface CaseFilterParams {
  status?: CaseStatus;
  caseType?: AdoptionType;
  dateFrom?: string;
  dateTo?: string;
}

export interface CaseSortParams {
  sortBy?: 'attention' | 'caseNumber' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CasePaginationParams {
  page?: number;
  pageSize?: number;
}

export interface CaseDashboardCase extends Case {
  keyDates: KeyDates;
  attention: AttentionLevel;
  childName?: string;
  localAuthority?: string;
  birthFamily?: {
    name: string;
    address: string;
  };
  birthParent?: {
    name: string;
    details: string;
  };
}

export interface CaseDashboardResponse {
  cases: CaseDashboardCase[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
