# Story — Update Case Status

## User Story

As an **authorised user**, I want **to transition a case through its lifecycle states** so that **the case record accurately reflects its current stage in the adoption process and other users can see the progress**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:**
  - HMCTS Case Officer (most transitions)
  - Judge / Legal Adviser (terminal state transitions)
- **Dependencies:**
  - Session management infrastructure (user authenticated with role)
  - API authentication middleware
  - Case data model with status enumeration
  - Case view page (for status update UI integration)
- **Routes:**
  - `GET /cases/:id/status` — Display status update form
  - `PATCH /api/cases/:id/status` — Process status update
- **This story establishes:**
  - Status transition validation
  - Role-based transition authority
  - Status change audit trail

---

## Acceptance Criteria

**AC-1 — Status update page display**
- Given an authorised user navigates to `/cases/{id}/status`,
- When the page loads,
- Then a status update form is displayed containing:
  - Current status (read-only display),
  - Available next statuses (radio buttons or select),
  - Optional reason/notes textarea,
  - An "Update status" button,
  - A "Cancel" link.

**AC-2 — Valid transitions only shown**
- Given the status update form is displayed,
- When viewing the available next statuses,
- Then only valid transitions from the current state are shown,
- And invalid transitions are not selectable.

**AC-2a — API returns valid transitions in case permissions**
- Given a GET request to `/api/cases/{id}`,
- When the response includes permissions,
- Then the permissions object MUST contain a `validTransitions` array,
- And the array contains only status values valid from the current state,
- And the array is filtered by the user's role permissions,
- And for terminal statuses, the array is empty,
- And for users without update permission, the array is empty.

**AC-3 — Transition validation matrix**
- Given a case with current status,
- When determining valid transitions,
- Then the following rules apply:

| Current Status | Valid Next Statuses |
|---------------|---------------------|
| APPLICATION | DIRECTIONS, ON_HOLD, APPLICATION_WITHDRAWN |
| DIRECTIONS | CONSENT_AND_REPORTING, ON_HOLD, APPLICATION_WITHDRAWN |
| CONSENT_AND_REPORTING | FINAL_HEARING, ON_HOLD, APPLICATION_WITHDRAWN |
| FINAL_HEARING | ORDER_GRANTED, APPLICATION_REFUSED, ADJOURNED, ON_HOLD, APPLICATION_WITHDRAWN |
| ON_HOLD | (return to previous state), APPLICATION_WITHDRAWN |
| ADJOURNED | FINAL_HEARING, APPLICATION_WITHDRAWN |
| ORDER_GRANTED | (terminal - no transitions) |
| APPLICATION_REFUSED | (terminal - no transitions) |
| APPLICATION_WITHDRAWN | (terminal - no transitions) |

**AC-4 — Role-based transition authority**
- Given a user attempts a status transition,
- When validating the transition,
- Then the following role restrictions apply:

| Transition | Permitted Roles |
|------------|-----------------|
| Any -> ON_HOLD | HMCTS Case Officer, Judge / Legal Adviser |
| Any -> APPLICATION_WITHDRAWN | HMCTS Case Officer |
| FINAL_HEARING -> ORDER_GRANTED | Judge / Legal Adviser |
| FINAL_HEARING -> APPLICATION_REFUSED | Judge / Legal Adviser |
| All other transitions | HMCTS Case Officer |

**AC-5 — Successful status update**
- Given an authorised user selects a valid next status,
- When the user clicks "Update status",
- Then the form submits to `PATCH /api/cases/{id}/status`,
- And on success, the user is redirected to the case detail page,
- And a success notification is displayed: "Case status updated to {new_status}".

**AC-6 — Status update recorded in history**
- Given a status update is successful,
- When the update completes,
- Then an entry is added to the case history including:
  - Previous status,
  - New status,
  - User who made the change,
  - Timestamp,
  - Reason/notes (if provided).

**AC-7 — API status update endpoint**
- Given a PATCH request to `/api/cases/{id}/status`,
- When the request body contains a valid status transition,
- Then the case status is updated,
- And the response contains:
  ```json
  {
    "success": true,
    "case": { "id": "...", "status": "NEW_STATUS", ... },
    "previousStatus": "OLD_STATUS"
  }
  ```

**AC-8 — API validation - invalid transition**
- Given a PATCH request to `/api/cases/{id}/status`,
- When the requested status is not a valid transition from current state,
- Then the API returns HTTP 400 Bad Request,
- And the response contains `{ "error": "Invalid status transition from {current} to {requested}" }`.

