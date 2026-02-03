# Implementation Guide - Project Scaffold Feature

## Overview

This guide explains what the tests expect from the implementation. Use this to understand the contract you are implementing against.

---

## 1. Project Structure Requirements

### Directory Structure
The following directories MUST exist at the repository root:
```
/client/          # React frontend application
/server/          # Express backend application
/shared/          # Shared TypeScript code
/docker/          # Docker configuration files
```

### Server Directory Structure
```
/server/src/
  routes/         # API route handlers
  controllers/    # Business logic controllers
  middleware/     # Express middleware
  services/       # External service integrations
  utils/          # Helper functions
  config/         # Configuration management
/server/migrations/  # Database migration files
```

### Client Directory Structure
```
/client/src/
  components/     # Reusable UI components
  pages/          # Route-level page components
  hooks/          # Custom React hooks
  context/        # React Context providers
  services/       # API client functions
  styles/         # GOV.UK overrides and custom styles
```

### Shared Directory Structure
```
/shared/
  types/          # TypeScript type definitions
  constants/      # Shared constants
  utils/          # Shared utility functions
  index.ts        # Main entry point with exports
  package.json    # Package configuration
  tsconfig.json   # TypeScript configuration
```

---

## 2. Package Configuration Requirements

### Root package.json
Must include:
```json
{
  "workspaces": ["client", "server", "shared"],
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "<start both client and server>",
    "dev:client": "<start client only>",
    "dev:server": "<start server only>",
    "test": "<run all tests>",
    "test:coverage": "<run tests with coverage>",
    "test:watch": "<run tests in watch mode>"
  }
}
```

### .nvmrc File
Must contain Node version:
```
20
```
or
```
v20
```

---

## 3. Environment Configuration

### Required Files
- `/.env.example` - Root environment template
- `/server/.env.example` - Server environment template

### Required Environment Variables
The server must validate these on startup:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/test/production)
- `PORT` - Server port (default 3001)

---

## 4. Server API Requirements

### Health Endpoint: GET /api/health

**When database is connected:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```
- HTTP Status: 200

**When database is disconnected:**
```json
{
  "status": "degraded",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "services": {
    "database": "disconnected"
  }
}
```
- HTTP Status: 200 (still returns OK, but degraded status)

### 404 Response Format
For unknown routes like `/api/nonexistent`:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found"
  }
}
```
- HTTP Status: 404

### 500 Response Format
For unhandled errors:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```
- HTTP Status: 500
- Must NOT expose stack traces or sensitive details

### Response Headers
All API responses must include:
- `Content-Type: application/json`

For development mode, include CORS headers:
- `Access-Control-Allow-Origin: http://localhost:3000`

---

## 5. Client Requirements

### Landing Page Elements

**GOV.UK Header:**
- Must have element with class `govuk-header`
- Must display service name "Adoption Digital Platform"

**Phase Banner:**
- Must have element with class `govuk-phase-banner`
- Must contain text "ALPHA"

**GOV.UK Footer:**
- Must have element with class `govuk-footer`

**Main Content:**
- Must have `<h1>` heading
- Heading text should welcome users

**Skip Link:**
- Must have link with class `govuk-skip-link`
- Link text: "Skip to main content"
- Links to `#main-content`

**Semantic HTML:**
- Use `<header>` element
- Use `<main>` element with `id="main-content"`
- Use `<footer>` element

**Document Title:**
- Format: "Adoption Digital Platform - GOV.UK"

---

## 6. Database Requirements

### Migration Scripts
Provide npm scripts:
- `npm run migrate:up` - Apply pending migrations
- `npm run migrate:down` - Rollback last migration
- `npm run migrate:create` - Create new migration file

### Required Tables

**audit_log table:**
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  user_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);
```

**sessions table:**
```sql
CREATE TABLE sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX idx_sessions_expire ON sessions (expire);
```

---

## 7. Shared Package Requirements

### Package Name
Use scoped name: `@adoption/shared`

### Required Exports
The shared package must export:

**Types (from /shared/types/):**
- `HealthResponse` - Health endpoint response type

**Constants (from /shared/constants/):**
- `APP_NAME` - Application name string
- `HTTP_STATUS` - HTTP status code constants

**Utils (from /shared/utils/):**
- At least one utility function (e.g., `formatDate`)

### Export Pattern
Main entry `/shared/index.ts` should re-export all:
```typescript
export * from './types/api';
export * from './constants/app';
export * from './utils/format';
```

---

## 8. Test Configuration Requirements

### Jest Configuration
Each package needs Jest config with:
- Server: `testEnvironment: 'node'`
- Client: `testEnvironment: 'jsdom'`
- TypeScript support via ts-jest or equivalent

### Test Scripts
Root package.json must have:
- `test` - Run all workspace tests
- `test:coverage` - Run with coverage report
- `test:watch` - Run in watch mode

---

## 9. Common Pitfalls to Avoid

1. **Health endpoint returning wrong status code** - Always return 200, use body to indicate degraded
2. **Missing CORS headers** - Development mode must allow localhost:3000
3. **Exposing error details** - 500 errors must hide stack traces
4. **Wrong JSON structure** - Match the exact structure in this guide
5. **Missing semantic HTML** - Use proper header/main/footer elements
6. **Forgetting skip link** - Required for accessibility
7. **Wrong document title format** - Must end with "- GOV.UK"

---

## 10. Test Execution Notes

Tests are designed to:
1. Fail initially (TDD approach)
2. Pass once implementation is complete
3. Run without requiring Docker (structure tests)
4. Skip gracefully if database unavailable (integration tests)

To run tests:
```bash
npm test
```

To run with coverage:
```bash
npm run test:coverage
```
