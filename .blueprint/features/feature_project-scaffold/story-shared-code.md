# Story — Shared Code Infrastructure

## User Story

As a **developer**,
I want **TypeScript types and utilities shared between client and server**,
So that **I can maintain type safety across the full stack and avoid duplicating common code**.

---

## Context / Scope

- **Actor:** Developer
- **Feature:** Project Scaffold
- **Relates to:** System Spec Section 12.2 (Project Structure - Monorepo)
- **This story establishes:** The shared package that enables code reuse between frontend and backend

### What This Story Delivers
- Shared package configured in npm workspaces
- TypeScript configuration for the shared package
- Example shared types
- Example shared utility functions
- Example shared constants
- Import/export patterns for consuming packages

### Entry Conditions
- Developer Environment Setup story is complete

### Exit Conditions
- Shared package is importable from both client and server
- Types are shared correctly
- Utilities work in both environments

---

## Acceptance Criteria

**AC-1 — Shared package is configured in workspaces**
- Given I examine the root `package.json`,
- When I check the workspaces configuration,
- Then `shared` is listed as a workspace.

**AC-2 — Shared directory structure is organised**
- Given I examine the `/shared` directory,
- Then I see the following structure:
  - `types/` - TypeScript type definitions
  - `constants/` - Shared constants
  - `utils/` - Shared utility functions
  - `index.ts` - Main entry point with exports

**AC-3 — Shared package has TypeScript configuration**
- Given I examine the `/shared` directory,
- Then I find a `tsconfig.json` file,
- And the configuration enables:
  - Declaration file generation (`.d.ts`)
  - Strict mode
  - ES module output

**AC-4 — Shared package has package.json**
- Given I examine the `/shared` directory,
- Then I find a `package.json` file with:
  - Package name (e.g., `@adoption/shared`)
  - Main entry point
  - Types entry point
  - Build scripts if needed

**AC-5 — Example shared types are defined**
- Given I examine `/shared/types`,
- Then I find example type definitions including:
  - API response type (e.g., `ApiResponse<T>`)
  - Health check response type
  - Error response type

**AC-6 — Example shared constants are defined**
- Given I examine `/shared/constants`,
- Then I find example constants including:
  - HTTP status codes
  - Application-wide constants (e.g., service name)

**AC-7 — Example shared utility is defined**
- Given I examine `/shared/utils`,
- Then I find at least one example utility function,
- And the function is pure (no side effects),
- And the function has proper TypeScript types.

**AC-8 — Server can import from shared**
- Given the server code needs a shared type,
- When I import from the shared package (e.g., `import { ApiResponse } from '@adoption/shared'`),
- Then the import resolves correctly,
- And TypeScript recognises the types.

**AC-9 — Client can import from shared**
- Given the client code needs a shared type,
- When I import from the shared package (e.g., `import { ApiResponse } from '@adoption/shared'`),
- Then the import resolves correctly,
- And TypeScript recognises the types.

**AC-10 — Shared types provide type safety**
- Given I use a shared type incorrectly,
- When TypeScript compiles,
- Then a type error is reported,
- And the error message identifies the type mismatch.

**AC-11 — Changes to shared code trigger rebuild**
- Given the application is running in development mode,
- When I modify a file in `/shared`,
- Then both client and server detect the change,
- And the application reloads/recompiles.

**AC-12 — TypeScript strict mode is enabled project-wide**
- Given I examine the TypeScript configurations,
- Then strict mode is enabled in:
  - Root `tsconfig.json`
  - `/client/tsconfig.json`
  - `/server/tsconfig.json`
  - `/shared/tsconfig.json`

---

## Technical Notes

### Package Naming
- Use scoped package name: `@adoption/shared`
- This allows clean imports: `import { X } from '@adoption/shared'`

### TypeScript Project References
Consider using TypeScript project references for efficient builds:

**Root tsconfig.json:**
```json
{
  "references": [
    { "path": "./client" },
    { "path": "./server" },
    { "path": "./shared" }
  ]
}
```

### Example Shared Types

```typescript
// /shared/types/api.ts

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
  };
}
```

### Example Shared Constants

```typescript
// /shared/constants/app.ts

export const APP_NAME = 'Adoption Digital Platform';
export const PHASE = 'ALPHA' as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
```

### Example Shared Utility

```typescript
// /shared/utils/format.ts

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
```

### Export Pattern

```typescript
// /shared/index.ts

export * from './types/api';
export * from './constants/app';
export * from './utils/format';
```

---

## Out of Scope

- Business domain types (Case, Party, Document entities)
- Validation schemas (Zod, Yup, etc.)
- Complex utility libraries
- Runtime type checking
- Code generation from shared types

---

## Dependencies

- **Depends on:** Developer Environment Setup (npm workspaces)

---

## Definition of Done

- [ ] Shared package is listed in workspaces configuration
- [ ] Directory structure includes types, constants, and utils
- [ ] TypeScript configuration enables declaration generation
- [ ] Example shared types are defined and exported
- [ ] Example shared constants are defined and exported
- [ ] Example shared utility is defined and exported
- [ ] Server can import from shared package
- [ ] Client can import from shared package
- [ ] Type errors are reported when types are misused
- [ ] TypeScript strict mode is enabled in all packages
- [ ] Changes to shared code trigger rebuilds in dev mode
