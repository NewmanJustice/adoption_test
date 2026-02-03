# Story — View Case Details with Role-Based Redaction

## User Story

As an **authenticated user with access to a case**, I want **to view the case details appropriate to my role** so that **I can understand the current state of the adoption matter while sensitive information is protected according to policy**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:** All authenticated users with case access (with role-based content)
- **Dependencies:**
  - Session management infrastructure (user authenticated with role)
  - API authentication middleware
  - Case data model and database schema
  - Role-based access control
- **Routes:**
  - `GET /cases/:id` — Display case detail page
  - `GET /api/cases/:id` — Retrieve case details
- **This story establishes:**
  - Case detail display
  - Role-based information visibility
  - Adopter view redaction
  - Access denied handling for case-level permissions

---

## Acceptance Criteria

**AC-1 — Case detail page display**
- Given an authenticated user with access to a case navigates to `/cases/{id}`,
- When the page loads,
- Then the case details are displayed including:
  - Case number (as page heading),
  - Case type,
  - Current status,
  - Assigned court,
  - Created date,
  - Last updated date.

**AC-2 — Full view for professional users**
- Given an authenticated professional user (HMCTS, Judge, Cafcass, LA, VAA) views a case,
- When the page loads,
- Then all case information is displayed without redaction,
- And linked case reference is visible (if present),
- And notes are visible (if present).

**AC-3 — Redacted view for Adopters**
- Given an authenticated Adopter views their case,
- When the page loads,
- Then birth family identifying information is NOT displayed,
- And the following fields are visible:
  - Case number,
  - Case type,
  - Current status,
  - Assigned court,
  - Key dates.

**AC-4 — Adopter redaction - birth parent details hidden**
- Given a case has associated birth parent information,
- When an Adopter views the case,
- Then birth parent names are NOT displayed,
- And birth parent addresses are NOT displayed,
- And birth parent contact details are NOT displayed.

**AC-5 — API case detail endpoint**
- Given a GET request to `/api/cases/{id}`,
- When the request is authenticated and authorised,
- Then the response contains case details appropriate to the user's role.

**AC-6 — API response includes redaction flag**
- Given a GET request to `/api/cases/{id}` from an Adopter,
- When the response is returned,
- Then the response includes `"redacted": true`,
- And sensitive fields are omitted from the response.

**AC-7 — Case not found**
- Given a GET request to `/api/cases/{id}` with a non-existent ID,
- When the request is processed,
- Then the API returns HTTP 404 Not Found,
- And the response contains `{ "error": "Case not found" }`.

**AC-8 — Access denied - no case access**
- Given a user attempts to view a case they are not authorised to access,
- When the request is processed,
- Then the API returns HTTP 403 Forbidden,
- And the response contains `{ "error": "You do not have permission to view this case" }`,
- And the access attempt is logged.

**AC-9 — UI access denied handling**
- Given a user navigates to `/cases/{id}` for a case they cannot access,
- When the page loads,
- Then an access denied message is displayed,
- And the user is not shown any case details.

**AC-10 — Status history section**
- Given a case has had status changes,
- When viewing the case detail page,
- Then a "Case history" section shows status transitions,
- And each entry shows: status, date, changed by (for professional users only).

**AC-11 — Case actions based on role**
- Given an HMCTS Case Officer or Judge views a case,
- When the page loads,
- Then action buttons are displayed for permitted operations (e.g., "Update status").

**AC-12 — No edit actions for Adopters**
- Given an Adopter views their case,
- When the page loads,
- Then no edit or update actions are displayed,
- And the view is read-only.

**AC-13 — Back to case list navigation**
- Given the case detail page is displayed,
- When the user clicks "Back to cases",
- Then the user is returned to `/cases` (or `/my-cases` for Adopters).

**AC-14 — Unauthenticated access**
- Given an unauthenticated user navigates to `/cases/{id}`,
- When the request is processed,
- Then the user is redirected to `/login`.

**AC-15 — Soft-deleted case not viewable**
- Given a case has been soft-deleted,
- When a user attempts to view it,
- Then the API returns HTTP 404 Not Found,
- And the response contains `{ "error": "Case not found" }`.

**AC-16 — Accessibility compliance**
- Given the case detail page is displayed,
- Then:
  - All content is properly structured with headings,
  - Key information is presented in accessible formats (summary lists),
  - Screen readers can understand the case structure,
  - Colour contrast meets WCAG 2.1 AA standards.

---

## API Request/Response

```js
// GET /api/cases/{id}
// Response - Success (200) - Professional User
{
  "success": true,
  "case": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "caseNumber": "BFC/2026/00001",
    "caseType": "AGENCY_ADOPTION",
    "status": "APPLICATION",
    "assignedCourt": "Birmingham Family Court",
    "linkedCaseReference": "BC/2025/12345",
    "notes": "Transferred from Central London",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z",
    "createdBy": "case.officer@hmcts.gov.uk",
    "history": [
      {
        "status": "APPLICATION",
        "changedAt": "2026-02-03T10:00:00Z",
        "changedBy": "case.officer@hmcts.gov.uk"
      }
    ]
  },
  "redacted": false,
  "permissions": {
    "canUpdateStatus": true,
    "canEdit": true
  }
}

// Response - Success (200) - Adopter (Redacted)
{
  "success": true,
  "case": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "caseNumber": "BFC/2026/00001",
    "caseType": "AGENCY_ADOPTION",
    "status": "APPLICATION",
    "assignedCourt": "Birmingham Family Court",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  },
  "redacted": true,
  "permissions": {
    "canUpdateStatus": false,
    "canEdit": false
  }
}

// Response - Not Found (404)
{
  "success": false,
  "error": "Case not found",
  "code": "NOT_FOUND"
}

// Response - Forbidden (403)
{
  "success": false,
  "error": "You do not have permission to view this case",
  "code": "FORBIDDEN"
}
```

---

## Redaction Matrix

| Field | Professional Users | Adopters |
|-------|-------------------|----------|
| Case Number | Visible | Visible |
| Case Type | Visible | Visible |
| Status | Visible | Visible |
| Assigned Court | Visible | Visible |
| Created Date | Visible | Visible |
| Updated Date | Visible | Visible |
| Linked Case Reference | Visible | Hidden |
| Notes | Visible | Hidden |
| Created By | Visible | Hidden |
| Status History | Full (with user names) | Limited (dates only) |
| Birth Parent Details | Visible | **Redacted** |

---

## Out of Scope

- Party/participant list on case detail (separate feature)
- Document list on case detail (separate feature)
- Hearing schedule on case detail (separate feature)
- Inline editing of case fields
- Case printing functionality
- Case sharing or forwarding
- Comparison with linked cases

---

## Assumptions

1. Redaction is enforced server-side - client cannot request unredacted data
2. History entries are available from audit log infrastructure
3. Permissions object helps frontend determine which actions to display
4. Birth parent information will be stored separately (party management feature)
5. "Professional user" means any non-Adopter role

---

## Design Notes

- Case details should use GOV.UK summary list component
- Status should use GOV.UK tag component with appropriate colour
- History section could use GOV.UK timeline or simple table pattern
- Consider a visual indicator when viewing redacted content
- Breadcrumb should show: Cases > Case BFC/2026/00001
