# Feature Specification — PostgreSQL Data Persistence

## 1. Feature Intent
**Why this feature exists.**

- **Problem being addressed:** The application currently uses in-memory Map storage for all data (cases, assignments, documents, audit logs). All data is lost when the application restarts or redeploys. This makes the system unsuitable for production use and violates core requirements for a government case management system.

- **User or system need:** All users need their case data to persist across application restarts, deployments, and server failures. HMCTS case officers need case records to survive system maintenance. Social workers and adopters need reliable access to historical case data. The system needs a durable audit trail for compliance.

- **How this supports the system purpose:** This feature implements foundational data persistence required by System Spec Section 3 (System Boundaries) and enables the "Single digital case record" requirement. Without persistent storage, no production adoption proceedings can be managed.

> **System Spec Alignment:** This feature implements the data persistence foundation assumed by all other features. It replaces the development-only in-memory storage with production-grade PostgreSQL persistence.

---

## 2. Scope

### In Scope
- Replace in-memory Map storage with PostgreSQL database queries in all repositories
- Create database migrations for cases and case_assignments tables
- Implement all CRUD operations (Create, Read, Update, Delete) using PostgreSQL
- Maintain optimistic locking for concurrent case updates (version field)
- Persist audit logs to database instead of in-memory
- Persist document metadata to database
- Generate case numbers using database sequences
- Support role-based case filtering through SQL queries
- Configure environment-specific database connections (LOCAL/DEV/PROD)
- Run database migrations on local and Azure PostgreSQL instances

### Out of Scope
- Database performance optimization (query tuning, indexing strategy beyond basics)
- Database backups and disaster recovery procedures (Azure managed service handles this)
- Database migration rollback automation (manual rollback via migration scripts)
- Multi-database support (only PostgreSQL)
- Read replicas or database scaling
- Database connection pooling tuning (using defaults)
- Migration from existing production data (no production data exists yet)

---

## 3. Actors Involved
**Who interacts with this feature.**

### System (Backend)
- **Can do:** Store and retrieve all case data in PostgreSQL, execute migrations, manage database connections, log operations to database
- **Cannot do:** Operate without database connectivity (no fallback to in-memory storage in production)

### DevOps / Platform Engineers
- **Can do:** Configure database connection strings, run migrations, monitor database health, set APP_ENV environment variables
- **Cannot do:** Access database directly without proper credentials, modify schema without migrations

### All End Users (Indirect)
- **Can do:** Rely on data persistence across sessions and deployments
- **Cannot do:** Directly interact with database (all access mediated through API)

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy Path - Case Creation with Persistence
1. User creates a case through the API
2. System validates case data
3. System begins database transaction
4. System generates case ID (UUID) and case number (using database sequence)
5. System inserts case record into PostgreSQL `cases` table
6. System inserts audit log entry into `audit_log` table
7. System commits transaction
8. User receives confirmation with case ID
9. Case data persists even if application restarts

### Happy Path - Case Retrieval
1. User requests case details via API
2. System queries PostgreSQL `cases` table by case ID
3. System applies role-based filtering (SQL WHERE clauses)
4. System retrieves case data and related assignments
5. System returns case data to user
6. Data reflects all updates since creation, regardless of restarts

### Happy Path - Case Update with Optimistic Locking
1. User updates case status via API
2. System retrieves current case record (including version)
3. System validates status transition
4. System executes UPDATE with WHERE clause: `id = ? AND version = ?`
5. System increments version number
6. System logs audit entry
7. If version mismatch (concurrent update), system returns conflict error
8. User receives confirmation or retries with latest version

### Key Alternatives
- **Database unavailable:** System fails fast, returns 503 Service Unavailable, logs error
- **Migration not run:** System detects missing tables on startup, logs error, fails to start
- **Invalid connection string:** System fails during initialization with clear error message

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

### States Modified
- **Case lifecycle:** All case state transitions (APPLICATION → DIRECTIONS → HEARING → etc.) now persist to database
- **Document status:** Document upload status, OCR status, virus scan status persist to database
- **Audit trail:** All audit events persist permanently to database

