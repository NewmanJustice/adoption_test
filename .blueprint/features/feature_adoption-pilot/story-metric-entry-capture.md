# Story — Metric entry capture

## User story
As a Builder, I want to capture metric entries with required fields so that pilot metrics are consistent and complete.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Create a metric entry**
- Given I am authenticated as a Builder,
- When I submit a metric entry with `metricKey`, `value`, `unit`, `date`, `phase`, `experimentType`, and `role`,
- Then the metric entry is stored successfully.

**AC-2 — Validate required fields**
- Given I am submitting a metric entry,
- When any required field is missing or invalid,
- Then I see a validation error and the entry is not stored.

**AC-3 — Add SME contextual notes**
- Given I am authenticated as an SME and metric entries exist,
- When I navigate to the metric entry page,
- Then I see a dropdown of available metric entries (showing metric key, date, and loop number) so I can select an entry without knowing its ID.

**AC-3a — View existing notes before adding**
- Given I am an SME and I select a metric entry from the dropdown,
- When the selection changes,
- Then any existing notes for that entry are displayed before the note input field.

**AC-3b — Save note and see confirmation**
- Given I am an SME with a metric entry selected and a note written,
- When I submit the form,
- Then the note is stored, the note field is cleared, and the updated notes list is shown immediately.

**AC-3c — SME note visibility to delivery team**
- Given an SME has added notes to a metric entry,
- When a Builder or SME views the metric entry page,
- Then they see an "SME notes" section with a dropdown to select any metric entry and read its notes.

**AC-4 — Restrict write access**
- Given I am an Analyst or Observer,
- When I attempt to create or update a metric entry,
- Then access is denied.

**AC-5 — Preserve metric history on updates**
- Given I am a Builder and a metric entry exists,
- When I update the metric value,
- Then the previous value remains in history and the new value is stored as the latest.

**AC-6 — Availability for aggregation**
- Given a metric entry is stored,
- When dashboard filters include its date, phase, and experiment type,
- Then the entry is available for aggregation.

## Out of scope
- Automated ingestion from external systems
- Bulk import/export of metric entries
