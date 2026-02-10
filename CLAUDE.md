# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adoption Digital Platform for England & Wales - a government digital service for adoption case management. Built as an npm workspaces monorepo with three packages: `client/` (React + Vite), `server/` (Express + PostgreSQL), and `shared/` (TypeScript types/utilities).

## Development Commands

```bash
# Start full stack development (client + server concurrently)
npm run dev

# Start individual services
npm run dev:client      # Vite dev server on port 3000
npm run dev:server      # Express server on port 3001 (nodemon)

# Testing
npm test                # Run all tests across workspaces
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Type checking
npm run typecheck --workspace=client
npm run typecheck --workspace=server

# Database migrations (from server workspace)
npm run migrate:up --workspace=server
npm run migrate:down --workspace=server
npm run migrate:create --workspace=server -- <migration-name>

# Build for production
npm run build --workspace=client
npm run build --workspace=server
```

## Database Setup

PostgreSQL runs via Docker Compose:
```bash
docker compose up -d    # Start PostgreSQL on localhost:5432
```
Connection: `postgresql://adoption:adoption@localhost:5432/adoption`

## Test Configuration

Jest multi-project config in `jest.config.js` with four test suites:
- `scaffold` - Integration tests in `test/**/*.test.js`
- `server` - Backend tests in `server/**/*.test.ts`
- `client` - Frontend tests in `client/**/*.test.tsx|ts` (jsdom environment)
- `shared` - Shared library tests

Run a specific test file:
```bash
npx jest path/to/file.test.ts
```

## Architecture

### Backend (Express)
- Entry: `server/src/index.ts` → `server/src/app.ts`
- Middleware chain: Helmet → CORS → Body parsing → Session → Auth → Routes
- Route organization: Public routes (`/api/auth`) and protected routes require authentication
- Database: pg connection pool in `server/src/config/database.ts`

### Frontend (React + Vite)
- Entry: `client/src/main.tsx` → `client/src/App.tsx`
- Routing: React Router v7 (pages in `client/src/pages/`)
- Dev proxy: Vite proxies `/api/*` to `localhost:3001`
- Design system: GOV.UK Frontend v5 (SASS in `client/src/styles/`)

### Shared Types
- `shared/types/api.ts` - API request/response types shared between client and server
- `shared/constants/app.ts` - Application constants
- `shared/utils/format.ts` - Formatting utilities

## Feature Implementation Pipeline

Use `/implement-feature` skill for new features. This orchestrates a 4-agent pipeline:

1. **Alex** (Specification) → Creates `FEATURE_SPEC.md`
2. **Cass** (BA) → Writes user stories in `story-*.md`
3. **Nigel** (Tester) → Produces `test-spec.md` and `*.test.js` files
4. **Codey** (Developer) → Implements code with `IMPLEMENTATION_PLAN.md`

Agent specifications: `.blueprint/agents/AGENT_*.md`
Feature artifacts: `.blueprint/features/feature_<name>/`
System specification: `.blueprint/system_specification/SYSTEM_SPEC.md`
Business context: `.business_context/` (18 domain documents covering regulatory, user roles, etc.)

## Key Patterns

- Session-based authentication with role-based access control (roles defined in `server/src/config/roles.ts`)
- TypeScript strict mode enforced across all workspaces
- GOV.UK Frontend accessibility standards required
- All API responses use types from `shared/types/api.ts`
