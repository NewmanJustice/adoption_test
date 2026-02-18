# Story — Outcome dashboard surface

## User story
As a pilot team member, I want to see a per-loop outcome summary on the pilot dashboard so that I can quickly assess how many artefacts met SME expectations without reading individual outcome records.

## Context
- Reference: `.blueprint/features/feature_review-prototype-outcomes/FEATURE_SPEC.md`

## Acceptance criteria

**AC-1 — Outcome summary cards visible in Phase 2**
- Given the pilot is in Phase 2 and at least one outcome has been submitted,
- When I view the pilot dashboard,
- Then per-loop outcome summary cards are displayed beneath the existing metric summary cards, showing total outcomes, met-expectations count, and average rating for each loop.

**AC-2 — Summary hidden when no outcomes exist**
- Given the pilot is in Phase 2 but no outcomes have been recorded,
- When I view the pilot dashboard,
- Then no outcome summary section is displayed.

**AC-3 — Summary absent in Phase 1**
- Given the pilot is in Phase 1 (specFreezeAt is not set),
- When I view the pilot dashboard,
- Then no outcome summary section is displayed.

**AC-4 — Summary reflects all submitted outcomes**
- Given outcomes have been submitted across multiple loops,
- When I view the pilot dashboard,
- Then there is one summary card per loop that has at least one outcome, and each card correctly reflects the total count, met count, and average rating for that loop.

**AC-5 — Dashboard data provided via API**
- Given outcomes exist in the store,
- When a client calls `GET /api/pilot/dashboard`,
- Then the response includes an `outcomeSummary` array of `PilotOutcomeSummary` objects, each with `loop`, `totalOutcomes`, `metExpectationsCount`, and `averageRating`.

**AC-6 — Visible to all pilot roles**
- Given I am authenticated as any pilot role,
- When I view the pilot dashboard in Phase 2,
- Then I can see the outcome summary cards (read-only for all roles).

## Out of scope
- Trend graphs or historical aggregation across phases
- Interleaving outcome cards with metric cards by loop number (placement is a dedicated section)
- Export of dashboard summary data
- Outcome summary in Phase 1
