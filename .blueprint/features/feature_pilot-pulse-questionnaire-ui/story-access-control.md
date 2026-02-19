# Story 3 — Access Control

## User story
As the system, I want to enforce role-based access on the questionnaire and trends pages so that only permitted pilot roles can reach each page, and all others are silently redirected without seeing restricted content.

---

## Context / scope
- Access rules apply on component mount, before page content renders
- Source of truth: `user.role` from `useSession()` context
- Questionnaire permitted roles: `PILOT_BUILDER`, `PILOT_SME`
- Trends permitted roles: any role starting with `PILOT_` (`PILOT_BUILDER`, `PILOT_SME`, `PILOT_OBSERVER`, `PILOT_OBSERVER`)
- Routes affected: `GET /pilot/pulse/questionnaire`, `GET /pilot/pulse/trends`

---

## Acceptance criteria

**AC-1 — `PILOT_BUILDER` and `PILOT_SME` can access the questionnaire page**
- Given I am authenticated as `PILOT_BUILDER` or `PILOT_SME`,
- When I navigate to `/pilot/pulse/questionnaire`,
- Then the questionnaire form renders.

**AC-2 — Pilot roles without submit permission are redirected from the questionnaire page**
- Given I am authenticated as `PILOT_OBSERVER` or `PILOT_OBSERVER`,
- When I navigate to `/pilot/pulse/questionnaire`,
- Then I am immediately redirected to `/pilot` (replace: true),
- And the questionnaire form never renders.

**AC-3 — Non-pilot roles are redirected from the questionnaire page**
- Given I am authenticated with a non-pilot role (e.g. `HMCTS_CASE_OFFICER`, `ADOPTER`),
- When I navigate to `/pilot/pulse/questionnaire`,
- Then I am immediately redirected to `/pilot` (replace: true).

**AC-4 — All four pilot roles can access the trends page**
- Given I am authenticated as `PILOT_BUILDER`, `PILOT_SME`, `PILOT_OBSERVER`, or `PILOT_OBSERVER`,
- When I navigate to `/pilot/pulse/trends`,
- Then the trends page renders (loading state or data).

**AC-5 — Non-pilot roles are redirected from the trends page to `/dashboard`**
- Given I am authenticated with a non-pilot role,
- When I navigate to `/pilot/pulse/trends`,
- Then I am immediately redirected to `/dashboard` (replace: true),
- And the trends page never renders.

**AC-6 — Redirect does not fire while session is still loading**
- Given the session context has not yet resolved (loading state is true),
- When either page mounts,
- Then no redirect occurs and a loading indicator is shown,
- And the redirect (if required) fires only once `loading` becomes false.

---

## Session persistence

No session data is written. Role check is read-only from `useSession()`.

---

## Out of scope
- Server-side route protection (handled by API middleware; this story covers client-side guard only)
- Role changes during an active session (handled by session expiry/logout)