### Feature Classification
- **State-enabling:** This feature enables all state persistence across the system
- **Infrastructure:** Foundational capability required by all other features

### Lifecycle Impact
- Application startup now requires successful database connection
- Application shutdown should gracefully close database connections
- Each deployment can now preserve all existing data

---

## 6. Rules & Decision Logic
**New or exercised rules.**

### Rule 1: Environment-Based Database Selection
- **Description:** System uses different database connection strings based on APP_ENV
- **Inputs:** APP_ENV environment variable (LOCAL, DEV, TEST, PROD)
- **Outputs:** Database connection string (LOCAL_DATABASE_URL, DEV_DATABASE_URL, etc.)
- **Type:** Deterministic
- **Implementation:** `server/src/config/index.ts:10-32`

### Rule 2: Optimistic Locking for Concurrent Updates
- **Description:** Prevent lost updates when multiple users modify the same case
- **Inputs:** Case ID, expected version number, update data
- **Outputs:** Success (row updated) or Conflict (version mismatch)
- **Type:** Deterministic
- **Implementation:** SQL `UPDATE cases SET ... WHERE id = ? AND version = ? RETURNING *`

### Rule 3: Soft Delete for Cases
- **Description:** Cases are never physically deleted, only marked with deleted_at timestamp
- **Inputs:** Case ID, user performing deletion
- **Outputs:** Case record with deleted_at set to current timestamp
- **Type:** Deterministic
- **Implementation:** SQL `UPDATE cases SET deleted_at = NOW() WHERE id = ?`

### Rule 4: Case Number Generation Per Court
- **Description:** Each court has independent case number sequences
- **Inputs:** Court name (e.g., "Birmingham Family Court")
- **Outputs:** Case number format: `{CourtCode}/{Year}/{SequenceNumber}` (e.g., BFC/2026/00001)
- **Type:** Deterministic
- **Implementation:** Database sequence or table with row-level locking

---

## 7. Dependencies
**What this feature relies on.**

### System Components
- PostgreSQL database (version 12+)
- Node.js `pg` driver (already installed)
- Database connection pool configuration (`server/src/config/database.ts`)
- Environment variable configuration (`APP_ENV`, `*_DATABASE_URL`)

### External Systems
- **Local Development:** PostgreSQL via Docker Compose (localhost:5432)
- **Azure Production:** Azure Database for PostgreSQL (provisioned, connection string in secrets)

### Operational Dependencies
- Database migrations must be run before application starts
- Connection pool must be configured with appropriate limits (currently max: 10)
- Database user must have CREATE, SELECT, INSERT, UPDATE, DELETE permissions

### Migration Files
- `server/migrations/001_initial_schema.sql` (sessions, audit_log) - EXISTS ✓
- `server/migrations/002_create_documents_table.sql` - EXISTS ✓
- `server/migrations/003_create_audit_log_table.sql` - EXISTS ✓
- `server/migrations/004_create_cases_table.sql` - NEEDS TO BE CREATED
- `server/migrations/005_create_case_assignments_table.sql` - NEEDS TO BE CREATED

---

## 8. Non-Functional Considerations
**Only where relevant.**

### Performance
- **Query Performance:** Simple indexed queries (by ID, by court) should complete in <50ms
- **Connection Pooling:** Reuse database connections (current pool size: 10)
- **Transaction Overhead:** Minimal - only use transactions for multi-step operations

### Audit/Logging
- **All database operations log to audit_log table:** case creation, updates, deletions
- **Failed database operations log to application logs** with error details
- **Migration execution logs** to console and application logs

### Error Tolerance
- **Database unavailable:** Application fails to start (fail-fast principle)
- **Query failures:** Return HTTP 500 with error details in development, generic message in production
- **Connection pool exhausted:** Queue requests or return 503 Service Unavailable

### Security Implications
- **Connection strings contain credentials:** Must be stored in environment variables, never in code
- **SQL injection prevention:** Use parameterized queries exclusively (`pool.query($1, $2)`)
- **Audit trail integrity:** Audit logs are append-only, never deleted
- **Role-based filtering:** Enforce access control at SQL query level (WHERE clauses)

---

## 9. Assumptions & Open Questions
**What must be true for this feature to work.**

