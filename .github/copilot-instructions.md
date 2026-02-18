# GitHub Copilot Instructions

Instructions for GitHub Copilot when working with this repository.

## Project Overview

Adoption Digital Platform for England & Wales - a government digital service for adoption case management. Built as an npm workspaces monorepo with three packages: `client/` (React + Vite), `server/` (Express + PostgreSQL), and `shared/` (TypeScript types/utilities).

**Node.js requirement:** >=20.0.0

## Build, Test, and Lint Commands

```bash
# Development
npm run dev                          # Start full stack (client + server concurrently)
npm run dev:client                   # Vite dev server on port 3000
npm run dev:server                   # Express server on port 3001 (nodemon)

# Testing
npm test                             # Run all tests across workspaces
npm run test:watch                   # Watch mode
npm run test:coverage                # Coverage report
npx jest path/to/file.test.ts        # Run a specific test file
npx jest --testNamePattern="test name"  # Run specific test by name
npx jest --selectProjects=server     # Run only server tests
npx jest --selectProjects=client     # Run only client tests
npx jest --selectProjects=shared     # Run only shared tests
npx jest --selectProjects=scaffold   # Run only integration tests

# Type Checking
npm run typecheck --workspace=client
npm run typecheck --workspace=server

# Build
npm run build --workspace=client     # TypeScript + Vite build
npm run build --workspace=server     # TypeScript compilation

# Database Migrations
npm run migrate:up --workspace=server
npm run migrate:down --workspace=server
npm run migrate:create --workspace=server -- <migration-name>
```

## Database Setup

PostgreSQL runs via Docker Compose on `localhost:5432`:
```bash
docker compose up -d
```

Connection string: `postgresql://adoption:adoption@localhost:5432/adoption`

## Development vs Production

**IMPORTANT:** Several features are development-only and must be replaced before production deployment:

- **Mock Authentication** - Currently accepts any username/role without password validation
- **In-Memory Storage** - Cases, documents, and audit logs stored in memory (not PostgreSQL)
- **Local File Storage** - Documents saved to `./uploads` instead of Azure Blob Storage
- **Mock Antivirus** - Always returns "clean" without actual scanning
- **Prototype Annotator** - Feedback overlay tool injected into all pages

See `DEV_TO_PROD_CHECKLIST.md` for complete migration requirements.

## Architecture

### Monorepo Structure

