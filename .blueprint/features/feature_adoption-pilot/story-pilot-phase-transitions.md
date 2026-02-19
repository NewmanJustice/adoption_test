# Story — Pilot phase transitions

## User story
As a Builder, I want to transition the pilot through phases with clear gating so that lifecycle progress is controlled and traceable.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Transition to Phase 2 with Spec Freeze**
- Given the pilot is in Phase 1 and a Spec Freeze timestamp is set,
- When I transition the pilot to Phase 2,
- Then the current phase updates to "Phase 2 – Agentic Specification Loops" with a transition timestamp.

**AC-2 — Block Phase 2 without Spec Freeze**
- Given the pilot is in Phase 1 and Spec Freeze is not set,
- When I attempt to transition to Phase 2,
- Then the transition is blocked with a clear message.

**AC-3 — Restrict phase transitions**
- Given a user is not a Builder,
- When they attempt to change the pilot phase,
- Then access is denied and the phase remains unchanged.

**AC-4 — Display current phase**
- Given the pilot overview is displayed,
- When I view the lifecycle section,
- Then the current phase and last transition timestamp are visible.

## Out of scope
- Automatic phase transitions without an explicit user action
- Changing phase definitions or entry conditions
