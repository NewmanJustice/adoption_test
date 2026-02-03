# Story — List Cases with Role-Based Filtering

## User Story

As an **authenticated user**, I want **to see a list of adoption cases that I have permission to access** so that **I can find and navigate to cases relevant to my role and assignments**.

---

## Context / Scope

- **Story Type:** User-facing feature
- **Actors:** All authenticated users (with role-specific filtering)
- **Dependencies:**
  - Session management infrastructure (user authenticated with role)
  - API authentication middleware
  - Case data model and database schema
  - Case assignment mechanism (for non-HMCTS users)
- **Routes:**
  - `GET /cases` — Display case list page
  - `GET /api/cases` — Retrieve filtered case list
- **This story establishes:**
  - Role-based case visibility
  - Paginated case listing
  - Basic case list display

---

## Acceptance Criteria

**AC-1 — Case list page display**
- Given an authenticated user navigates to `/cases`,
- When the page loads,
- Then a case list is displayed showing cases the user has access to,
- And the list includes columns for: Case Number, Case Type, Status, Assigned Court, Created Date.

**AC-2 — HMCTS Case Officer sees assigned court cases**
- Given an authenticated HMCTS Case Officer,
- When viewing the case list,
- Then the user sees all cases assigned to their court(s),
- And does not see cases from other courts (unless explicitly assigned).

**AC-3 — Judge/Legal Adviser sees assigned cases**
- Given an authenticated Judge or Legal Adviser,
- When viewing the case list,
- Then the user sees only cases where they are explicitly assigned as the judicial officer,
- And does not see unassigned cases.

**AC-4 — Cafcass Officer sees assigned cases**
- Given an authenticated Cafcass Officer,
- When viewing the case list,
- Then the user sees only cases where they are assigned as the Cafcass officer,
- And does not see cases without their assignment.

**AC-5 — Local Authority Social Worker sees LA cases**
- Given an authenticated Local Authority Social Worker,
- When viewing the case list,
- Then the user sees only cases involving children in their Local Authority's care,
- And does not see cases from other Local Authorities.

**AC-6 — Voluntary Adoption Agency Worker sees agency cases**
- Given an authenticated Voluntary Adoption Agency Worker,
- When viewing the case list,
- Then the user sees only cases where their agency is involved,
- And does not see cases without agency involvement.

**AC-7 — Adopter sees own cases only**
- Given an authenticated Adopter,
- When viewing the case list,
- Then the user sees only cases where they are the applicant,
- And the list is displayed at `/my-cases` (redirected from `/cases`).

**AC-8 — Empty state display**
- Given an authenticated user with no accessible cases,
- When viewing the case list,
- Then a message is displayed: "You have no cases to view",
- And no empty table is shown.

**AC-9 — API case list endpoint**
- Given a GET request to `/api/cases`,
- When the request is authenticated,
- Then the response contains a filtered list of cases based on user role and assignments,
- And the response format is:
  ```json
  {
    "success": true,
    "cases": [...],
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "totalCount": 100,
      "totalPages": 4
    }
  }
  ```

**AC-10 — Pagination support**
- Given more than 25 cases match the filter,
- When viewing the case list,
- Then pagination controls are displayed,
- And the user can navigate between pages.

**AC-11 — Pagination API parameters**
- Given a GET request to `/api/cases?page=2&pageSize=25`,
- When the request is processed,
- Then the response returns the appropriate page of results,
- And pagination metadata reflects the current page.

**AC-12 — Case list sorting**
- Given the case list is displayed,
- When viewing the list,
- Then cases are sorted by created date (newest first) by default.

**AC-13 — Case row click navigation**
- Given the case list is displayed,
- When a user clicks on a case row,
- Then the user is navigated to the case detail page `/cases/{id}`.

**AC-14 — Create case button (HMCTS only)**
- Given an HMCTS Case Officer views the case list,
- When the page loads,
- Then a "Create case" button is displayed linking to `/cases/create`.

**AC-15 — Create case button hidden for other roles**
- Given a non-HMCTS Case Officer views the case list,
- When the page loads,
- Then no "Create case" button is displayed.

**AC-16 — Unauthenticated access**
- Given an unauthenticated user navigates to `/cases`,
- When the request is processed,
- Then the user is redirected to `/login`.

**AC-17 — API unauthenticated access**
- Given a GET request to `/api/cases` without authentication,
- When the request is processed,
- Then the API returns HTTP 401 Unauthorized.

**AC-18 — Status displayed with appropriate styling**
- Given a case is displayed in the list,
- When viewing the status column,
- Then the status is displayed with GOV.UK tag styling,
- And terminal statuses (Order Granted, Refused, Withdrawn) are visually distinct.

**AC-19 — Accessibility compliance**
- Given the case list is displayed,
- Then:
  - The table has appropriate headers and scope attributes,
  - Pagination controls are keyboard accessible,
  - Screen readers can navigate the table structure,
  - Colour contrast meets WCAG 2.1 AA standards.

---

## API Request/Response

```js
// GET /api/cases?page=1&pageSize=25
// Response - Success (200)
{
  "success": true,
  "cases": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "caseNumber": "BFC/2026/00001",
      "caseType": "AGENCY_ADOPTION",
      "status": "APPLICATION",
      "assignedCourt": "Birmingham Family Court",
      "createdAt": "2026-02-03T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "caseNumber": "BFC/2026/00002",
      "caseType": "STEP_PARENT_ADOPTION",
      "status": "DIRECTIONS",
      "assignedCourt": "Birmingham Family Court",
      "createdAt": "2026-02-02T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 47,
    "totalPages": 2
  }
}

// Response - Unauthorized (401)
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

---

## Role-Based Filtering Logic

| Role | Filter Criteria |
|------|-----------------|
| HMCTS Case Officer | Cases where `assigned_court` matches user's court assignment |
| Judge / Legal Adviser | Cases where user is assigned as judicial officer |
| Cafcass Officer | Cases where user is assigned as Cafcass officer |
| LA Social Worker | Cases where child's LA matches user's organisation |
| VAA Worker | Cases where user's agency is involved |
| Adopter | Cases where user is the applicant |

---

## Out of Scope

- Advanced search and filtering (by status, date range, case type)
- Sorting by different columns (click to sort)
- Bulk case operations
- Case export to CSV/Excel
- Saved views or filters
- Real-time updates to case list
- Full-text search across case data

---

## Assumptions

1. User-to-court assignment exists for HMCTS Case Officers (seeded or configured)
2. Case-to-user assignment table exists for explicit assignments (Judges, Cafcass)
3. Organisation association exists in user context for LA and VAA workers
4. Adopters are identified by matching user ID to case applicant ID
5. Default page size of 25 is appropriate for all users

---

## Design Notes

- Case list should use GOV.UK table component
- Pagination should use GOV.UK pagination component
- Status tags should use GOV.UK tag component with appropriate colours
- Consider a "Last updated" column for users tracking case progress
- Mobile view may need responsive table pattern or card-based display
