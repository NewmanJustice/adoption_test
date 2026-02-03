# Story — Investigate GOV.UK Frontend v5 Changes

## User Story

As a **developer**, I want to **investigate the breaking changes and migration requirements between GOV.UK Frontend v4.10.1 and v5.14.0** so that **I can plan the upgrade work accurately and identify any risks before implementation begins**.

---

## Context / Scope

- Technical spike/research story
- Applies to: All developers working on the Adoption Digital Platform
- This story is a prerequisite for all subsequent upgrade stories
- Output: Documented findings to inform implementation approach
- Components currently in use: Header, Footer, PhaseBanner, SkipLink

---

## Acceptance Criteria

**AC-1 — Review official migration guide**
- Given the GOV.UK Frontend v5 migration guide is available,
- When I review the migration documentation,
- Then I document all breaking changes relevant to our codebase.

**AC-2 — Audit current component usage**
- Given the current codebase uses Header, Footer, PhaseBanner, and SkipLink components,
- When I compare our usage against v5 specifications,
- Then I identify any class name changes required for each component.

**AC-3 — Verify Sass compiler compatibility**
- Given Dart Sass 1.33+ is required for `@use` and `@forward` support,
- When I check `package-lock.json` and build configuration,
- Then I confirm the current Sass compiler version meets requirements,
- And I document any upgrade needed for the Sass compiler itself.

**AC-4 — Assess JavaScript initialisation changes**
- Given components use `data-module` attributes (e.g., `data-module="govuk-header"`, `data-module="govuk-skip-link"`),
- When I review the v5 JavaScript API documentation,
- Then I document any changes required to component initialisation patterns.

**AC-5 — Check for custom Sass variable overrides**
- Given the migration is more complex if Sass variables are overridden,
- When I audit `client/src/styles/` for any custom variable overrides,
- Then I document any overrides found and the migration approach required.

**AC-6 — Document findings**
- Given all investigations are complete,
- When I compile findings,
- Then I create a summary document listing:
  - All required changes,
  - Any risks identified,
  - Recommended implementation sequence,
  - And estimated effort for each change.

---

## Out of Scope

- Actual implementation of changes (covered by subsequent stories)
- Changes to custom components beyond GOV.UK Frontend wrapper components
- Upgrade of any other npm packages
- Performance benchmarking

---

## Definition of Done

- [ ] Migration guide reviewed and documented
- [ ] All four current components assessed for v5 compatibility
- [ ] Sass compiler version verified
- [ ] JavaScript initialisation requirements documented
- [ ] Custom overrides audit completed
- [ ] Summary document created and shared with team
