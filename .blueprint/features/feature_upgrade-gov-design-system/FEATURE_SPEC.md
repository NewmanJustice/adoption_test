# Feature Specification — Upgrade GOV.UK Design System (v4 to v5)

## 1. Feature Intent
**Why this feature exists.**

This feature addresses a **technical debt and modernisation requirement** for the Adoption Digital Platform's frontend implementation.

### Problem Being Addressed
- The current implementation uses `govuk-frontend` version 4.10.1, which employs deprecated Sass `@import` syntax
- Sass has deprecated `@import` in favour of `@use` and `@forward`, with planned removal in Dart Sass 2.0
- Build tools and IDEs generate deprecation warnings, creating noise and obscuring genuine issues
- The platform is not benefiting from accessibility improvements, bug fixes, and new component patterns introduced in v5

### User or System Need
- **Developer Experience:** Eliminate Sass deprecation warnings to maintain clean build output
- **Maintainability:** Align with modern Sass module system for better encapsulation and explicit dependencies
- **Accessibility:** Gain access to improved accessibility features in GOV.UK Frontend v5
- **Compliance:** Maintain alignment with Government Digital Service (GDS) recommended patterns

### How This Supports System Purpose
This feature directly supports the System Specification (Section 12.9 - GOV.UK Design System Integration) which mandates:
- Use of GOV.UK Design System components as base
- WCAG 2.1 AA compliance as minimum standard
- Progressive enhancement principles

Upgrading to v5 ensures continued adherence to these requirements while benefiting from the latest GDS research and accessibility improvements.

> **System Spec Alignment:** This feature reinforces Section 12.9 (GOV.UK Design System Integration) and Section 8 (Accessibility cross-cutting concern). No conflict identified.

---

## 2. Scope
### In Scope
- **Package Upgrade:** Update `govuk-frontend` from v4.10.1 to v5.14.0 in both root and client `package.json`
- **Sass Migration:** Convert all Sass files from `@import` to `@use` module syntax
- **Import Path Updates:** Update import to `@use 'govuk-frontend' as *` (uses package exports)
- **Rebrand Activation:** Add `govuk-template--rebranded` class to HTML element for blue header styling
- **Asset Copying:** Copy GOV.UK assets (fonts, images) from `node_modules/govuk-frontend/dist/govuk/assets/` to `client/public/assets/`
- **Header Component Update:** Add Tudor Crown SVG and new GOV.UK logotype with raised dot to Header component
- **Build Verification:** Ensure build process completes successfully
- **Visual Regression Check:** Verify components render correctly with rebrand styling
- **Accessibility Verification:** Confirm WCAG 2.1 AA compliance is maintained or improved

### Out of Scope
- **New Component Introduction:** This feature does not add new GOV.UK components to the system
- **Custom Component Redesign:** Existing React wrapper components retain their current architecture; only class names and imports are updated
- **Design Changes:** No visual design modifications beyond what the v5 upgrade naturally introduces
- **GOV.UK Prototype Kit:** Any prototype kit usage is separate from the production codebase
- **Backend Changes:** This is a frontend-only change; no server-side modifications required

---

## 3. Actors Involved
**Who interacts with this feature.**

### Developers
- **Can do:** Execute the upgrade, update Sass imports, modify component class names, run build verification
- **Cannot do:** Approve design deviations from GOV.UK patterns without escalation

### QA/Testers
- **Can do:** Verify visual consistency, confirm accessibility compliance, validate build output cleanliness
- **Cannot do:** Approve functional changes if upgrade introduces behavioural differences

### End Users (All Roles per Section 4 of System Spec)
- **Impact:** Transparent - users should experience no visible change to functionality
- **Expectation:** Existing journeys continue to work identically; any accessibility improvements are automatically applied

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

### Happy-Path Behaviour
1. Developer updates `govuk-frontend` package version from `^4.10.1` to `^5.14.0`
2. Developer updates Sass entry point (`client/src/styles/index.scss`) to use `@use` syntax with new import path
3. Developer audits existing React components for deprecated class names
4. Developer updates any class names that changed in v5
5. Developer updates JavaScript initialisation patterns if required
6. Build process completes successfully with zero Sass deprecation warnings
7. All existing pages render correctly with GOV.UK Design System styling
8. Accessibility tests pass at WCAG 2.1 AA level

### Key Alternatives or Branches
- **Class Name Unchanged:** If a component's class names have not changed in v5, no modification required
- **JavaScript Not Used:** Components that are purely CSS-based (no `data-module` JS behaviour) require only Sass updates
- **Custom Overrides:** Any custom Sass overrides must be migrated to use the `@use` pattern with appropriate namespacing

