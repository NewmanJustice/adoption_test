# Story 7 — Verify Data Persistence Across Application Restarts

## User story
As a **developer**, I want to verify that all data persists correctly across application restarts, so that production deployments do not result in data loss.

---

## Context / scope
- Infrastructure story (testing and validation)
- End-to-end verification of PostgreSQL persistence
- Covers cases, documents, assignments, and audit logs
- Tests both local PostgreSQL (Docker) and Azure PostgreSQL
- Scope: Manual testing procedure to confirm persistence

---

## Acceptance criteria

**AC-1 — Case data persists across restart**
- Given a case is created via API with status "APPLICATION",
- When the application is stopped and restarted,
- And the case is retrieved by ID,
- Then all case fields are returned unchanged (status, court, parties, dates),
- And the case version number remains 1.

**AC-2 — Document metadata persists across restart**
- Given 3 documents are uploaded for case `abc-123`,
- When the application is stopped and restarted,
- And documents are listed for case `abc-123`,
- Then all 3 documents are returned with correct filenames, types, and upload status,
- And no documents are missing.

**AC-3 — Case assignments persist across restart**
- Given user `user-456` is assigned to 2 cases,
- When the application is stopped and restarted,
- And cases are listed for user `user-456`,
- Then both assigned cases are returned,
- And the assignment roles are correct.

**AC-4 — Audit log persists across restart**
- Given 5 case actions have been logged to audit_log,
- When the application is stopped and restarted,
- And audit logs are retrieved,
- Then all 5 audit entries are returned with correct timestamps and user IDs,
- And audit trail is complete.

**AC-5 — Concurrent updates work after restart**
- Given a case exists with version 2,
- When the application restarts,
- And two concurrent update requests are made,
- Then optimistic locking prevents conflicting updates,
- And one update succeeds (version becomes 3),
- And the other update fails with conflict error.

---

## Out of scope
- Performance benchmarking (basic persistence verification only)
- Load testing with multiple concurrent users (single-user testing)
- Database backup and restore verification (Azure managed service handles this)
- Data migration from old system (no legacy data)
