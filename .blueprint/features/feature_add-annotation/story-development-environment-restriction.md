# Story — Development Environment Restriction

## User story
As a platform maintainer, I want the annotation system to only be active in development mode so that it never runs in production or test environments.

---

## Context / scope
- Actor: Platform maintainers, DevOps
- Environment: All environments (enforcement of development-only rule)
- This is a critical safeguard to prevent development tooling from appearing in production
- Reference: `/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md`, Rule R1

---

## Acceptance criteria

**AC-1 — Middleware only mounts when NODE_ENV is development**
- Given `NODE_ENV=development`,
- When the Express server starts,
- Then the prototype-annotator middleware is mounted and active.

**AC-2 — Middleware does not mount in production**
- Given `NODE_ENV=production`,
- When the Express server starts,
- Then the prototype-annotator middleware is NOT mounted,
- And annotator routes return 404.

**AC-3 — Middleware does not mount in test environment**
- Given `NODE_ENV=test`,
- When the Express server starts,
- Then the prototype-annotator middleware is NOT mounted,
- And the annotation system does not interfere with automated tests.

**AC-4 — No annotator scripts injected in non-development**
- Given `NODE_ENV` is not `development`,
- When any page is served,
- Then no annotator overlay scripts are injected into the HTML response.

**AC-5 — Conditional import to avoid production bundle bloat (optional)**
- Given the server is built for production,
- When the build process runs,
- Then annotator dependencies are not included in the production bundle (if tree-shaking is feasible).

---

## Implementation guidance

```typescript
// server/src/app.ts
if (process.env.NODE_ENV === 'development') {
  // Dynamic import to avoid loading in production
  const { prototypeAnnotator } = await import('prototype-annotator');
  app.use(prototypeAnnotator({ /* config */ }));
}
```

---

## Out of scope
- Feature flags for annotation (strictly environment-based)
- Per-user or per-role annotation access control
- Runtime toggling of annotation system
