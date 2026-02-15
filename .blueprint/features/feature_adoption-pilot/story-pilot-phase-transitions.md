# Story — Pilot phase transitions

## User story
As a Delivery Lead, I want to transition the pilot through phases with clear gating so that lifecycle progress is controlled and traceable.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`

## Acceptance criteria
**AC-1 — Transition to Phase 2 with Spec Freeze**
- Given the pilot is in Phase 1 and a Spec Freeze timestamp is set,
- When I transition the pilot to Phase 2,
- Then the current phase updates to “Phase 2 – Agentic Specification Loops” with a transition timestamp.

**AC-2 — Block Phase 2 without Spec Freeze**
- Given the pilot is in Phase 1 and Spec Freeze is not set,
- When I attempt to transition to Phase 2,
- Then the transition is blocked with a clear message.

**AC-3 — Transition to Phase 3 with stability confirmation**
- Given the pilot is in Phase 2 and structural stability is confirmed,
- When I transition the pilot to Phase 3,
- Then the current phase updates to “Phase 3 – Controlled Implementation” with a transition timestamp.

**AC-4 — Block Phase 3 without stability confirmation**
- Given the pilot is in Phase 2 and structural stability is not confirmed,
- When I attempt to transition to Phase 3,
- Then the transition is blocked with a clear message.

**AC-5 — Restrict phase transitions**
- Given a user is not a Delivery Lead,
- When they attempt to change the pilot phase,
- Then access is denied and the phase remains unchanged.

**AC-6 — Display current phase**
- Given the pilot overview is displayed,
- When I view the lifecycle section,
- Then the current phase and last transition timestamp are visible.

## Out of scope
- Automatic phase transitions without an explicit user action
- Changing phase definitions or entry conditions
