# Feature Specification — Pilot Pulse Questionnaire UI

> **Frontend-only feature.** The backend API (submission endpoint, trends endpoint, score computation, governance signal evaluation) is fully implemented and documented in `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md`. This specification covers only the React SPA layer.

---

## 1. Feature Intent

**Why this feature exists.**

The backend for the pilot pulse questionnaire is complete and production-ready. Pilot participants — `PILOT_BUILDER` and `PILOT_SME` — have no interface through which to submit responses. All pilot roles lack any view of the structural trend data the system is designed to surface. This feature closes that gap by adding:

1. A **questionnaire submission page** that renders the 12-question Likert form and POSTs to the existing `/api/pilot/pulse` endpoint.
2. A **trends visualisation page** that fetches `/api/pilot/pulse/trends` and presents per-section structural scores, clarity scores, governance signal flags, and an accessible data table — without any external charting library dependency.
3. **PilotSidebar updates** that surface both pages via role-conditional navigation links.
4. **App.tsx route registrations** (lazy-loaded) for both new pages.

> **System Spec Alignment:** Continues the Observability classification (`.blueprint/system_specification/SYSTEM_SPEC.md` Section 8) established by the backend feature. No production case management surfaces are touched.

---

## 2. Scope

### In Scope

**PilotPulseQuestionnairePage** (`/pilot/pulse/questionnaire`)
- Accessible to `PILOT_BUILDER` and `PILOT_SME` roles only; non-permitted authenticated users redirected to `/pilot`
- GOV.UK fieldset/legend/radios pattern for each of 4 sections × 3 questions (12 radio groups total)
- Radio options labelled 1–5 with descriptive endpoints: "1 — Strongly Disagree" … "5 — Strongly Agree"
- Section headings matching the four structural preconditions defined in the backend spec:
  - Section 1 — Authority & Decision Structure (Q1–Q3)
  - Section 2 — Service Intent & Boundaries (Q4–Q6)
  - Section 3 — Lifecycle & Operational Modelling (Q7–Q9)
  - Section 4 — Architectural & Dependency Discipline (Q10–Q12)
- One optional free-text `<textarea>` with hint: *"Where does structural clarity feel weakest right now? Do not include personal data."*
- Client-side validation: all 12 radio groups required before submit; GOV.UK error summary pattern on failure
- POST to `/api/pilot/pulse` with `credentials: 'include'`; on 201 success, navigate to `/pilot` and display a GOV.UK confirmation success banner
- On API error, display GOV.UK error summary with a human-readable message; form state preserved so user can retry

**PilotPulseTrendsPage** (`/pilot/pulse/trends`)
- Accessible to all four pilot roles (`PILOT_BUILDER`, `PILOT_SME`, `PILOT_DELIVERY_LEAD`, `PILOT_OBSERVER`); non-pilot roles redirected to `/dashboard`
- Fetches `GET /api/pilot/pulse/trends` on mount with `credentials: 'include'`
- Displays per-section **Structural Score** and **Clarity Score** as GOV.UK summary cards (one card per section per metric type) or an accessible HTML table — no external charting library
- When `trendInferenceSuppressed: true`, renders a GOV.UK inset-text notice above results: *"Insufficient data for trend inference. At least 3 pulse windows are needed."*
- Governance signal flags rendered using GOV.UK patterns:
  - `severity: 'red'` → `govuk-warning-text` component
  - `severity: 'amber'` → `govuk-inset-text` component with amber styling
  - Signal `message` used verbatim from API response; `section` displayed as context label
- When `signals` array is empty, no signal section rendered
- Loading and error states follow existing pilot page patterns (plain `govuk-body` loading text; `govuk-error-message` on failure)
- An accessible summary table of all windowed score data is always rendered below the cards/signals (provides keyboard and screen-reader equivalent of any visual representation)

**PilotSidebar updates**
- "Pulse questionnaire" link (`/pilot/pulse/questionnaire`) — visible only when `user.role` is `PILOT_BUILDER` or `PILOT_SME`
- "Structural trends" link (`/pilot/pulse/trends`) — visible to all pilot roles
- Role check via `useSession()` hook; sidebar receives no new props (reads role internally, consistent with existing `PilotDashboardPage` pattern)
- Active-link bold styling consistent with existing sidebar links

**App.tsx route additions**
- Two `lazy()`-imported routes added to `AppRoutes`: `/pilot/pulse/questionnaire` → `PilotPulseQuestionnairePage`, `/pilot/pulse/trends` → `PilotPulseTrendsPage`
- Added alongside existing `/pilot/*` route block

### Out of Scope

- Any backend changes (endpoints, database, score computation, signal evaluation — all complete)
- External charting library (Recharts or similar); trend data is presented as tables/summary cards only
- Free-text display on the trends page (free text is not returned by the trends API)
- Editing or deleting responses
- Bi-weekly cadence enforcement or reminders
- New shared types (all required API types derivable from the existing `ApiResponse<T>` wrapper and inline interfaces)

