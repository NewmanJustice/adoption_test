# Story — Test Infrastructure

## User Story

As a **developer**,
I want **Jest configured for both client and server with example tests and coverage reporting**,
So that **I can write tests confidently and verify code quality from the start**.

---

## Context / Scope

- **Actor:** Developer
- **Feature:** Project Scaffold
- **Relates to:** System Spec Section 12.7 (Testing Strategy)
- **This story establishes:** The test framework that all automated tests will build upon

### What This Story Delivers
- Jest configuration for client, server, and shared packages
- Example tests demonstrating patterns for each package
- React Testing Library integration for component testing
- jest-axe integration for accessibility testing
- Coverage reporting configuration
- Test npm scripts

### Entry Conditions
- Developer Environment Setup story is complete
- Server Foundation and Client Foundation are complete (to have code to test)

### Exit Conditions
- Test suite runs successfully
- Coverage report is generated
- Example tests pass

---

## Acceptance Criteria

**AC-1 — Test command runs all tests**
- Given all packages have tests configured,
- When I run `npm test` from the root directory,
- Then tests for client, server, and shared packages all execute,
- And results are displayed in the terminal.

**AC-2 — Server tests run independently**
- Given the server package has tests,
- When I run `npm test` from the `/server` directory,
- Then only server tests execute,
- And results are displayed.

**AC-3 — Client tests run independently**
- Given the client package has tests,
- When I run `npm test` from the `/client` directory,
- Then only client tests execute,
- And results are displayed.

**AC-4 — Shared tests run independently**
- Given the shared package has tests,
- When I run `npm test` from the `/shared` directory,
- Then only shared tests execute,
- And results are displayed.

**AC-5 — Example server test demonstrates API testing**
- Given I examine the server tests,
- Then I find an example test for the health endpoint that:
  - Uses supertest (or equivalent) for HTTP testing
  - Tests the `/api/health` endpoint
  - Verifies the response status and body structure

**AC-6 — Example client test demonstrates component testing**
- Given I examine the client tests,
- Then I find an example test that:
  - Uses React Testing Library
  - Renders a component
  - Asserts on visible content or behaviour

**AC-7 — Example accessibility test is included**
- Given I examine the client tests,
- Then I find an example test that:
  - Uses jest-axe
  - Renders a component
  - Checks for accessibility violations

**AC-8 — Example shared test demonstrates utility testing**
- Given I examine the shared tests,
- Then I find an example test that:
  - Tests a utility function or type guard
  - Demonstrates testing pure functions

**AC-9 — Coverage report is generated**
- Given all tests pass,
- When I run `npm run test:coverage`,
- Then a coverage report is generated,
- And the report is output to a `/coverage` directory,
- And a summary is displayed in the terminal.

**AC-10 — Coverage report includes all packages**
- Given the coverage report has been generated,
- When I examine the report,
- Then I see coverage metrics for:
  - `/client/src` files
  - `/server/src` files
  - `/shared` files

**AC-11 — Watch mode is available**
- Given I am developing,
- When I run `npm run test:watch`,
- Then Jest runs in watch mode,
- And tests re-run when source files change.

**AC-12 — TypeScript tests are supported**
- Given test files are written in TypeScript (`.test.ts`, `.test.tsx`),
- When tests are executed,
- Then TypeScript tests compile and run correctly,
- And type errors in tests are reported.

**AC-13 — Test configuration files are present**
- Given I examine each package,
- Then I find Jest configuration in either:
  - `jest.config.js` or `jest.config.ts` file, or
  - `jest` section in `package.json`

**AC-14 — Tests complete within time limit**
- Given a standard development machine,
- When I run the full test suite,
- Then all tests complete within 30 seconds.

---

## Technical Notes

### Jest Configuration

**Server Jest Config (key settings):**
```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}
```

**Client Jest Config (key settings):**
```javascript
{
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.tsx', '**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
}
```

### npm Scripts

Root `package.json`:
```json
{
  "scripts": {
    "test": "npm run test --workspaces",
    "test:coverage": "npm run test:coverage --workspaces",
    "test:watch": "npm run test:watch --workspaces"
  }
}
```

### Example Test Patterns

**Server health endpoint test:**
```typescript
import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('returns healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});
```

**Client component test:**
```typescript
import { render, screen } from '@testing-library/react';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  it('renders welcome heading', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
```

**Accessibility test:**
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LandingPage from './LandingPage';

expect.extend(toHaveNoViolations);

describe('LandingPage accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LandingPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Out of Scope

- End-to-end tests (Playwright, Cypress)
- Visual regression testing
- Performance testing
- Minimum coverage thresholds (no enforcement in scaffold)
- CI pipeline integration for tests
- Test database setup (integration tests with real DB)

---

## Dependencies

- **Depends on:** Developer Environment Setup
- **Depends on:** Server Foundation (for health endpoint test)
- **Depends on:** Client Foundation (for component test)
- **Depends on:** Shared Code Infrastructure (for utility test)

---

## Definition of Done

- [ ] `npm test` runs all tests successfully
- [ ] Each package can run tests independently
- [ ] Example server API test exists and passes
- [ ] Example client component test exists and passes
- [ ] Example accessibility test exists and passes
- [ ] Example shared utility test exists and passes
- [ ] `npm run test:coverage` generates coverage report
- [ ] Watch mode works correctly
- [ ] TypeScript tests compile and run
- [ ] Full test suite completes within 30 seconds
