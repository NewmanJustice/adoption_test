/**
 * Health check endpoint response type
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
  };
}

/**
 * API error response type
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError['error'];
}

/**
 * Attention level for case dashboard
 */
export type AttentionLevel = 'normal' | 'approaching' | 'overdue';

/**
 * Key dates for a case
 */
export interface KeyDates {
  nextHearing?: string;
  applicationDate?: string;
  placementDate?: string;
}

/**
 * Case filter parameters for dashboard
 */
export interface CaseFilterParams {
  status?: string;
  caseType?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Case dashboard response
 */
export interface CaseDashboardCase {
  id: string;
  caseNumber: string;
  caseRef?: string;
  caseType: string;
  status: string;
  assignedCourt: string;
  createdAt: string;
  keyDates: KeyDates;
  attention: AttentionLevel;
  childName?: string;
  localAuthority?: string;
  assignedTo?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Case dashboard response type
 */
export interface CaseDashboardResponse {
  cases: CaseDashboardCase[];
  pagination: PaginationMeta;
}

export type PilotPhase = 'PHASE_1' | 'PHASE_2';

export type PilotMetricType = 'percent' | 'score' | 'count' | 'time';

export type PilotRole = 'PILOT_BUILDER' | 'PILOT_SME' | 'PILOT_DELIVERY_LEAD' | 'PILOT_OBSERVER';

export interface GuidanceContent {
  title: string;
  description: string;
  actions: string[];
  tips?: string[];
}

export interface PilotConfiguration {
  id: string;
  domainScope: string;
  createdAt: string;
  createdBy: string;
}

export interface PilotLifecycleState {
  phase: PilotPhase;
  phaseLabel: string;
  lastTransitionAt?: string;
  specFreezeAt?: string;
  stabilityConfirmedAt?: string;
}

export interface PilotMetricEntry {
  id: string;
  metricKey: string;
  metricType: PilotMetricType;
  value: number;
  unit: string;
  date: string;
  phase: PilotPhase;
  loop: number;
  role: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface PilotMetricHistory {
  id: string;
  metricEntryId: string;
  value: number;
  updatedAt: string;
  updatedBy: string;
}

export interface PilotMetricNote {
  id: string;
  metricEntryId: string;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface PilotTrendPoint {
  bucket: string;
  startDate: string;
  endDate: string;
  value: number | null;
}

export interface PilotMetricSummary {
  metricKey: string;
  metricType: PilotMetricType;
  unit: string;
  value: number | null;
  latestAt?: string;
  incomplete?: boolean;
}

export interface PilotTrendSeries {
  metricKey: string;
  metricType: PilotMetricType;
  unit: string;
  points: PilotTrendPoint[];
}

export interface PilotDeviation {
  id: string;
  metricKey?: string;
  description: string;
  createdAt: string;
  createdBy: string;
  phase: PilotPhase;
}

export interface PilotAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorRole: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PilotDashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  phase?: PilotPhase;
  loop?: number;
}

export interface GuidanceResponse {
  content: string;
  role?: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  preferenceKey: string;
  preferenceValue: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PilotDashboardResponse {
  filters: PilotDashboardFilters;
  summary: PilotMetricSummary[];
  trends: PilotTrendSeries[];
  completeness: {
    score: number;
    missingMetricKeys: string[];
  };
  deviations: PilotDeviation[];
  outcomeSummary: PilotOutcomeSummary[];
}

export type PilotArtefactType = 'spec_artefact' | 'code_stub' | 'test_suite' | 'other';

export interface PilotPrototypeOutcome {
  id: string;
  loop: number;
  phase: PilotPhase;
  artefactType: PilotArtefactType;
  artefactDescription: string;
  metExpectations: boolean;
  smeRating: number;
  smeFeedback?: string;
  createdAt: string;
  createdBy: string;
}

export interface PilotOutcomeSummary {
  loop: number;
  totalOutcomes: number;
  metExpectationsCount: number;
  averageRating: number;
}
