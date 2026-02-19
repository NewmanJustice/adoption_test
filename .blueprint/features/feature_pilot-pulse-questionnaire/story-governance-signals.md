# Story 6 — Governance Signal Flags

## User story
As a `PILOT_DELIVERY_LEAD` or any pilot-role user viewing the visualisation page, I want governance signal flags to be computed from the latest complete window and displayed prominently so that I can identify structural risk conditions requiring attention.

---

## Context / scope
- Flags are evaluated server-side and returned as part of `GET /api/pilot/pulse/trends`
- Flags are displayed on the visualisation page (`GET /pilot/pulse/trends`)
- Signals evaluated against the **most recent complete bi-weekly window only**
- Two severity levels: 🔴 (critical) and 🟠 (warning)
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Sections 2, 6)

---

## Acceptance criteria

**AC-1 — 🔴 flag raised when any section Structural Score is below 3.0 in the latest window**
- Given the latest complete window contains a section where `structuralScore < 3.0`,
- When `GET /api/pilot/pulse/trends` is called,
- Then the response includes a critical signal: `{ level: "critical", code: "LOW_STRUCTURAL_SCORE", section: "<section name>" }`,
- And this flag is displayed as a 🔴 alert on the visualisation page identifying the affected section.

**AC-2 — 🔴 flag raised when any section Alignment Index is ≥ 1.0 in the latest window**
- Given the latest complete window contains a section where `alignmentIndex >= 1.0`,
- When `GET /api/pilot/pulse/trends` is called,
- Then the response includes a critical signal: `{ level: "critical", code: "HIGH_ALIGNMENT_INDEX", section: "<section name>" }`,
- And this flag is displayed as a 🔴 alert on the visualisation page.

**AC-3 — 🟠 flag raised when Structural Score is stable but Clarity Score has fallen over two consecutive windows**
- Given the two most recent windows for a section show `structuralScore` within ±0.1 of each other,
- And `clarityScore` in the latest window is lower than in the previous window,
- When the endpoint responds,
- Then the response includes a warning signal: `{ level: "warning", code: "CLARITY_FALLING", section: "<section name>" }`,
- And this flag is displayed as a 🟠 alert on the visualisation page.

**AC-4 — 🟠 flag raised when Alignment Index has increased over two consecutive windows**
- Given the two most recent windows for a section both have a non-null `alignmentIndex`,
- And the latest window's `alignmentIndex` is greater than the previous window's `alignmentIndex`,
- When the endpoint responds,
- Then the response includes a warning signal: `{ level: "warning", code: "ALIGNMENT_INCREASING", section: "<section name>" }`,
- And this flag is displayed as a 🟠 alert on the visualisation page.

**AC-5 — No flags are shown when no signal conditions are met**
- Given the latest window has all section Structural Scores ≥ 3.0, all Alignment Indices < 1.0, no falling Clarity, and no increasing variance,
- When the visualisation page is rendered,
- Then no signal flags are displayed,
- And a notice reads *"No governance signals active."*

**AC-6 — Signal flags are suppressed when fewer than 2 windows exist**
- Given fewer than 2 complete windows exist (making consecutive-window comparisons impossible),
- When the endpoint responds,
- Then no warning signals requiring consecutive-window comparison (AC-3, AC-4) are evaluated,
- And the response returns `signals: []` for those signal types with a note that insufficient windows exist.

---

## Out of scope
- Sending notifications or alerts outside the visualisation page
- Recording or auditing which flags have been seen by which users
- Manual flag dismissal or acknowledgement
- Signal evaluation for historical windows (only latest window evaluated)