### Assumptions
1. PostgreSQL database is provisioned and accessible from application server
2. Database user has sufficient permissions (CREATE, SELECT, INSERT, UPDATE, DELETE)
3. Network connectivity between application and database is reliable
4. Azure Database for PostgreSQL connection string is configured in App Service settings
5. Court assignment data exists for HMCTS users (to filter cases by court)
6. Migration scripts are run before first deployment to environment

### Open Questions
1. **Case number sequence implementation:** Should we use PostgreSQL sequences, a dedicated table with locking, or a stored function?
   - **Recommendation:** Dedicated table with row-level locking (more flexible, easier to reset per court)

2. **Migration execution:** Should migrations run automatically on startup or manually via npm script?
   - **Recommendation:** Manual via npm script (safer, explicit control)

3. **Test database:** Should tests use in-memory SQLite or a test PostgreSQL instance?
   - **Recommendation:** Test PostgreSQL instance to match production behavior

4. **Transaction scope:** Which operations require transactions?
   - **Recommendation:** Any multi-step operation (case creation + audit log, document upload + metadata)

---

## 10. Impact on System Specification
**Alex-owned reconciliation section.**

### System Spec Alignment
This feature **reinforces** System Spec assumptions:
- Section 3 (System Boundaries): Confirms assumption of persistent data storage
- Section 5 (Core Domain Concepts): Enables Case entity to persist across sessions
- Section 6 (Lifecycle & State Model): Enables durable state transitions

### No Contradictions
This feature does not contradict any system specification assumptions. The System Spec assumes production-grade persistence; this feature delivers it.

### System Spec Updates Required
None. This feature implements infrastructure assumed by the System Spec.

---

## 11. Handover to BA (Cass)
**What Cass should derive from this spec.**

### Story Themes
This is an **infrastructure feature** with no user-facing stories. However, Cass should be aware that this work unblocks:
- All production case management workflows
- Reliable audit trail for compliance
- Multi-user concurrent access to cases
- Long-term data retention

### Expected Story Boundaries
- **Story 1:** Migrate Case Repository to PostgreSQL (create cases table, implement CRUD)
- **Story 2:** Migrate Document Repository to PostgreSQL (use existing migrations)
- **Story 3:** Implement Database Migrations (create missing migrations, run locally and Azure)
- **Story 4:** Configure Environment-Specific Database Connections (Azure App Service settings)
- **Story 5:** Testing & Validation (verify data persists across restarts)

### Areas Needing Careful Story Framing
- **No user-facing changes:** Stories should focus on technical acceptance criteria, not UI behavior
- **Testing strategy:** Each story needs database-specific tests (not in-memory mocks)
- **Backward compatibility:** Existing API contracts remain unchanged, only persistence layer changes

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-10 | Initial specification created | Production deployment requires persistent storage | User request |

---

## Appendix: Implementation Plan

See detailed implementation plan at: `~/.copilot/session-state/{session-id}/plan.md`

### Phase 1: Database Schema
- Review existing migrations
- Create cases table migration (all Case type fields)
- Create case_assignments table migration
- Run migrations locally to verify schema
- Test rollback/up cycle

### Phase 2: Case Repository Migration
- Rewrite all 17 exported functions in `caseRepository.ts` (236 lines)
- Replace Map operations with SQL queries
- Implement optimistic locking (version field)
- Migrate courtSequences to database table

### Phase 3: Document Repository Migration
- Rewrite documentRepository (123 lines)
- Use existing migrations (002_documents, 003_audit)

### Phase 4: Audit Log Migration
- Ensure all operations log to PostgreSQL audit_log table

### Phase 5: Testing & Deployment
- Update tests to use test database
- Test locally with PostgreSQL
- Configure Azure App Service: APP_ENV=DEV, DEV_DATABASE_URL
- Run migrations on Azure PostgreSQL
- Deploy and verify persistence

### Estimated Scope
- **caseRepository.ts:** ~200 lines to rewrite
- **documentRepository.ts:** ~150 lines to rewrite
- **New migrations:** 2 files (~50 lines total)
- **Azure configuration:** 2 environment variables
- **Total effort:** 6-8 hours
