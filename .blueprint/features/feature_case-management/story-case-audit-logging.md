# Story — Case Audit Logging

## User Story

As a **system administrator or compliance officer**, I want **all case operations to be logged with full audit trail information** so that **we can demonstrate regulatory compliance, investigate issues, and reconstruct case state at any point in time**.

---

## Context / Scope

- **Story Type:** Technical enabler
- **Actors:** System (audit logging operates transparently)
- **Dependencies:**
  - Case data model and database schema
  - Authentication infrastructure (user context for attribution)
- **This story establishes:**
  - Audit log data model
  - Automatic logging of case operations
  - Immutable audit records
  - Query interface for audit data

---

## Acceptance Criteria

**AC-1 — Audit log table created**
- Given the database migration runs,
- When the migration completes successfully,
- Then a `case_audit_log` table exists with the required columns.

**AC-2 — Audit log schema**
- Given the audit log table exists,
- When examining the schema,
- Then the following fields are present:
  - `id` (UUID, primary key),
  - `case_id` (UUID, foreign key to cases),
  - `action` (enum: CREATE, UPDATE, STATUS_CHANGE, VIEW, DELETE),
  - `performed_by` (string, user ID),
  - `performed_at` (timestamp with timezone),
  - `before_state` (JSONB, nullable),
  - `after_state` (JSONB, nullable),
  - `metadata` (JSONB, nullable for additional context).

**AC-3 — Case creation logged**
- Given a new case is created,
- When the create operation completes,
- Then an audit log entry is created with:
  - `action`: CREATE,
  - `before_state`: null,
  - `after_state`: full case object,
  - `performed_by`: creating user's ID.

**AC-4 — Case update logged**
- Given an existing case is updated,
- When the update operation completes,
- Then an audit log entry is created with:
  - `action`: UPDATE,
  - `before_state`: case state before update,
  - `after_state`: case state after update,
  - `performed_by`: updating user's ID.

**AC-5 — Status change logged**
- Given a case status is changed,
- When the status update completes,
- Then an audit log entry is created with:
  - `action`: STATUS_CHANGE,
  - `before_state`: `{ "status": "OLD_STATUS" }`,
  - `after_state`: `{ "status": "NEW_STATUS" }`,
  - `metadata`: `{ "reason": "user provided reason" }`.

**AC-6 — Case view logged (optional)**
- Given an authorised user views a case,
- When the view operation completes,
- Then an audit log entry is created with:
  - `action`: VIEW,
  - `before_state`: null,
  - `after_state`: null,
  - `performed_by`: viewing user's ID,
  - `metadata`: `{ "redacted": true/false }`.

**AC-7 — Case deletion logged**
- Given a case is soft-deleted,
- When the delete operation completes,
- Then an audit log entry is created with:
  - `action`: DELETE,
  - `before_state`: case state before deletion,
  - `after_state`: null,
  - `performed_by`: deleting user's ID.

**AC-8 — Audit records are immutable**
- Given an audit log entry exists,
- When an update or delete is attempted on the audit record,
- Then the operation is rejected,
- And the original audit record remains unchanged.

**AC-9 — Audit log cannot be truncated**
- Given the audit log table,
- When a TRUNCATE command is attempted,
- Then the operation fails due to protection rules.

**AC-10 — Timestamps use UTC**
- Given an audit log entry is created,
- When the timestamp is recorded,
- Then the `performed_at` value is in UTC timezone.

**AC-11 — Audit log query by case**
- Given audit logs exist for a case,
- When querying `GET /api/cases/{id}/audit`,
- Then all audit entries for that case are returned in chronological order.

**AC-12 — Audit log query restricted to authorised users**
- Given a request to view case audit logs,
- When the requesting user is not an HMCTS Case Officer or system administrator,
- Then the API returns HTTP 403 Forbidden.

**AC-13 — Audit log pagination**
- Given a case has many audit entries,
- When querying the audit log,
- Then results are paginated with default page size of 50.