**AC-9 — API validation - insufficient role**
- Given a PATCH request to `/api/cases/{id}/status`,
- When the user's role is not permitted for this transition,
- Then the API returns HTTP 403 Forbidden,
- And the response contains `{ "error": "Your role cannot perform this status transition" }`.

**AC-10 — API validation - case not found**
- Given a PATCH request to `/api/cases/{id}/status`,
- When the case ID does not exist,
- Then the API returns HTTP 404 Not Found,
- And the response contains `{ "error": "Case not found" }`.

**AC-11 — Terminal state - no update option**
- Given a case is in a terminal state (ORDER_GRANTED, APPLICATION_REFUSED, APPLICATION_WITHDRAWN),
- When viewing the case detail page,
- Then no "Update status" action is available.

**AC-12 — On Hold - return to previous state**
- Given a case is in ON_HOLD status,
- When viewing available transitions,
- Then an option to return to the previous (non-ON_HOLD) state is available.

**AC-13 — Reason required for certain transitions**
- Given the status update form is displayed,
- When the transition is to ON_HOLD, APPLICATION_WITHDRAWN, or APPLICATION_REFUSED,
- Then the reason/notes field is required,
- And the form cannot be submitted without providing a reason.

**AC-14 — Cancel navigation**
- Given the status update form is displayed,
- When the user clicks "Cancel",
- Then the user is returned to `/cases/{id}`,
- And no status change occurs.

**AC-15 — Concurrent update handling**
- Given a case status is being updated,
- When another user has updated the status since the form was loaded,
- Then the API returns HTTP 409 Conflict,
- And the response contains `{ "error": "Case status has changed. Please refresh and try again.", "currentStatus": "ACTUAL_CURRENT_STATUS" }`.

**AC-16 — Accessibility compliance**
- Given the status update form is displayed,
- Then:
  - All form inputs have associated labels,
  - The form is navigable by keyboard,
  - Current status is clearly announced,
  - Colour contrast meets WCAG 2.1 AA standards.

---

## API Request/Response

```js
// GET /api/cases/{id}
// Response - includes permissions with validTransitions
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "caseNumber": "BFC/2026/00001",
  "caseType": "AGENCY_ADOPTION",
  "status": "APPLICATION",
  "assignedCourt": "Birmingham Family Court",
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-01T10:00:00Z",
  "permissions": {
    "canEdit": true,
    "canUpdateStatus": true,
    "canDelete": true,
    "canViewAudit": true,
    "validTransitions": ["DIRECTIONS", "ON_HOLD", "APPLICATION_WITHDRAWN"]  // CRITICAL: Required for AC-2a
  }
}

// PATCH /api/cases/{id}/status
// Request
{
  "status": "DIRECTIONS",
  "reason": "Application accepted, directions to be issued",
  "expectedVersion": "2026-02-03T10:00:00Z"  // for optimistic locking
}

// Response - Success (200)
{
  "success": true,
  "case": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "caseNumber": "BFC/2026/00001",
    "caseType": "AGENCY_ADOPTION",
    "status": "DIRECTIONS",
    "assignedCourt": "Birmingham Family Court",
    "updatedAt": "2026-02-03T11:00:00Z"
  },
  "previousStatus": "APPLICATION",
  "transition": {
    "from": "APPLICATION",
    "to": "DIRECTIONS",
    "at": "2026-02-03T11:00:00Z",
    "by": "case.officer@hmcts.gov.uk",
    "reason": "Application accepted, directions to be issued"
  }
}

// Response - Invalid Transition (400)
{
  "success": false,
  "error": "Invalid status transition from APPLICATION to FINAL_HEARING",
  "code": "INVALID_TRANSITION",
  "validTransitions": ["DIRECTIONS", "ON_HOLD", "APPLICATION_WITHDRAWN"]
}

// Response - Insufficient Role (403)
{
  "success": false,
  "error": "Your role cannot perform this status transition",
  "code": "FORBIDDEN",
  "requiredRoles": ["JUDGE_LEGAL_ADVISER"]
}

// Response - Conflict (409)
{
  "success": false,
  "error": "Case status has changed. Please refresh and try again.",
  "code": "CONFLICT",
  "currentStatus": "DIRECTIONS"
}
```

---

## State Transition Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                                                         │
                    ▼                                                         │
