# Story — Metric entry capture

## User story
As a Delivery Lead, I want to capture metric entries with required fields so that pilot metrics are consistent and complete.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Create a metric entry**
- Given I am authenticated as a Delivery Lead or Builder,
- When I submit a metric entry with `metricKey`, `value`, `unit`, `date`, `phase`, `experimentType`, and `role`,
- Then the metric entry is stored successfully.

**AC-2 — Validate required fields**
- Given I am submitting a metric entry,
- When any required field is missing or invalid,
- Then I see a validation error and the entry is not stored.

**AC-3 — Add SME contextual notes**
- Given I am authenticated as an SME and a metric entry exists,
- When I submit a contextual note for that entry,
- Then the note is stored without altering the metric value.

**AC-4 — Restrict write access**
- Given I am an Analyst or Observer,
- When I attempt to create or update a metric entry,
- Then access is denied.

**AC-5 — Preserve metric history on updates**
- Given I am a Delivery Lead or Builder and a metric entry exists,
- When I update the metric value,
- Then the previous value remains in history and the new value is stored as the latest.

**AC-6 — Availability for aggregation**
- Given a metric entry is stored,
- When dashboard filters include its date, phase, and experiment type,
- Then the entry is available for aggregation.

## Out of scope
- Automated ingestion from external systems
- Bulk import/export of metric entries
