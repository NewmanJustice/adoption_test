# Story — Empty State Handling

## User story
As a professional user, I want to see helpful guidance when no cases are displayed so that I understand why no cases appear and what actions I might take.

---

## Context / scope
- All authenticated users (professional and adopters)
- Handles both "no cases at all" and "no results from filter" scenarios
- Route:
  - `GET /dashboard`
  - `GET /my-cases`

---

## Acceptance criteria

**AC-1 — No cases assigned (new user)**
- Given I am a new user with no cases assigned,
- When I view the dashboard,
- Then I see an empty state message:
  - Heading: "No cases found"
  - Body: "You don't have any cases assigned yet. Cases will appear here once you are assigned to them."
- And the table is not displayed.

**AC-2 — No results from filter**
- Given I have applied filters that match no cases,
- When the filtered results are empty,
- Then I see a message:
  - Heading: "No matching cases"
  - Body: "No cases match your selected filters."
- And a "Clear filters" link is prominently displayed.
- And the active filters remain visible so I can see what is applied.

**AC-3 — Filter indication**
- Given filters are currently active,
- Then a summary shows: "Showing cases filtered by: [Status: Application] [Case type: Agency]"
- So that I understand why fewer cases are displayed.

**AC-4 — Error state**
- Given the case list API returns an error,
- When the dashboard attempts to display cases,
- Then I see an error message:
  - Heading: "Sorry, there is a problem"
  - Body: "We could not load your cases. Please try again later."
- And a "Try again" button is displayed to retry the request.

**AC-5 — Adopter-specific empty state**
- Given I am an adopter with no active cases,
- When I view the "My Cases" page,
- Then I see a trauma-informed message:
  - Heading: "No cases yet"
  - Body: "Your adoption case will appear here once it has been registered with the court. If you have submitted an application and don't see it here, please contact your adoption agency."
- And the tone is supportive and not alarming.

---

## Empty state layout (GOV.UK)

```
+------------------------------------------+
|  [Icon or illustration - optional]       |
|                                          |
|  No cases found                          |
|  ----------------------------------------|
|  You don't have any cases assigned yet.  |
|  Cases will appear here once you are     |
|  assigned to them.                       |
|                                          |
+------------------------------------------+
```

---

## Out of scope
- Animated empty state illustrations
- Suggested actions or onboarding steps
- Help links to external resources

---

## References
- Feature Spec: `.blueprint/features/feature_case-dashboard/FEATURE_SPEC.md` (Section 4, Key Alternatives)
- System Spec: Section 8 (Trauma-Informed Design)
