# Story 5 — Trend Visualisation Charts

## User story
As any pilot-role user, I want to view per-section trend line charts on the visualisation page showing Structural Score, Clarity Score, and variance band over time so that I can interpret structural maturity trends across the pilot.

---

## Context / scope
- Roles with access: `PILOT_BUILDER`, `PILOT_SME`, `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER`
- Route:
  - `GET /pilot/pulse/trends` — render the visualisation page
- Page consumes data from `GET /api/pilot/pulse/trends`
- One chart set rendered per section (four sections)
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Sections 2, 4, 8)

---

## Acceptance criteria

**AC-1 — Visualisation page renders four chart sets, one per section**
- Given the trend data API returns windows with data for all four sections,
- When the user navigates to `/pilot/pulse/trends`,
- Then four labelled chart areas are displayed: *Authority & Decision Structure*, *Service Intent & Boundaries*, *Lifecycle & Operational Modelling*, *Architectural & Dependency Discipline*,
- And each chart area contains a Structural Score trend line, a Clarity Score trend line, and a variance band representing the Alignment Index.

**AC-2 — Trend lines render correctly against the x-axis (time windows)**
- Given three or more bi-weekly windows are present in the API response,
- When the charts are rendered,
- Then the x-axis displays window start dates in ascending order,
- And each data point on the Structural Score and Clarity Score lines corresponds to the mean value for that window and section.

**AC-3 — Variance band is suppressed for windows with single-role responses**
- Given one or more windows in the API response include `alignmentWarning`,
- When the chart is rendered for those windows,
- Then no variance band is drawn for the affected window(s),
- And a visible inline notice reads *"Insufficient role diversity for alignment calculation"* adjacent to or below the chart for that window.

**AC-4 — Insufficient data notice is displayed when fewer than 3 windows exist**
- Given the API response includes `trendInferenceSuppressed: true`,
- When the page renders,
- Then a GOV.UK inset text component is displayed above all charts reading *"Insufficient data for trend inference. At least 3 pulse windows are required."*,
- And any available partial charts are still shown below the notice.

**AC-5 — Empty state renders when no data exists**
- Given the API response contains `windows: []`,
- When the page renders,
- Then no charts are displayed,
- And a GOV.UK inset text component reads *"No pulse responses have been submitted yet. Complete the first questionnaire to begin tracking structural maturity."*

**AC-6 — Accessible data table is shown below each chart**
- Given a chart is rendered with at least one data point,
- When the page is displayed,
- Then a summary table below each chart contains the same data as the chart (window date, Structural Score, Clarity Score, Alignment Index or suppression reason),
- And the table is visible to all users (not hidden),
- And the page passes `jest-axe` with no violations.

---

## Out of scope
- Governance signal flags (covered in `story-governance-signals.md`)
- Sidenav navigation link to this page (covered in `story-sidenav-navigation.md`)
- Interactive chart drill-down or filtering
- Displaying free-text submissions on this page
