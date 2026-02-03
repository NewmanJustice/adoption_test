# Story — Verify Build, Visual Output, and Accessibility Compliance

## User Story

As a **developer**, I want to **verify that the GOV.UK Frontend v5 upgrade produces a clean build, maintains visual consistency, and preserves or improves accessibility compliance** so that **we can confidently deploy the upgraded system without regressions**.

---

## Context / Scope

- Verification and quality assurance story
- Applies to: Entire frontend application
- Depends on: Completion of all implementation stories
- Aligns with System Spec Section 8 (Accessibility) and Section 12.9 (GOV.UK Design System Integration)
- This is the final story in the upgrade sequence

---

## Acceptance Criteria

**AC-1 — Build completes successfully**
- Given all upgrade changes have been applied,
- When I run the full build process (`npm run build`),
- Then the build completes without errors.

**AC-2 — Zero Sass deprecation warnings**
- Given the primary goal is eliminating `@import` deprecation warnings,
- When I run the build process,
- Then zero Sass deprecation warnings related to `@import` syntax appear in build output.

**AC-3 — Development server starts successfully**
- Given the application needs to run in development mode,
- When I start the development server (`npm run dev`),
- Then the server starts without errors,
- And the application is accessible at the expected URL.

**AC-4 — Visual consistency verification for Header**
- Given the Header component should render correctly,
- When I view pages containing the Header,
- Then the Header appears visually consistent with the pre-upgrade appearance,
- And any minor refinements from v5 do not break the layout.

**AC-5 — Visual consistency verification for Footer**
- Given the Footer component should render correctly,
- When I view pages containing the Footer,
- Then the Footer appears visually consistent with the pre-upgrade appearance,
- And any minor refinements from v5 do not break the layout.

**AC-6 — Visual consistency verification for PhaseBanner**
- Given the PhaseBanner component should render correctly,
- When I view pages containing the PhaseBanner,
- Then the PhaseBanner appears visually consistent with the pre-upgrade appearance,
- And any minor refinements from v5 do not break the layout.

**AC-7 — Visual consistency verification for SkipLink**
- Given the SkipLink component should render correctly,
- When I focus on the SkipLink (Tab key on page load),
- Then the SkipLink appears correctly,
- And it functions as expected (navigates to main content).

**AC-8 — Accessibility tests pass**
- Given WCAG 2.1 AA compliance is required (System Spec Section 8),
- When I run automated accessibility tests (jest-axe, Pa11y),
- Then all tests pass without new violations.

**AC-9 — Keyboard navigation functions correctly**
- Given keyboard accessibility is required,
- When I navigate the application using only keyboard,
- Then all interactive elements are reachable and usable,
- And focus states are clearly visible.

**AC-10 — Screen reader compatibility**
- Given screen reader users must be supported,
- When I test key pages with a screen reader (NVDA or VoiceOver),
- Then content is announced correctly,
- And navigation is understandable.

**AC-11 — Mobile responsiveness maintained**
- Given the system must be mobile-responsive (System Spec Section 9),
- When I view the application at mobile viewport sizes,
- Then components render correctly,
- And the Header mobile navigation toggle functions correctly.

**AC-12 — Unit tests pass**
- Given existing tests should continue to pass,
- When I run the test suite (`npm test`),
- Then all unit tests pass,
- Or I update tests to reflect valid v5 changes.

**AC-13 — No console errors in browser**
- Given JavaScript errors indicate problems,
- When I view the application in a browser,
- Then no GOV.UK Frontend-related errors appear in the browser console.

---

## Verification Checklist

### Build Verification
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors
- [ ] Zero Sass deprecation warnings for `@import`
- [ ] `npm run dev` starts successfully

### Visual Verification
- [ ] Header renders correctly
- [ ] Footer renders correctly
- [ ] PhaseBanner renders correctly
- [ ] SkipLink renders correctly
- [ ] Typography appears correct
- [ ] Spacing appears correct
- [ ] Colours appear correct

### Accessibility Verification
- [ ] Automated accessibility tests pass
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader testing completed
- [ ] Mobile responsiveness verified

### Functional Verification
- [ ] All unit tests pass
- [ ] No console errors
- [ ] Interactive behaviours work

---

## Rollback Criteria

The following issues would trigger a rollback to v4.10.1:

1. **Critical:** Build fails and cannot be resolved within reasonable timeframe
2. **Critical:** Accessibility regressions that violate WCAG 2.1 AA
3. **Critical:** Component rendering failures that break user journeys
4. **High:** Multiple visual inconsistencies that degrade user experience
5. **High:** JavaScript initialisation failures that break interactive behaviours

---

## Out of Scope

- Performance benchmarking (unless regressions observed)
- Load testing
- Cross-browser testing beyond standard development browsers
- End-to-end journey testing (covered by existing test suite)
- New accessibility improvements beyond maintaining current compliance

---

## Definition of Done

- [ ] Build completes without errors
- [ ] Zero Sass `@import` deprecation warnings
- [ ] All four components render correctly
- [ ] Automated accessibility tests pass
- [ ] Keyboard navigation verified
- [ ] Screen reader testing completed
- [ ] Mobile responsiveness verified
- [ ] All unit tests pass
- [ ] No browser console errors
- [ ] Sign-off from QA/Tester
