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
