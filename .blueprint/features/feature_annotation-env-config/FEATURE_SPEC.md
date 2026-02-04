# Feature Specification — Annotation Environment Configuration

> **Enhancement to:** [Add Prototype Annotator](/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md)

## 1. Feature Intent
**Why this enhancement exists.**

This enhancement extends the prototype-annotator feature with explicit environment control and Azure-compatible persistence, enabling safe deployment to non-production Azure environments.

- **Problem being addressed:** The parent feature relies on `NODE_ENV` to determine whether the annotator is active. This conflates environment type (development/production) with feature availability, making it impossible to deploy the annotator to Azure test or staging slots where `NODE_ENV=production` is often set for performance and behaviour consistency.

- **User or system need:** The development team requires:
  1. Explicit, independent control over annotator availability via a dedicated flag
  2. Persistent annotation storage that survives Azure App Service deployments (which replace the `/home/site/wwwroot` directory on each deploy)

- **How this supports the system purpose:** The System Specification emphasises iterative, user-centred design. Enabling the annotator in Azure test/staging environments allows user research sessions and design feedback collection on deployed prototypes, closer to production behaviour, while preventing accidental exposure in production.

> Alignment confirmed: This enhancement supports development workflow and deployment operations without altering core system behaviour.

---

## 2. Scope

### In Scope
- New environment variable `ANNOTATION_ENABLED` (boolean flag) to explicitly control annotator availability
- Conditional middleware mounting based on `ANNOTATION_ENABLED` (replaces `NODE_ENV` check)
- Configurable SQLite database path via `ANNOTATION_DB_PATH` environment variable
- Default database path set to Azure-persistent location (`/home/prototype-annotator/`) when deployed to Azure
- Documentation of environment configuration for each deployment slot

### Out of Scope
- Changes to annotation UI or behaviour (handled by parent feature)
- Migration of existing annotation data between environments
- Shared/centralised annotation storage across environments (each environment maintains its own SQLite instance)
- Production deployment of annotations (explicitly prohibited)

---

## 3. Actors Involved

Actors remain unchanged from the parent feature specification. This enhancement affects **DevOps/Platform Engineers** who configure deployment environments:

### DevOps/Platform Engineers
- **What they can do:**
  - Configure `ANNOTATION_ENABLED` per deployment slot (dev, test, staging)
  - Configure `ANNOTATION_DB_PATH` to use persistent storage paths
  - Verify annotator is disabled in production configuration
- **What they cannot do:**
  - Enable annotations in production (configuration must be explicitly blocked)

---

## 4. Behaviour Overview

### Happy-Path Behaviour (Azure Deployment)
1. DevOps engineer sets `ANNOTATION_ENABLED=true` in Azure App Service configuration for dev/test slot
2. DevOps engineer sets `ANNOTATION_DB_PATH=/home/prototype-annotator/annotator.sqlite`
3. Application starts, reads environment configuration
4. Middleware initialises with specified database path
5. Annotation data persists across deployments (stored in `/home` which survives deploys)
6. Team members access the deployed prototype with full annotation capabilities

### Key Alternatives
- **Local development:** `ANNOTATION_ENABLED=true` (or unset, defaults per environment), database uses local `./prototype-annotator/` directory
- **Production:** `ANNOTATION_ENABLED=false` or unset, middleware not mounted regardless of database path configuration
- **Missing database path:** If `ANNOTATION_DB_PATH` unset, falls back to package default (`./prototype-annotator/annotator.sqlite`)

### Configuration Matrix

| Environment | `ANNOTATION_ENABLED` | `ANNOTATION_DB_PATH` | Result |
|-------------|---------------------|----------------------|--------|
| Local Dev   | `true` (or unset)   | Unset (use default)  | Active, local SQLite |
| Azure Dev   | `true`              | `/home/prototype-annotator/annotator.sqlite` | Active, persistent |
| Azure Test  | `true`              | `/home/prototype-annotator/annotator.sqlite` | Active, persistent |
| Azure Staging | `true` (optional) | `/home/prototype-annotator/annotator.sqlite` | Active if enabled |
| Production  | `false` / unset     | N/A                  | Disabled |

---

## 5. State & Lifecycle Interactions

This enhancement does not change state or lifecycle interactions from the parent feature. The annotation system continues to operate outside the core system lifecycle.

### Configuration-Specific State
- **Environment variable read:** At application startup only (not hot-reloadable)
- **Database path resolution:** At middleware initialisation

---

## 6. Rules & Decision Logic

