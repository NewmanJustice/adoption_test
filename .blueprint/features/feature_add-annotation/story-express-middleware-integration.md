# Story — Express Middleware Integration

## User story
As a developer, I want the prototype-annotator middleware added to the Express server so that I can create annotations on prototype pages during development.

---

## Context / scope
- Actor: Development team members
- Environment: Development only (`NODE_ENV=development`)
- This is internal tooling, not user-facing functionality
- The `prototype-annotator` npm package is already installed
- Reference: `/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md`

---

## Acceptance criteria

**AC-1 — Middleware is mounted in Express application**
- Given the Express server is configured in `server/src/app.ts`,
- When I import and use the `prototype-annotator` middleware,
- Then the middleware is mounted at the configured basePath (default: `/__prototype-annotator`).

**AC-2 — SQLite database is created on first use**
- Given the middleware is mounted and the server starts,
- When the annotator initialises,
- Then a SQLite database file is created at the configured location (e.g., `./prototype-annotator/annotator.sqlite`).

**AC-3 — Annotation overlay is injected into HTML responses**
- Given the middleware is active,
- When a page is served by the Express server,
- Then the annotation overlay script is injected into the HTML response.

**AC-4 — Management dashboard is accessible**
- Given the middleware is mounted,
- When I navigate to `/__prototype-annotator/dashboard` (or configured basePath + `/dashboard`),
- Then I see the annotation management dashboard.

**AC-5 — Middleware does not interfere with existing routes**
- Given the middleware is mounted,
- When I access existing application routes (e.g., `/api/auth/login`, `/api/cases`),
- Then those routes continue to function normally without interference.

---

## Configuration

```typescript
// Example middleware configuration in server/src/app.ts
import { prototypeAnnotator } from 'prototype-annotator';

if (process.env.NODE_ENV === 'development') {
  app.use(prototypeAnnotator({
    basePath: '/__prototype-annotator',
    actorMode: 'prompt',
    urlMode: 'canonical'
  }));
}
```

---

## Out of scope
- Production deployment of annotation capabilities
- Custom styling or modification of the annotation UI
- Integration with external issue tracking systems
- Modification of the annotation data schema
- User authentication for the annotator (uses built-in actor modes)
