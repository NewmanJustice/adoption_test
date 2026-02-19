# Story 1 — Pulse Submission API & Database Schema

## User story
As a system, I need a `pilot_pulse_responses` table and a validated submission endpoint so that questionnaire responses are persisted immutably with role attribution, timestamp, and computed scores.

---

## Context / scope
- Internal pilot delivery infrastructure; not part of adoption case processing
- Roles with submission access: `PILOT_BUILDER`, `PILOT_SME`
- Route:
  - `POST /api/pilot/pulse`
- This story covers: database migration, request validation, response persistence, and score storage
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Sections 5–6)

---

## Acceptance criteria

**AC-1 — Database migration creates `pilot_pulse_responses` table**
- Given the migration is applied,
- When the schema is inspected,
- Then the `pilot_pulse_responses` table exists with columns: `id` (UUID PK), `role` (VARCHAR), `submitted_at` (TIMESTAMPTZ), `q1`–`q12` (SMALLINT), `structural_score_s1`, `structural_score_s2`, `structural_score_s3`, `structural_score_s4` (DECIMAL), `clarity_score_s1`, `clarity_score_s2`, `clarity_score_s3`, `clarity_score_s4` (DECIMAL), `free_text` (TEXT NULLABLE),
- And no `user_id`, username, or session identifier column is present.

**AC-2 — Successful submission persists response**
- Given an authenticated `PILOT_BUILDER` or `PILOT_SME` session,
- When `POST /api/pilot/pulse` is called with valid `q1`–`q12` values (each in `[1, 5]`),
- Then the server returns HTTP 201,
- And a row is inserted into `pilot_pulse_responses` with `role` matching `req.session.user.role` and `submitted_at` set to the current UTC timestamp.

**AC-3 — Validation rejects missing or out-of-range questions**
- Given a submission payload where one or more of `q1`–`q12` is absent, null, or outside `[1, 5]`,
- When `POST /api/pilot/pulse` is called,
- Then the server returns HTTP 400 with an `ApiError` body listing each invalid or missing field,
- And no row is inserted.

**AC-4 — Free-text field is optional and sanitised**
- Given a submission where `free_text` is omitted,
- When the request is processed,
- Then the row is stored with `free_text = NULL`.
- Given a submission where `free_text` is present,
- Then the value is sanitised server-side to remove any HTML/script content before storage.

**AC-5 — Role is derived from session, not request body**
- Given a valid submission payload that includes a `role` field in the body,
- When the request is processed,
- Then the stored `role` is taken from `req.session.user.role` only,
- And the body-supplied `role` is ignored.

**AC-6 — Responses are immutable — no update or delete endpoint exists**
- Given a previously submitted response,
- When any `PUT`, `PATCH`, or `DELETE` request is made to `/api/pilot/pulse/:id`,
- Then the server returns HTTP 404 or HTTP 405,
- And no modification to the stored record occurs.

---

## Out of scope
- Score computation logic (covered in `story-score-computation.md`)
- Frontend form (covered in `story-submit-questionnaire.md`)
- Retrieval/aggregation endpoint for visualisation (covered in `story-trend-data-api.md`)
- Export or download of raw responses
