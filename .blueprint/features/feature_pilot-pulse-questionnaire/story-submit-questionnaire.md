# Story 2 — Questionnaire Form Submission Journey

## User story
As a `PILOT_BUILDER` or `PILOT_SME`, I want to navigate to the pulse questionnaire from the pilot dashboard, complete all 12 Likert questions and an optional free-text field, and submit my response, so that my structural perception is recorded for the pilot.

---

## Context / scope
- Roles with access: `PILOT_BUILDER`, `PILOT_SME` only
- Roles without access: `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER` (no submit capability)
- Routes:
  - `GET /pilot/pulse/questionnaire` — render questionnaire form
  - `POST /api/pilot/pulse` — submit responses (API call from form)
- This story covers: form rendering, validation, submission, confirmation, and role access guard
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Sections 2–4)

---

## Acceptance criteria

**AC-1 — Form renders all 12 questions in four labelled sections**
- Given an authenticated `PILOT_BUILDER` or `PILOT_SME` user navigates to `/pilot/pulse/questionnaire`,
- When the page loads,
- Then four sections are displayed: *Authority & Decision Structure* (Q1–Q3), *Service Intent & Boundaries* (Q4–Q6), *Lifecycle & Operational Modelling* (Q7–Q9), *Architectural & Dependency Discipline* (Q10–Q12),
- And each question renders as a GOV.UK radios component with five options labelled 1 (Strongly Disagree) to 5 (Strongly Agree),
- And each radio group uses a `<fieldset>` with a visible `<legend>` containing the question text.

**AC-2 — Free-text field is optional and labelled with a personal-data reminder**
- Given the form is rendered,
- When the user views the free-text area,
- Then the label reads *"Where does structural clarity feel weakest right now?"*,
- And hint text states *"Do not include personal data."*,
- And the field is not required for successful submission.

**AC-3 — Client-side validation prevents submission with unanswered required questions**
- Given one or more Likert questions have no selection,
- When the user activates the Submit button,
- Then a GOV.UK error summary is displayed at the top of the page listing each unanswered question,
- And each error in the summary links to the corresponding radio group,
- And focus moves to the error summary.

**AC-4 — Successful submission returns user to pilot dashboard with confirmation**
- Given all 12 Likert questions are answered and the form passes server-side validation,
- When the form is submitted,
- Then the user is redirected to `/pilot`,
- And a GOV.UK success notification banner is displayed reading *"Your pulse response has been recorded."*

**AC-5 — Server-side validation errors are surfaced in the form**
- Given the server returns HTTP 400 (e.g. a question value rejected as out of range),
- When the response is received by the client,
- Then a GOV.UK error summary is displayed listing the rejected fields,
- And the user remains on the questionnaire page with previously entered values preserved.

**AC-6 — Unauthorised roles cannot access the questionnaire submission form**
- Given an authenticated user with role `PILOT_DELIVERY_LEAD` or `PILOT_OBSERVER`,
- When they navigate to `/pilot/pulse/questionnaire`,
- Then they are shown a GOV.UK "You do not have permission" page (HTTP 403),
- And the Submit button is not rendered.

**AC-7 — Accessibility compliance**
- Given the form is rendered,
- Then all radio groups meet WCAG 2.1 AA requirements,
- And the page passes `jest-axe` with no violations,
- And all controls are keyboard operable.

---

## Out of scope
- Enforced submission cadence or deadline warnings
- Saving a draft before submission
- Editing or deleting a submitted response
- Displaying previously submitted responses to the user
