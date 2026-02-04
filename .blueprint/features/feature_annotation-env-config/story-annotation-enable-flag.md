# Story — Annotation Enable Flag

## User story
As a DevOps engineer, I want to control annotator availability via a dedicated `ANNOTATION_ENABLED` environment variable so that I can enable annotations in Azure non-production slots where `NODE_ENV=production` is set.

---

## Context / scope
- **Enhancement to:** [Add Prototype Annotator](/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md)
- **Actor:** DevOps/Platform Engineers
- **Affected component:** Express server middleware mounting (`server/src/app.ts`)
- **Change from parent feature:** Replaces `NODE_ENV !== 'production'` check with explicit `ANNOTATION_ENABLED` flag

---

## Acceptance criteria

**AC-1 — Middleware mounted when explicitly enabled**
- Given `ANNOTATION_ENABLED=true` in the environment,
- When the Express server starts,
- Then the prototype-annotator middleware is mounted and annotation features are available.

**AC-2 — Middleware not mounted when explicitly disabled**
- Given `ANNOTATION_ENABLED=false` in the environment,
- When the Express server starts,
- Then the prototype-annotator middleware is not mounted and annotation routes return 404.

**AC-3 — Middleware not mounted when flag is unset**
- Given `ANNOTATION_ENABLED` is not set in the environment,
- When the Express server starts,
- Then the prototype-annotator middleware is not mounted (secure-by-default).

**AC-4 — Middleware not mounted for invalid values**
- Given `ANNOTATION_ENABLED` is set to any value other than `true` (e.g., `yes`, `1`, `TRUE`),
- When the Express server starts,
- Then the prototype-annotator middleware is not mounted.

**AC-5 — Flag is independent of NODE_ENV**
- Given `ANNOTATION_ENABLED=true` and `NODE_ENV=production`,
- When the Express server starts,
- Then the prototype-annotator middleware is mounted regardless of NODE_ENV value.

---

## Out of scope
- Changes to annotation UI or overlay behaviour
- Production safety enforcement via code (operational responsibility)
- Hot-reloading of environment variable changes (restart required)
- Validation or warning when enabling in production environment
