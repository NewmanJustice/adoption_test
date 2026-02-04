# Story — Case List API

## User story
As a professional user, I want to retrieve a list of adoption cases I am permitted to view so that I can access my caseload through the dashboard.

---

## Context / scope
- All authenticated professional users (HMCTS, Judge, Cafcass, LA SW, VAA)
- Backend API endpoint returning paginated, filtered case data
- Route:
  - `GET /api/cases`
- This endpoint returns: case list with key attributes based on user permissions

---

## Acceptance criteria

**AC-1 — Case list retrieval**
- Given I am an authenticated professional user,
- When I request `GET /api/cases`,
- Then I receive a JSON response containing cases I am permitted to view.

**AC-2 — Role-based case visibility**
- Given I am a user assigned to specific cases (by organisation or explicit assignment),
- When I request the case list,
- Then I only see cases where I have a legitimate role.
- And I do not see cases belonging to other organisations or courts.

**AC-3 — Role-based field redaction**
- Given I am a VAA Worker viewing a case,
- When the case data is returned,
- Then birth family addresses are redacted from the response.
- And adopter identifying information is shown only where appropriate.

**AC-4 — Pagination parameters**
- Given I request `GET /api/cases?page=1&pageSize=20`,
- When the response is returned,
- Then it includes a maximum of 20 cases,
- And the response includes pagination metadata (totalCount, currentPage, totalPages).

**AC-5 — Filter parameters**
- Given I request `GET /api/cases?status=Application&caseType=Agency`,
- When the response is returned,
- Then only cases matching the specified status AND case type are included.

**AC-6 — Unauthenticated access**
- Given I am not authenticated,
- When I request `GET /api/cases`,
- Then I receive a 401 Unauthorized response.

---

## API response shape

```json
{
  "data": [
    {
      "id": "uuid",
      "caseNumber": "AD-2026-001234",
      "caseType": "Agency Adoption",
      "status": "Application",
      "applicationDate": "2026-01-15",
      "nextHearingDate": "2026-03-20",
      "parties": {
        "child": { "initials": "JD", "age": 4 },
        "applicants": [{ "name": "Smith" }],
        "localAuthority": "Birmingham City Council"
      },
      "attentionLevel": "normal"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalCount": 45,
    "totalPages": 3
  }
}
```

---

## Out of scope
- Case creation or modification via this endpoint
- Full-text search across case content
- Bulk operations on cases
- Export functionality

---

## References
- Feature Spec: `.blueprint/features/feature_case-dashboard/FEATURE_SPEC.md` (Section 6, Rule: Case Visibility Determination)
- System Spec: Section 7 (Access Rules - Need-to-Know)
