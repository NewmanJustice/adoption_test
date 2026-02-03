# Implementation Plan - Project Scaffold Feature

## Summary

This plan establishes the foundational technical infrastructure for the Adoption Digital Platform. The implementation creates a monorepo structure with React frontend, Express backend, PostgreSQL database, and shared TypeScript code. The feature is developer-facing infrastructure with no business logic.

**Total Tests to Pass:** 37 automated tests in `/test/feature_project-scaffold.test.js`
**Stories Covered:** 6 stories with 70 acceptance criteria

---

## Understanding

### Key Behaviours
1. **Monorepo Structure** - `/client`, `/server`, `/shared`, `/docker` directories with npm workspaces
2. **Server Foundation** - Express server with health endpoint returning JSON status
3. **Client Foundation** - React app with GOV.UK Design System styling
4. **Database Foundation** - PostgreSQL with migrations, audit_log and sessions tables
5. **Test Infrastructure** - Jest configured for all packages with coverage
6. **Shared Code** - TypeScript types, constants, and utilities shared across packages

### Test Count by Story
| Story | Automated Tests |
|-------|-----------------|
| Developer Environment Setup | 10 |
| Server Foundation | 5 |
| Client Foundation | 4 |
| Database Foundation | 2 |
| Test Infrastructure | 4 |
| Shared Code Infrastructure | 12 |

---

## Files to Create/Modify

### Root Level Files
| File | Action | Purpose |
|------|--------|---------|
| `/package.json` | Modify | Add workspaces, scripts, engines |
| `/.nvmrc` | Create | Node version (20) |
| `/.env.example` | Create | Environment variable template |
| `/jest.config.js` | Create | Root Jest configuration |
| `/tsconfig.json` | Create | Root TypeScript configuration |
| `/docker-compose.yml` | Create | Docker services configuration |

### Server Package (`/server/`)
| File | Action | Purpose |
|------|--------|---------|
| `/server/package.json` | Create | Server dependencies and scripts |
| `/server/tsconfig.json` | Create | Server TypeScript config |
| `/server/.env.example` | Create | Server environment template |
| `/server/src/index.ts` | Create | Server entry point |
| `/server/src/app.ts` | Create | Express app configuration |
| `/server/src/routes/health.ts` | Create | Health endpoint route |
| `/server/src/middleware/errorHandler.ts` | Create | Error handling middleware |
| `/server/src/middleware/notFound.ts` | Create | 404 handler |
| `/server/src/config/index.ts` | Create | Configuration management |
| `/server/src/config/database.ts` | Create | Database connection pool |
| `/server/src/services/.gitkeep` | Create | Placeholder |
| `/server/src/controllers/.gitkeep` | Create | Placeholder |
| `/server/src/utils/.gitkeep` | Create | Placeholder |
| `/server/migrations/001_initial_schema.sql` | Create | Initial migration |

### Client Package (`/client/`)
| File | Action | Purpose |
|------|--------|---------|
| `/client/package.json` | Create | Client dependencies and scripts |
| `/client/tsconfig.json` | Create | Client TypeScript config |
| `/client/src/index.tsx` | Create | React entry point |
| `/client/src/App.tsx` | Create | Main App component |
| `/client/src/pages/LandingPage.tsx` | Create | Landing page component |
| `/client/src/components/Header.tsx` | Create | GOV.UK Header wrapper |
| `/client/src/components/Footer.tsx` | Create | GOV.UK Footer wrapper |
| `/client/src/components/PhaseBanner.tsx` | Create | Phase banner component |
| `/client/src/components/SkipLink.tsx` | Create | Skip link component |
| `/client/src/styles/index.scss` | Create | GOV.UK styles import |
| `/client/src/hooks/.gitkeep` | Create | Placeholder |
| `/client/src/context/.gitkeep` | Create | Placeholder |
| `/client/src/services/.gitkeep` | Create | Placeholder |

