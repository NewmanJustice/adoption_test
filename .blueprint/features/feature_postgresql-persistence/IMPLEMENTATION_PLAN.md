# PostgreSQL Persistence Migration Plan

## Problem Statement
Application is using in-memory Map storage for all data (cases, assignments, audit logs, documents). All data is lost on restart. PostgreSQL is provisioned and configured, but repositories are not using it.

## Approach
Replace Map-based storage with PostgreSQL queries in all repository files. Use the existing `pool` from `config/database.ts`. Migrations already exist but need to be reviewed/updated.

---

## Workplan

### Phase 1: Database Schema
- [ ] Review existing migrations (001_initial_schema.sql, 002_documents, 003_audit)
- [ ] Create missing migration for cases table (with all Case type fields)
- [ ] Create missing migration for case_assignments table
- [ ] Run migrations locally to verify schema
- [ ] Test rollback/up cycle

### Phase 2: Case Repository Migration
- [ ] Rewrite `createCase()` - INSERT query returning case object
- [ ] Rewrite `findCaseById()` - SELECT query with deleted_at check
- [ ] Rewrite `findCasesByCourtAssignment()` - SELECT with WHERE clause
- [ ] Rewrite `updateCaseStatus()` - UPDATE query with optimistic locking
- [ ] Rewrite `deleteCase()` - soft delete UPDATE query
- [ ] Rewrite `getAllCases()` - SELECT with pagination
- [ ] Migrate `courtSequences` Map to database table or use DB sequence

### Phase 3: Document Repository Migration
- [ ] Review document migrations (002_create_documents_table.sql)
- [ ] Rewrite documentRepository to use PostgreSQL
- [ ] Migrate file metadata queries
- [ ] Update document audit logging to use DB

### Phase 4: Audit Log Migration
- [ ] Review audit migrations (003_create_audit_log_table.sql)
- [ ] Rewrite audit logging functions to INSERT to PostgreSQL
- [ ] Ensure all case operations log to DB instead of Map

### Phase 5: Testing & Deployment
- [ ] Update unit tests to use test database
- [ ] Test locally with PostgreSQL
- [ ] Configure Azure App Service environment variables (APP_ENV, DATABASE_URL)
- [ ] Run migrations on Azure PostgreSQL
- [ ] Deploy and verify data persists across restarts

---

## Key Files to Modify

| File | Changes Needed | Lines Affected |
|------|----------------|----------------|
| `server/src/repositories/caseRepository.ts` | Replace all Map operations with SQL queries | ~200+ lines (full rewrite) |
| `server/src/repositories/documentRepository.ts` | Replace Map with PostgreSQL | Entire file |
| `server/migrations/` | Add cases table migration | New file |
| `server/migrations/` | Add case_assignments table migration | New file |
| Azure App Service | Set APP_ENV=DEV, DEV_DATABASE_URL | Configuration only |

---

## Risks & Questions

**Risk:** Breaking existing functionality during migration
- Mitigation: Write tests first, migrate incrementally, keep Map version as fallback

**Question:** Should we use transactions for multi-step operations?
- Recommendation: Yes - case creation with audit logging should be atomic

**Question:** How to handle the courtSequences Map? 
- Options: (A) DB sequence per court, (B) dedicated sequences table, (C) function to get next number
- Recommendation: PostgreSQL sequence or table with row locking

**Risk:** Migrations not run on Azure before deployment
- Mitigation: Add migration step to deployment workflow or run manually first

---

## Estimated Scope
- **caseRepository.ts**: ~200 lines to rewrite
- **documentRepository.ts**: ~150 lines to rewrite  
- **New migrations**: 2 files (~50 lines total)
- **Testing**: Update/add database tests
- **Azure config**: 2 environment variables

This is a **medium-large refactor** (~6-8 hours of work) but critical for production.
