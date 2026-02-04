# Story — Database Path Configuration

## User story
As a DevOps engineer, I want to configure the annotation database path via `ANNOTATION_DB_PATH` environment variable so that annotation data persists across Azure App Service deployments.

---

## Context / scope
- **Enhancement to:** [Add Prototype Annotator](/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md)
- **Actor:** DevOps/Platform Engineers
- **Affected component:** Express server middleware configuration (`server/src/app.ts`)
- **Azure context:** The `/home` directory on Azure App Service persists across deployments; `/home/site/wwwroot` does not

---

## Acceptance criteria

**AC-1 — Custom path used when configured**
- Given `ANNOTATION_DB_PATH=/home/prototype-annotator/annotator.sqlite` in the environment,
- And `ANNOTATION_ENABLED=true`,
- When the Express server starts,
- Then the prototype-annotator middleware initialises with the specified database path.

**AC-2 — Default path used when not configured**
- Given `ANNOTATION_DB_PATH` is not set in the environment,
- And `ANNOTATION_ENABLED=true`,
- When the Express server starts,
- Then the prototype-annotator middleware uses the package default path (`./prototype-annotator/annotator.sqlite`).

**AC-3 — Parent directory auto-created**
- Given `ANNOTATION_DB_PATH=/home/prototype-annotator/annotator.sqlite`,
- And the `/home/prototype-annotator/` directory does not exist,
- And `ANNOTATION_ENABLED=true`,
- When the Express server starts,
- Then the directory is created automatically before database initialisation.

**AC-4 — Graceful handling of inaccessible path**
- Given `ANNOTATION_DB_PATH` points to an inaccessible location (no write permission),
- And `ANNOTATION_ENABLED=true`,
- When the Express server starts,
- Then an error is logged and the annotator is disabled gracefully without crashing the application.

**AC-5 — Path configuration ignored when disabled**
- Given `ANNOTATION_DB_PATH=/some/path/annotator.sqlite`,
- And `ANNOTATION_ENABLED=false` or unset,
- When the Express server starts,
- Then no database path resolution occurs and no directories are created.

---

## Out of scope
- Migration of existing annotation data between paths
- Shared/centralised annotation storage across environments
- Database path validation beyond write access check
- Configurable database filename (only full path supported)
