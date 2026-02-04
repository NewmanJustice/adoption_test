# Story — Annotator Startup Logging

## User story
As a DevOps engineer, I want the server to log annotator configuration at startup so that I can verify the correct settings are applied in each deployment environment.

---

## Context / scope
- **Enhancement to:** [Add Prototype Annotator](/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md)
- **Actor:** DevOps/Platform Engineers
- **Affected component:** Express server startup logging (`server/src/app.ts` or `server/src/index.ts`)
- **Purpose:** Operational visibility for troubleshooting and configuration verification

---

## Acceptance criteria

**AC-1 — Log when annotator is enabled**
- Given `ANNOTATION_ENABLED=true`,
- When the Express server starts,
- Then a log message is output: `[Annotator] Enabled: true, DB Path: <resolved-path>`.

**AC-2 — Log when annotator is disabled**
- Given `ANNOTATION_ENABLED=false` or unset,
- When the Express server starts,
- Then a log message is output: `[Annotator] Disabled`.

**AC-3 — Log shows resolved path not environment variable**
- Given `ANNOTATION_DB_PATH` is not set,
- And `ANNOTATION_ENABLED=true`,
- When the Express server starts,
- Then the log shows the resolved default path (e.g., `./prototype-annotator/annotator.sqlite`), not `undefined` or empty.

**AC-4 — Log level appropriate for startup info**
- Given any annotator configuration,
- When the Express server starts,
- Then the annotator configuration log is output at INFO level (not DEBUG or ERROR).

---

## Out of scope
- Runtime logging of annotation operations (handled by prototype-annotator package)
- Structured logging format (JSON) - use existing server logging conventions
- Log aggregation or external logging services
- Configuration validation warnings (separate concern)
