# Story — Upgrade GOV.UK Frontend Package and Migrate Sass Imports

## User Story

As a **developer**, I want to **upgrade the `govuk-frontend` package from v4.10.1 to v5.14.0 and migrate Sass imports to use the `@use` module syntax** so that **the build process eliminates Sass deprecation warnings and aligns with modern Sass standards**.

---

## Context / Scope

- Technical upgrade story
- Applies to: Frontend build toolchain and Sass compilation
- Depends on: Completion of investigation story (story-investigate-v5-changes)
- Files affected:
  - `package.json` (package version)
  - `client/src/styles/index.scss` (Sass import syntax)
  - Any other `.scss` files importing GOV.UK Frontend
- This story focuses on package version and Sass syntax changes only

---

## Acceptance Criteria

**AC-1 — Update package version**
- Given `govuk-frontend` is currently at version `^4.10.1` in `package.json`,
- When I update the version to `^5.14.0`,
- Then `npm install` completes successfully without errors.

**AC-2 — Update main Sass import path**
- Given the current import uses `@import 'govuk-frontend/govuk/all'`,
- When I update to `@use 'govuk-frontend/dist/govuk/all.scss'`,
- Then the import path resolves correctly during Sass compilation.

**AC-3 — Migrate all Sass imports to @use syntax**
- Given any Sass file may contain deprecated `@import` statements for GOV.UK Frontend,
- When I convert all such imports to use `@use` directive,
- Then all imports follow the modern Sass module syntax pattern.

**AC-4 — Handle namespace requirements**
- Given `@use` imports create a namespace by default,
- When I import GOV.UK Frontend styles,
- Then I either:
  - Use `@use ... as *` to expose all without namespace, OR
  - Use appropriate namespace references where variables/mixins are used.

**AC-5 — Resolve any transitive import issues**
- Given GOV.UK Frontend v5 may have changed internal import structure,
- When I compile the Sass,
- Then all transitive dependencies resolve correctly without manual intervention.

**AC-6 — Build completes without Sass deprecation warnings**
- Given the primary goal is eliminating deprecation warnings,
- When I run the full build process,
- Then zero Sass deprecation warnings related to `@import` are produced,
- And any remaining warnings are unrelated to GOV.UK Frontend imports.

**AC-7 — CSS output is generated correctly**
- Given the build process should produce functional CSS,
- When I inspect the compiled CSS output,
- Then GOV.UK Frontend styles are present and correctly compiled.

---

## Technical Notes

### Before (v4 syntax)
```scss
@import 'govuk-frontend/govuk/all';
```

### After (v5 syntax)
```scss
@use 'govuk-frontend/dist/govuk/all.scss';
```

### Alternative with exposed namespace
```scss
@use 'govuk-frontend/dist/govuk/all.scss' as *;
```

---

## Out of Scope

- Component class name changes (separate story)
- JavaScript initialisation changes (separate story)
- Visual verification (separate story)
- Accessibility testing (separate story)
- Changes to custom application styles beyond import syntax

---

## Definition of Done

- [ ] `govuk-frontend` updated to v5.14.0 in `package.json`
- [ ] All Sass imports migrated to `@use` syntax
- [ ] `npm install` completes without errors
- [ ] Build process completes successfully
- [ ] Zero Sass deprecation warnings for `@import`
- [ ] CSS output verified as present and correct