---

## 3. Actors Involved

| Actor | Questionnaire Page | Trends Page | Sidebar — Questionnaire Link | Sidebar — Trends Link |
|---|---|---|---|---|
| `PILOT_BUILDER` | ✅ Submit | ✅ View | ✅ Visible | ✅ Visible |
| `PILOT_SME` | ✅ Submit | ✅ View | ✅ Visible | ✅ Visible |
| `PILOT_DELIVERY_LEAD` | 🚫 Redirect to `/pilot` | ✅ View | 🚫 Hidden | ✅ Visible |
| `PILOT_OBSERVER` | 🚫 Redirect to `/pilot` | ✅ View | 🚫 Hidden | ✅ Visible |
| Non-pilot roles | 🚫 Redirect to `/pilot` | 🚫 Redirect to `/dashboard` | n/a | n/a |

---

## 4. Behaviour Overview

### Questionnaire — Happy Path
1. `PILOT_BUILDER` or `PILOT_SME` navigates to `/pilot/pulse/questionnaire` via the sidebar link
2. Page renders: GOV.UK `<fieldset>` per section, 3 radio groups per section, optional free-text textarea at foot of form
3. User selects a radio option for each of the 12 questions, optionally enters free text
4. User clicks "Submit pulse" button
5. Client validates all 12 radio groups are selected; if not, renders GOV.UK error summary pointing to each missing field, focus moved to summary
6. On valid form: POST `{ q1..q12: number, freeText?: string }` to `/api/pilot/pulse`
7. On 201 response: navigate to `/pilot`, render a GOV.UK `govuk-panel--confirmation` banner ("Pulse questionnaire submitted")
8. On API error: render error summary, preserve form state for retry

### Questionnaire — Access Control
- On mount, check `user.role` from `useSession()`; if role is not `PILOT_BUILDER` or `PILOT_SME`, navigate to `/pilot` immediately (before form renders)
- If session still loading, render loading state (do not redirect prematurely)

### Trends — Happy Path
1. Any pilot role navigates to `/pilot/pulse/trends` via the sidebar link
2. Page fetches `GET /api/pilot/pulse/trends` on mount
3. If `trendInferenceSuppressed: true`: renders inset notice only (no score cards rendered)
4. If data available: renders governance signal flags (if any), then per-section score summary, then accessible data table of all windows
5. Loading state while fetch in-flight; error state on failure

### Trends — Access Control
- Non-pilot roles navigate to `/dashboard` on mount

---

## 5. Rules & Decision Logic (Frontend)

### Rule: Role Guard — Questionnaire Page
- **Check:** `user.role` ∈ `['PILOT_BUILDER', 'PILOT_SME']`
- **Pass:** Page renders
- **Fail:** `navigate('/pilot', { replace: true })`

### Rule: Role Guard — Trends Page
- **Check:** `user.role` starts with `'PILOT_'`
- **Pass:** Page renders
- **Fail:** `navigate('/dashboard', { replace: true })`

### Rule: Client-Side Form Validation
- All 12 radio groups must have a selected value before POST
- Free-text textarea: optional; no client-side length enforcement (server-side maximum applies)
- On validation failure: render GOV.UK error summary; move focus to it; highlight each invalid radio group with error styling

### Rule: Signal Severity Rendering
- `severity: 'red'` → `<div class="govuk-warning-text">` with `⚠` prefix icon
- `severity: 'amber'` → `<div class="govuk-inset-text">` (amber border via inline style or utility class; no new CSS file)

### Rule: Sidebar Conditional Rendering
- Questionnaire link rendered only when `user?.role === 'PILOT_BUILDER' || user?.role === 'PILOT_SME'`
- Trends link rendered when `user?.role?.startsWith('PILOT_')`
- If user is null (loading or unauthenticated), neither link rendered

---

## 6. Dependencies

### Technical
- **Backend API:** `/api/pilot/pulse` (POST) and `/api/pilot/pulse/trends` (GET) — both complete and tested
- **Authentication:** `useSession()` context (`client/src/context/SessionContext.tsx`) — provides `user.role`
- **Routing:** React Router v7 via `App.tsx` lazy route registration
- **Design system:** GOV.UK Frontend v5 — radios, fieldset, error-summary, inset-text, warning-text, panel — all already present in the project
- **PilotSidebar:** `client/src/components/pilot/PilotSidebar.tsx` — modified to import `useSession` and conditionally render new links

### API Contract Reference
See `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` Section 2 (Scope) and Section 6 (Rules) for full payload shapes, score computation rules, and signal type definitions.

**POST `/api/pilot/pulse`** — request body:
```typescript
{ q1: number; q2: number; /* ... */ q12: number; freeText?: string }
```
Response: `201 { data: { id: string } }`

