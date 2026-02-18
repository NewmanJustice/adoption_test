# Test Spec — Review Prototype Outcomes

## Brief understanding
- PILOT_SME creates structured outcome records per loop artefact; all pilot roles can read them.
- Outcome creation is gated to Phase 2 (specFreezeAt must be set on the pilot config).
- POST /api/pilot/outcomes is restricted to PILOT_SME; all GET endpoints open to all pilot roles.
- Required fields: loop, artefactType, artefactDescription, metExpectations, smeRating (1–5).
- Outcomes are immutable: no PUT/PATCH/DELETE endpoints exist (405 if attempted).
- Every successful creation emits a PilotAuditLog entry with action: 'OUTCOME_CREATED'.
- GET /api/pilot/dashboard gains an outcomeSummary array of per-loop aggregates in Phase 2.

## AC → Test ID mapping
| Story | AC | Test ID | Scenario |
|-------|----|---------|----------|
| story-record-prototype-outcome.md | AC-1 | TC-RPO-001 | SME creates outcome in Phase 2 → 201 |
| story-record-prototype-outcome.md | AC-2 | TC-RPO-002 | Missing required field → 400 |
| story-record-prototype-outcome.md | AC-3 | TC-RPO-003 | smeRating out of bounds → 400 |
| story-record-prototype-outcome.md | AC-4 | TC-RPO-004 | Phase 1 pilot → 422 |
| story-record-prototype-outcome.md | AC-5 | TC-RPO-005 | Non-SME POST → 403 |
| story-record-prototype-outcome.md | AC-6 | TC-RPO-006 | PUT/PATCH/DELETE → 405 |
| story-record-prototype-outcome.md | AC-7 | TC-RPO-007 | Audit log entry OUTCOME_CREATED on creation |
| story-view-prototype-outcomes.md | AC-1 | TC-RPO-008 | Any pilot role GET list → 200 with array |
| story-view-prototype-outcomes.md | AC-2 | TC-RPO-009 | GET ?loop=N filters by loop |
| story-view-prototype-outcomes.md | AC-3 | TC-RPO-010 | GET ?phase=PHASE_2 filters by phase |
| story-view-prototype-outcomes.md | AC-4 | TC-RPO-011 | GET /:id returns full outcome record |
| story-view-prototype-outcomes.md | AC-5 | TC-RPO-012 | Non-SME POST → 403 (no write affordance) |
| story-view-prototype-outcomes.md | AC-6 | TC-RPO-013 | GET list when no outcomes → empty array |
| story-dashboard-outcomes-surface.md | AC-1 | TC-RPO-014 | Dashboard Phase 2 + outcomes → outcomeSummary present |
| story-dashboard-outcomes-surface.md | AC-2 | TC-RPO-015 | Dashboard Phase 2 + no outcomes → outcomeSummary empty array |
| story-dashboard-outcomes-surface.md | AC-3 | TC-RPO-016 | Dashboard Phase 1 → no outcomeSummary |
| story-dashboard-outcomes-surface.md | AC-4 | TC-RPO-017 | Multi-loop outcomes → one summary per loop |
| story-dashboard-outcomes-surface.md | AC-5 | TC-RPO-018 | outcomeSummary shape: loop, totalOutcomes, metExpectationsCount, averageRating |
| story-dashboard-outcomes-surface.md | AC-6 | TC-RPO-019 | Dashboard accessible to all pilot roles |

## Key assumptions
1. Pilot Phase 2 is established by calling POST /api/pilot/config then POST /api/pilot/spec-freeze as PILOT_BUILDER.
2. Phase 1 gate test (TC-RPO-004) and empty-state test (TC-RPO-013) are marked skip: they require test isolation not available with a shared in-memory store.
3. Unauthenticated requests to pilot endpoints return 401.
4. The outcomeSummary field is an array (not absent) on the dashboard response in Phase 2, even when empty.
5. artefactType enum values follow the FEATURE_SPEC: spec_artefact, code_stub, test_suite, domain_model, state_model, event_model, other.
