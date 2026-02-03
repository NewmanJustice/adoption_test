# Implementation Guide — GOV.UK Frontend v5 Upgrade Tests

## Overview

This guide provides instructions for running and maintaining the tests for the GOV.UK Frontend v5 upgrade feature. The tests are designed to verify the technical upgrade without requiring a fully running application.

---

## Test File Location

```
/test/feature_upgrade-gov-design-system.test.js
```

---

## Prerequisites

### Required Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### Optional Dependencies (for full test coverage)

```json
{
  "devDependencies": {
    "jest-axe": "^8.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

---

## Running Tests

### Run all upgrade feature tests

```bash
npm test -- test/feature_upgrade-gov-design-system.test.js
```

### Run specific test suite

```bash
npm test -- test/feature_upgrade-gov-design-system.test.js -t "Package Version"
```

### Run with verbose output

```bash
npm test -- test/feature_upgrade-gov-design-system.test.js --verbose
```

---

## Test Structure

The test file is organised into describe blocks matching the user stories:

```
describe('GOV.UK Frontend v5 Upgrade')
  ├── describe('Story 1: Investigate v5 Changes')
  │   └── Tests for configuration verification
  │
  ├── describe('Story 2: Package and Sass Migration')
  │   └── Tests for package version and Sass syntax
  │
  ├── describe('Story 3: Component Class Names')
  │   └── Tests for GOV.UK class name presence
  │
  ├── describe('Story 4: JavaScript Initialisation')
  │   └── Tests for data-module attributes and imports
  │
  └── describe('Story 5: Build and Accessibility')
      └── Tests for build success and accessibility
```

---

## Test Categories

### 1. Configuration Tests

These tests verify static configuration files without executing code.

**What they check:**
- `package.json` version of `govuk-frontend`
- Presence of required files

**Example:**
```javascript
it('should have govuk-frontend version 5.x', () => {
  const pkg = require('../package.json');
  expect(pkg.dependencies['govuk-frontend']).toMatch(/^\^?5\./);
});
```

### 2. File Pattern Tests

These tests scan source files for correct patterns.

**What they check:**
- Sass files use `@use` not `@import`
- Correct import paths for v5
- No deprecated patterns

**Example:**
```javascript
it('should use @use syntax in Sass files', async () => {
  const content = await fs.readFile('client/src/styles/index.scss', 'utf-8');
  expect(content).not.toMatch(/@import\s+['"]govuk-frontend/);
  expect(content).toMatch(/@use\s+['"]govuk-frontend/);
});
```

### 3. Component Structure Tests

These tests verify GOV.UK class names exist in component files.

**What they check:**
- `govuk-header` class in Header component
- `govuk-footer` class in Footer component
- `govuk-phase-banner` class in PhaseBanner component
- `govuk-skip-link` class in SkipLink component

**Example:**
```javascript
it('should contain govuk-header class', async () => {
  const content = await fs.readFile('client/src/components/Header.jsx', 'utf-8');
  expect(content).toMatch(/govuk-header/);
});
```

### 4. Build Verification Tests

These tests execute the build process and verify output.

**What they check:**
- Build completes without errors
- No Sass deprecation warnings in output
- CSS file is generated

**Note:** These tests may be slow and should be run selectively.

---

## Handling Test Failures

### Package Version Test Fails

**Symptom:** `expected "^4.10.1" to match /^\^?5\./`

**Resolution:** Update `package.json` to use govuk-frontend v5:
```bash
npm install govuk-frontend@^5.14.0
```

### Sass Syntax Test Fails

**Symptom:** Found `@import` statement

**Resolution:** Update Sass imports:
```scss
// Before (v4)
@import 'govuk-frontend/govuk/all';

// After (v5)
@use 'govuk-frontend/dist/govuk/all.scss';
```

### Class Name Test Fails

**Symptom:** Class name not found in component

**Resolution:** Check v5 migration guide for class name changes and update component.

### Build Test Fails

**Symptom:** Build process returns non-zero exit code

**Resolution:** Check build output for specific errors and resolve.

---

## Skipped Tests

Some tests are marked as `test.skip()` or `test.todo()` because:

1. **Files don't exist yet** - Component files may not be created
2. **Manual verification required** - Cannot automate screen reader testing
3. **Dependencies missing** - jest-axe not installed

Enable these tests as the codebase develops.

---

## Adding New Tests

When adding new GOV.UK components, add corresponding tests:

```javascript
describe('NewComponent', () => {
  it('should contain govuk-new-component class', async () => {
    const componentPath = 'client/src/components/NewComponent.jsx';

    if (!fs.existsSync(componentPath)) {
      test.skip('Component file does not exist');
      return;
    }

    const content = await fs.readFile(componentPath, 'utf-8');
    expect(content).toMatch(/govuk-new-component/);
  });
});
```

---

## Continuous Integration

Add to CI pipeline:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      - name: Run GOV.UK Upgrade Tests
        run: npm test -- test/feature_upgrade-gov-design-system.test.js
```

---

## Manual Testing Checklist

The following cannot be automated and require manual verification:

- [ ] Development server starts (`npm run dev`)
- [ ] Keyboard navigation works throughout application
- [ ] Screen reader announces content correctly
- [ ] Mobile viewport renders correctly
- [ ] No JavaScript errors in browser console
- [ ] Header mobile menu toggle functions
- [ ] SkipLink navigates to main content

---

## Contact

For questions about these tests, contact:
- **Tester:** Nigel
- **Principal Developer:** Steve
