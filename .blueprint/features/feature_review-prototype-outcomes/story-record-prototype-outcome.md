# Story — Record prototype outcome

## User story
As a Pilot SME, I want to record a structured outcome for each agentic loop artefact so that domain feedback is captured, traceable, and visible to the rest of the pilot team.

## Context
- Reference: `.blueprint/features/feature_review-prototype-outcomes/FEATURE_SPEC.md`

## Acceptance criteria

**AC-1 — Record an outcome successfully**
- Given I am authenticated as a `PILOT_SME` and the pilot is in Phase 2 (specFreezeAt is set),
- When I submit the "Record Outcome" form with `loop`, `artefactType`, `artefactDescription`, `metExpectations`, and `smeRating` all provided,
- Then the outcome is stored, an inline confirmation is shown, and the form resets to its empty state.

**AC-2 — Validate required fields**
- Given I am authenticated as a `PILOT_SME`,
- When I submit the form with any required field (`loop`, `artefactType`, `artefactDescription`, `metExpectations`, `smeRating`) absent or invalid,
- Then a GOV.UK error summary is displayed, each error links to its field, and the outcome is not stored.

**AC-3 — Validate rating bounds**
- Given I am authenticated as a `PILOT_SME`,
- When I submit a rating value outside the range 1–5,
- Then a validation error is returned and the outcome is not stored.

**AC-4 — Block outcome creation in Phase 1**
- Given the pilot has not yet reached Phase 2 (specFreezeAt is not set),
- When a `PILOT_SME` attempts to submit the "Record Outcome" form,
- Then the submission is rejected with a validation error indicating that outcomes require Phase 2.

**AC-5 — Restrict create access to PILOT_SME**
- Given I am authenticated as any pilot role other than `PILOT_SME` (Builder, Delivery Lead, or Observer),
- When I attempt to call `POST /api/pilot/outcomes`,
- Then I receive a `403 Forbidden` response and no outcome is stored.

**AC-6 — Outcome is immutable after submission**
- Given an outcome has been successfully submitted,
- When any role attempts to call `PUT`, `PATCH`, or `DELETE` on `/api/pilot/outcomes/:id`,
- Then a `405 Method Not Allowed` response is returned and the record is unchanged.

**AC-7 — Audit log entry on creation**
- Given a `PILOT_SME` successfully submits a new outcome,
- When the outcome is stored,
- Then a `PilotAuditLog` entry is written with `action: 'OUTCOME_CREATED'` and the new outcome's `id` as `entityId`.

## Out of scope
- Editing or deleting submitted outcomes
- Outcomes created during Phase 1
- Bulk submission of multiple outcomes in a single request
- Linking outcomes directly to `PilotMetricEntry` records
