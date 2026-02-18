# Feature Specification — Review Prototype Outcomes

> **Parent feature:** `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`
> This feature is an extension to the existing adoption pilot. Shared context (roles, phases, architecture, dashboard) is not repeated here — refer to the parent spec.

---

## 1. Feature Intent

**Problem being addressed:** The SME actor's "Review prototype outcomes" responsibility is documented in pilot guidance (`client/src/data/pilotGuidance.ts`) and the adoption-pilot feature spec (Section 3, SME actor) but has no implementation — no data model, no API routes, no UI. This creates a gap between what the pilot guidance promises SMEs they can do and what the system actually supports.

**User need:** During Phase 2 agentic loops, each loop produces one or more prototype artefacts (a spec section, a code stub, a test suite). SMEs need a structured way to record whether each produced artefact met domain expectations, and to provide qualitative feedback the Builder and Delivery Lead can act on. Without this, SME domain input on loop outputs is informal, untracked, and invisible to the rest of the pilot team.

**How this supports the system purpose:** The pilot (per `.business_context/Specification-Led-Agentic-Delivery-Pilot.md` Section 4.2) depends on "Structured, categorised, mapped-back-to-specification" SME feedback. Prototype outcome reviews are the structured vehicle for that feedback. This feature closes the loop between prototype generation and SME-validated specification mutation.

---

## 2. Scope

### In Scope
- A `PrototypeOutcome` record representing the result of a single agentic loop iteration, recorded once per loop (or per artefact produced in a loop)
- Fields: `loop` number, `phase` (PHASE_2 only), `artefactType`, `artefactDescription`, `metExpectations` (boolean), `smeRating` (1–5 scale), `smeFeedback` (free text), `createdBy` (role), `createdAt`, `pilotId`
- Create outcome endpoint: `POST /api/pilot/outcomes` — restricted to `PILOT_SME`
- List outcomes endpoint: `GET /api/pilot/outcomes` — accessible to all pilot roles
- Single outcome endpoint: `GET /api/pilot/outcomes/:id` — accessible to all pilot roles
- UI: SME "Record Outcome" form under `/pilot` (new tab or sub-section)
- UI: Outcome list view accessible to Builder, Delivery Lead, Observer (read-only)
- Dashboard surface: outcome summary counts per loop (met / not met) surfaced alongside existing metric summary cards
- Shared type: `PilotPrototypeOutcome` added to `shared/types/api.ts`
- Audit log entry on outcome creation (consistent with existing pilot audit pattern)

### Out of Scope
- Outcome editing or deletion after submission (immutable record, consistent with metric entry history rule)
- Automated outcome generation from agent tooling
- Linking outcomes directly to `PilotMetricEntry` records (could be a future extension)
- Trend aggregation for outcomes (loop-level counts are sufficient for MVP)
- Export or reporting beyond the dashboard surface
- Outcomes in Phase 1 (prototype generation only begins in Phase 2)

---

## 3. Actors Involved

### SME (Primary Actor for this feature)
- **Can do:** Record a prototype outcome for a completed loop, including artefact type, description, rating, and whether it met expectations
- **Cannot do:** Edit or delete a submitted outcome; access the create endpoint while in Phase 1

### Builder
- **Can do:** View all submitted outcomes; see per-loop outcome summaries on the dashboard
- **Cannot do:** Create or modify outcomes

### Delivery Lead
- **Can do:** View all submitted outcomes; use outcome data to assess loop health
- **Cannot do:** Create or modify outcomes

### Observer
- **Can do:** Read-only view of outcome list
- **Cannot do:** Create outcomes

---

## 4. Behaviour Overview

### Happy Path
1. Phase 2 begins (Spec Freeze timestamp is set)
2. An agentic loop completes and produces one or more artefacts
3. SME navigates to the "Record Outcome" form in the pilot UI
4. SME selects loop number, artefact type, provides a description, rates the output (1–5), states whether it met expectations, and optionally adds free-text feedback
5. Outcome is stored; confirmation is shown; the outcome is immediately visible in the list view
6. Builder and Delivery Lead see per-loop outcome summaries on the dashboard (met count / total count per loop)

### Key Alternatives

**Outcome recorded before Spec Freeze:**
- System rejects the submission with a validation error: outcomes require Phase 2 (Spec Freeze must be set)

**SME submits without rating or met/not-met:**
- `metExpectations` is required; `smeRating` is required. Validation error returned if absent.

**No outcomes recorded for a loop:**
- Dashboard shows "0 outcomes" for that loop — no suppression of empty state

