# Test Specification — PostgreSQL Data Persistence

## Understanding
This feature replaces in-memory Map storage with PostgreSQL persistence across all repositories (cases, documents, assignments, audit logs). The core behaviors to test: (1) CRUD operations query PostgreSQL instead of in-memory structures, (2) data persists across application restarts, (3) optimistic locking prevents concurrent update conflicts, (4) case number generation uses database sequences with row-level locking, (5) environment-specific database connection selection works correctly, and (6) database migrations execute idempotently. All existing API contracts remain unchanged—only the persistence layer changes. Testing focuses on observable behavior: data survives restarts, SQL queries execute correctly, and concurrent operations are handled safely.

## AC → Test ID Mapping

| Story | AC | Test ID | Scenario |
|-------|----|---------|---------------------------------------------------------|
| S1 | AC-1 | T-1.1 | Migration creates cases table with all required columns |
| S1 | AC-1 | T-1.2 | Cases table has indexes on court and deleted_at |
| S1 | AC-2 | T-1.3 | Create case inserts row with version=1 and audit log |
| S1 | AC-3 | T-1.4 | Get case by ID queries database excluding soft-deleted |
| S1 | AC-4 | T-1.5 | Update case with matching version succeeds |
| S1 | AC-4 | T-1.6 | Update case with stale version fails with conflict |
| S1 | AC-5 | T-1.7 | List cases filters by court and excludes deleted |
| S1 | AC-6 | T-1.8 | Delete case sets deleted_at timestamp (soft delete) |
| S1 | AC-7 | T-1.9 | Case data persists after application restart |
| S2 | AC-1 | T-2.1 | Case assignments migration creates table with FK |
| S2 | AC-1 | T-2.2 | Assignments table has unique constraint on (case_id, user_id, role) |
| S2 | AC-2 | T-2.3 | Assign user to case inserts row and logs audit entry |
| S2 | AC-3 | T-2.4 | Get assignments by case ID returns all assignments |
| S2 | AC-4 | T-2.5 | Get cases by user ID uses JOIN to filter assigned cases |
| S2 | AC-5 | T-2.6 | Remove assignment deletes row and logs audit entry |
| S2 | AC-6 | T-2.7 | Assignments remain when case soft-deleted, excluded from user queries |
| S3 | AC-1 | T-3.1 | Documents table migration already exists |
| S3 | AC-2 | T-3.2 | Create document inserts metadata row and audit log |
| S3 | AC-3 | T-3.3 | Get document by ID queries database |
| S3 | AC-4 | T-3.4 | List documents by case ID filters by case_id |
| S3 | AC-5 | T-3.5 | Update document status modifies row and logs audit |
| S3 | AC-6 | T-3.6 | Delete document sets deleted_at (soft delete) |
| S4 | AC-1 | T-4.1 | Court sequences migration creates table with seed data |
| S4 | AC-2 | T-4.2 | Generate case number increments sequence and returns formatted number |
| S4 | AC-3 | T-4.3 | New year resets sequence to 1 |
| S4 | AC-4 | T-4.4 | Concurrent case number generation uses locking (no duplicates) |
| S4 | AC-5 | T-4.5 | Sequence persists after restart |
| S5 | AC-1 | T-5.1 | APP_ENV=LOCAL uses LOCAL_DATABASE_URL |
| S5 | AC-2 | T-5.2 | APP_ENV=DEV uses DEV_DATABASE_URL with SSL |
| S5 | AC-3 | T-5.3 | APP_ENV=PROD uses PROD_DATABASE_URL with SSL |
| S5 | AC-4 | T-5.4 | Missing database URL fails fast with clear error |
| S5 | AC-5 | T-5.5 | Connection pool config remains max=10 across envs |
| S6 | AC-1 | T-6.1 | Migration script executes pending migrations in order |
| S6 | AC-2 | T-6.2 | Re-running migrations skips already-applied ones |
| S6 | AC-3 | T-6.3 | Migration failure rolls back transaction |
| S6 | AC-4 | T-6.4 | Local PostgreSQL migration succeeds |
| S6 | AC-5 | T-6.5 | Azure PostgreSQL migration succeeds (requires live Azure DB) |
| S7 | AC-1 | T-7.1 | Case data intact after restart |
| S7 | AC-2 | T-7.2 | Document metadata intact after restart |
| S7 | AC-3 | T-7.3 | Case assignments intact after restart |
| S7 | AC-4 | T-7.4 | Audit log intact after restart |
| S7 | AC-5 | T-7.5 | Optimistic locking works after restart |

## Key Assumptions

- **PostgreSQL instance available**: Tests assume PostgreSQL is running locally via Docker or a test instance is configured
- **Test database isolation**: Each test suite uses a fresh database or transaction rollback to avoid state pollution
- **Migration execution order**: Tests assume migrations 001-003 already exist; new migrations 004-006 are created by this feature
- **No production data**: Tests use synthetic test data; no migration from existing production data
- **Synchronous restart testing**: For restart verification (T-1.9, T-4.5, T-7.x), tests will simulate restart by reconnecting to database rather than full application restart
- **Row-level locking behavior**: Concurrent tests (T-4.4) assume PostgreSQL transaction isolation level supports FOR UPDATE locking
- **SSL configuration**: Azure database tests (T-6.5) require live Azure credentials and are marked as integration tests (may be skipped in CI)
- **Existing codebase contracts**: All repository function signatures remain unchanged; tests verify behavior, not implementation details
- **Audit log tracking**: All mutation operations (create, update, delete) should produce corresponding audit_log entries

## Test Environment Setup

- **Database**: PostgreSQL 12+ (Docker: `postgresql://adoption:adoption@localhost:5432/adoption_test`)
- **Migration tool**: Existing npm script `npm run migrate:up --workspace=server`
- **Test framework**: Jest with Supertest for API integration tests
- **Test database cleanup**: Use `beforeAll` to run migrations, `afterEach` to truncate tables or rollback transactions
- **Environment variables**: Set `APP_ENV=TEST` and `TEST_DATABASE_URL` for test runs
