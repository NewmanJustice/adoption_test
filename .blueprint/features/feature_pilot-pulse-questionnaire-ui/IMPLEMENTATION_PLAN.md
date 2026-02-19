# Implementation Plan — Pilot Pulse Questionnaire UI

## Summary

Add two new React pages (`PilotPulseQuestionnairePage`, `PilotPulseTrendsPage`) and update `PilotSidebar` and `App.tsx` to wire them up. The backend API is complete. All implementation is frontend-only, TypeScript strict mode, no new dependencies. Tests are already written in `client/src/__tests__/feature_pilot-pulse-questionnaire-ui.test.tsx`.

**Pilot roles:** `PILOT_BUILDER`, `PILOT_SME`, `PILOT_OBSERVER` — `PILOT_DELIVERY_LEAD` does NOT exist and must NOT be added.

---

## Files to Create/Modify

| Action | File | Notes |
|--------|------|-------|
| Create | `client/src/pages/PilotPulseQuestionnairePage.tsx` | Questionnaire form, validation, POST to `/api/pilot/pulse` |
| Create | `client/src/pages/PilotPulseTrendsPage.tsx` | Fetch trends, render scores table, signals, suppressed notice |
| Modify | `client/src/components/pilot/PilotSidebar.tsx` | Import `useSession`; add conditional "Pulse questionnaire" and "Structural trends" links |
| Modify | `client/src/App.tsx` | Add two lazy-loaded routes: `/pilot/pulse/questionnaire` and `/pilot/pulse/trends` |
| Modify | `client/src/pages/PilotDashboardPage.tsx` | Read `location.state.submitted` and render GOV.UK success panel on arrival from questionnaire |

---

## Implementation Steps

1. **`PilotPulseQuestionnairePage.tsx` — skeleton + role guard**
   - Import `useSession`, `useNavigate`. On mount: if `loading` show loading text; if role ∉ `['PILOT_BUILDER','PILOT_SME']` call `navigate('/pilot', { replace: true })`. Render page shell (Header, PilotSidebar, Footer). Passes T-S1.7, T-S3.1–S3.4, T-S3.9.

2. **`PilotPulseQuestionnairePage.tsx` — form structure**
   - Hard-code Q1–Q12 question text (source: `.business_context/questionnaire.md`). Render 4 `<fieldset>` sections, 3 GOV.UK radio groups each (values 1–5, labels "1 — Strongly Disagree" … "5 — Strongly Agree"), optional `<textarea>` with hint. Passes T-S1.1–S1.6, T-S1.8.

3. **`PilotPulseQuestionnairePage.tsx` — client-side validation + error summary**
   - State: `answers: Record<string,number|undefined>`, `freeText: string`, `errors: string[]`, `errorRef: RefObject`. On submit: validate all 12 answered; if not, populate `errors`, `focus(errorRef)`. Render GOV.UK `govuk-error-summary` when errors present. Passes T-S2.1–S2.3.

4. **`PilotPulseQuestionnairePage.tsx` — POST + navigation**
   - On valid submit: `fetch('/api/pilot/pulse', { method:'POST', credentials:'include', body: JSON.stringify({q1..q12, freeText?}) })`. On 201: `navigate('/pilot', { state: { submitted: true } })`. On error: show error summary, preserve answers. Passes T-S2.4–S2.9.

5. **`PilotDashboardPage.tsx` — submission confirmation banner**
   - Import `useLocation`; read `location.state?.submitted`. If truthy, render `<div className="govuk-panel govuk-panel--confirmation">` above main content. Passes T-S2.6.

6. **`PilotPulseTrendsPage.tsx` — skeleton + role guard + loading/error states**
   - Role guard: if `!user?.role?.startsWith('PILOT_')` → `navigate('/dashboard', { replace: true })`. On mount: `fetch('/api/pilot/pulse/trends', { credentials:'include' })`. Render loading / error states. Passes T-S3.5–S3.10, T-S4.1–S4.2.

7. **`PilotPulseTrendsPage.tsx` — suppressed notice + score rendering**
   - If `trendInferenceSuppressed: true`: render `govuk-inset-text` notice ("Insufficient data…"); skip score cards. Otherwise render per-section cards/summary with `structuralScore` and `clarityScore` (null → "N/A"). Passes T-S4.3–S4.6.

8. **`PilotPulseTrendsPage.tsx` — accessible data table + accessibility**
   - Always render `<table class="govuk-table">` with caption and columns: Window Start | Section | Structural Score | Clarity Score | Alignment Index. Suppressed values → "N/A". Passes T-S4.7–S4.9.

9. **`PilotPulseTrendsPage.tsx` — governance signals**
   - Map `signals` array: `severity:'red'` → `<div class="govuk-warning-text">`, `severity:'amber'` → `<div class="govuk-inset-text" style={{borderLeftColor:'#f47738'}>`. Signal section rendered only when `signals.length > 0`. Signals rendered before score summary in DOM. Passes T-S5.1–S5.8.

10. **`PilotSidebar.tsx` + `App.tsx` — wiring**
    - `PilotSidebar`: import `useSession`; add "Pulse questionnaire" link (visible when role ∈ `['PILOT_BUILDER','PILOT_SME']`) and "Structural trends" link (visible when `role?.startsWith('PILOT_')`); apply bold class when `location.pathname` matches; hide both when `user` is null. `App.tsx`: add two `lazy()`-imported routes. Passes T-S6.1–S6.8.

---

## Risks / Questions

- **Q1 wording:** Test T-S1.2 expects exact text *"There is a clearly identified individual accountable for sequencing decisions"* — must confirm this matches `.business_context/questionnaire.md` before step 2.
- **Amber styling:** `govuk-inset-text` has no built-in amber variant. Plan uses inline `style={{ borderLeftColor: '#f47738' }}` (GOV.UK amber). Confirm acceptable or whether a shared utility class exists in `client/src/styles/`.
- **Confirmation banner:** T-S2.6 asserts `navigate('/pilot', { state: { submitted: true } })`. `PilotDashboardPage` currently has no `location.state` handling — step 5 adds it. If the dashboard test suite has a snapshot, update accordingly.
- **Question text source:** `.business_context/questionnaire.md` must be read before implementing step 2 to avoid wording mismatches with T-S1.2.
