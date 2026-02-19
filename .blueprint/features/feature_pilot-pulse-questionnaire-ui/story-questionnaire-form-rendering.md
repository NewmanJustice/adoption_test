# Story 1 — Questionnaire Form Rendering

## User story
As a `PILOT_BUILDER` or `PILOT_SME`, I want to see a GOV.UK-styled pulse questionnaire form with four labelled sections, three Likert radio groups each, and an optional free-text field, so that I can accurately record my structural health assessment.

---

## Context / scope
- Roles: `PILOT_BUILDER`, `PILOT_SME`
- Route: `GET /pilot/pulse/questionnaire`
- Entry: User clicks "Pulse questionnaire" link in the PilotSidebar
- This screen renders: 12 radio groups (Likert 1–5) across 4 sections, plus one optional textarea

---

## Acceptance criteria

**AC-1 — Four sections render with correct headings and questions**
- Given I am authenticated as `PILOT_BUILDER` or `PILOT_SME` and navigate to `/pilot/pulse/questionnaire`,
- When the page loads,
- Then I see four `<fieldset>` blocks with `<legend>` headings:
  - **Section 1 — Authority & Decision Structure** containing:
    - Q1: "There is a clearly identified individual accountable for sequencing decisions."
    - Q2: "Structural decisions are made quickly when needed."
    - Q3: "I believe there is shared understanding of who holds authority for delivery decisions."
  - **Section 2 — Service Intent & Boundaries** containing:
    - Q4: "The service vision and purpose are clearly articulated."
    - Q5: "The boundary of the service (where it starts and stops) is explicit."
    - Q6: "I believe there is shared understanding of what this service is responsible for."
  - **Section 3 — Lifecycle & Operational Modelling** containing:
    - Q7: "The service lifecycle can be described as a coherent state model."
    - Q8: "Exceptional and edge-case transitions are explicitly identified."
    - Q9: "I believe there is shared understanding of how the lifecycle behaves."
  - **Section 4 — Architectural & Dependency Discipline** containing:
    - Q10: "Non-functional requirements shape sequencing decisions."
    - Q11: "External dependencies are explicitly identified and managed."
    - Q12: "I believe there is shared understanding of architectural constraints."

**AC-2 — Each question renders five labelled radio options**
- Given the page has loaded,
- When I view any of the 12 questions,
- Then I see five radio inputs labelled: "1 — Strongly Disagree", "2 — Disagree", "3 — Unsure", "4 — Agree", "5 — Strongly Agree".
- And each radio group uses the GOV.UK radios pattern with a visible `<label>` for each option.

**AC-3 — Optional free-text textarea renders at foot of form**
- Given the page has loaded,
- When I scroll below Section 4,
- Then I see a `<textarea>` labelled with the hint text: *"Where does structural clarity feel weakest right now? Do not include personal data."*
- And the textarea is not marked as required.

**AC-4 — Form renders a "Submit pulse" submit button**
- Given the page has loaded,
- When I view the foot of the form,
- Then I see a GOV.UK button labelled "Submit pulse".

**AC-5 — Loading state shown while session resolves**
- Given the session context is still loading (authenticated state not yet resolved),
- When the page mounts,
- Then a loading indicator is rendered (`govuk-body` loading text) and the form is not shown.

**AC-6 — Accessibility: fieldset and label structure**
- Given the page has loaded,
- When rendered,
- Then each of the 12 questions is wrapped in a `<fieldset>` with a `<legend>` containing the question text,
- And all radio inputs have associated `<label>` elements,
- And the page passes an automated accessibility check (jest-axe `toHaveNoViolations`).

---

## Session persistence

No session data is persisted at render time. Form state is held in React component state only until submission.

---

## Out of scope
- Server-side pre-population of saved answers (no draft/resume behaviour)
- Character limit enforcement on the textarea (server-side only)
- Question text fetched from an API (hard-coded string literals per assumption in FEATURE_SPEC.md §8)
