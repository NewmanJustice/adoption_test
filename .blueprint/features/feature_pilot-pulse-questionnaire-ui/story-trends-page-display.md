# Story 4 — Trends Page Display

## User story
As any pilot role, I want to view per-section structural and clarity scores from past pulse windows on the trends page, so that I can understand how the pilot's structural health has changed over time.

---

## Context / scope
- Roles: `PILOT_BUILDER`, `PILOT_SME`, `PILOT_OBSERVER`, `PILOT_OBSERVER`
- Route: `GET /pilot/pulse/trends`
- Entry: User clicks "Structural trends" link in the PilotSidebar
- Data source: `GET /api/pilot/pulse/trends` — fetched on mount with `credentials: 'include'`
- No external charting library; data rendered as GOV.UK summary cards and an accessible HTML table

---

## Acceptance criteria

**AC-1 — Loading state shown while fetch is in-flight**
- Given I navigate to `/pilot/pulse/trends`,
- When the `GET /api/pilot/pulse/trends` request has not yet resolved,
- Then a `govuk-body` loading text is rendered in place of the results.

**AC-2 — Error state shown on fetch failure**
- Given the `GET /api/pilot/pulse/trends` request fails (non-200 response or network error),
- When the error is received,
- Then a `govuk-error-message` is rendered with a human-readable message (e.g. "Unable to load trend data."),
- And no score content or table is rendered.

**AC-3 — Insufficient-data notice shown when `trendInferenceSuppressed: true`**
- Given the API responds with `trendInferenceSuppressed: true`,
- When the page renders,
- Then a GOV.UK `govuk-inset-text` notice is rendered above results with the text: *"Insufficient data for trend inference. At least 3 pulse windows are needed."*
- And score summary cards are not rendered (table may still render raw window data if `windows` is non-empty).

**AC-4 — Per-section scores rendered as summary cards or equivalent**
- Given the API responds with `trendInferenceSuppressed: false` and `windows` contains data,
- When the page renders,
- Then for each of the four sections I can see the section name, Structural Score, and Clarity Score
- And scores that are `null` (suppressed) are shown as "N/A".

**AC-5 — Accessible data table always rendered when `windows` is non-empty**
- Given the API responds with at least one window in the `windows` array,
- When the page renders,
- Then an HTML `<table>` with column headers "Window Start", "Section", "Structural Score", "Clarity Score", "Alignment Index" is rendered below the summary content,
- And `null` values are shown as "N/A" in each cell,
- And the table has a `<caption>` describing its contents for screen-reader users.

**AC-6 — Accessibility compliance**
- Given the page has rendered with data,
- When an automated accessibility check is run,
- Then the page passes `jest-axe` `toHaveNoViolations`.

---

## Session persistence

No session data is written. API response is held in component state only.

---

## Out of scope
- External chart rendering (line graphs, variance bands) — explicitly deferred; table is the only visual representation
- Filtering or pagination of trend windows
- Free-text display (not returned by trends API)
- Downloading or exporting trend data
