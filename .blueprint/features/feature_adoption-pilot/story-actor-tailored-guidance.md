# Story — Actor-tailored dashboard guidance

## User story
As a pilot user, I want dashboard guidance tailored to my role so that I understand what actions I need to take and how to use the dashboard effectively.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`
- Three actor types: Builder, SME, Observer

## Acceptance criteria
**AC-1 — Display role-specific guidance**
- Given I am authenticated as a specific role,
- When I view the dashboard,
- Then I see guidance text explaining what actions are available to my role and what steps I should take.

**AC-2 — Builder guidance**
- Given I am authenticated as a Builder,
- When I view the dashboard guidance,
- Then I see instructions for: configuring pilot scope, confirming Spec Freeze, reviewing metrics and deviations, and identifying structural integrity issues.

**AC-3 — SME guidance**
- Given I am authenticated as an SME,
- When I view the dashboard guidance,
- Then I see instructions for: providing feedback inputs, reviewing prototype outcomes, and adding contextual notes to metrics.

**AC-4 — Observer guidance**
- Given I am authenticated as an Observer,
- When I view the dashboard guidance,
- Then I see instructions for: viewing metrics, interpreting summary cards and trends, and using filters to explore pilot progress.

**AC-5 — Guidance dismissal**
- Given guidance is displayed,
- When I dismiss or collapse the guidance panel,
- Then my preference is saved and the guidance remains collapsed on subsequent visits unless I choose to expand it.

**AC-6 — Contextual help for filters and controls**
- Given I interact with a filter or control,
- When I hover over or click a help icon,
- Then a tooltip or help text explains what the control does and how it affects the displayed data.

## Out of scope
- Multi-language support for guidance
- Customization of guidance text by users
- Video or interactive tutorials