**Non-SME attempts to create outcome:**
- Request rejected with `403 FORBIDDEN`

---

## 5. State & Lifecycle Interactions

- `PrototypeOutcome` records are **Phase 2 only**. The create endpoint enforces that the pilot is in PHASE_2 (i.e., `specFreezeAt` is set on the `PilotConfiguration`).
- Outcomes are **immutable** once submitted (no update or delete). Consistent with `PilotMetricEntry` history invariant in parent spec Rule: MetricEntry Schema.
- Outcome creation is **audit-logged** (consistent with existing `PilotAuditLog` pattern).
- Outcomes do **not** transition pilot phase — they are observational records within Phase 2.

| Condition | Behaviour |
|-----------|-----------|
| Phase 1 active (no specFreezeAt) | Outcome creation blocked |
| Phase 2 active | Outcome creation allowed for PILOT_SME |
| Outcome submitted | Immutable; visible to all pilot roles |

---

## 6. Rules & Decision Logic

### Rule: Phase Gate on Outcome Creation
- **Description:** Prototype outcomes may only be created when the pilot is in Phase 2 (specFreezeAt is set)
- **Inputs:** Current pilot lifecycle state
- **Outputs:** 422 validation error if Phase 1; proceed if Phase 2
- **Type:** Deterministic

### Rule: SME-Only Write Access
- **Description:** Only `PILOT_SME` may create outcome records
- **Inputs:** Authenticated session role
- **Outputs:** 403 if any other role attempts POST; all roles may GET
- **Type:** Deterministic

### Rule: Required Fields
- **Description:** `loop`, `phase`, `artefactType`, `artefactDescription`, `metExpectations`, `smeRating` are all required
- **Inputs:** POST payload
- **Outputs:** 400 validation error listing missing fields if any are absent
- **Type:** Deterministic

### Rule: Rating Bounds
- **Description:** `smeRating` must be an integer between 1 and 5 (inclusive)
- **Inputs:** smeRating field
- **Outputs:** 400 validation error if out of range
- **Type:** Deterministic

### Rule: Loop Number Validity
- **Description:** `loop` must be a positive integer ≥ 1
- **Inputs:** loop field
- **Outputs:** 400 validation error if invalid
- **Type:** Deterministic

### Rule: Immutability
- **Description:** No PUT, PATCH, or DELETE is available for outcome records
- **Outputs:** 405 Method Not Allowed if attempted
- **Type:** Deterministic

---

## 7. Data Model

### `PilotPrototypeOutcome` (add to `shared/types/api.ts`)

```typescript
export type PilotArtefactType =
  | 'spec_artefact'
  | 'code_stub'
  | 'test_suite'
  | 'domain_model'
  | 'state_model'
  | 'event_model'
  | 'other';

export interface PilotPrototypeOutcome {
  id: string;
  pilotId: string;
  loop: number;
  phase: PilotPhase;           // always PHASE_2
  artefactType: PilotArtefactType;
  artefactDescription: string;
  metExpectations: boolean;
  smeRating: number;           // 1–5
  smeFeedback?: string;        // optional free text
  createdBy: PilotRole;
  createdAt: string;           // ISO 8601
}
```

### Dashboard surface type extension (add to `PilotDashboardResponse`)
```typescript
export interface PilotOutcomeSummary {
  loop: number;
  totalOutcomes: number;
  metExpectationsCount: number;
  averageRating: number;
}
// Added to PilotDashboardResponse:
// outcomeSummary: PilotOutcomeSummary[];
```

---

## 8. API Design

