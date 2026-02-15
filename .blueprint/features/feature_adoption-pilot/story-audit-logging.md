# Story — Audit logging for pilot changes

## User story
As a governance auditor, I want an immutable audit trail of metric and phase changes so that pilot governance is traceable.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Log metric creation**
- Given a metric entry is created,
- When the entry is stored,
- Then an audit record is written with user, timestamp, action, and metric identifier.

**AC-2 — Log metric updates**
- Given a metric entry is updated,
- When the update is stored,
- Then an audit record is written and the previous value remains retrievable.

**AC-3 — Log phase transitions**
- Given a pilot phase transition occurs,
- When the phase updates,
- Then an audit record is written with from/to phase and user details.

**AC-4 — Audit immutability**
- Given audit records exist,
- When a standard pilot role attempts to edit or delete them,
- Then the action is blocked and the records remain unchanged.

**AC-5 — Audit log visibility**
- Given an authorized governance user views the audit log,
- When they apply date range or action filters,
- Then only matching audit records are displayed.

## Out of scope
- Exporting audit logs to external systems
- Administrative override deletion of audit records
