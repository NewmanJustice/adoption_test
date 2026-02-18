# Story — View prototype outcomes

## User story
As a pilot team member, I want to view all submitted prototype outcomes so that I can understand how agentic loop artefacts have been assessed by the SME.

## Context
- Reference: `.blueprint/features/feature_review-prototype-outcomes/FEATURE_SPEC.md`

## Acceptance criteria

**AC-1 — List all outcomes**
- Given I am authenticated as any pilot role (`PILOT_SME`, `PILOT_BUILDER`, `PILOT_DELIVERY_LEAD`, or `PILOT_OBSERVER`),
- When I navigate to the outcomes list view under `/pilot`,
- Then I see a table of all submitted outcomes showing loop number, artefact type, met/not met, rating, and submission date.

**AC-2 — Filter outcomes by loop**
- Given outcomes exist across multiple loops,
- When I call `GET /api/pilot/outcomes?loop=N`,
- Then only outcomes for loop `N` are returned.

**AC-3 — Filter outcomes by phase**
- Given outcomes have been recorded in Phase 2,
- When I call `GET /api/pilot/outcomes?phase=PHASE_2`,
- Then only outcomes for that phase are returned.

**AC-4 — Retrieve a single outcome**
- Given an outcome exists with a known `id`,
- When I call `GET /api/pilot/outcomes/:id` as any pilot role,
- Then the full outcome record is returned including all fields defined in `PilotPrototypeOutcome`.

**AC-5 — Read-only for non-SME roles**
- Given I am authenticated as `PILOT_BUILDER`, `PILOT_DELIVERY_LEAD`, or `PILOT_OBSERVER`,
- When I view the outcomes list,
- Then no create, edit, or delete affordance is presented.

**AC-6 — Empty state shown when no outcomes exist**
- Given no outcomes have been submitted for any loop,
- When I navigate to the outcomes list view,
- Then an empty state message is displayed rather than an empty table.

## Out of scope
- Editing or deleting outcomes from the list view
- Exporting the outcome list
- Pagination (outcome volume is small by design during the pilot)
- Outcomes from Phase 1 (none can exist)
