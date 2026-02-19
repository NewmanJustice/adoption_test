# Story 5 — Governance Signal Display

## User story
As any pilot role viewing the trends page, I want to see active governance signal flags rendered with severity-appropriate styling, so that I can immediately identify structural risks that require attention.

---

## Context / scope
- Roles: `PILOT_BUILDER`, `PILOT_SME`, `PILOT_OBSERVER`, `PILOT_OBSERVER`
- Route: `GET /pilot/pulse/trends`
- Signal data: `signals` array in `GET /api/pilot/pulse/trends` response
- Signal types: `LOW_STRUCTURAL_SCORE` | `HIGH_ALIGNMENT_INDEX` | `CLARITY_FALLING` | `ALIGNMENT_INCREASING`
- Severities: `'red'` | `'amber'`

---

## Acceptance criteria

**AC-1 — Red signals render as GOV.UK warning-text components**
- Given the API response includes at least one signal with `severity: 'red'`,
- When the trends page renders,
- Then each red signal is rendered as a `<div class="govuk-warning-text">` block,
- And the signal `message` from the API response is displayed verbatim,
- And the `section` value is displayed as a context label adjacent to the message.

**AC-2 — Amber signals render as GOV.UK inset-text components**
- Given the API response includes at least one signal with `severity: 'amber'`,
- When the trends page renders,
- Then each amber signal is rendered as a `<div class="govuk-inset-text">` block with an amber left-border applied via an inline `borderLeftColor` style override,
- And the signal `message` is displayed verbatim,
- And the `section` value is displayed as a context label.

> **Assumption (flagged):** GOV.UK Frontend v5 has no built-in amber variant for `govuk-inset-text`. An inline `style={{ borderLeftColor: '#f47738' }}` override is used pending confirmation of a shared utility class in `client/src/styles/`. If a project utility class already exists, it should be used instead.

**AC-3 — Signals section is not rendered when `signals` array is empty**
- Given the API response includes `signals: []`,
- When the trends page renders,
- Then no governance signal section heading or signal blocks are rendered.

**AC-4 — Multiple signals of mixed severity all render**
- Given the API response includes both `'red'` and `'amber'` signals across different sections,
- When the trends page renders,
- Then all signals render in the order returned by the API,
- And each uses its respective severity component.

**AC-5 — Signal section renders above score summary content**
- Given the API response includes at least one signal and score data,
- When the trends page renders,
- Then the signals section appears above the per-section score cards/table in the document order.

---

## Session persistence

No session data is written. Signal data is derived from the trends API response held in component state.

---

## Out of scope
- Dismissing or acknowledging signals (no interactive state on signals)
- Historical signal log (only current signals from the most recent computation are shown)
- Signal type icons beyond the GOV.UK warning-text `⚠` prefix (no custom iconography)
