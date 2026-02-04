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
