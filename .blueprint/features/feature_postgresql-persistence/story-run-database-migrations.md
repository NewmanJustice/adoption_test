# Story 6 — Run Database Migrations on Local and Azure PostgreSQL

## User story
As a **developer**, I want to run database migrations manually via npm script, so that database schema is created and updated consistently across all environments.

---

## Context / scope
- Infrastructure story (operational task)
- Migration files in `server/migrations/` directory
- Existing migrations: 001 (sessions), 002 (documents), 003 (audit_log)
- New migrations: 004 (cases), 005 (case_assignments), 006 (court_sequences)
- Migration execution via `npm run migrate:up --workspace=server`
- Scope: Manual migration execution, not automatic on startup

---

## Acceptance criteria

**AC-1 — Migration script executes all pending migrations**
- Given 3 new migration files exist (004, 005, 006),
- When `npm run migrate:up --workspace=server` is executed,
- Then each migration is executed in order (001 → 002 → 003 → 004 → 005 → 006),
- And a `migrations` table tracks which migrations have been applied,
- And console output shows: "Applied migration: 004_create_cases_table.sql".

**AC-2 — Idempotent migration execution**
- Given migrations 001-003 have already been applied,
- When `npm run migrate:up` is executed again,
- Then migrations 001-003 are skipped,
- And only migrations 004-006 are executed,
- And no errors occur from duplicate table creation.

**AC-3 — Migration failure rolls back transaction**
- Given migration 005 contains a SQL syntax error,
- When `npm run migrate:up` is executed,
- Then migrations 001-004 are applied successfully,
- And migration 005 fails with error message displayed,
- And migration 005 is rolled back (not recorded in `migrations` table),
- And migrations 006 is not attempted.

**AC-4 — Local PostgreSQL migration succeeds**
- Given `APP_ENV=LOCAL` and local PostgreSQL is running via Docker,
- When `npm run migrate:up` is executed,
- Then all migrations apply to `postgresql://adoption:adoption@localhost:5432/adoption`,
- And tables are created in local database,
- And the application can connect and query tables.

**AC-5 — Azure PostgreSQL migration succeeds**
- Given `APP_ENV=DEV` and `DEV_DATABASE_URL` points to Azure,
- When `npm run migrate:up` is executed,
- Then all migrations apply to Azure Database for PostgreSQL,
- And SSL connection is used (`?sslmode=require`),
- And tables are created in Azure database,
- And the application can connect and query tables.

---

## Out of scope
- Automatic migration on application startup (manual execution only)
- Migration rollback automation (manual SQL rollback via migrate:down)
- Migration version conflict resolution (assumes linear migration history)
- Migration testing framework (manual verification)
