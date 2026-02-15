# Story — Pilot configuration

## User story
As a Builder (Technical Authority), I want to define the pilot scope and experiment type so that the pilot starts with clear, bounded parameters.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Create pilot configuration**
- Given I am authenticated as a Builder and no pilot configuration exists,
- When I submit a configuration with domain scope and experiment type,
- Then the configuration is stored and the pilot is marked as configured.

**AC-2 — Validate required fields**
- Given I am creating a pilot configuration,
- When any required field (domain scope or experiment type) is missing or invalid,
- Then I see a validation error and the configuration is not saved.

**AC-3 — Initialize lifecycle state**
- Given a pilot configuration is stored,
- When the pilot overview is displayed,
- Then the current phase is set to “Phase 1 – Structural Foundation” and Spec Freeze is unset.

**AC-4 — Read-only access for non-builders**
- Given a pilot configuration exists,
- When a non-Builder user views the configuration,
- Then the values are visible but cannot be edited.

**AC-5 — Restrict configuration changes**
- Given a non-Builder user attempts to create or change the configuration,
- When the action is submitted,
- Then access is denied and the configuration remains unchanged.

## Out of scope
- Managing multiple concurrent pilots
- Editing configuration after creation (unless explicitly added later)
- External reporting integrations or exports
