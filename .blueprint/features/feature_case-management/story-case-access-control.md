# Story — Case-Level Access Control

## User Story

As a **system operator**, I want **case access to be controlled based on explicit user assignments and role-based rules** so that **users can only view and interact with cases they have legitimate reason to access, enforcing the need-to-know principle**.

---

## Context / Scope

- **Story Type:** Technical enabler with user-facing impact
- **Actors:** System (access control operates transparently on all case operations)
- **Dependencies:**
  - Session management infrastructure (user authenticated with role and organisation)
  - Case data model and database schema
  - Authentication middleware
- **Routes:**
  - Access control applies to all `/api/cases/*` endpoints
- **This story establishes:**
  - Case assignment data model
  - Assignment-based access rules
  - Organisation-based access for LA and agency workers
  - Security logging for access attempts

---

## Acceptance Criteria

**AC-1 — Case assignments table created**
- Given the database migration runs,
- When the migration completes successfully,
- Then a `case_assignments` table exists to track user-case relationships.

**AC-2 — Case assignment schema**
- Given the case assignments table exists,
- When examining the schema,
- Then the following fields are present:
  - `id` (UUID, primary key),
  - `case_id` (UUID, foreign key to cases),
  - `user_id` (string, the assigned user),
  - `assignment_type` (enum: JUDICIAL, CAFCASS, COURT, APPLICANT),
  - `assigned_at` (timestamp),
  - `assigned_by` (string),
  - `revoked_at` (timestamp, nullable).

**AC-3 — HMCTS Case Officer access rule**
- Given an HMCTS Case Officer requests access to a case,
- When evaluating access,
- Then access is granted if the case's `assigned_court` matches the user's court assignment,
- Or if the user has an explicit COURT assignment to the case.

**AC-4 — Judge/Legal Adviser access rule**
- Given a Judge or Legal Adviser requests access to a case,
- When evaluating access,
- Then access is granted only if the user has a JUDICIAL assignment to the case.

**AC-5 — Cafcass Officer access rule**
- Given a Cafcass Officer requests access to a case,
- When evaluating access,
- Then access is granted only if the user has a CAFCASS assignment to the case.

**AC-6 — Local Authority Social Worker access rule**
- Given a Local Authority Social Worker requests access to a case,
- When evaluating access,
- Then access is granted if the user's organisation (Local Authority) is associated with the case,
- And the LA is involved as the placing authority or supporting agency.

**AC-7 — Voluntary Adoption Agency Worker access rule**
- Given a Voluntary Adoption Agency Worker requests access to a case,
- When evaluating access,
- Then access is granted if the user's organisation (agency) is associated with the case.

**AC-8 — Adopter access rule**
- Given an Adopter requests access to a case,
- When evaluating access,
- Then access is granted only if the user has an APPLICANT assignment to the case.

**AC-9 — Access denied response**
- Given a user requests access to a case they are not authorised to view,
- When the access check fails,
- Then the API returns HTTP 403 Forbidden,
- And the response contains `{ "error": "You do not have permission to access this case" }`,
- And the attempt is logged in the security audit log.

**AC-10 — Access denied does not leak case existence**
- Given a user requests access to a case they cannot access,
- When the access is denied,
- Then the response does not indicate whether the case exists or not,
- And the same 403 response is returned for non-existent cases (to authorised users, 404 is returned).

**AC-11 — Assignment creation (HMCTS Case Officer)**
- Given an HMCTS Case Officer assigns a user to a case,
- When the assignment is created via `POST /api/cases/{id}/assignments`,
- Then the assignment is stored with the assigning user recorded.

**AC-12 — Assignment revocation**
- Given an existing case assignment,
- When the assignment is revoked via `DELETE /api/cases/{id}/assignments/{assignmentId}`,
- Then the assignment is soft-deleted (revoked_at set),
- And the user loses access to the case.

**AC-13 — Multiple assignments per user**
- Given a user may have multiple roles on a case,
- When checking access,
- Then any valid assignment grants access,
- And assignment types do not conflict.

**AC-14 — API assignment endpoint - create**
- Given a POST request to `/api/cases/{id}/assignments`,
- When the request body contains valid assignment data,
- Then an assignment is created,
- And the response contains:
  ```json
  {
    "success": true,
    "assignment": { "id": "...", "userId": "...", "assignmentType": "..." }
  }
  ```

**AC-15 — API assignment endpoint - list**
- Given a GET request to `/api/cases/{id}/assignments`,
- When the requesting user has access to the case,
- Then all active assignments are returned.

**AC-16 — Only HMCTS can manage assignments**
- Given a request to create or revoke assignments,
- When the requesting user is not an HMCTS Case Officer,
- Then the API returns HTTP 403 Forbidden.

**AC-17 — Security logging for denied access**
- Given an access denied event occurs,
- When the denial is processed,
- Then a security log entry is created with:
  - User ID attempting access,
  - Case ID requested,
  - Timestamp,
  - User's role,
  - Denial reason.

