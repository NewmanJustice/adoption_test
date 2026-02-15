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

export type PilotExperimentType = 'pilot' | 'control';

export type PilotPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3';

export type PilotMetricType = 'percent' | 'score' | 'count' | 'time';

export interface PilotConfiguration {
  id: string;
  domainScope: string;
  experimentType: PilotExperimentType;
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
  experimentType: PilotExperimentType;
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

export interface PilotCompareSummary {
  metricKey: string;
  metricType: PilotMetricType;
  unit: string;
  pilotValue: number | null;
  controlValue: number | null;
  delta: number | null;
  direction: 'up' | 'down' | 'flat' | null;
}

export interface PilotDeviation {
  id: string;
  metricKey?: string;
  description: string;
  createdAt: string;
  createdBy: string;
  phase: PilotPhase;
  experimentType: PilotExperimentType;
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
  experimentType?: PilotExperimentType;
  compare?: boolean;
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
  compare?: {
    enabled: boolean;
    warning?: string;
    summaries?: PilotCompareSummary[];
    trends?: PilotTrendSeries[];
  };
}