**GET `/api/pilot/pulse/trends`** — response:
```typescript
{
  data: {
    windows: Array<{
      windowStart: string;
      sections: Array<{
        section: string;
        structuralScore: number | null;
        clarityScore: number | null;
        alignmentIndex: number | null;
        alignmentSuppressed: boolean;
      }>;
    }>;
    trendInferenceSuppressed: boolean;
    signals: Array<{
      type: 'LOW_STRUCTURAL_SCORE' | 'HIGH_ALIGNMENT_INDEX' | 'CLARITY_FALLING' | 'ALIGNMENT_INCREASING';
      section: string;
      severity: 'red' | 'amber';
      message: string;
    }>;
  }
}
```

---

## 7. Non-Functional Considerations

### Accessibility
- All radio groups must use `<fieldset>` + `<legend>` per section; each radio uses GOV.UK radios pattern with visible `<label>`
- Error summary must receive programmatic focus on validation failure (`useRef` + `focus()`)
- Trends page accessible data table is mandatory — not optional — ensuring all trend data is keyboard and screen-reader accessible even when summary cards are the primary visual representation
- GOV.UK warning-text and inset-text components carry their own accessible semantics; no additional ARIA annotations needed beyond correct element choice

### Performance
- Both pages lazy-loaded (consistent with all other pilot pages in `App.tsx`)
- Trends fetch is a single request; no pagination needed for expected pilot dataset volume
- No client-side aggregation — all computation is server-side

### No New Dependencies
- No charting library added; trend data rendered as HTML tables/summary cards
- No new npm packages required

---

## 8. Assumptions & Open Questions

### Assumptions
1. The GOV.UK confirmation panel (`govuk-panel--confirmation`) on the pilot dashboard after submission is achievable via React Router state (`navigate('/pilot', { state: { submitted: true } })`) and a conditional banner read from `location.state` in `PilotDashboardPage`
2. `user.role` from `useSession()` is the authoritative source for role checks on the frontend; no separate permissions API call is needed
3. Questions for Q1–Q12 are hard-coded string literals in the component (they are fixed for the pilot duration per the backend spec); no separate data fetch is needed
4. `PilotSidebar` can import `useSession` without introducing a circular dependency (confirmed: other pilot pages import both without issue)
5. A `govuk-panel--confirmation` on the pilot dashboard is sufficient post-submission feedback; no dedicated `/pilot/pulse/submitted` page is needed
6. The accessible data table on the trends page shows: Window Start | Section | Structural Score | Clarity Score | Alignment Index — with suppressed values shown as "N/A"

### Open Questions
1. **Confirmation banner placement:** Should the submission confirmation be a full `govuk-panel--confirmation` on the dashboard (as assumed), or a `govuk-notification-banner--success` rendered at the top of the trends page as a next-step prompt?
2. **Question text source:** Questions are defined in `.business_context/questionnaire.md`. Confirm the exact wording to hard-code — Codey will need this as reference before implementation.
3. **Amber signal styling:** GOV.UK Frontend does not have a built-in amber inset-text variant. Confirm whether an inline `border-left-color` override is acceptable, or whether a shared utility class already exists in `client/src/styles/`.

---

## 9. Impact on System Specification

This feature adds no new system-level concerns. It surfaces data already computed and stored by the backend feature. Accessibility and role-based rendering patterns are consistent with existing pilot pages.

**No system spec changes required.**

---

## 10. Handover to BA (Cass)

### Story Themes
1. **Questionnaire Page — Form Rendering:** As a `PILOT_BUILDER` or `PILOT_SME`, I see a GOV.UK-styled form with 4 labelled sections, 3 radio groups each (Likert 1–5), and an optional free-text textarea
2. **Questionnaire Page — Submission & Confirmation:** On valid completion I can submit, receive a 201, and be returned to the dashboard with a success confirmation banner; on partial completion I see an accessible error summary
3. **Questionnaire Page — Access Control:** Non-permitted roles are redirected to `/pilot` immediately; form never renders for them
4. **Trends Page — Score Display:** As any pilot role I can view per-section Structural Score and Clarity Score across available windows in an accessible table; insufficient-data notice shown when `trendInferenceSuppressed: true`
5. **Trends Page — Governance Signals:** Active signal flags are displayed using GOV.UK warning/inset patterns with severity-appropriate styling; no signals section rendered when signals array is empty
6. **Sidebar Navigation:** Questionnaire link visible to Builder/SME only; Trends link visible to all pilot roles; both use consistent active-link styling

### Tensions to Surface in Stories
- **Confirmation banner ownership:** Dashboard currently has no `location.state` handling. Story 2 acceptance criteria must include the dashboard change or treat it as a separate sub-task.
- **Question text:** Stories should reference `.business_context/questionnaire.md` as the source of truth for label text; acceptance criteria must cite specific question wording.
- **Amber signal styling:** Acceptance criteria for Story 5 must specify the visual treatment for amber signals; the open question above should be resolved before stories are finalised.

---

## 11. Change Log

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-07-14 | Initial feature specification created | Backend complete; frontend spec needed to unblock Cass and Codey | Alex |
