# Story 7 — Sidenav Navigation & Role-Based Access to Pilot Pages

## User story
As any pilot-role user, I want the pulse questionnaire and trend visualisation to be accessible via the pilot sidenav so that I can navigate to them without needing to know their direct URLs, and so that access is automatically scoped to my role.

---

## Context / scope
- Sidenav is rendered within the pilot section (`/pilot` and child routes)
- Questionnaire link visible to: `PILOT_BUILDER`, `PILOT_SME` only
- Visualisation link visible to: all pilot roles (`PILOT_BUILDER`, `PILOT_SME`, `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER`)
- Routes:
  - `/pilot/pulse/questionnaire` — questionnaire form
  - `/pilot/pulse/trends` — visualisation page
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Sections 2–3)

---

## Acceptance criteria

**AC-1 — Questionnaire sidenav link appears only for PILOT_BUILDER and PILOT_SME**
- Given an authenticated user with role `PILOT_BUILDER` or `PILOT_SME` is on any `/pilot` page,
- When the sidenav is rendered,
- Then a link labelled *"Pulse questionnaire"* is present and navigates to `/pilot/pulse/questionnaire`.

**AC-2 — Questionnaire sidenav link is absent for PILOT_DELIVERY_LEAD and PILOT_OBSERVER**
- Given an authenticated user with role `PILOT_DELIVERY_LEAD` or `PILOT_OBSERVER` is on any `/pilot` page,
- When the sidenav is rendered,
- Then no *"Pulse questionnaire"* link is present.

**AC-3 — Visualisation sidenav link appears for all pilot roles**
- Given an authenticated user with any pilot role is on any `/pilot` page,
- When the sidenav is rendered,
- Then a link labelled *"Structural trends"* is present and navigates to `/pilot/pulse/trends`.

**AC-4 — Direct navigation to questionnaire by unauthorised roles returns 403**
- Given an authenticated user with role `PILOT_DELIVERY_LEAD` or `PILOT_OBSERVER`,
- When they navigate directly to `/pilot/pulse/questionnaire`,
- Then the server returns HTTP 403,
- And a GOV.UK "You do not have permission to access this page" message is displayed.

**AC-5 — Direct navigation to visualisation by any non-pilot role returns 403**
- Given an authenticated user with a non-pilot role (e.g. `HMCTS_CASE_OFFICER`),
- When they navigate directly to `/pilot/pulse/trends`,
- Then the server returns HTTP 403.

**AC-6 — Unauthenticated access to either route redirects to login**
- Given an unauthenticated request to `/pilot/pulse/questionnaire` or `/pilot/pulse/trends`,
- When the request is received,
- Then the user is redirected to the login page.

---

## Out of scope
- Changes to non-pilot sidenav sections
- Sidenav active-state highlighting (may already be handled by existing pilot navigation component)
- Breadcrumb navigation for the new pages