┌─────────────┐   ┌───────────┐   ┌────────────────────┐   ┌──────────────┐  │
│ APPLICATION │──▶│ DIRECTIONS│──▶│CONSENT_AND_REPORTING│──▶│FINAL_HEARING │  │
└─────────────┘   └───────────┘   └────────────────────┘   └──────────────┘  │
      │                │                    │                      │          │
      │                │                    │                ┌─────┼─────┐    │
      │                │                    │                │     │     │    │
      │                │                    │                ▼     ▼     ▼    │
      │                │                    │     ┌──────────┐ ┌──────┐ ┌─────────┴─┐
      │                │                    │     │  ORDER   │ │REFUSED│ │ ADJOURNED │
      │                │                    │     │ GRANTED  │ └──────┘ └───────────┘
      │                │                    │     └──────────┘
      │                │                    │
      ├────────────────┼────────────────────┼──────────────────────▶ APPLICATION_WITHDRAWN
      │                │                    │
      └────────────────┴────────────────────┴──────────────────────▶ ON_HOLD ◀────────┐
                                                                        │             │
                                                                        └─────────────┘
                                                                       (return to prev)
```

---

## Out of Scope

- Automated status transitions based on events (e.g., document upload)
- Status change notifications to other users/parties
- Scheduled status transitions (e.g., auto-close after X days)
- Bulk status updates across multiple cases
- Status workflow customisation per court
- Integration with external case management systems

---

## Assumptions

1. Status transitions are user-initiated (no automated transitions in MVP)
2. ON_HOLD tracks the previous state internally for return capability
3. Reason/notes are stored in the audit log, not on the case record itself
4. Optimistic locking using `updatedAt` timestamp prevents lost updates
5. Terminal states are truly terminal - no re-opening of closed cases

---

## Design Notes

- Current status should be prominently displayed at top of form
- Available transitions should use GOV.UK radios component
- Consider visual indication of transition impact (e.g., "This will close the case")
- Reason textarea should use GOV.UK character count component
- Success notification should use GOV.UK notification banner

---

## Test Scenarios

### Critical Path Tests

**Test 1: HMCTS Officer views status update page for APPLICATION case**
- Setup: Case in APPLICATION status, user is HMCTS_CASE_OFFICER
- Navigate to `/cases/{id}/status`
- Assert: Page displays 3 radio buttons: DIRECTIONS, ON_HOLD, APPLICATION_WITHDRAWN
- Assert: Current status shows "Application"

**Test 2: Judge views status update page for FINAL_HEARING case**
- Setup: Case in FINAL_HEARING status, user is JUDGE_LEGAL_ADVISER
- Navigate to `/cases/{id}/status`
- Assert: Page displays 4 radio buttons including ORDER_GRANTED, APPLICATION_REFUSED
- Assert: HMCTS officer would NOT see ORDER_GRANTED, APPLICATION_REFUSED options

**Test 3: Terminal case has no transitions**
- Setup: Case in ORDER_GRANTED status
- GET `/api/cases/{id}`
- Assert: `permissions.validTransitions` is an empty array `[]`
- Navigate to `/cases/{id}/status` (if allowed)
- Assert: No radio buttons displayed OR page redirects back to case detail

**Test 4: API permissions object includes validTransitions**
- Setup: Case in APPLICATION status, user is HMCTS_CASE_OFFICER
- GET `/api/cases/{id}`
- Assert: Response includes:
  ```json
  {
    "id": "...",
    "status": "APPLICATION",
    "permissions": {
      "canEdit": true,
      "canUpdateStatus": true,
      "canDelete": true,
      "canViewAudit": true,
      "validTransitions": ["DIRECTIONS", "ON_HOLD", "APPLICATION_WITHDRAWN"]
    }
  }
  ```

### Regression Tests

**Regression Test 1: validTransitions missing from API (Bug Fix 2026-02-12)**
- **Bug:** Status update page showed no radio buttons because backend wasn't returning `validTransitions`
- **Test:** GET `/api/cases/{id}` for non-terminal case with authorized user
- **Assert:** Response MUST include `permissions.validTransitions` array
- **Assert:** Array is not undefined or null
- **Related AC:** AC-2a

**Regression Test 2: validTransitions filtered by role**
- **Bug Prevention:** Ensure judicial-only transitions aren't shown to HMCTS officers
- **Test:** GET `/api/cases/{id}` where case is in FINAL_HEARING status
  - As HMCTS_CASE_OFFICER: `validTransitions` should NOT include ORDER_GRANTED or APPLICATION_REFUSED
  - As JUDGE_LEGAL_ADVISER: `validTransitions` SHOULD include ORDER_GRANTED and APPLICATION_REFUSED
- **Related AC:** AC-4