### User-Visible Outcomes
- **No Change Expected:** Users should see no functional or significant visual differences
- **Minor Visual Refinements:** Some components may have subtle visual improvements from v5 bug fixes
- **Improved Accessibility:** Screen reader users may benefit from improved ARIA patterns

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

This feature is **infrastructure-level** and does not interact with the adoption case lifecycle or domain state model.

### States Affected
- **None** - This is a technical upgrade with no impact on case states, party records, or workflow progression

### Feature Classification
- **State-Creating:** No
- **State-Transitioning:** No
- **State-Constraining:** No

This feature is **system-invariant** with respect to domain state.

---

## 6. Rules & Decision Logic
**New or exercised rules.**

### Rule: Sass Module Syntax
- **Description:** All Sass imports must use `@use` directive instead of deprecated `@import`
- **Inputs:** Sass files requiring GOV.UK Frontend styles
- **Outputs:** Compiled CSS with no deprecation warnings
- **Deterministic:** Yes - syntax is prescribed by Sass specification

### Rule: Import Path Convention
- **Description:** GOV.UK Frontend v5 exports from `/dist/` path
- **Inputs:** Package import statements
- **Outputs:** Valid module resolution
- **Deterministic:** Yes - path is specified by package structure

### Rule: Class Name Compatibility
- **Description:** Component class names must match v5 specifications
- **Inputs:** GOV.UK Frontend v5 documentation, existing component markup
- **Outputs:** Correctly styled components
- **Deterministic:** Yes - class names are specified by design system

---

## 7. Dependencies
**What this feature relies on.**

### System Components
- **React Frontend Application:** `client/` directory structure and build toolchain
- **Sass Compiler:** Must support Dart Sass 1.x with `@use` directive (current tooling assumed compliant)
- **Node.js Package Manager:** npm with workspace support (confirmed in `package.json`)

### External Systems
- **GOV.UK Frontend npm Package:** Published v5.14.0 package on npm registry
- **GOV.UK Design System Documentation:** Reference for migration guidance and class name changes

### Technical Dependencies
- **Dart Sass 1.33+:** Required for full `@use` and `@forward` support
- **Compatible Build Tool:** Webpack/Vite/similar must be configured for Sass compilation

### Policy Dependencies
- None - this is a technical alignment with GDS standards already mandated by System Spec

---

## 8. Non-Functional Considerations
**Only where relevant.**

### Performance Sensitivity
- **Build Time:** Minor impact expected; `@use` is marginally more efficient than `@import`
- **Runtime:** No runtime performance impact; CSS output is equivalent
- **Bundle Size:** May slightly change due to v5 CSS differences; expected to be neutral or improved

### Audit/Logging Needs
- **None** - Technical upgrade does not affect audit trail requirements

### Error Tolerance
- **Build Failure Risk:** If upgrade is incomplete, build will fail with clear Sass compilation errors
- **Rollback Path:** Git version control allows reversion to v4.10.1 if critical issues discovered

### Security Implications
- **None** - No change to authentication, authorisation, or data handling
- **Supply Chain:** Standard npm package from GDS-maintained repository; follow normal dependency verification practices

### Accessibility Implications
- **Positive:** v5 includes accessibility improvements researched by GDS
- **Verification Required:** Must run accessibility tests to confirm no regressions

---

## 9. Assumptions & Open Questions
**What must be true for this feature to work.**

### Assumptions
1. **Sass Compiler Compatibility:** Current build toolchain uses Dart Sass 1.33+ (not node-sass or LibSass)
2. **No Breaking Class Name Changes in Used Components:** The specific components currently in use (Header, Footer, PhaseBanner, SkipLink) have stable class names in v5
3. **JavaScript Initialisation Pattern:** Components using `data-module` attribute continue to work with v5 initialisation approach, or can be updated straightforwardly
4. **No Custom Sass Variable Overrides:** Current implementation does not override GOV.UK Frontend Sass variables (if it does, migration is more complex)
5. **Build Tool Configuration:** Webpack/Vite configuration can resolve the new import paths without modification

### Open Questions
1. **Q: Do any of the four existing components (Header, Footer, PhaseBanner, SkipLink) have breaking changes in v5?**
   - Requires: Review of GOV.UK Frontend v5 release notes and migration guide

2. **Q: Is JavaScript initialisation required for current components?**
   - Current: `data-module="govuk-header"` and `data-module="govuk-skip-link"` attributes present
   - Requires: Verification of v5 JavaScript API and whether React handles this differently

