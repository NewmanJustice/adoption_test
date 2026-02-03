# Understanding Document — GOV.UK Frontend v5 Upgrade

## Summary

This feature addresses a **technical upgrade** of the `govuk-frontend` npm package from version 4.10.1 to version 5.14.0 within the Adoption Digital Platform. The primary driver is the elimination of Sass deprecation warnings caused by the deprecated `@import` syntax, which will be removed in Dart Sass 2.0.

This is **not a user-facing feature** - end users should experience no visible change to functionality. The upgrade is purely technical, affecting the build toolchain and frontend styling infrastructure.

---

## Key Behaviours (Happy Path)

1. **Package Version**: `govuk-frontend` version 5.x is installed
2. **Sass Syntax**: All Sass imports use `@use` directive instead of deprecated `@import`
3. **Import Paths**: Import paths use the new `/dist/govuk/all.scss` structure
4. **Build Output**: Sass compilation produces zero deprecation warnings
5. **Component Styling**: All GOV.UK components (Header, Footer, PhaseBanner, SkipLink) render correctly
6. **JavaScript Behaviour**: Interactive components initialise and function correctly
7. **Accessibility**: WCAG 2.1 AA compliance is maintained or improved

---

## Components In Scope

| Component    | CSS Classes | JavaScript | Notes |
|--------------|-------------|------------|-------|
| Header       | Yes         | Yes (`data-module="govuk-header"`) | Mobile navigation toggle |
| Footer       | Yes         | No         | Static component |
| PhaseBanner  | Yes         | No         | Static component |
| SkipLink     | Yes         | Yes (`data-module="govuk-skip-link"`) | Focus management |

---

## Initial Assumptions

1. **Sass Compiler**: Current toolchain uses Dart Sass 1.33+ (required for `@use` support)
2. **No Custom Overrides**: No Sass variable overrides exist in the current codebase
3. **Class Name Stability**: The four components in use have stable class names in v5
4. **Build Tool Compatibility**: Webpack/Vite can resolve new import paths without modification
5. **JavaScript Patterns**: Components using `data-module` continue to work with v5 initialisation

---

## Identified Ambiguities

1. **Q: What constitutes "zero deprecation warnings"?**
   - Assumption: Specifically Sass `@import` deprecation warnings; other unrelated warnings may exist

2. **Q: What defines "visually consistent"?**
   - Assumption: Layout and structure unchanged; minor refinements from v5 bug fixes are acceptable

3. **Q: How to verify JavaScript initialisation without a running application?**
   - Assumption: Tests can verify the presence of correct `data-module` attributes and import patterns

---

## Story Dependencies

```
Story 1: Investigate v5 Changes (research spike)
    |
    v
Story 2: Upgrade Package and Sass Imports
    |
    v
Story 3: Audit Component Class Names
    |
    v
Story 4: Update JavaScript Initialisation
    |
    v
Story 5: Verify Build and Accessibility
```

---

## Constraints

- **No Functional Changes**: This is a like-for-like upgrade; no new features introduced
- **No Design Changes**: Visual output should remain consistent
- **Accessibility Compliance**: Must maintain WCAG 2.1 AA (System Spec Section 8)
- **GOV.UK Patterns**: Must align with GDS standards (System Spec Section 12.9)

---

## Test Focus Areas

Given this is a technical upgrade, tests should verify:

1. **Configuration Correctness**: Package version, import paths
2. **Build Success**: No errors, no deprecation warnings
3. **Structural Integrity**: GOV.UK class names exist in components
4. **Component Rendering**: Components render without errors
5. **Accessibility**: Automated accessibility checks pass

---

## Out of Scope for Testing

- Performance benchmarking
- Cross-browser visual regression testing
- End-to-end user journey testing
- New component introduction
- Backend/API changes
