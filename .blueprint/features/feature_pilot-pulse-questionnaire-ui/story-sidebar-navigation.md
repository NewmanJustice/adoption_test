# Story 6 — Sidebar Navigation

## User story
As a pilot user, I want the PilotSidebar to show me only the navigation links I am permitted to use, so that I am never presented with links to pages I cannot access.

---

## Context / scope
- Component: `client/src/components/pilot/PilotSidebar.tsx`
- Role source: `useSession()` hook imported directly into `PilotSidebar` (no new props required)
- Conditional rules:
  - "Pulse questionnaire" → `/pilot/pulse/questionnaire` — visible only to `PILOT_BUILDER` and `PILOT_SME`
  - "Structural trends" → `/pilot/pulse/trends` — visible to all pilot roles (any role matching `PILOT_*`)
- Active-link styling: `govuk-!-font-weight-bold` class applied when the current path matches the link's route (consistent with existing "Dashboard" link pattern)

---

## Acceptance criteria

**AC-1 — `PILOT_BUILDER` sees both "Pulse questionnaire" and "Structural trends" links**
- Given I am authenticated as `PILOT_BUILDER`,
- When the PilotSidebar renders,
- Then I see a "Pulse questionnaire" link pointing to `/pilot/pulse/questionnaire`,
- And I see a "Structural trends" link pointing to `/pilot/pulse/trends`.

**AC-2 — `PILOT_SME` sees both links**
- Given I am authenticated as `PILOT_SME`,
- When the PilotSidebar renders,
- Then I see a "Pulse questionnaire" link pointing to `/pilot/pulse/questionnaire`,
- And I see a "Structural trends" link pointing to `/pilot/pulse/trends`.

**AC-3 — `PILOT_OBSERVER` and `PILOT_OBSERVER` see only "Structural trends"**
- Given I am authenticated as `PILOT_OBSERVER` or `PILOT_OBSERVER`,
- When the PilotSidebar renders,
- Then I see a "Structural trends" link pointing to `/pilot/pulse/trends`,
- And I do not see a "Pulse questionnaire" link.

**AC-4 — Non-pilot roles see neither new link**
- Given I am authenticated with a non-pilot role (e.g. `HMCTS_CASE_OFFICER`),
- When the PilotSidebar renders,
- Then neither the "Pulse questionnaire" link nor the "Structural trends" link is rendered.

**AC-5 — Active-link bold styling applied on current route**
- Given I am on `/pilot/pulse/questionnaire`,
- When the PilotSidebar renders,
- Then the "Pulse questionnaire" link has the `govuk-!-font-weight-bold` class applied,
- And the "Structural trends" link does not have that class.
- And conversely, when I am on `/pilot/pulse/trends`, the "Structural trends" link carries `govuk-!-font-weight-bold` and "Pulse questionnaire" does not.

**AC-6 — Neither new link renders while session is loading**
- Given the session context has not yet resolved (`user` is null or loading is true),
- When the PilotSidebar renders,
- Then neither "Pulse questionnaire" nor "Structural trends" links are rendered.

---

## Session persistence

No session data is written. `useSession()` is read-only.

---

## Out of scope
- Sidebar re-ordering or grouping of existing links (Dashboard, Adoption Vision, About the Pilot sections are unchanged)
- Collapsible/expandable section for pulse links (flat list items consistent with the Dashboard link pattern)
- Tooltips or descriptions on the new links
