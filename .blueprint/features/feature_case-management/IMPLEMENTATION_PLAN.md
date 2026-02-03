# Implementation Plan - Case Management Feature

## Summary
Implement case management APIs for creating, viewing, listing, and updating adoption cases with role-based access control and audit logging. The implementation follows the existing Express/TypeScript patterns in `server/src/` and requires new routes, controllers, services, repositories, and database migrations. Tests import from `../server/src/app`, so the app export must remain compatible.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `server/src/types/case.ts` | Create | Case, CaseStatus, AdoptionType types and interfaces |
| `server/src/types/audit.ts` | Create | AuditAction, AuditLogEntry types |
| `server/src/types/assignment.ts` | Create | CaseAssignment, AssignmentType types |
| `server/src/migrations/001_create_cases.sql` | Create | Cases table with enums, indexes, triggers |
| `server/src/migrations/002_create_audit_log.sql` | Create | Audit log table with immutability triggers |
| `server/src/migrations/003_create_assignments.sql` | Create | Case assignments and organisations tables |
| `server/src/repositories/caseRepository.ts` | Create | Database operations for cases (CRUD, queries) |
| `server/src/repositories/auditRepository.ts` | Create | Audit log persistence operations |
| `server/src/repositories/assignmentRepository.ts` | Create | Case assignment persistence operations |
| `server/src/services/caseService.ts` | Create | Business logic for case operations |
| `server/src/services/auditService.ts` | Create | Audit logging service (async-safe) |
| `server/src/services/accessControlService.ts` | Create | Role-based access evaluation logic |
| `server/src/services/caseNumberService.ts` | Create | Case number generation (COURT/YEAR/SEQ) |
| `server/src/controllers/caseController.ts` | Create | HTTP handlers for case endpoints |
| `server/src/middleware/caseAccessMiddleware.ts` | Create | Per-case access control enforcement |
| `server/src/routes/cases.ts` | Create | Case API route definitions |
| `server/src/app.ts` | Modify | Register case routes |
| `server/src/types/auth.ts` | Modify | Add courtAssignment, organisationId to SessionUser |

## Implementation Steps

1. **Extend auth types** - Add `courtAssignment` and `organisationId` to SessionUser interface and update mock login to accept these fields. Update authController to handle extended user context.

2. **Create case types** - Define AdoptionType enum (6 values), CaseStatus enum (9 values), Case interface, CreateCaseRequest, UpdateCaseRequest, and API response types matching test expectations.

3. **Create database migrations** - Write SQL for cases table with enums, audit_log with immutability triggers, and case_assignments/case_organisations tables. Include indexes for common queries.

4. **Implement repositories** - Create caseRepository (create, findById, findByFilters, updateStatus, softDelete), auditRepository (create, findByCaseId), assignmentRepository (create, revoke, findByCaseAndUser).

5. **Implement core services** - Build caseNumberService for COURT/YEAR/SEQ generation, accessControlService for role-based access evaluation per the AC matrix, auditService for async logging.

6. **Implement case service** - Create caseService with createCase (validates, generates number, logs), getCase (applies redaction for adopters), listCases (role-filtered), updateStatus (validates transitions and role authority).

7. **Implement case controller** - HTTP handlers: POST /api/cases (201/400/403), GET /api/cases (200/401), GET /api/cases/:id (200/403/404), PATCH /api/cases/:id/status (200/400/403/409), GET /api/cases/:id/audit (200/403).

8. **Implement access control middleware** - Middleware that evaluates case-level access per role rules (HMCTS by court, Judge/Cafcass by assignment, LA/VAA by organisation, Adopter by APPLICANT assignment).

9. **Implement assignment endpoints** - POST /api/cases/:id/assignments (201/403), GET /api/cases/:id/assignments (200), DELETE /api/cases/:id/assignments/:aid (200). Only HMCTS can manage.

10. **Register routes and test** - Mount caseRouter in app.ts, run test suite incrementally, fix discrepancies between test expectations and story ACs (note: tests use different status values than stories).

## Risks/Questions

- **Enum mismatch**: Tests define statuses like SUBMITTED, IN_ASSESSMENT, PENDING_HEARING but stories use DIRECTIONS, CONSENT_AND_REPORTING, FINAL_HEARING. Tests are the contract - implement to match test values.
- **Adopter case linking**: Tests expect `applicantIds` array and APPLICANT assignment. Stories mention assignment by HMCTS - confirm automatic linking or manual assignment workflow.
- **Court code derivation**: Tests expect "Birmingham Family Court" -> "BFC". Need utility to extract court code from name (first letter of each word).
- **Version/conflict handling**: Tests expect `version` field for optimistic locking on status updates - need to track case version or use updatedAt timestamp.
- **In-memory vs PostgreSQL**: Tests may need mocked repositories for speed. Consider repository interface pattern for test doubles.