### R1: Explicit Enable Flag (Modified from Parent)
- **Description:** Annotation middleware is mounted if and only if `ANNOTATION_ENABLED=true`
- **Inputs:** `ANNOTATION_ENABLED` environment variable
- **Outputs:** Middleware mounted (`true`) or skipped (any other value or unset)
- **Deterministic:** Yes
- **Change from parent:** Replaces `NODE_ENV !== 'production'` check with explicit flag

### R2: Database Path Resolution
- **Description:** SQLite database path is configurable, with sensible defaults
- **Inputs:** `ANNOTATION_DB_PATH` environment variable
- **Outputs:** Resolved absolute path for SQLite database
- **Logic:**
  ```
  if ANNOTATION_DB_PATH is set:
    use ANNOTATION_DB_PATH
  else:
    use './prototype-annotator/annotator.sqlite' (package default)
  ```
- **Deterministic:** Yes

### R3: Production Safety
- **Description:** Production environment must never have annotations enabled
- **Inputs:** Deployment configuration review
- **Outputs:** Verified production configuration excludes `ANNOTATION_ENABLED=true`
- **Deterministic:** Operational check, not code-enforced

---

## 7. Dependencies

### System Components
- **Express server:** No change from parent feature
- **Environment variable loading:** Uses existing `process.env` mechanism

### Operational Dependencies
- **Azure App Service:** `/home` directory must be available and persistent
- **Deployment pipeline:** Must exclude `ANNOTATION_ENABLED=true` from production slot configuration
- **Azure Key Vault / App Configuration:** Recommended for managing environment-specific settings

### Technical Dependencies
- **File system permissions:** Application must have write access to configured database path
- **Parent directory existence:** Database directory must exist or be created at startup

---

## 8. Non-Functional Considerations

### Performance Sensitivity
- **No change:** Environment variable read occurs once at startup
- **Database location:** `/home` on Azure is network-attached storage; slightly slower than local SSD but acceptable for development tooling

### Security Implications
- **Reduced risk:** Explicit flag prevents accidental annotator exposure when `NODE_ENV=production` in non-production slots
- **Production safeguard:** Default behaviour (unset = disabled) is secure-by-default
- **Persistent storage:** Annotation data on Azure contains development feedback only; no sensitive adoption data

### Audit/Logging Needs
- **Startup logging:** Log whether annotator is enabled and the resolved database path
- **Example:** `[Annotator] Enabled: true, DB Path: /home/prototype-annotator/annotator.sqlite`

---

## 9. Assumptions & Open Questions

### Assumptions
1. Azure App Service `/home` directory is available and persistent across deployments
2. Development/test/staging slots are configured with appropriate environment variables
3. Production deployment pipeline enforces `ANNOTATION_ENABLED` is not set to `true`
4. Parent feature implementation uses the prototype-annotator package's `dbPath` configuration option

### Open Questions
1. **Directory creation:** Should the application create the database directory if it does not exist, or should this be a deployment prerequisite?
   - **Recommendation:** Auto-create directory to simplify deployment
2. **Fallback behaviour:** If database path is inaccessible, should the annotator fail silently or log an error and disable?
   - **Recommendation:** Log error and disable gracefully (do not crash application)

---

## 10. Impact on System Specification

### Alignment Assessment
This enhancement **reinforces system specification assumptions**:
- Supports secure-by-default configuration practices
- Aligns with deployment pipeline requirements (Section 12.8)
- Does not modify core system behaviour

### System Spec Update Recommendation
Consider adding `ANNOTATION_ENABLED` and `ANNOTATION_DB_PATH` to the Environment Variables list in System Spec Section 12.3:

```
# Prototype Annotator (Development/Test only)
ANNOTATION_ENABLED=true|false
ANNOTATION_DB_PATH=/home/prototype-annotator/annotator.sqlite
```

> **Decision required:** Should this be added to the system spec, or documented only in feature-level specifications?

---

## 11. Handover to BA (Cass)

### Story Themes
1. **Environment Variable Control:** Story for implementing `ANNOTATION_ENABLED` flag and replacing `NODE_ENV` check
2. **Database Path Configuration:** Story for implementing `ANNOTATION_DB_PATH` with fallback logic
3. **Deployment Configuration:** Story for documenting Azure slot configurations (dev/test/staging/prod)

### Expected Story Boundaries
- Stories should be small and focused on configuration changes
- Clear acceptance criteria verifiable in each environment
- Deployment documentation can be a separate, non-technical story

### Areas Needing Careful Story Framing
- **Environment variable naming:** Ensure consistency with existing patterns (all caps, underscore-separated)
- **Testing strategy:** Verify behaviour with various environment variable combinations
- **Production safeguard:** Explicit verification that production slot excludes the flag

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-04 | Initial enhancement specification created | Enable annotation deployment to Azure non-production environments with persistent storage | Alex |
