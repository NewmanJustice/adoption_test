# Implementation Plan — GOV.UK Frontend v5 Upgrade

## Summary

This plan details the upgrade of `govuk-frontend` from v4.10.1 to v5.14.0, including migration from deprecated Sass `@import` syntax to modern `@use` module syntax. The upgrade affects 2 files directly, with 4 components requiring verification.

**Primary Goal:** Eliminate Sass deprecation warnings while maintaining visual and functional parity.

---

## Understanding

### Behaviours to Implement

| Behaviour | Source |
|-----------|--------|
| Package version updated to v5.14.0 | Story 2, AC-1 |
| Sass imports use `@use` syntax | Story 2, AC-2, AC-3 |
| Import path uses `/dist/govuk/` | Story 2, AC-2 |
| No Sass deprecation warnings | Story 2, AC-6; Story 5, AC-2 |
| Component class names compatible with v5 | Story 3, AC-1 to AC-4 |
| `data-module` attributes present | Story 4, AC-2, AC-3 |
| Build completes successfully | Story 5, AC-1 |
| All tests pass | Story 5, AC-12 |

### Test Count

- **Total tests in test file:** 15 test cases
- **Story 1 (Config):** 2 tests
- **Story 2 (Package/Sass):** 4 tests
- **Story 3 (Class Names):** 4 tests
- **Story 4 (JavaScript):** 3 tests
- **Story 5 (Build):** 2 tests

---

## Files to Create/Modify

### Files to Modify

| File | Change Required |
|------|-----------------|
| `/workspaces/adoption_test/package.json` | Update `govuk-frontend` from `^4.10.1` to `^5.14.0`; add `sass` to devDependencies |
| `/workspaces/adoption_test/client/src/styles/index.scss` | Change `@import` to `@use` with v5 path |

### Files to Verify (No Changes Expected)

| File | Verification |
|------|--------------|
| `/workspaces/adoption_test/client/src/components/Header.tsx` | Class names and `data-module` attribute compatible |
| `/workspaces/adoption_test/client/src/components/Footer.tsx` | Class names compatible |
| `/workspaces/adoption_test/client/src/components/PhaseBanner.tsx` | Class names compatible |
| `/workspaces/adoption_test/client/src/components/SkipLink.tsx` | Class names and `data-module` attribute compatible |

---

## Implementation Steps (Ordered)

### Step 1: Add Sass Compiler Dependency

**File:** `/workspaces/adoption_test/package.json`

**Change:** Add `sass` (Dart Sass) to devDependencies.

**Rationale:** `@use` syntax requires Dart Sass 1.33+. Current package.json lacks sass dependency.

```json
"devDependencies": {
  "sass": "^1.77.0",
  ...
}
```

### Step 2: Update GOV.UK Frontend Version

**File:** `/workspaces/adoption_test/package.json`

**Change:** Update version from `^4.10.1` to `^5.14.0`.

```json
"dependencies": {
  "govuk-frontend": "^5.14.0"
}
```

**Post-action:** Run `npm install` to update `node_modules`.

### Step 3: Migrate Sass Import Syntax

**File:** `/workspaces/adoption_test/client/src/styles/index.scss`

**Current (v4):**
```scss
@import 'govuk-frontend/govuk/all';
```

**Required (v5):**
```scss
@use 'govuk-frontend/dist/govuk/all' as *;
```

**Notes:**
- Path changes from `/govuk/all` to `/dist/govuk/all`
- `as *` exposes styles without namespace (maintains current behaviour)
- File extension optional but recommended: `all.scss`

### Step 4: Verify Component Class Names

**Files to audit:**
- `Header.tsx` - uses `govuk-header`, `govuk-header__container`, etc.
- `Footer.tsx` - uses `govuk-footer`, `govuk-footer__meta`, etc.
- `PhaseBanner.tsx` - uses `govuk-phase-banner`, `govuk-tag`, etc.
- `SkipLink.tsx` - uses `govuk-skip-link`

**Expected outcome:** No changes required. GOV.UK Frontend v5 maintains backward compatibility for these class names per the v5 migration guide.

### Step 5: Verify JavaScript Initialisation

**Components with `data-module`:**
- `Header.tsx`: `data-module="govuk-header"` - OK
- `SkipLink.tsx`: `data-module="govuk-skip-link"` - OK

**Expected outcome:** No changes required. The `data-module` attribute pattern remains valid in v5. React components do not currently import GOV.UK JS, so no import path changes needed.

### Step 6: Run Tests

```bash
npm test -- test/feature_upgrade-gov-design-system.test.js
```

**Expected:** All 15 tests pass.

### Step 7: Verify Build (if build script exists)

```bash
npm run build
```

**Expected:** Build completes with zero Sass deprecation warnings for `@import`.

---

## Breaking Changes to Handle

### From GOV.UK Frontend v5 Migration Guide

| Change | Impact | Action |
|--------|--------|--------|
| Import path changed to `/dist/` | **High** | Update in Step 3 |
| `@import` deprecated for `@use` | **High** | Update in Step 3 |
| Crown logo SVG updated | **None** | Footer.tsx uses inline SVG (OGL logo), not Crown logo |
| New focus styles | **Low** | Automatic improvement, no action needed |
| JavaScript ES modules | **None** | No current JS imports from govuk-frontend |

### Class Names Unchanged in v5

The following class names used in current components are **unchanged** in v5:
- `govuk-header` and all child classes
- `govuk-footer` and all child classes
- `govuk-phase-banner` and all child classes
- `govuk-skip-link`
- `govuk-tag`
- `govuk-link`
- `govuk-width-container`
- `govuk-visually-hidden`

---

## Risks/Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Build toolchain incompatible with `@use` syntax | Low | High | Verify Dart Sass version after `npm install` |
| Undocumented class name changes | Low | Medium | Manual visual verification after upgrade |
| React lifecycle conflicts with GOV.UK JS init | Low | Medium | Current components work without JS init; monitor if issues arise |

### Open Questions

1. **Q: Is there a build script configured in the client workspace?**
   - Current `package.json` has no `build` script at root level
   - May need to verify client workspace configuration

2. **Q: Are jest-axe and accessibility testing tools installed?**
   - Not currently in `devDependencies`
   - Story 5 accessibility tests may need these added

3. **Q: Is there a development server configured?**
   - `npm run dev` script exists but depends on workspace scripts
   - Verification of dev server may require workspace setup

---

## Definition of Done

- [ ] `govuk-frontend` updated to `^5.14.0` in `package.json`
- [ ] `sass` added to `devDependencies`
- [ ] `npm install` completes without errors
- [ ] `client/src/styles/index.scss` uses `@use` syntax with `/dist/` path
- [ ] All 15 tests in `test/feature_upgrade-gov-design-system.test.js` pass
- [ ] No Sass `@import` deprecation warnings
- [ ] Component class names verified as v5-compatible
- [ ] `data-module` attributes verified as present and correct
- [ ] Build completes successfully (if build script available)

---

## Appendix: GOV.UK Frontend v5 Migration Reference

**Official Migration Guide:** https://frontend.design-system.service.gov.uk/migrating-to-v5/

### Key Changes Summary

1. **Sass module system:** Replace `@import` with `@use`
2. **New import paths:** Use `/dist/govuk/` instead of `/govuk/`
3. **Namespace handling:** Use `as *` to avoid prefixing
4. **JavaScript:** `initAll()` still works; `createAll()` is new alternative
5. **Accessibility:** Improved focus states applied automatically

---

*Plan created: 2026-02-03*
*Author: Codey (Developer Agent)*