3. **Q: Are there any Sass variable overrides in custom styles that need migration?**
   - Current: `index.scss` only contains the single import line
   - Requires: Confirmation no other Sass files exist with overrides

4. **Q: What is the exact Dart Sass version in the current toolchain?**
   - Requires: Check `package-lock.json` or build configuration

---

## 10. Impact on System Specification
**Alex-owned reconciliation section.**

### Assessment
This feature **reinforces existing system assumptions** without stretching or contradicting them.

### Alignment with System Spec
- **Section 12.1 (Technology Stack):** Confirms use of GOV.UK Design System with `govuk-frontend` npm package
- **Section 12.9 (GOV.UK Design System Integration):** Directly supports the implementation approach described
- **Section 8 (Accessibility - Cross-Cutting):** Upgrading improves accessibility alignment
- **Section 9 (Non-Functional - Usability):** Mobile-responsive requirement maintained

### System Spec Tensions Found
**None identified.**

This is a pure implementation-level upgrade that maintains full alignment with the specified technology stack and design system requirements. The System Specification does not mandate a specific `govuk-frontend` version, allowing this upgrade without contradiction.

### Recommendation
No changes to System Specification required. The upgrade should proceed as a technical maintenance activity.

---

## 11. Handover to BA (Cass)
**What Cass should derive from this spec.**

### Story Themes
1. **Sass Migration Story:** Update Sass imports to use `@use` module syntax
2. **Package Upgrade Story:** Update `govuk-frontend` package version
3. **Component Audit Story:** Verify and update component class names for v5 compatibility
4. **JavaScript Initialisation Story:** Update component JS initialisation if required
5. **Verification Story:** Build verification and accessibility testing

### Recommended Story Boundaries
- **Separate upgrade from verification:** Package upgrade and code changes should be distinct from testing/verification stories
- **Group Sass changes:** All Sass import changes can be a single story given the small number of files
- **Component audit may be nil:** If no class names changed, this story closes with "no changes required" verification

### Areas Needing Careful Story Framing
1. **Acceptance Criteria for "No Visual Change":** How do we verify visual consistency? Consider screenshot comparison or manual visual QA.
2. **Definition of "Build Clean":** Zero Sass deprecation warnings specifically; other warnings may exist
3. **Accessibility Testing Scope:** Which pages/components need explicit WCAG testing? All four existing components at minimum.
4. **Rollback Trigger:** What constitutes a "critical issue" requiring rollback vs. a fixable bug?

### Suggested Story Sequence
1. Investigate v5 changes for current components (spike/research)
2. Update package version and Sass imports
3. Update component class names (if needed)
4. Update JavaScript initialisation (if needed)
5. Verify build, visual output, and accessibility

---

## 12. Implementation Details (Post-Implementation)

### Actual Changes Made

**1. Package Updates:**
- `package.json`: Updated `govuk-frontend` to `^5.14.0`, added `sass: ^1.77.0`
- `client/package.json`: Updated `govuk-frontend` to `^5.14.0`

**2. Sass Import (client/src/styles/index.scss):**
```scss
@use 'govuk-frontend' as *;
```

**3. HTML Rebrand Class (client/index.html):**
```html
<html lang="en" class="govuk-template govuk-template--rebranded">
```

**4. Asset Copying:**
- Copied `node_modules/govuk-frontend/dist/govuk/assets/*` to `client/public/assets/`
- Includes fonts (woff, woff2), images (favicon, crown, icons), and manifest.json

**5. Header Component (client/src/components/Header.tsx):**
- Added full Tudor Crown SVG (`<g>` with circles and path)
- Added GOV.UK logotype with raised dot (`govuk-logo-dot` class)
- SVG viewBox: `0 0 324 60`, dimensions: 162x30

### Key Discoveries During Implementation

1. **Import Path:** The correct import is `@use 'govuk-frontend' as *` (not `/dist/govuk/all.scss`) - the package exports handle resolution
2. **Rebrand Flag:** The blue header/Tudor Crown styling requires the `govuk-template--rebranded` class on the `<html>` element
3. **Assets Required:** Fonts and images must be copied to public folder for Vite to serve them correctly
4. **SVG Required:** The Header component must include the full Tudor Crown SVG - it's not loaded automatically from CSS

---

## 13. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-03 | Initial feature specification created | Technical upgrade requirement identified | Alex (System Spec Agent) |
| 2026-02-03 | Added implementation details section | Document actual changes after implementation | Codey (Developer Agent) |