**AC-14 — Access denied attempts logged**
- Given a user attempts to access a case they are not authorised to view,
- When the access is denied,
- Then an audit log entry is created with:
  - `action`: VIEW,
  - `metadata`: `{ "access_denied": true, "reason": "No permission" }`.

**AC-15 — Audit logging is asynchronous**
- Given a case operation is performed,
- When the audit log is written,
- Then the logging does not block the primary operation,
- And any logging failures do not cause the primary operation to fail.

**AC-16 — State reconstruction capability**
- Given the audit log for a case,
- When processing the entries from creation to a specific timestamp,
- Then the case state at that timestamp can be reconstructed.

---

## Database Schema

```sql
-- migrations/002_create_case_audit_log.sql

CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'UPDATE',
  'STATUS_CHANGE',
  'VIEW',
  'DELETE'
);

CREATE TABLE case_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  action audit_action NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  before_state JSONB,
  after_state JSONB,
  metadata JSONB,
  CONSTRAINT case_audit_log_immutable CHECK (1=1)  -- placeholder for trigger-based immutability
);

CREATE INDEX idx_audit_case_id ON case_audit_log(case_id);
CREATE INDEX idx_audit_performed_at ON case_audit_log(performed_at);
CREATE INDEX idx_audit_action ON case_audit_log(action);
CREATE INDEX idx_audit_performed_by ON case_audit_log(performed_by);

-- Prevent updates and deletes on audit log
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable_update
  BEFORE UPDATE ON case_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_immutable_delete
  BEFORE DELETE ON case_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- Prevent truncate
REVOKE TRUNCATE ON case_audit_log FROM PUBLIC;
```

---

## API Response Format

```js
// GET /api/cases/{id}/audit?page=1&pageSize=50
// Response - Success (200)
{
  "success": true,
  "caseId": "550e8400-e29b-41d4-a716-446655440000",
  "auditLog": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "action": "CREATE",
      "performedBy": "case.officer@hmcts.gov.uk",
      "performedAt": "2026-02-03T10:00:00Z",
      "beforeState": null,
      "afterState": {
        "caseNumber": "BFC/2026/00001",
        "caseType": "AGENCY_ADOPTION",
        "status": "APPLICATION"
      },
      "metadata": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "action": "STATUS_CHANGE",
      "performedBy": "case.officer@hmcts.gov.uk",
      "performedAt": "2026-02-03T14:30:00Z",
      "beforeState": { "status": "APPLICATION" },
      "afterState": { "status": "DIRECTIONS" },
      "metadata": { "reason": "Application accepted" }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalCount": 2,
    "totalPages": 1
  }
}

// Response - Forbidden (403)
{
  "success": false,
  "error": "You do not have permission to view audit logs",
  "code": "FORBIDDEN"
}
```

---

## Audit Actions Reference

| Action | Trigger | Before State | After State | Metadata |
|--------|---------|--------------|-------------|----------|
| CREATE | New case created | null | Full case object | null |
| UPDATE | Case fields modified | Previous values | New values | Changed fields list |
| STATUS_CHANGE | Case status changed | `{ status }` | `{ status }` | Reason if provided |
| VIEW | Case viewed | null | null | redacted flag, viewer role |
| DELETE | Case soft-deleted | Full case object | null | Deletion reason |

---

## Out of Scope

- Audit log UI for browsing logs (admin tooling)
- Audit log export functionality
- Real-time audit log streaming
- Cross-case audit reporting
- Automated audit log analysis
- Long-term audit log archival strategy
- View logging configuration (may be toggled off for performance)

---

## Assumptions

1. Audit logging of views is configurable (may impact performance at scale)
2. JSONB storage is efficient for state snapshots
3. Audit log retention is indefinite for MVP (archival strategy deferred)
4. Database triggers provide sufficient immutability protection
5. Asynchronous logging uses a reliable queue mechanism

---

## Technical Notes

- Consider using database triggers for automatic audit logging on case table changes
- JSONB allows flexible state storage without schema migrations
- Before/after state enables both point-in-time queries and diff views
- Index on `performed_at` supports time-range queries
- Metadata field allows extending audit data without schema changes
