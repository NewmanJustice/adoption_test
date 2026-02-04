# Story — Dashboard Page Layout

## User story
As a professional user, I want to view my adoption caseload in a clear, accessible table layout so that I can quickly identify and navigate to cases requiring my attention.

---

## Context / scope
- Professional users (HMCTS, Judge, Cafcass, LA SW, VAA)
- GOV.UK Design System compliant page layout
- Route:
  - `GET /dashboard`
- Screen is reached when: user logs in and is redirected to dashboard (per login feature)
- This page displays: paginated case list with key attributes

---

## Acceptance criteria

**AC-1 — Dashboard page structure**
- Given I am an authenticated professional user,
- When I navigate to `/dashboard`,
- Then I see a GOV.UK-compliant page with:
  - Page title "Your cases"
  - Case list table with column headers
  - Pagination controls (if cases exceed page size)

**AC-2 — Case table columns**
- Given the case list table is displayed,
- Then it includes the following columns:
  - Case number (linked)
  - Case type
  - Status
  - Child (initials and age)
  - Local Authority
  - Key date (next action or hearing)
  - Attention indicator

**AC-3 — Case row navigation**
- Given I click on a case number link in the table,
- Then I am navigated to `/cases/{caseId}` (case detail page).

**AC-4 — Mobile responsive layout**
- Given I am viewing the dashboard on a mobile device,
- When the viewport width is less than 640px,
- Then the table adapts to a stacked card layout,
- And all case information remains accessible.

**AC-5 — Loading state**
- Given the page is loading case data,
- When the API request is in progress,
- Then a loading indicator is displayed,
- And the table area shows "Loading cases..." text.

**AC-6 — Accessibility compliance**
- Given the dashboard is rendered,
- Then:
  - The table has proper `<caption>` element,
  - Column headers use `<th scope="col">`,
  - Row headers use `<th scope="row">` where applicable,
  - The page is navigable via keyboard,
  - All interactive elements have visible focus states.

---

## UI components (GOV.UK)
- GOV.UK Table component
- GOV.UK Pagination component
- GOV.UK Tag component (for status)
- GOV.UK Link component (for case navigation)

---

## Out of scope
- Filter controls (separate story)
- Sort functionality (separate story)
- Attention indicator logic (separate story)
- Empty state handling (separate story)

---

## References
- Feature Spec: `.blueprint/features/feature_case-dashboard/FEATURE_SPEC.md` (Section 4, Happy Path)
- System Spec: Section 12.9 (GOV.UK Design System Integration)
