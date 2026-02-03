# Story — Create Adoption Case

## User Story

As an **HMCTS Case Officer**, I want **to create a new adoption case with the required case details** so that **I can establish a digital case record for tracking the adoption matter through the court process**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:** HMCTS Case Officer (only role permitted to create cases)
- **Dependencies:**
  - Session management infrastructure (user authenticated with role)
  - API authentication middleware
  - Case data model and database schema
- **Routes:**
  - `GET /cases/create` — Display case creation form
  - `POST /api/cases` — Process case creation
- **This story captures:**
  - Case type selection
  - Assigned court
  - Optional linked case reference
  - Optional notes

---

## Acceptance Criteria

**AC-1 — Create case page display**
- Given an HMCTS Case Officer navigates to `/cases/create`,
- When the page loads,
- Then a case creation form is displayed containing:
  - A selection control for case type (six adoption types),
  - A text input for assigned court,
  - An optional text input for linked case reference,
  - An optional textarea for notes,
  - A "Create case" button,
  - A "Cancel" link.

**AC-2 — Case type options displayed**
- Given the case creation form is displayed,
- When viewing the case type selection,
- Then all six adoption types are available:
  - Agency Adoption,
  - Step-Parent Adoption,
  - Intercountry Adoption,
  - Non-Agency Adoption,
  - Foster-to-Adopt,
  - Adoption Following Placement Order.

**AC-3 — Case type required validation**
- Given the case creation form is displayed,
- When the user submits without selecting a case type,
- Then a validation error is displayed: "Select an adoption type",
- And the form is not submitted.

**AC-4 — Assigned court required validation**
- Given the case creation form is displayed,
- When the user submits without entering an assigned court,
- Then a validation error is displayed: "Enter the assigned court",
- And the form is not submitted.

**AC-5 — Successful case creation**
- Given an HMCTS Case Officer enters valid case details,
- When the user clicks "Create case",
- Then the form submits to `POST /api/cases`,
- And on success, the user is redirected to the case detail page `/cases/{id}`,
- And a success notification is displayed: "Case {case_number} created".

**AC-6 — Case number generation**
- Given a case is created successfully,
- When the system generates the case number,
- Then the format is: `{COURT_CODE}/{YEAR}/{SEQUENCE}`,
- And the case number is unique,
- And the sequence increments per court per year.

**AC-7 — Initial case status**
- Given a case is created successfully,
- When the case record is stored,
- Then the status is set to "Application".

**AC-8 — Created by tracking**
- Given a case is created successfully,
- When the case record is stored,
- Then the `createdBy` field contains the authenticated user's ID.

**AC-9 — API case creation endpoint**
- Given a POST request to `/api/cases`,
- When the request body contains valid case data,
- Then a case record is created,
- And the response contains:
  - `{ "success": true, "case": { ...caseDetails }, "redirectUrl": "/cases/{id}" }`.

**AC-10 — API validation - missing case type**
- Given a POST request to `/api/cases`,
- When the case type is missing,
- Then the API returns HTTP 400 Bad Request,
- And the response contains `{ "error": "Case type is required" }`.

**AC-11 — API validation - invalid case type**
- Given a POST request to `/api/cases`,
- When the case type is not one of the six valid options,
- Then the API returns HTTP 400 Bad Request,
- And the response contains `{ "error": "Invalid case type" }`.

**AC-12 — API validation - missing assigned court**
- Given a POST request to `/api/cases`,
- When the assigned court is missing or empty,
- Then the API returns HTTP 400 Bad Request,
- And the response contains `{ "error": "Assigned court is required" }`.

**AC-13 — Role restriction - non-HMCTS user**
- Given a POST request to `/api/cases`,
- When the authenticated user is not an HMCTS Case Officer,
- Then the API returns HTTP 403 Forbidden,
- And the response contains `{ "error": "Insufficient permissions" }`.

**AC-14 — Role restriction - UI access**
- Given a non-HMCTS Case Officer navigates to `/cases/create`,
- When the page loads,
- Then the user is shown an access denied message,
- Or the user is redirected to an appropriate page with notification.

**AC-15 — Cancel navigation**
- Given the case creation form is displayed,
- When the user clicks "Cancel",
- Then the user is returned to `/cases`,
- And no case is created.

**AC-16 — GOV.UK error summary pattern**
- Given validation errors occur,
- When errors are displayed,
- Then:
  - A GOV.UK error summary is displayed at the top of the page,
  - Each error links to the relevant field,
  - Focus moves to the error summary,
  - Individual field error messages are shown inline.

**AC-17 — Accessibility compliance**
- Given the case creation form is displayed,
- Then:
  - All form inputs have associated labels,
  - The form is navigable by keyboard,
  - Focus order is logical,
  - Colour contrast meets WCAG 2.1 AA standards.

---

## API Request/Response

```js
// POST /api/cases
// Request
{
  "caseType": "AGENCY_ADOPTION",
  "assignedCourt": "Birmingham Family Court",
  "linkedCaseReference": "BC/2025/12345",  // optional
  "notes": "Transferred from Central London"  // optional
}

// Response - Success (201)
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
    "createdBy": "case.officer@hmcts.gov.uk"
  },
  "redirectUrl": "/cases/550e8400-e29b-41d4-a716-446655440000"
}

// Response - Validation Error (400)
{
  "success": false,
  "error": "Case type is required",
  "code": "VALIDATION_ERROR"
}

// Response - Forbidden (403)
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

---

## Out of Scope

- Party/participant assignment during creation (separate feature)
- Document upload during creation (separate feature)
- Duplicate case detection beyond case number uniqueness
- Court lookup/validation from external registry
- Batch case creation
- Case creation from Form A58 submission (separate workflow)
- Pre-population from external systems (future integration)

---

## Assumptions

1. Court codes are derived from a simple mapping (e.g., "Birmingham Family Court" -> "BFC")
2. Sequence numbers reset per court per year
3. HMCTS Case Officer is the only role permitted to create cases (other users submit applications that become cases)
4. Linked case reference is informational only - no validation against external systems

---

## Design Notes

- Case type selection should use GOV.UK radios component for clear visibility of options
- Assigned court could use text input with optional autocomplete (implementation choice)
- Consider hint text explaining case number format after creation
- Form layout should follow GOV.UK form patterns
