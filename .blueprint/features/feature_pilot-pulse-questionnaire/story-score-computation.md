# Story 3 — Server-Side Score Computation

## User story
As the system, I need to compute and store Structural Score and Clarity Score for each section on every valid submission so that scores are reproducible from the stored question values and available for trend aggregation.

---

## Context / scope
- Computation is performed server-side on `POST /api/pilot/pulse` before persistence
- Scores are stored alongside raw question values in `pilot_pulse_responses`
- Alignment Index is **not** computed per submission — it is a read-time aggregate (covered in `story-trend-data-api.md`)
- See feature spec: `.blueprint/features/feature_pilot-pulse-questionnaire/FEATURE_SPEC.md` (Section 6 — Rules)

---

## Acceptance criteria

**AC-1 — Structural Score is computed as the mean of the first two questions in each section**
- Given a validated submission with `q1=4, q2=2, q4=3, q5=5, q7=1, q8=3, q10=5, q11=4`,
- When the submission is processed,
- Then the stored scores are:
  - `structural_score_s1 = 3.0` (mean of Q1=4, Q2=2)
  - `structural_score_s2 = 4.0` (mean of Q4=3, Q5=5)
  - `structural_score_s3 = 2.0` (mean of Q7=1, Q8=3)
  - `structural_score_s4 = 4.5` (mean of Q10=5, Q11=4).

**AC-2 — Clarity Score is the raw value of the third question in each section**
- Given a validated submission with `q3=4, q6=2, q9=5, q12=3`,
- When the submission is processed,
- Then:
  - `clarity_score_s1 = 4`
  - `clarity_score_s2 = 2`
  - `clarity_score_s3 = 5`
  - `clarity_score_s4 = 3`.

**AC-3 — Scores are stored with raw question values in the same row**
- Given a successfully processed submission,
- When the `pilot_pulse_responses` row is inspected,
- Then `q1`–`q12` raw values and all eight computed score columns are present in the same row.

**AC-4 — Scores are reproducible from stored raw values**
- Given any stored row in `pilot_pulse_responses`,
- When the Structural Score formula is applied to the stored `q` values,
- Then the result matches the stored score columns exactly (to two decimal places).

**AC-5 — Computation failure does not silently store incorrect data**
- Given a processing error occurs during score computation (e.g. unexpected null after validation),
- When the error is encountered,
- Then the transaction is rolled back,
- And HTTP 500 is returned with an `ApiError` body,
- And no partial row is persisted.

---

## Out of scope
- Alignment Index (read-time computation across responses — see `story-trend-data-api.md`)
- Maturity interpretation labels (not stored; derived at display time if needed)
- Section label display on the visualisation page (covered in `story-trend-charts.md`)
