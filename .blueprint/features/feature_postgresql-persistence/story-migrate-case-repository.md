# Story 1 — Migrate Case Repository to PostgreSQL

## User story
As a **developer**, I want the case repository to persist data to PostgreSQL instead of in-memory storage, so that case data survives application restarts and deployments.

---

## Context / scope
- Infrastructure story (no user-facing changes)
- Replaces in-memory Map storage in `server/src/repositories/caseRepository.ts` (236 lines, 17 exported functions)
- Requires migration `004_create_cases_table.sql` to be created and executed
- All existing API endpoints continue to work with same request/response contracts
- Scope: Replace all CRUD operations with PostgreSQL queries

---

## Acceptance criteria

**AC-1 — Cases table migration exists**
- Given the migration file `004_create_cases_table.sql` is created,
- When the migration is executed,
- Then a `cases` table is created with columns matching all fields from `shared/types/case.ts` Case type,
- And a `version` column exists for optimistic locking,
- And a `deleted_at` column exists for soft deletes,
- And primary key is `id` (UUID),
- And an index exists on `court` and `deleted_at` fields.

**AC-2 — Create case persists to database**
- Given a valid case creation request is received via `/api/cases` POST,
- When the `createCase()` repository function executes,
- Then a new row is inserted into the `cases` table with `version = 1`,
- And the case ID is a generated UUID,
- And an audit log entry is inserted into `audit_log` table,
- And the transaction commits successfully,
- And the case data is returned to the caller.

**AC-3 — Retrieve case queries database**
- Given a case exists in the database with ID `abc-123`,
- When `getCaseById('abc-123')` is called,
- Then a SQL SELECT query is executed: `SELECT * FROM cases WHERE id = $1 AND deleted_at IS NULL`,
- And the case data is returned with all fields populated,
- And related case assignments are retrieved via JOIN or separate query.

**AC-4 — Update case uses optimistic locking**
- Given a case exists with `version = 3`,
- When `updateCase(caseId, updates, expectedVersion = 3)` is called,
- Then a SQL UPDATE query is executed: `UPDATE cases SET ..., version = version + 1 WHERE id = $1 AND version = $2 RETURNING *`,
- And if the version matches, the update succeeds and version becomes 4,
- And if the version does not match (concurrent update), the query returns no rows and a conflict error is thrown.

**AC-5 — List cases filters by role and court**
- Given the user is an HMCTS officer assigned to Birmingham Family Court,
- When `getCasesByUserRole(userId, role)` is called,
- Then a SQL query filters cases by court: `WHERE court = $1 AND deleted_at IS NULL`,
- And only cases for Birmingham Family Court are returned,
- And the result is ordered by `created_at DESC`.

**AC-6 — Delete case performs soft delete**
- Given a case exists with ID `abc-123`,
- When `deleteCase('abc-123')` is called,
- Then a SQL UPDATE query is executed: `UPDATE cases SET deleted_at = NOW() WHERE id = $1`,
- And the case remains in the database but is excluded from list queries,
- And an audit log entry records the deletion.

**AC-7 — Data persists across restarts**
- Given a case is created and the application restarts,
- When the case is retrieved by ID,
- Then the case data is returned with all fields intact,
- And no data loss occurs.

---

## Out of scope
- Database performance tuning (query optimization, indexing beyond basics)
- Migration rollback automation (manual rollback via SQL)
- Connection pool configuration changes (using defaults: max 10)
- Read replicas or database scaling
- Test database setup (handled separately)