All endpoints follow the existing pilot route pattern in `server/src/routes/pilot.ts`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/pilot/outcomes` | `PILOT_SME` only | Record a new prototype outcome |
| `GET` | `/api/pilot/outcomes` | All pilot roles | List all outcomes (optionally filter by `?loop=N&phase=PHASE_2`) |
| `GET` | `/api/pilot/outcomes/:id` | All pilot roles | Retrieve a single outcome by ID |

Response envelope: `ApiResponse<T>` from `shared/types/api.ts` (consistent with all pilot API responses).

---

## 9. UI Design

### SME — "Record Outcome" form
- Location: new tab or sub-section within `/pilot`, visible only when `PILOT_SME` is the session role
- Fields: Loop number (number input), Artefact type (select), Artefact description (textarea), Met expectations (radio: Yes / No), SME rating (radio group 1–5), Feedback (textarea, optional)
- Submit button: "Record outcome"
- On success: inline confirmation, form resets, outcomes list refreshes
- On validation error: GOV.UK error summary pattern

### All roles — Outcome list view
- Location: visible to all pilot roles; read-only for non-SME
- Display: table of submitted outcomes, sortable by loop, showing artefact type, met/not met, rating, date
- SME sees own submissions highlighted; no edit affordance

### Dashboard surface
- Outcome summary cards per loop (total outcomes, met count, average rating) added beneath existing metric summary cards
- Only visible when Phase 2 is active and at least one outcome exists

---

## 10. Dependencies

### Within Pilot Feature
- Requires `PilotConfiguration` with `specFreezeAt` set (Phase 2 precondition)
- Audit logging via existing `PilotAuditLog` mechanism
- Role enforcement via `requireAuth({ allowedRoles: [...] })` pattern in `server/src/routes/pilot.ts`

### Shared Types
- `PilotPrototypeOutcome`, `PilotArtefactType`, `PilotOutcomeSummary` must be added to `shared/types/api.ts` before implementation

### Architecture
- Repository → Service → Controller → Route pattern (consistent with existing pilot layers)
- Server ESM: all imports must use `.js` extensions
- In-memory storage is acceptable for MVP (consistent with parent feature's current storage approach); PostgreSQL persistence is a future migration path

---

## 11. Non-Functional Considerations

### Auditability
- Every outcome creation must produce a `PilotAuditLog` entry (`action: 'OUTCOME_CREATED'`, `entityId`: outcome ID)

### Immutability
- No mutation endpoints. Consistent with metric entry history rule. A future "correction" mechanism (if ever needed) must be a new record with a `supersedesId` reference — not an update.

### Access Control
- Write restricted to `PILOT_SME`. Read open to all pilot roles. Consistent with metric notes access pattern.

### Performance
- Outcome list expected to be small (Phase 2 is 2 weeks, ≤48h loops → ~10–20 outcomes maximum during pilot). No pagination required for MVP.

---

## 12. Assumptions & Open Questions

### Assumptions
1. One outcome record per artefact per loop is the intended granularity (not one per loop regardless of artefact count)
2. `smeRating` (1–5) is sufficient signal for MVP; a richer rubric is out of scope
3. `smeFeedback` text is unstructured; categorisation/tagging of feedback is out of scope
4. Outcomes are never deleted — if an SME records an incorrect outcome, they add a corrective one (noted in the UI)
5. The existing in-memory pilot store is the persistence mechanism for MVP

### Open Questions
1. **Multiple SMEs:** Can more than one SME record an outcome for the same loop/artefact? Assumption is yes (additive) — should be confirmed.
2. **Artefact type taxonomy:** Is the proposed `PilotArtefactType` enum sufficient, or do domain practitioners need to extend it?
3. **Dashboard placement:** Should outcome summaries appear as a dedicated section or be interleaved with metric summary cards by loop?
4. **Phase gate strictness:** Should outcomes be blocked if the pilot has progressed beyond Phase 2 (i.e., no future phase exists, but should the gate still check)?

---

## 13. Impact on Parent Specification

The parent feature spec (`.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`) notes in Section 3 (SME actor): _"Not yet implemented: Review prototype outcomes."_ Once this feature is delivered:
- That annotation should be removed and replaced with a reference to this spec
- `PilotDashboardResponse` in `shared/types/api.ts` gains an `outcomeSummary` field — this is a non-breaking additive change

No system-spec-level changes are required. This feature is internal pilot delivery infrastructure (see parent spec Section 10, Tensions Identified).

---

## 14. Handover to BA (Cass)

### Story Themes
1. **Record Prototype Outcome** — SME form to capture loop artefact result (create endpoint + UI)
2. **View Outcome List** — Read-only list for all pilot roles (list/get endpoints + UI)
3. **Outcome Dashboard Surface** — Per-loop summary cards on pilot dashboard
4. **Shared Types & API Contract** — `PilotPrototypeOutcome` type, API response envelope, server routes

### Expected Story Boundaries
- Story 1 (Record) and Story 2 (View) can be written together or as a pair — they share the data model
- Story 3 (Dashboard) depends on Story 2 being complete (needs the list endpoint)
- Story 4 (Types) is a prerequisite for all others and should be called out as a dependency

### Areas Needing Careful Story Framing
- **Phase gate:** Acceptance criteria must assert the `PHASE_1` rejection explicitly
- **Immutability:** Acceptance criteria must assert no edit/delete affordance exists anywhere in the UI
- **Role restriction on create:** Explicit test for `PILOT_BUILDER` attempting POST — must receive 403

---

## 15. Change Log

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-07-11 | Initial feature specification created | Close SME "Review prototype outcomes" gap identified in SME role audit | Alex |