- **client/** - React + Vite frontend (port 3000)
- **server/** - Express backend (port 3001)  
- **shared/** - Shared TypeScript types and utilities

### Backend (Express)

- **Entry:** `server/src/index.ts` → `server/src/app.ts`
- **Middleware chain:** Helmet → CORS → Body parsing → Session → Auth → Routes
- **Route organization:** Public routes (`/api/auth`) and protected routes (require authentication)
- **Database:** pg connection pool in `server/src/config/database.ts`
- **Authentication:** Session-based with role-based access control (roles in `server/src/config/roles.ts`)

### Frontend (React + Vite)

- **Entry:** `client/src/main.tsx` → `client/src/App.tsx`
- **Routing:** React Router v7 (pages in `client/src/pages/`)
- **Dev proxy:** Vite proxies `/api/*` and `/__prototype-annotator/*` to `localhost:3001`
- **Design system:** GOV.UK Frontend v5 (SASS in `client/src/styles/`)
- **Accessibility:** GOV.UK Frontend accessibility standards are required
- **Prototype Annotator:** Development-only feedback tool (remove before production)

### Shared Types

- `shared/types/api.ts` - API request/response types (`ApiResponse<T>`, `ApiError`, `HealthResponse`, case/pilot types)
- `shared/constants/app.ts` - Application constants
- `shared/utils/format.ts` - Formatting utilities

**API Response Pattern:**
All API responses must use types from `shared/types/api.ts`. Responses should follow the `ApiResponse<T>` wrapper pattern:
```typescript
// Success
{ data: T }

// Error
{ error: { code: string, message: string } }
```

## Test Configuration

Jest multi-project config in `jest.config.js` with five test suites:

- **unit** - Unit tests in `test/unit/**/*.test.js`
- **scaffold** - Integration tests in `test/**/*.test.js`
- **server** - Backend tests in `server/**/*.test.ts` (node environment)
- **client** - Frontend tests in `client/**/*.test.tsx|ts` (jsdom environment)
- **shared** - Shared library tests in `shared/**/*.test.ts`

Run specific test suites or tests:
```bash
npx jest --selectProjects=server path/to/file.test.ts  # Run specific file in server suite
npx jest --testNamePattern="test name"                 # Run tests matching pattern
```

## Key Conventions

- **TypeScript strict mode** enforced across all workspaces
- **Workspace imports:** Use `@adoption/shared` alias for shared package imports (e.g., `import { ApiResponse } from '@adoption/shared/types/api.js'`)
- **Module resolution:** `.js` extensions in imports are mapped to `.ts` files (ESM style, TypeScript will resolve)
- **Server ESM modules:** Server package uses `"type": "module"` - all imports must include `.js` extensions
- **Session-based auth:** All protected routes require authentication middleware
- **GOV.UK patterns:** Follow GOV.UK Design System patterns for UI components (see `client/src/styles/`)
- **Layered architecture:** Server follows Repository → Service → Controller → Route pattern
- **Security:** Helmet CSP configured for React SPA + GOV.UK Frontend (see `server/src/app.ts`)
- **Error handling:** Use `ApiError` type for all API errors with consistent error codes
- **Route protection:** Use `requireAuth()` middleware factory from `authMiddleware.ts`; pass `allowedRoles` array or `'*'` for any authenticated user:
  ```typescript
  router.get('/resource', requireAuth({ allowedRoles: ['HMCTS_CASE_OFFICER', 'JUDGE_LEGAL_ADVISER'] }), handler);
  ```
- **Controller request type:** Use `AuthRequest` (from `server/src/types/auth.ts`) instead of `Request` to access `req.session.user` in authenticated controllers
- **Accessibility testing:** `jest-axe` is configured globally in client tests — use `expect(await axe(container)).toHaveNoViolations()` in component tests

## User Roles

The system supports the following roles (defined in `server/src/config/roles.ts`):

**Court & Legal:**
- `HMCTS_CASE_OFFICER` - Courts and Tribunals case officer
- `JUDGE_LEGAL_ADVISER` - Judge or legal adviser

**Social Services:**
- `CAFCASS_OFFICER` - Children and Family Court Advisory officer
- `LA_SOCIAL_WORKER` - Local Authority social worker
- `VAA_WORKER` - Voluntary Adoption Agency worker

**Adopters:**
- `ADOPTER` - Prospective or approved adopter

**Pilot Team:**
- `PILOT_BUILDER` - Technical builder
- `PILOT_SME` - Subject matter expert
- `PILOT_DELIVERY_LEAD` - Delivery lead
- `PILOT_OBSERVER` - Observer role

Each role has specific redirect URLs after login (e.g., `ADOPTER` → `/my-cases`, others → `/dashboard` or `/pilot`).

## Feature Implementation Pipeline

For new features, this repository uses a custom `/implement-feature` skill that orchestrates a 4-agent pipeline:

1. **Alex** (Specification) → Creates `FEATURE_SPEC.md`
2. **Cass** (BA) → Writes user stories in `story-*.md`
3. **Nigel** (Tester) → Produces `test-spec.md` and `*.test.js` files
4. **Codey** (Developer) → Implements code with `IMPLEMENTATION_PLAN.md`

**Related directories:**
- `.blueprint/agents/` - Agent specifications (Alex, Cass, Nigel, Codey)
- `.blueprint/features/feature_<name>/` - Feature artifacts (specs, stories, tests, plans)
- `.blueprint/system_specification/` - System specification
- `.business_context/` - 18 domain documents covering regulatory requirements, user roles, adoption types, court processes, etc.
- `test/artifacts/feature_<name>/` - Test specifications and artifacts

**Pipeline artifacts:**
- `FEATURE_SPEC.md` - Feature specification (Alex)
- `story-*.md` - User stories (Cass)
- `test-spec.md` + `test/feature_*.test.js` - Test specifications and executable tests (Nigel)
- `IMPLEMENTATION_PLAN.md` - Implementation plan (Codey)
