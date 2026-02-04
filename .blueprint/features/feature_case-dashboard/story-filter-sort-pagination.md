# Story — Filter, Sort & Pagination

## User story
As a professional user, I want to filter, sort, and paginate my case list so that I can efficiently locate specific cases within a large caseload.

---

## Context / scope
- Professional users with potentially large caseloads
- UI controls for filtering, sorting, and pagination
- Route:
  - `GET /dashboard` (with query parameters)
- Controls interact with the Case List API

---

## Acceptance criteria

**AC-1 — Filter by status**
- Given I am on the dashboard,
- When I select a status from the "Status" dropdown (e.g., "Application", "Directions", "Final Hearing"),
- And I click "Apply filters",
- Then only cases matching that status are displayed,
- And the URL updates to include `?status={value}`.

**AC-2 — Filter by case type**
- Given I am on the dashboard,
- When I select a case type from the "Case type" dropdown (e.g., "Agency Adoption", "Step-Parent"),
- And I click "Apply filters",
- Then only cases matching that type are displayed.

**AC-3 — Filter by date range**
- Given I am on the dashboard,
- When I enter a "From" date and "To" date using GOV.UK date input components,
- And I click "Apply filters",
- Then only cases with a key date within that range are displayed.

**AC-4 — Combined filters**
- Given I apply multiple filters (status AND case type AND date range),
- Then the case list shows only cases matching ALL selected criteria (AND logic).

**AC-5 — Clear filters**
- Given I have active filters applied,
- When I click "Clear filters",
- Then all filter selections are reset,
- And the full unfiltered case list is displayed,
- And the URL query parameters are removed.

**AC-6 — Sort by column**
- Given I click on a sortable column header (Case number, Status, Key date),
- Then the case list is sorted by that column in ascending order,
- And a visual indicator (arrow) shows the current sort column and direction.
- When I click the same column header again,
- Then the sort order toggles to descending.

**AC-7 — Pagination navigation**
- Given there are more than 20 cases (default page size),
- Then pagination controls are displayed below the table,
- And I can navigate to specific pages using numbered links,
- And I can use "Previous" and "Next" links to move between pages.

---

## Filter controls layout

```
[Status dropdown] [Case type dropdown] [Date from] [Date to]
[Apply filters button] [Clear filters link]
```

---

## Out of scope
- Saved filter preferences
- Advanced search (keyword search across case content)
- Custom page size selection
- Export filtered results

---

## References
- Feature Spec: `.blueprint/features/feature_case-dashboard/FEATURE_SPEC.md` (Section 2, In Scope)
- GOV.UK: Select component, Date input component, Pagination component
