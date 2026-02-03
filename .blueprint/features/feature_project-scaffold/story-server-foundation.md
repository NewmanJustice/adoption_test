# Story — Server Foundation

## User Story

As a **developer**,
I want **an Express server with a health endpoint and database connectivity**,
So that **I can verify the backend infrastructure is working correctly and build API features upon it**.

---

## Context / Scope

- **Actor:** Developer
- **Feature:** Project Scaffold
- **Relates to:** System Spec Section 12.1 (Technology Stack - Backend)
- **This story establishes:** The foundational Express server that all API routes will build upon

### What This Story Delivers
- Express.js server configuration
- Health check endpoint with database connectivity verification
- Structured project layout for routes, controllers, middleware
- Environment variable validation
- Basic error handling middleware
- Logging infrastructure

### Entry Conditions
- Developer Environment Setup story is complete
- Docker Compose is running (PostgreSQL available)

### Exit Conditions
- Health endpoint returns valid response
- Database connectivity is verified
- Server structure is ready for additional routes

---

## Acceptance Criteria

**AC-1 — Server starts successfully**
- Given the environment is configured correctly,
- When I run `npm run dev:server`,
- Then the Express server starts,
- And logs a message indicating it is listening on the configured port.

**AC-2 — Health endpoint returns healthy status**
- Given the server is running,
- And the database is connected,
- When I send a GET request to `/api/health`,
- Then I receive a 200 OK response,
- And the response body contains:
  ```json
  {
    "status": "healthy",
    "timestamp": "<ISO 8601 timestamp>",
    "services": {
      "database": "connected"
    }
  }
  ```

**AC-3 — Health endpoint reports degraded status when database unavailable**
- Given the server is running,
- And the database is not connected,
- When I send a GET request to `/api/health`,
- Then I receive a 200 OK response,
- And the response body contains:
  ```json
  {
    "status": "degraded",
    "timestamp": "<ISO 8601 timestamp>",
    "services": {
      "database": "disconnected"
    }
  }
  ```

**AC-4 — Server directory structure is organised**
- Given I examine the `/server/src` directory,
- Then I see the following subdirectories:
  - `routes/` - API route handlers
  - `controllers/` - Business logic controllers
  - `middleware/` - Express middleware
  - `services/` - External service integrations
  - `utils/` - Helper functions
  - `config/` - Configuration management

**AC-5 — Environment variables are validated on startup**
- Given required environment variables are missing,
- When I attempt to start the server,
- Then the server fails to start,
- And an error message lists the missing variables,
- And the process exits with a non-zero code.

**AC-6 — JSON responses are properly formatted**
- Given the server is running,
- When I send a request to any API endpoint,
- Then the response has `Content-Type: application/json` header,
- And the response body is valid JSON.

**AC-7 — CORS is configured for development**
- Given the server is running in development mode,
- When I send a request from `http://localhost:3000`,
- Then the request is not blocked by CORS,
- And appropriate CORS headers are present in the response.

**AC-8 — Unknown routes return 404**
- Given the server is running,
- When I send a GET request to `/api/nonexistent`,
- Then I receive a 404 Not Found response,
- And the response body contains a JSON error object.

**AC-9 — Server errors return 500 with safe error message**
- Given the server is running,
- When an unhandled error occurs during request processing,
- Then I receive a 500 Internal Server Error response,
- And the response body contains a generic error message,
- And sensitive error details are not exposed to the client,
- And the error is logged server-side.

**AC-10 — Request logging is enabled**
- Given the server is running,
- When I send a request to any endpoint,
- Then the request is logged with:
  - HTTP method
  - Path
  - Response status code
  - Response time

---

## Technical Notes

### Express Configuration
- Use `express.json()` middleware for JSON body parsing
- Configure appropriate request size limits
- Use helmet.js or equivalent for security headers

### Database Connection
- Use `pg` package for PostgreSQL connectivity
- Connection pool should be configured
- Connection string from `DATABASE_URL` environment variable

### Logging
- Structured JSON logging for production compatibility
- Console-friendly output for development
- Consider using `pino` or `morgan` for request logging

### Error Handling Pattern
```javascript
// Example error response shape
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found"
  }
}
```

---

## Out of Scope

- Authentication middleware (separate feature)
- Business domain routes (cases, parties, documents)
- API documentation (Swagger/OpenAPI)
- Rate limiting
- Request validation middleware

---

## Dependencies

- **Depends on:** Developer Environment Setup (database must be available)

---

## Definition of Done

- [ ] Server starts and listens on configured port
- [ ] `/api/health` returns healthy status when database connected
- [ ] `/api/health` returns degraded status when database disconnected
- [ ] Directory structure follows specification
- [ ] Missing environment variables cause startup failure with clear message
- [ ] Unknown routes return 404 JSON response
- [ ] Unhandled errors return 500 with safe message
- [ ] Request logging is visible in console
