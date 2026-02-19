# Implementation Plan — Pilot Pulse Questionnaire

## Summary
Add a 12-question Likert pulse questionnaire for `PILOT_BUILDER` and `PILOT_SME` roles, persisting responses (with server-computed structural/clarity scores) to a new `pilot_pulse_responses` table. A trends aggregation API groups responses into 14-day windows and computes alignment indices; a visualisation page displays trend data and governance signal flags for all pilot roles. Server-rendered Express HTML routes are required for `/pilot`, `/pilot/pulse/questionnaire`, and `/pilot/pulse/trends` so scaffold (supertest) tests can assert on page content and access control — these routes are registered before the SPA catch-all in `app.ts`.

---

## Files to Create / Modify

| Path | Action | Purpose |
|------|--------|---------|
| `server/migrations/010_create_pilot_pulse_responses.sql` | Create | `pilot_pulse_responses` table: `id`, `role`, `submitted_at`, `q1–q12`, 4× `structural_score_sN`, 4× `clarity_score_sN`, `free_text` (no `user_id`) |
| `server/src/types/auth.ts` | Modify | Add `PILOT_OBSERVER` to `UserRole` union (currently missing; tests require it) |
| `shared/types/api.ts` | Modify | Add `PILOT_OBSERVER` to `PilotRole` union |
| `server/src/features/pilotPulse/computeScores.ts` | Create | Pure exported `computeScores(q)` — structural scores = mean of first two Qs per section; clarity scores = third Q per section |
| `server/src/features/pilotPulse/evaluateSignals.ts` | Create | Pure exported `evaluateSignals(windows)` — evaluates 4 governance flag rules against latest/previous windows |
| `server/src/features/pilotPulse/aggregateWindows.ts` | Create | Groups responses into 14-day windows anchored from earliest `submitted_at`; computes mean scores and alignment index (std dev across roles, then section mean); returns `{ windows, trendInferenceSuppressed }` |
| `server/src/repositories/pilotPulseRepository.ts` | Create | `insertResponse(row)` and `listResponses()` using pg pool with parameterised queries |
| `server/src/services/pilotPulseService.ts` | Create | `submitPulse(payload, role)`: validate q1–q12 ∈ [1,5], sanitise `free_text`, compute scores, transactional insert. `getTrends()`: list → aggregate → evaluate signals |
| `server/src/controllers/pilotPulseController.ts` | Create | `submit` (POST handler) and `getTrends` (GET handler) delegating to service |
| `server/src/routes/pilotPulse.ts` | Create | API routes (`POST /api/pilot/pulse`, `GET /api/pilot/pulse/trends`, 405 stubs for PUT/PATCH/DELETE) + server-rendered HTML routes (`GET /pilot/pulse/questionnaire`, `GET /pilot/pulse/trends`, `GET /pilot`) with `requireAuth` guards |
| `server/src/app.ts` | Modify | Import and mount new pulse routes **before** the SPA catch-all |
| `client/src/components/pilot/PilotSidebar.tsx` | Modify | Add "Structural trends" link (all pilot roles) and conditional "Pulse questionnaire" link (BUILDER/SME only), reading role from `useSession` |
| `client/src/pages/PilotPulseQuestionnairePage.tsx` | Create | React form page: 4 GOV.UK fieldset sections, 12 radio groups, optional free-text textarea, POSTs to `/api/pilot/pulse`, redirects to `/pilot` on success |
| `client/src/pages/PilotPulseTrendsPage.tsx` | Create | React page: fetches `/api/pilot/pulse/trends`, renders per-section trend charts (Recharts), accessible summary tables, governance signal flags, insufficient-data inset notice |
| `client/src/App.tsx` | Modify | Add client-side routes `/pilot/pulse/questionnaire` and `/pilot/pulse/trends` |

---

## Implementation Steps

1. **DB migration** — Create `010_create_pilot_pulse_responses.sql`. Columns: `id UUID DEFAULT gen_random_uuid()`, `role VARCHAR(50) NOT NULL`, `submitted_at TIMESTAMPTZ DEFAULT NOW()`, `q1`–`q12 SMALLINT NOT NULL`, `structural_score_s1`–`s4 NUMERIC(4,2)`, `clarity_score_s1`–`s4 SMALLINT`, `free_text TEXT`. No `user_id`, `username`, or `session_id`.

