# Test Spec — Pilot Pulse Questionnaire

## Understanding
A recurring structural-health questionnaire for PILOT_BUILDER and PILOT_SME roles. Respondents answer 12 Likert (1–5) questions across 4 sections plus an optional free-text field. Scores (Structural Score = mean of first two Qs per section; Clarity Score = third Q per section) are computed server-side and stored immutably. An aggregation API groups responses into 14-day windows and computes mean scores and Alignment Index (std dev across roles). A visualisation page shows trend charts with governance signal flags. Access is role-gated throughout.

Key behaviours: submit (PILOT_BUILDER/SME only) → validate → compute scores → persist; read trends (all pilot roles) → aggregate windows → evaluate signals → render charts.

## AC → Test ID Mapping

| Story | AC | Test ID | Scenario |
|-------|----|---------|----------|
| story-submission-api | AC-1 | T-API-1.1 | DB schema has correct columns, no user_id |
| story-submission-api | AC-2 | T-API-2.1 | Valid POST returns 201, row persisted with session role |
| story-submission-api | AC-3 | T-API-3.1 | Missing q returns 400 with field list |
| story-submission-api | AC-3 | T-API-3.2 | Out-of-range q value returns 400 |
| story-submission-api | AC-4 | T-API-4.1 | Omitted free_text stored as NULL |
| story-submission-api | AC-4 | T-API-4.2 | HTML in free_text is sanitised before storage |
| story-submission-api | AC-5 | T-API-5.1 | Body-supplied role is ignored; session role used |
| story-submission-api | AC-6 | T-API-6.1 | PUT/PATCH/DELETE to /api/pilot/pulse/:id returns 404 or 405 |
| story-submit-questionnaire | AC-1 | T-FORM-1.1 | GET /pilot/pulse/questionnaire renders 4 sections with 12 radio groups |
| story-submit-questionnaire | AC-2 | T-FORM-2.1 | Free-text label and "Do not include personal data" hint present |
| story-submit-questionnaire | AC-3 | T-FORM-3.1 | Client-side: submit with missing answers shows error summary |
| story-submit-questionnaire | AC-4 | T-FORM-4.1 | Valid submit → redirect to /pilot with success banner |
| story-submit-questionnaire | AC-5 | T-FORM-5.1 | Server 400 → error summary shown, page preserved |
| story-submit-questionnaire | AC-6 | T-FORM-6.1 | PILOT_DELIVERY_LEAD gets 403; no submit button rendered |
| story-submit-questionnaire | AC-6 | T-FORM-6.2 | PILOT_OBSERVER gets 403 on questionnaire route |
| story-submit-questionnaire | AC-7 | T-FORM-7.1 | Page passes jest-axe with no violations |
| story-score-computation | AC-1 | T-SCORE-1.1 | Structural scores = mean of first two Qs per section (known inputs) |
| story-score-computation | AC-2 | T-SCORE-2.1 | Clarity scores = raw third Q per section |
| story-score-computation | AC-3 | T-SCORE-3.1 | Raw q1–q12 and computed scores in same row |
| story-score-computation | AC-4 | T-SCORE-4.1 | Recomputing formula from stored q values matches stored scores |
| story-score-computation | AC-5 | T-SCORE-5.1 | Computation error rolls back transaction, returns 500, no partial row |
| story-trend-data-api | AC-1 | T-TREND-1.1 | Windows grouped in 14-day intervals, each has windowStart + windowIndex |
| story-trend-data-api | AC-2 | T-TREND-2.1 | Mean structuralScore and clarityScore present per section per window |
| story-trend-data-api | AC-3 | T-TREND-3.1 | alignmentIndex = mean std dev when multiple roles present |
| story-trend-data-api | AC-4 | T-TREND-4.1 | Single-role window → alignmentIndex null + alignmentWarning message |
| story-trend-data-api | AC-5 | T-TREND-5.1 | Fewer than 3 windows → trendInferenceSuppressed: true, windows still returned |
| story-trend-data-api | AC-6 | T-TREND-6.1 | Empty table → 200, windows: [], trendInferenceSuppressed: true |
| story-trend-data-api | AC-7 | T-TREND-7.1 | Response contains no q1–q12, no individual rows, no free_text |
| story-trend-charts | AC-1 | T-CHART-1.1 | Visualisation page renders four labelled chart areas |
| story-trend-charts | AC-2 | T-CHART-2.1 | X-axis shows window dates ascending; data points match mean values |
| story-trend-charts | AC-3 | T-CHART-3.1 | alignmentWarning windows suppress variance band + show inline notice |
| story-trend-charts | AC-4 | T-CHART-4.1 | trendInferenceSuppressed → GOV.UK inset text shown above charts |
| story-trend-charts | AC-5 | T-CHART-5.1 | Empty windows → no charts, GOV.UK inset "No pulse responses" message |
| story-trend-charts | AC-6 | T-CHART-6.1 | Summary data table present below each chart; page passes jest-axe |
| story-governance-signals | AC-1 | T-SIG-1.1 | structuralScore < 3.0 → critical LOW_STRUCTURAL_SCORE signal in response |
| story-governance-signals | AC-2 | T-SIG-2.1 | alignmentIndex >= 1.0 → critical HIGH_ALIGNMENT_INDEX signal |
| story-governance-signals | AC-3 | T-SIG-3.1 | Structural stable (±0.1), clarity falling → warning CLARITY_FALLING |
| story-governance-signals | AC-4 | T-SIG-4.1 | alignmentIndex increasing two consecutive windows → warning ALIGNMENT_INCREASING |
| story-governance-signals | AC-5 | T-SIG-5.1 | No signal conditions met → no flags, "No governance signals active" shown |
| story-governance-signals | AC-6 | T-SIG-6.1 | Fewer than 2 windows → consecutive signals not evaluated, signals: [] |
| story-sidenav-navigation | AC-1 | T-NAV-1.1 | PILOT_BUILDER/SME sidenav includes "Pulse questionnaire" link |
| story-sidenav-navigation | AC-2 | T-NAV-2.1 | PILOT_DELIVERY_LEAD/OBSERVER sidenav has no "Pulse questionnaire" link |
| story-sidenav-navigation | AC-3 | T-NAV-3.1 | All pilot roles see "Structural trends" sidenav link |
| story-sidenav-navigation | AC-4 | T-NAV-4.1 | DELIVERY_LEAD direct navigate to questionnaire → 403 |
| story-sidenav-navigation | AC-5 | T-NAV-5.1 | Non-pilot role direct navigate to /pilot/pulse/trends → 403 |
| story-sidenav-navigation | AC-6 | T-NAV-6.1 | Unauthenticated access to either route → redirect to login |

## Key Assumptions
- `POST /api/pilot/pulse` and `GET /api/pilot/pulse/trends` are the canonical API endpoints
- Score computation is unit-testable via an exported pure function or by inspecting the persisted row
- The test runner uses supertest against the Express app (same pattern as existing feature tests)
- DB interactions in scaffold tests use an in-memory or test database; score/computation tests use direct function unit tests where DB is unavailable
- Free-text sanitisation strips HTML tags/script content; the exact library is an implementation detail
- Alignment Index computation precision is tested to 4 decimal places
- Client rendering tests (FORM, CHART) are marked `test.todo` where jsdom/React rendering requires the client test project; server-side route access tests run in the scaffold suite
