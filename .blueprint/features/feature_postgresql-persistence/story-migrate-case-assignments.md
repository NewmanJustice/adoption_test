# Story 2 — Migrate Case Assignments to PostgreSQL

## User story
As a **developer**, I want case assignments to persist to PostgreSQL instead of in-memory storage, so that multi-user case allocation survives application restarts.

---

## Context / scope
- Infrastructure story (no user-facing changes)
- Handles case-to-user assignments for case officers, judges, Cafcass officers, and social workers
- Requires migration `005_create_case_assignments_table.sql` to be created and executed
- Supports role-based case filtering (e.g., "show me all cases assigned to me")
- Scope: Store and query case assignment relationships

---

## Acceptance criteria

**AC-1 — Case assignments table migration exists**
- Given the migration file `005_create_case_assignments_table.sql` is created,
- When the migration is executed,
- Then a `case_assignments` table is created with columns: `id` (UUID), `case_id` (UUID), `user_id` (TEXT), `role` (TEXT), `assigned_at` (TIMESTAMP), `assigned_by` (TEXT),
- And a foreign key constraint exists: `case_id` references `cases(id)`,
- And an index exists on `case_id` and `user_id`,
- And a unique constraint exists on `(case_id, user_id, role)` to prevent duplicate assignments.

**AC-2 — Assign user to case persists to database**
- Given a case exists with ID `abc-123`,
- When `assignUserToCase(caseId, userId, role)` is called,
- Then a new row is inserted into `case_assignments` table,
- And an audit log entry records the assignment,
- And the assignment data is returned to the caller.

**AC-3 — Get assignments by case queries database**
- Given a case `abc-123` has assignments for two users,
- When `getAssignmentsByCaseId('abc-123')` is called,
- Then a SQL SELECT query is executed: `SELECT * FROM case_assignments WHERE case_id = $1`,
- And all assignments for that case are returned with user_id and role fields.

**AC-4 — Get cases by user filters via JOIN**
- Given user `user-456` is assigned to 3 cases,
- When `getCasesByUserId('user-456')` is called,
- Then a SQL query joins `cases` and `case_assignments`: `SELECT c.* FROM cases c INNER JOIN case_assignments a ON c.id = a.case_id WHERE a.user_id = $1 AND c.deleted_at IS NULL`,
- And only cases assigned to `user-456` are returned.

**AC-5 — Remove assignment deletes from database**
- Given an assignment exists for case `abc-123` and user `user-456`,
- When `removeAssignment(caseId, userId, role)` is called,
- Then a SQL DELETE query is executed: `DELETE FROM case_assignments WHERE case_id = $1 AND user_id = $2 AND role = $3`,
- And the assignment is removed from the database,
- And an audit log entry records the removal.

**AC-6 — Cascade delete on case removal**
- Given a case `abc-123` has 3 assignments,
- When the case is soft-deleted (deleted_at set),
- Then the assignments remain in the database,
- And queries for user assignments exclude deleted cases via JOIN filter on `deleted_at IS NULL`.

---

## Out of scope
- Real-time notifications when assignments change (handled separately)
- Assignment history tracking (audit log captures this)
- Complex multi-role assignment rules (simple role-based filtering only)
- Workload balancing across case officers (manual assignment only)
