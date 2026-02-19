# Story 4 — Trend Data Aggregation API

## User story
As any pilot-role user, I need the system to aggregate pulse responses into bi-weekly windows and compute per-section mean scores and Alignment Index so that the visualisation page can display accurate, role-diverse trend data.

---

## Context / scope
- Roles with read access: `PILOT_BUILDER`, `PILOT_SME`, `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER`
- Route:
  - `GET /api/pilot/pulse/trends` — returns aggregated window data (no raw responses)
- Aggregation is performed server-side; raw question values are never sent to the client
- Alignment Index is computed at read time across all responses in each time window
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Sections 2, 6)

---

## Acceptance criteria

**AC-1 — Time windows are grouped in 14-day intervals anchored from the earliest response**
- Given responses with `submitted_at` dates spanning multiple fortnights,
- When `GET /api/pilot/pulse/trends` is called,
- Then the response body contains an ordered array of windows,
- And each window object includes: `windowStart` (ISO date), `windowIndex` (integer from 1), and per-section aggregates,
- And each response falls into exactly one window based on its `submitted_at` date.

**AC-2 — Mean Structural Score and mean Clarity Score are computed per section per window**
- Given a window containing multiple responses,
- When the endpoint responds,
- Then each window contains `structuralScore` and `clarityScore` for each of the four sections,
- And each value is the arithmetic mean of the corresponding stored scores for that window's responses.

**AC-3 — Alignment Index is computed as mean standard deviation per section per window**
- Given a window containing responses from at least two different roles (`PILOT_BUILDER` and `PILOT_SME`),
- When the endpoint responds,
- Then each section's `alignmentIndex` is the mean of the standard deviations of Q1/Q2/Q3 (S1), Q4/Q5/Q6 (S2), Q7/Q8/Q9 (S3), Q10/Q11/Q12 (S4) computed across all responses in that window.

**AC-4 — Single-role window suppresses Alignment Index with an explicit warning**
- Given a window where all responses share the same role,
- When the endpoint responds,
- Then each section's `alignmentIndex` is `null`,
- And the window object includes `alignmentWarning: "Insufficient role diversity for alignment calculation"`.

**AC-5 — Fewer than 3 complete windows triggers an insufficient-data flag**
- Given fewer than 3 distinct bi-weekly windows exist in `pilot_pulse_responses`,
- When the endpoint responds,
- Then the response body includes `trendInferenceSuppressed: true`,
- And window data for existing windows is still returned.

**AC-6 — No data returns an explicit empty state**
- Given the `pilot_pulse_responses` table contains no rows,
- When the endpoint responds,
- Then HTTP 200 is returned with `windows: []` and `trendInferenceSuppressed: true`.

**AC-7 — Raw question values and free text are not included in the response**
- Given any state of the `pilot_pulse_responses` table,
- When the endpoint responds,
- Then no `q1`–`q12` values, no individual response rows, and no `free_text` content are present in the response body.

---

## Out of scope
- Chart rendering (covered in `story-trend-charts.md`)
- Governance signal flag evaluation (covered in `story-governance-signals.md`)
- Filtering or paginating trend data by date range
- Export or download of aggregate data
