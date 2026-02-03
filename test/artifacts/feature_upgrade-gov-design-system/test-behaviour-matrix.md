# Test Behaviour Matrix — GOV.UK Frontend v5 Upgrade

## Story 1: Investigate v5 Changes

| AC | Description | Test ID | Test Description | Notes |
|----|-------------|---------|------------------|-------|
| AC-1 | Review official migration guide | - | Not testable (research activity) | Documentation deliverable |
| AC-2 | Audit current component usage | - | Not testable (research activity) | Documentation deliverable |
| AC-3 | Verify Sass compiler compatibility | T-1.1 | Verify Dart Sass version meets minimum requirement | Checks package.json/lock |
| AC-4 | Assess JavaScript initialisation changes | - | Not testable (research activity) | Documentation deliverable |
| AC-5 | Check for custom Sass variable overrides | T-1.2 | Verify no custom Sass overrides exist | File content check |
| AC-6 | Document findings | - | Not testable (documentation) | Documentation deliverable |

---

## Story 2: Upgrade Package and Sass Imports

| AC | Description | Test ID | Test Description | Notes |
|----|-------------|---------|------------------|-------|
| AC-1 | Update package version | T-2.1 | Package version is 5.x | Checks package.json |
| AC-2 | Update main Sass import path | T-2.2 | Sass uses correct v5 import path | Pattern match in files |
| AC-3 | Migrate all Sass imports to @use | T-2.3 | No @import statements for govuk-frontend | Pattern match in files |
| AC-4 | Handle namespace requirements | T-2.4 | @use statement uses valid namespace pattern | Pattern match in files |
| AC-5 | Resolve transitive import issues | T-2.5 | Build completes without import errors | Build execution test |
| AC-6 | Build without Sass deprecation warnings | T-2.6 | Build output contains no deprecation warnings | Build output check |
| AC-7 | CSS output generated correctly | T-2.7 | Build produces CSS output file | File existence check |

---

## Story 3: Audit Component Class Names

| AC | Description | Test ID | Test Description | Notes |
|----|-------------|---------|------------------|-------|
| AC-1 | Audit Header component | T-3.1 | Header uses valid govuk-header class names | Component structure check |
| AC-2 | Audit Footer component | T-3.2 | Footer uses valid govuk-footer class names | Component structure check |
| AC-3 | Audit PhaseBanner component | T-3.3 | PhaseBanner uses valid govuk-phase-banner class names | Component structure check |
| AC-4 | Audit SkipLink component | T-3.4 | SkipLink uses valid govuk-skip-link class name | Component structure check |
| AC-5 | Audit additional GOV.UK components | T-3.5 | All govuk- class prefixes are valid v5 classes | Pattern validation |
| AC-6 | Update React component props | T-3.6 | Component props use valid class names | Props check (if applicable) |
| AC-7 | Verify no hardcoded class names in tests | T-3.7 | Test files use valid class names | Test file audit |

---

## Story 4: Update JavaScript Initialisation

| AC | Description | Test ID | Test Description | Notes |
|----|-------------|---------|------------------|-------|
| AC-1 | Audit current initialisation patterns | T-4.1 | Document data-module attributes found | Pattern search |
| AC-2 | Update Header JavaScript | T-4.2 | Header has correct data-module attribute | Attribute check |
| AC-3 | Update SkipLink JavaScript | T-4.3 | SkipLink has correct data-module attribute | Attribute check |
| AC-4 | Update JavaScript import statements | T-4.4 | JS imports use v5 patterns | Import pattern check |
| AC-5 | Verify React lifecycle integration | T-4.5 | Initialisation uses useEffect pattern | Code pattern check |
| AC-6 | Test interactive behaviours | - | Not automated (manual testing) | Manual verification |

---

## Story 5: Verify Build and Accessibility

| AC | Description | Test ID | Test Description | Notes |
|----|-------------|---------|------------------|-------|
| AC-1 | Build completes successfully | T-5.1 | npm run build exits with code 0 | Build execution |
| AC-2 | Zero Sass deprecation warnings | T-5.2 | Build output has no @import warnings | Build output check |
| AC-3 | Development server starts | - | Not automated (manual verification) | Manual step |
| AC-4 | Header visual consistency | T-5.3 | Header component renders without errors | Render test |
| AC-5 | Footer visual consistency | T-5.4 | Footer component renders without errors | Render test |
| AC-6 | PhaseBanner visual consistency | T-5.5 | PhaseBanner component renders without errors | Render test |
| AC-7 | SkipLink visual consistency | T-5.6 | SkipLink component renders without errors | Render test |
| AC-8 | Accessibility tests pass | T-5.7 | No accessibility violations detected | jest-axe |
| AC-9 | Keyboard navigation | - | Not automated (manual testing) | Manual verification |
| AC-10 | Screen reader compatibility | - | Not automated (manual testing) | Manual verification |
| AC-11 | Mobile responsiveness | - | Not automated (manual testing) | Manual verification |
| AC-12 | Unit tests pass | T-5.8 | All existing tests pass | Jest execution |
| AC-13 | No console errors | - | Not automated (requires browser) | Manual verification |

---

## Traceability Summary

| Story | Total ACs | Testable ACs | Tests Created | Manual Only |
|-------|-----------|--------------|---------------|-------------|
| Story 1 | 6 | 2 | 2 | 4 (research/docs) |
| Story 2 | 7 | 7 | 7 | 0 |
| Story 3 | 7 | 7 | 7 | 0 |
| Story 4 | 6 | 5 | 5 | 1 |
| Story 5 | 13 | 8 | 8 | 5 |
| **Total** | **39** | **29** | **29** | **10** |

---

## Tests Not Yet Implemented (Blocked or Manual)

| AC | Reason |
|----|--------|
| Story 1 AC-1,2,4,6 | Research/documentation activity - not testable |
| Story 4 AC-6 | Requires interactive browser testing |
| Story 5 AC-3 | Requires running dev server |
| Story 5 AC-9,10,11 | Manual testing required (keyboard, screen reader, mobile) |
| Story 5 AC-13 | Requires browser console inspection |