### Shared Package (`/shared/`)
| File | Action | Purpose |
|------|--------|---------|
| `/shared/package.json` | Create | Shared package config |
| `/shared/tsconfig.json` | Create | Shared TypeScript config |
| `/shared/index.ts` | Create | Main exports |
| `/shared/types/api.ts` | Create | API type definitions |
| `/shared/constants/app.ts` | Create | App constants |
| `/shared/utils/format.ts` | Create | Utility functions |

### Docker Configuration (`/docker/`)
| File | Action | Purpose |
|------|--------|---------|
| `/docker/docker-compose.yml` | Create | PostgreSQL service |

---

## Implementation Steps (Ordered)

### Phase 1: Project Structure and Root Configuration
**Objective:** Pass T-ENV-1 through T-ENV-6 tests

1. **Create directory structure**
   - Create `/client`, `/server`, `/shared`, `/docker` directories
   - Create subdirectories as specified in implementation-guide.md

2. **Update root package.json**
   ```json
   {
     "name": "adoption-digital-platform",
     "workspaces": ["client", "server", "shared"],
     "engines": { "node": ">=20.0.0" },
     "scripts": {
       "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
       "dev:client": "npm run dev --workspace=client",
       "dev:server": "npm run dev --workspace=server",
       "test": "jest",
       "test:coverage": "jest --coverage",
       "test:watch": "jest --watch"
     }
   }
   ```

3. **Create `.nvmrc`** with content: `20`

4. **Create `/.env.example`** with documented variables

5. **Create `/jest.config.js`** for root test configuration

### Phase 2: Shared Package
**Objective:** Pass T-SHR-1 through T-SHR-5 tests

1. **Create `/shared/package.json`**
   - Name: `@adoption/shared`
   - Main and types entry points

2. **Create `/shared/tsconfig.json`**
   - Enable declaration generation
   - Strict mode enabled

3. **Create type definitions** (`/shared/types/api.ts`)
   - `HealthResponse` interface
   - `ApiError` interface

4. **Create constants** (`/shared/constants/app.ts`)
   - `APP_NAME`, `HTTP_STATUS`, `PHASE`

5. **Create utilities** (`/shared/utils/format.ts`)
   - `formatDate()` function

6. **Create exports** (`/shared/index.ts`)
   - Re-export all modules

### Phase 3: Server Foundation
**Objective:** Pass T-SRV-1 through T-SRV-8 tests

1. **Create `/server/package.json`**
   - Dependencies: express, pg, cors, helmet
   - Dev dependencies: typescript, ts-node, nodemon

2. **Create `/server/.env.example`**
   - DATABASE_URL, NODE_ENV, PORT

3. **Create Express app** (`/server/src/app.ts`)
   - JSON body parser
   - CORS configuration
   - Helmet security headers

4. **Create health route** (`/server/src/routes/health.ts`)
   - GET /api/health
   - Database connectivity check
   - Return format per implementation-guide.md

5. **Create error handlers**
   - 404 handler with JSON response
   - 500 handler hiding sensitive details

6. **Create database config** (`/server/src/config/database.ts`)
   - Connection pool using pg
   - Connection test function

### Phase 4: Database Foundation
**Objective:** Pass T-DB-1 through T-DB-5 tests

1. **Create Docker configuration**
   - `/docker/docker-compose.yml` with PostgreSQL 15
   - Named volume for data persistence
   - Also create `/docker-compose.yml` at root (symlink or copy)

2. **Create migrations directory** (`/server/migrations/`)

3. **Create initial migration**
   - `audit_log` table per specification
   - `sessions` table per specification
   - Index on sessions.expire

4. **Add migration scripts to server package.json**
   - `migrate:up`, `migrate:down`, `migrate:create`

### Phase 5: Client Foundation
**Objective:** Pass T-CLI-1 through T-CLI-10 tests

1. **Create `/client/package.json`**
   - Dependencies: react, react-dom, govuk-frontend
   - Dev dependencies: typescript, vite (or CRA)

