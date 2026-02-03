# Story — Database Foundation

## User Story

As a **developer**,
I want **a PostgreSQL database with migrations infrastructure and initial schema**,
So that **I can manage database changes systematically and build upon a solid data foundation**.

---

## Context / Scope

- **Actor:** Developer
- **Feature:** Project Scaffold
- **Relates to:** System Spec Section 12.1 (Technology Stack - Database), Section 12.6 (Data Storage)
- **This story establishes:** The database infrastructure that all data persistence will build upon

### What This Story Delivers
- PostgreSQL database running in Docker
- Database migrations infrastructure
- Initial schema with foundational tables
- Migration scripts (up and down)
- Database seeding capability for development

### Entry Conditions
- Developer Environment Setup story is complete
- Docker Compose is running

### Exit Conditions
- Database is accessible
- Migrations can be run and rolled back
- Initial schema is in place

---

## Acceptance Criteria

**AC-1 — PostgreSQL container starts successfully**
- Given Docker Compose configuration is correct,
- When I run `docker-compose up`,
- Then a PostgreSQL 15.x container starts,
- And the database is accessible on the configured port (default 5432).

**AC-2 — Database connection can be established**
- Given the PostgreSQL container is running,
- When I connect using the `DATABASE_URL` from environment configuration,
- Then the connection succeeds,
- And I can execute SQL queries.

**AC-3 — Migrations infrastructure is configured**
- Given I examine the `/server` directory,
- Then I find a `/server/migrations` directory for migration files,
- And there is a configured migration tool (e.g., node-pg-migrate, knex, or similar).

**AC-4 — Migration commands are available**
- Given the migrations infrastructure is configured,
- When I check the available npm scripts,
- Then I find:
  - `npm run migrate:up` - Run pending migrations
  - `npm run migrate:down` - Rollback the last migration
  - `npm run migrate:create <name>` - Create a new migration file

**AC-5 — Migrations run successfully**
- Given the database is running,
- And I have pending migrations,
- When I run `npm run migrate:up`,
- Then all pending migrations are applied,
- And a success message is displayed.

**AC-6 — Migrations can be rolled back**
- Given migrations have been applied,
- When I run `npm run migrate:down`,
- Then the last migration is rolled back,
- And the database state is reverted.

**AC-7 — Migrations table tracks applied migrations**
- Given migrations have been run,
- When I query the migrations tracking table,
- Then I see a record of each applied migration,
- And each record includes the migration name and timestamp.

**AC-8 — Audit log table is created**
- Given initial migrations have been run,
- When I examine the database schema,
- Then I find an `audit_log` table with columns:
  - `id` - Primary key
  - `action` - The action performed
  - `entity_type` - Type of entity affected
  - `entity_id` - ID of entity affected
  - `user_id` - ID of user who performed action (nullable for system actions)
  - `timestamp` - When the action occurred
  - `details` - JSON column for additional context

**AC-9 — Session table is created**
- Given initial migrations have been run,
- When I examine the database schema,
- Then I find a `sessions` table suitable for session storage,
- And the table includes columns for session ID, data, and expiry.

**AC-10 — Database data persists between container restarts**
- Given I have inserted data into the database,
- When I stop and restart the Docker containers,
- Then the data is still present,
- And I do not need to re-run migrations.

**AC-11 — Fresh database setup works correctly**
- Given I have a new PostgreSQL container with no data,
- When I run `npm run migrate:up`,
- Then all migrations are applied from scratch,
- And the database is in the expected state.

**AC-12 — Database connection uses pooling**
- Given the server is configured,
- When I examine the database connection configuration,
- Then a connection pool is configured,
- And pool settings are appropriate for development (e.g., max 10 connections).

---

## Technical Notes

### PostgreSQL Version
- Use PostgreSQL 15.x for consistency with production target
- Container image: `postgres:15-alpine` (or similar)

### Docker Volume
- Configure a named volume for PostgreSQL data
- Example: `postgres_data:/var/lib/postgresql/data`

### Migration Tool Options
Consider one of:
- `node-pg-migrate` - Simple, PostgreSQL-specific
- `knex` - Query builder with migrations
- `prisma migrate` - If using Prisma ORM

### Initial Schema Tables

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

### Environment Variables
- `DATABASE_URL` - Full connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Individual components (optional)

---

## Out of Scope

- Business entity tables (cases, parties, documents)
- Database triggers for automatic auditing
- Full-text search configuration
- Database backups and restore procedures
- Read replicas or high-availability configuration
- Production database configuration

---

## Dependencies

- **Depends on:** Developer Environment Setup (Docker Compose)

---

## Definition of Done

- [ ] PostgreSQL container starts via Docker Compose
- [ ] Database connection can be established from server
- [ ] Migration commands are available and documented
- [ ] Migrations can be run successfully
- [ ] Migrations can be rolled back successfully
- [ ] Audit log table exists with specified schema
- [ ] Sessions table exists with specified schema
- [ ] Data persists between container restarts
- [ ] Connection pooling is configured
