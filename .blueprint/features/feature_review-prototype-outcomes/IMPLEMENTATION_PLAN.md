# Implementation Plan — Review Prototype Outcomes

## Summary
Add a `PilotPrototypeOutcome` entity (CRUD-lite: create + read only) to the existing pilot stack, gated to Phase 2 and write-restricted to `PILOT_SME`. Extend `GET /api/pilot/dashboard` to include a per-loop `outcomeSummary` array. All changes follow the existing Repository → Service → Controller → Route layered pattern.

---

## Files to Create / Modify

| Path | Action | Purpose |
|------|--------|---------|
| `shared/types/api.ts` | Modify | Add `PilotArtefactType`, `PilotPrototypeOutcome`, `PilotOutcomeSummary`; extend `PilotDashboardResponse` with `outcomeSummary?: PilotOutcomeSummary[]` |
| `server/src/repositories/pilotRepository.ts` | Modify | Add `pilot_prototype_outcomes` table DDL to `ensureSchema()`; add `createOutcome`, `listOutcomes`, `getOutcome` methods + `mapOutcome` private helper |
| `server/src/services/pilotService.ts` | Modify | Add `createOutcome`, `listOutcomes`, `getOutcome` service methods; extend `getDashboard` to call `listOutcomes` and build `outcomeSummary` aggregation |
| `server/src/controllers/pilotController.ts` | Modify | Add `createOutcome`, `listOutcomes`, `getOutcome` handlers; add `PHASE_GATE` → 422 to `mapErrorStatus` |
| `server/src/routes/pilot.ts` | Modify | Register `POST /pilot/outcomes` (SME only), `GET /pilot/outcomes`, `GET /pilot/outcomes/:id` (all pilot roles), and 405 handlers for `PUT/PATCH/DELETE /pilot/outcomes/:id` |

No new files required. No client UI changes needed to satisfy Nigel's tests (API-only test suite).

---

## Implementation Steps

1. **`shared/types/api.ts`** — Add `PilotArtefactType` union, `PilotPrototypeOutcome` interface, `PilotOutcomeSummary` interface, and `outcomeSummary?: PilotOutcomeSummary[]` field to `PilotDashboardResponse`.

2. **`pilotRepository.ts` — DDL** — Append `pilot_prototype_outcomes` table to the `ensureSchema()` DDL block:
   - Columns: `id`, `pilot_id`, `loop_number`, `phase`, `artefact_type`, `artefact_description`, `met_expectations`, `sme_rating`, `sme_feedback`, `created_by`, `created_at`
   - Index on `loop_number` and `phase` for filter queries.

3. **`pilotRepository.ts` — methods** — Add `createOutcome(outcome)`, `listOutcomes({ loop?, phase? })`, `getOutcome(id)`, and private `mapOutcome(row)`.

4. **`pilotService.ts` — `createOutcome`** — Validate required fields (`loop`, `phase`, `artefactType`, `artefactDescription`, `metExpectations`, `smeRating`); check `smeRating` in [1–5]; verify pilot is in Phase 2 (`specFreezeAt` set — return `{ code: 'PHASE_GATE' }` if not); enforce `PILOT_SME`-only write. On success, persist, then call `logAudit('OUTCOME_CREATED', user, { entityId: outcome.id })`.

5. **`pilotService.ts` — `listOutcomes` / `getOutcome`** — `listOutcomes` delegates to repo with optional `loop` and `phase` filters; returns `ServiceResult<PilotPrototypeOutcome[]>`. `getOutcome(id)` returns 404 via `NOT_FOUND` code if absent.

6. **`pilotService.ts` — extend `getDashboard`** — After fetching entries, call `repository.listOutcomes({})` to get all outcomes. Compute `outcomeSummary` by grouping by `loop`: `{ loop, totalOutcomes, metExpectationsCount, averageRating }`. Attach to `PilotDashboardResponse`. Only populate when `specFreezeAt` is set (Phase 2); return `[]` otherwise.

7. **`pilotController.ts`** — Add `createOutcome`, `listOutcomes`, `getOutcome` handlers following existing pattern (`req.body` / `req.params.id` / `parseDashboardFilters`). Add `PHASE_GATE: 422` case to `mapErrorStatus`. Use `res.status(201).json({ data: result.data })` for create and `res.json({ data: result.data })` for reads, matching test assertions (`res.body.data`).

8. **`server/src/routes/pilot.ts`** — Register:
   - `POST /pilot/outcomes` — `requireAuth({ allowedRoles: ['PILOT_SME'] })`
   - `GET /pilot/outcomes` — `requireAuth({ allowedRoles: PILOT_ROLES })`
   - `GET /pilot/outcomes/:id` — `requireAuth({ allowedRoles: PILOT_ROLES })`
   - `PUT/PATCH/DELETE /pilot/outcomes/:id` — inline handler returning `res.status(405).json({ error: 'Method Not Allowed' })` (no auth guard needed — 405 should be returned regardless).

9. **Run tests** — `npx jest --selectProjects=scaffold test/feature_review-prototype-outcomes.test.js` to verify all non-skipped cases pass. Fix any issues before moving on.

10. **Run full suite** — `npm test` to confirm no regressions in other test projects.

---

## Risks / Questions

- **405 vs auth order**: Express evaluates routes in registration order. The 405 handlers for PUT/PATCH/DELETE must be registered _after_ the GET routes but without auth middleware, so unauthenticated mutation attempts also get 405 (not 401). Verify this matches the intended security posture — if 401 before 405 is preferred, add `requireAuth` to those handlers too. Nigel's tests use authenticated sessions, so either order passes the tests.
- **`outcomeSummary` in Phase 1**: TC-RPO-016 is skipped (shared in-memory state). Ensure `getDashboard` still returns `outcomeSummary: []` (not absent) when `specFreezeAt` is null — this aligns with TC-RPO-015's shape check.
- **`pilotId` field**: `PilotPrototypeOutcome` has a `pilotId` field in the spec type, but tests don't assert on it. Use `PILOT_CONFIG_ID` constant (`'pilot-config'`) as the value when creating outcomes, consistent with how the rest of the service populates pilot-scoped records.
- **Dashboard `outcomeSummary` not wrapped**: `getDashboard` returns `res.json(result.data)` directly (not `res.json({ data: result.data })`). Tests assert `res.body.outcomeSummary` at the top level — keep this behaviour consistent; do not wrap dashboard in `{ data }`.