2. **Create React entry point** (`/client/src/index.tsx`)
   - Import GOV.UK styles
   - Render App component

3. **Create Landing Page** (`/client/src/pages/LandingPage.tsx`)
   - GOV.UK Header with service name
   - Phase Banner with "ALPHA"
   - Main content with h1 heading
   - GOV.UK Footer
   - Skip link

4. **Create GOV.UK wrapper components**
   - Header, Footer, PhaseBanner, SkipLink

5. **Ensure accessibility**
   - Semantic HTML (header, main, footer elements)
   - Skip link targeting #main-content
   - Document title: "Adoption Digital Platform - GOV.UK"

### Phase 6: Test Infrastructure
**Objective:** Pass T-TST-1 through T-TST-5 tests

1. **Create Jest configurations**
   - Server: `testEnvironment: 'node'`
   - Client: `testEnvironment: 'jsdom'`
   - Shared: `testEnvironment: 'node'`

2. **Add test dependencies**
   - jest, ts-jest, @types/jest
   - supertest (server)
   - @testing-library/react, jest-axe (client)

3. **Create example tests**
   - Server: Health endpoint test
   - Client: Component render test, accessibility test
   - Shared: Utility function test

---

## Data Model

### audit_log Table
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

### sessions Table
```sql
CREATE TABLE sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX idx_sessions_expire ON sessions (expire);
```

---

## Validation Rules

### Environment Variables (Required)
- `DATABASE_URL` - Must be valid PostgreSQL connection string
- `NODE_ENV` - Must be development/test/production
- `PORT` - Must be valid port number (default 3001)

### Health Endpoint Response
- Always return HTTP 200 (even when degraded)
- Status must be "healthy" or "degraded"
- Timestamp must be ISO 8601 format
- Database status must be "connected" or "disconnected"

### Error Responses
- 404: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`
- 500: `{ "error": { "code": "INTERNAL_ERROR", "message": "..." } }`
- Never expose stack traces in production

---

## Risks/Questions

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| GOV.UK Frontend v4 vs v5 | Component API changes | Pin to v4.10.1 (already in package.json) |
| Database tests without Docker | Tests fail | Skip gracefully with clear message |
| Port conflicts | Services fail to start | Use configurable ports with defaults |
| TypeScript compilation time | Slow dev experience | Use ts-node with SWC or esbuild |

### Open Questions
1. **Q1:** Should migrations use node-pg-migrate, knex, or prisma?
   - *Recommendation:* node-pg-migrate for simplicity
2. **Q2:** Vite or Create React App for client?
   - *Recommendation:* Vite for faster dev experience
3. **Q3:** Should root docker-compose.yml be symlink or copy?
   - *Recommendation:* Place at root, not in /docker

---

## Definition of Done

- [ ] All 37 automated tests in `/test/feature_project-scaffold.test.js` pass
- [ ] `npm install` completes without errors
- [ ] `npm test` runs successfully
- [ ] `npm run test:coverage` generates coverage report
- [ ] Directory structure matches specification
- [ ] Health endpoint returns correct JSON structure
- [ ] GOV.UK styling applied to landing page
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (if configured)
- [ ] All .env.example files document required variables

---

## Implementation Summary

| Metric | Count |
|--------|-------|
| **Total files to create** | ~45 |
| **Directories to create** | ~20 |
| **Files to modify** | 1 (root package.json) |
| **npm packages to add** | ~25 |
| **Database tables** | 2 |

### Implementation Order
1. Root configuration and directory structure
2. Shared package (types, constants, utils)
3. Server foundation (Express, health endpoint)
4. Database foundation (Docker, migrations)
5. Client foundation (React, GOV.UK components)
6. Test infrastructure (Jest configs, example tests)

### Key Dependencies Between Steps
- Shared package must be complete before server/client can import from it
- Server must be complete before database tests can verify connectivity
- Client requires GOV.UK Frontend package already in root package.json
