# Story 2 — Questionnaire Submission & Confirmation

## User story
As a `PILOT_BUILDER` or `PILOT_SME`, I want to submit my completed pulse questionnaire and receive a clear confirmation, so that I know my response has been recorded and I can return to the pilot dashboard.

---

## Context / scope
- Roles: `PILOT_BUILDER`, `PILOT_SME`
- Routes:
  - `POST /api/pilot/pulse` (API call, not a page route)
  - On success: navigate to `GET /pilot` with confirmation banner
- Entry: User clicks "Submit pulse" on `/pilot/pulse/questionnaire`
- Exit: On success → `/pilot`; on validation failure → stays on form; on API error → stays on form

---

## Acceptance criteria

**AC-1 — Client-side validation blocks submission if any radio is unselected**
- Given I have not selected a radio option for one or more of the 12 questions,
- When I click "Submit pulse",
- Then no POST request is made,
- And a GOV.UK error summary is rendered at the top of the page listing each unanswered question,
- And each error in the summary links to its corresponding radio group,
- And focus moves programmatically to the error summary.

**AC-2 — Valid form POSTs correct payload to `/api/pilot/pulse`**
- Given I have selected a radio option (1–5) for all 12 questions,
- When I click "Submit pulse",
- Then a POST request is made to `/api/pilot/pulse` with `credentials: 'include'` and a JSON body containing `{ q1, q2, ..., q12 }` as numbers,
- And `freeText` is included in the body only if the textarea contains non-empty content.

**AC-3 — On 201 response: navigate to `/pilot` with success banner**
- Given the POST to `/api/pilot/pulse` returns HTTP 201,
- When the response is received,
- Then the user is navigated to `/pilot` (via React Router with `{ state: { submitted: true } }`),
- And the pilot dashboard renders a GOV.UK `govuk-panel--confirmation` banner with the heading "Pulse questionnaire submitted".

**AC-4 — Confirmation banner only shown when navigated from submission**
- Given I navigate to `/pilot` directly (not via questionnaire submission),
- When the page loads,
- Then no confirmation banner is rendered.

**AC-5 — On API error: error summary displayed and form state preserved**
- Given the POST to `/api/pilot/pulse` returns a non-201 response (e.g. 400 or 500),
- When the response is received,
- Then the user remains on `/pilot/pulse/questionnaire`,
- And a GOV.UK error summary is rendered with a human-readable message (e.g. "There was a problem submitting your response. Please try again."),
- And all previously selected radio values and textarea content remain intact.

**AC-6 — Free-text field omitted from payload when empty**
- Given I leave the free-text textarea blank and all 12 radio groups are answered,
- When I click "Submit pulse",
- Then the POST body does not include a `freeText` key (or includes `freeText: undefined`).

---

## Session persistence

No client-side session state is modified. The server creates a `pilot_pulse_response` record on 201.

---

## Out of scope
- Preventing duplicate submissions within a time window (server-enforced, not client-enforced)
- A dedicated `/pilot/pulse/submitted` confirmation page
- Email or notification on submission
