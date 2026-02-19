# Test Specification — Pilot Pulse Questionnaire UI

## Brief Understanding

This feature adds two new React pages (`PilotPulseQuestionnairePage` and `PilotPulseTrendsPage`) and updates `PilotSidebar` to surface role-conditional navigation links. The questionnaire page renders a 12-question Likert form (4 sections × 3 questions) with client-side validation and POSTs to `/api/pilot/pulse`. The trends page fetches `/api/pilot/pulse/trends` and renders structural/clarity scores, governance signal flags (using GOV.UK warning/inset-text patterns), and an accessible data table. Access is role-gated: questionnaire for `PILOT_BUILDER`/`PILOT_SME` only; trends for all `PILOT_*` roles. Sidebar links are conditionally rendered by role. `PILOT_DELIVERY_LEAD` does not exist — the only pilot roles are `PILOT_BUILDER`, `PILOT_SME`, and `PILOT_OBSERVER`.

## AC → Test ID Mapping

| Story | AC | Test ID | Scenario |
|-------|----|---------|----------|
| S1 — Form Rendering | AC-1 | T-S1.1 | Four sections render with correct headings |
| S1 | AC-1 | T-S1.2 | Q1 question text renders in Section 1 |
| S1 | AC-2 | T-S1.3 | Five labelled radio options per question (Strongly Disagree → Strongly Agree) |
| S1 | AC-3 | T-S1.4 | Optional free-text textarea renders with correct hint |
| S1 | AC-3 | T-S1.5 | Free-text textarea is not marked required |
| S1 | AC-4 | T-S1.6 | "Submit pulse" button renders |
| S1 | AC-5 | T-S1.7 | Loading state shown while session resolves |
| S1 | AC-6 | T-S1.8 | Accessibility: page passes jest-axe toHaveNoViolations |
| S2 — Submission | AC-1 | T-S2.1 | Validation blocks submit if any radio unselected |
| S2 | AC-1 | T-S2.2 | Error summary rendered when validation fails |
| S2 | AC-1 | T-S2.3 | No fetch POST made when validation fails |
| S2 | AC-2 | T-S2.4 | Valid form POSTs correct JSON payload to /api/pilot/pulse |
| S2 | AC-2 | T-S2.5 | POST uses credentials: 'include' |
| S2 | AC-3 | T-S2.6 | On 201: navigates to /pilot with submitted state |
| S2 | AC-5 | T-S2.7 | On API error: error summary displayed, user stays on form |
| S2 | AC-5 | T-S2.8 | On API error: previously selected radio values preserved |
| S2 | AC-6 | T-S2.9 | freeText omitted from POST body when textarea is empty |
| S3 — Access Control | AC-1 | T-S3.1 | PILOT_BUILDER can access questionnaire page (form renders) |
| S3 | AC-1 | T-S3.2 | PILOT_SME can access questionnaire page (form renders) |
| S3 | AC-2 | T-S3.3 | PILOT_OBSERVER redirected to /pilot from questionnaire page |
| S3 | AC-3 | T-S3.4 | HMCTS_CASE_OFFICER redirected to /pilot from questionnaire page |
| S3 | AC-4 | T-S3.5 | PILOT_BUILDER can access trends page (content renders) |
| S3 | AC-4 | T-S3.6 | PILOT_SME can access trends page |
| S3 | AC-4 | T-S3.7 | PILOT_OBSERVER can access trends page |
| S3 | AC-5 | T-S3.8 | HMCTS_CASE_OFFICER redirected to /dashboard from trends page |
| S3 | AC-6 | T-S3.9 | No redirect fires while session is loading (questionnaire) |
| S3 | AC-6 | T-S3.10 | No redirect fires while session is loading (trends) |
| S4 — Trends Display | AC-1 | T-S4.1 | Loading state shown while fetch in-flight |
| S4 | AC-2 | T-S4.2 | Error state shown on fetch failure |
| S4 | AC-3 | T-S4.3 | trendInferenceSuppressed notice rendered |
| S4 | AC-3 | T-S4.4 | Score cards not rendered when trendInferenceSuppressed: true |
| S4 | AC-4 | T-S4.5 | Per-section scores render section name and scores |
| S4 | AC-4 | T-S4.6 | Null scores shown as "N/A" |
| S4 | AC-5 | T-S4.7 | Accessible data table renders with correct column headers |
| S4 | AC-5 | T-S4.8 | Table has a caption element |
| S4 | AC-6 | T-S4.9 | Trends page passes jest-axe toHaveNoViolations |
| S5 — Signals | AC-1 | T-S5.1 | Red signal renders as govuk-warning-text |
| S5 | AC-1 | T-S5.2 | Red signal message displayed verbatim |
| S5 | AC-1 | T-S5.3 | Red signal section label rendered |
| S5 | AC-2 | T-S5.4 | Amber signal renders as govuk-inset-text |
| S5 | AC-2 | T-S5.5 | Amber signal message displayed verbatim |
| S5 | AC-3 | T-S5.6 | No signals section rendered when signals array is empty |
| S5 | AC-4 | T-S5.7 | Multiple mixed-severity signals all render |
| S5 | AC-5 | T-S5.8 | Signals section appears before score summary in DOM order |
| S6 — Sidebar | AC-1 | T-S6.1 | PILOT_BUILDER sees "Pulse questionnaire" link |
| S6 | AC-1 | T-S6.2 | PILOT_BUILDER sees "Structural trends" link |
| S6 | AC-2 | T-S6.3 | PILOT_SME sees both links |
| S6 | AC-3 | T-S6.4 | PILOT_OBSERVER sees "Structural trends" but not "Pulse questionnaire" |
| S6 | AC-4 | T-S6.5 | HMCTS_CASE_OFFICER sees neither new link |
| S6 | AC-5 | T-S6.6 | Active link on /pilot/pulse/questionnaire has bold class |
| S6 | AC-5 | T-S6.7 | Active link on /pilot/pulse/trends has bold class |
| S6 | AC-6 | T-S6.8 | Neither link renders while session is loading (user is null) |

## Key Assumptions

- `PILOT_DELIVERY_LEAD` role does NOT exist. The three pilot roles are `PILOT_BUILDER`, `PILOT_SME`, and `PILOT_OBSERVER`.
- Components live at `client/src/pages/PilotPulseQuestionnairePage.tsx`, `client/src/pages/PilotPulseTrendsPage.tsx`, and `client/src/components/pilot/PilotSidebar.tsx`.
- `useSession` is mocked via `jest.mock('../context/SessionContext')` returning `{ user: { role }, isAuthenticated: true, loading: false }`.
- React Router navigation (`navigate`) is mocked via `jest.mock('react-router-dom', ...)` wrapping the actual module.
- Fetch is mocked as `global.fetch = jest.fn()` before each test that requires it.
- Tests for rendering components use `test.todo` until the component files exist — tests are written to describe intended behaviour and will fail gracefully with a clear message if the file is not found.
- The confirmation banner (AC-3 of S2) lives on `PilotDashboardPage` and reads from `location.state.submitted`. Tests for this are on the dashboard render path.