**AC-18 — Organisation association in user context**
- Given user authentication succeeds,
- When the session is created,
- Then the user context includes:
  - `organisationId` (for LA and VAA workers),
  - `organisationType` (LOCAL_AUTHORITY or VOLUNTARY_AGENCY),
  - `courtAssignment` (for HMCTS Case Officers).

**AC-19 — Case-organisation association**
- Given a case involves specific organisations,
- When the case is created or updated,
- Then `case_organisations` records link the case to involved LAs and agencies.

---

## Database Schema

```sql
-- migrations/003_create_case_assignments.sql

CREATE TYPE assignment_type AS ENUM (
  'JUDICIAL',
  'CAFCASS',
  'COURT',
  'APPLICANT'
);

CREATE TABLE case_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  user_id VARCHAR(255) NOT NULL,
  assignment_type assignment_type NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by VARCHAR(255) NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_active_assignment UNIQUE (case_id, user_id, assignment_type)
    WHERE revoked_at IS NULL
);

CREATE INDEX idx_assignments_case_id ON case_assignments(case_id);
CREATE INDEX idx_assignments_user_id ON case_assignments(user_id);
CREATE INDEX idx_assignments_active ON case_assignments(case_id, user_id)
  WHERE revoked_at IS NULL;

-- Case-organisation associations for LA and agency access
CREATE TYPE organisation_type AS ENUM (
  'LOCAL_AUTHORITY',
  'VOLUNTARY_AGENCY'
);

CREATE TABLE case_organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  organisation_id VARCHAR(255) NOT NULL,
  organisation_type organisation_type NOT NULL,
  association_type VARCHAR(50) NOT NULL,  -- e.g., 'PLACING_AUTHORITY', 'SUPPORT_AGENCY'
  associated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_case_org UNIQUE (case_id, organisation_id)
);

CREATE INDEX idx_case_orgs_case_id ON case_organisations(case_id);
CREATE INDEX idx_case_orgs_org_id ON case_organisations(organisation_id);

-- Security audit log for access denials
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_role VARCHAR(50),
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  outcome VARCHAR(20) NOT NULL,  -- 'DENIED', 'GRANTED'
  reason VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_audit_user ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_occurred ON security_audit_log(occurred_at);
CREATE INDEX idx_security_audit_outcome ON security_audit_log(outcome);
```

---

## Access Control Matrix

| Role | Access Criteria |
|------|-----------------|
| HMCTS Case Officer | Case `assigned_court` matches user's court OR explicit COURT assignment |
| Judge / Legal Adviser | Explicit JUDICIAL assignment only |
| Cafcass Officer | Explicit CAFCASS assignment only |
| LA Social Worker | User's LA in `case_organisations` |
| VAA Worker | User's agency in `case_organisations` |
| Adopter | Explicit APPLICANT assignment only |

---

## API Request/Response

```js
// POST /api/cases/{id}/assignments
// Request
{
  "userId": "judge.smith@judiciary.gov.uk",
  "assignmentType": "JUDICIAL"
}

// Response - Success (201)
{
  "success": true,
  "assignment": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "caseId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "judge.smith@judiciary.gov.uk",
    "assignmentType": "JUDICIAL",
    "assignedAt": "2026-02-03T10:00:00Z",
    "assignedBy": "case.officer@hmcts.gov.uk"
  }
}

// GET /api/cases/{id}/assignments
// Response - Success (200)
{
  "success": true,
  "assignments": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "userId": "judge.smith@judiciary.gov.uk",
      "assignmentType": "JUDICIAL",
      "assignedAt": "2026-02-03T10:00:00Z",
      "assignedBy": "case.officer@hmcts.gov.uk"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "userId": "cafcass.officer@cafcass.gov.uk",
      "assignmentType": "CAFCASS",
      "assignedAt": "2026-02-03T11:00:00Z",
      "assignedBy": "case.officer@hmcts.gov.uk"
    }
  ]
}

// Response - Access Denied (403)
{
  "success": false,
  "error": "You do not have permission to access this case",
  "code": "FORBIDDEN"
}
```

---

## Out of Scope

- User-to-court assignment management (seeded or separate admin feature)
- Organisation management (LA and agency registry)
- Automatic assignment based on case events
- Assignment delegation or proxying
- Temporary access grants
- Access request workflow
- Cross-case access for case linking purposes

---

## Assumptions

1. User-court associations exist for HMCTS Case Officers (seeded in mock auth or managed separately)
2. Organisation IDs are consistent between user context and case associations
3. Access checks happen at API level, not database level
4. Security logging is synchronous but lightweight
5. Same-organisation access is implicit (no explicit assignment needed for LA/VAA workers)

---

## Technical Notes

- Access control should be implemented as middleware or service layer
- Consider caching user permissions to reduce database queries
- Security audit log should be separate from case audit log (different retention, different access)
- IP address and user agent capture supports security incident investigation
- 403 vs 404 handling prevents information disclosure about case existence