2. **Verify role type system** — Confirm `PILOT_BUILDER`, `PILOT_SME`, `PILOT_OBSERVER` are present in `UserRole` and `PilotRole` (PILOT_DELIVERY_LEAD was intentionally removed; do not re-add it).

3. **Pure logic: `computeScores.ts`** — Export `computeScores(q: Record<string, number>)` returning 8 score keys. Must match the reference implementation in the test file exactly. Keep under 20 lines.

4. **Pure logic: `evaluateSignals.ts`** — Export `evaluateSignals(windows)` returning a `Signal[]` array. Implement all 4 rules (LOW_STRUCTURAL_SCORE, HIGH_ALIGNMENT_INDEX, CLARITY_FALLING, ALIGNMENT_INCREASING) using the test file's reference implementation as the contract.

5. **Window aggregation: `aggregateWindows.ts`** — Group raw DB rows by 14-day window (anchored to earliest `submitted_at`). Per window: mean structural and clarity scores per section; alignment index (std dev of each question across respondents, mean per section) only when ≥2 distinct roles present, else `null` + `alignmentWarning` message. Return `trendInferenceSuppressed: true` when `< 3` windows.

6. **Repository + service** — `pilotPulseRepository.ts`: simple pg insert and `SELECT * FROM pilot_pulse_responses ORDER BY submitted_at`. `pilotPulseService.ts`: validate, sanitise (`free_text` — strip HTML tags via string replace or `sanitize-html`), compute scores, wrap insert in `BEGIN/COMMIT/ROLLBACK`. `getTrends()` aggregates and evaluates signals; response must not expose raw q1–q12 or `free_text`.

7. **Controller + API routes** — `pilotPulseController.ts` thin controller. `pilotPulse.ts` routes: `POST /api/pilot/pulse` restricted to `['PILOT_BUILDER', 'PILOT_SME']`; `GET /api/pilot/pulse/trends` restricted to all `PILOT_*` roles (include DELIVERY_LEAD); `PUT/PATCH/DELETE /api/pilot/pulse/:id` → 405.

8. **Server-rendered HTML page routes** — In the same routes file, add `GET /pilot/pulse/questionnaire` (BUILDER+SME, returns HTML with 4 `<fieldset>` sections × 3 radio groups = 12 fieldsets, free-text field with "Do not include personal data" hint), `GET /pilot/pulse/trends` (all pilot roles, returns HTML with section headings + data placeholder), and `GET /pilot` (all pilot roles, returns HTML including sidebar with conditional "Pulse questionnaire" link and "Structural trends" link). Register in `app.ts` **before** the `app.get('*', ...)` SPA catch-all.

9. **React client pages** — `PilotPulseQuestionnairePage.tsx` and `PilotPulseTrendsPage.tsx` for SPA navigation. Add Recharts as a client dependency (`npm install recharts --workspace=client`). Add routes in `App.tsx`.

10. **Sidenav + final wiring** — Update `PilotSidebar.tsx` to show "Structural trends" (all pilot roles) and "Pulse questionnaire" (BUILDER/SME) links. Register pulse routes in `app.ts`. Run full test suite to verify.

---

## Risks / Questions

- **Server-rendered `/pilot` override**: Adding an Express route for `GET /pilot` takes precedence over the SPA catch-all, so direct-URL requests to `/pilot` will receive server-rendered HTML instead of the React dashboard. Client-side SPA navigation continues to work. Confirm this is acceptable or restrict server routes to `/pilot/pulse/*` only (which means T-NAV-1.1 will fail without a React-aware approach).
- **`PILOT_OBSERVER` missing from type system**: This is a pre-existing gap that must be fixed as step 2; several tests use this role via `makeSession`.
- **`sanitize-html` vs regex**: Feature spec requires server-side XSS sanitisation of `free_text`. A simple regex strip avoids a new dependency; `sanitize-html` is safer. Confirm preference with Steve.
- **Recharts**: Adds a new client dependency. Feature spec lists this as an open question (Section 9). Assume approved; flag if blocked.
- **In-memory vs PostgreSQL**: The server currently uses in-memory storage for cases/documents but not necessarily for pilot tables. Confirm `pilot_pulse_responses` should use the live pg pool (consistent with other pilot tables in migration 009).
