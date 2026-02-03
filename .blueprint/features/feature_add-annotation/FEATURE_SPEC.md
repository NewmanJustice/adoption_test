# Feature Specification — Add Prototype Annotator

## 1. Feature Intent
**Why this feature exists.**

This feature integrates the `prototype-annotator` npm package into the Adoption Digital Platform to enable in-browser annotation capabilities during development and user research.

- **Problem being addressed:** During prototype testing and user research sessions, stakeholders (designers, researchers, product owners, developers) need a mechanism to capture feedback, observations, and change requests directly on the prototype interface without disrupting the testing flow or relying on external tools.

- **User or system need:** The development team requires a lightweight, integrated annotation system that allows any team member to visually mark up prototype screens with comments, issues, and suggestions, creating a persistent record tied to specific UI elements or regions.

- **How this supports the system purpose:** The System Specification (see `/workspaces/adoption_test/.blueprint/system_specification/SYSTEM_SPEC.md`, Section 1) emphasises user-centred design and iterative learning. An integrated annotation tool supports the "Start with user needs" design principle by capturing feedback in context during user research sessions with social workers, case officers, and other adoption practitioners.

> Alignment confirmed: This feature supports development workflow and does not alter core system behaviour or domain logic.

---

## 2. Scope

### In Scope
- Integration of `prototype-annotator` Express middleware into the server application
- Configuration of the middleware for development environment use
- Enabling the annotation overlay on all frontend pages
- Enabling the management dashboard for viewing and managing annotations
- SQLite database persistence for annotation data (separate from main PostgreSQL database)
- Documentation of keyboard shortcuts and usage for the development team

### Out of Scope
- Production deployment of annotation capabilities (development-only feature)
- Custom styling or modification of the annotation UI (use package defaults)
- Integration with external issue tracking systems (e.g., Jira)
- Modification of the annotation data schema
- Export/migration of annotations to other systems
- User authentication for the annotator (will use built-in actor modes)

---

## 3. Actors Involved

### Development Team Members
- **What they can do:**
  - Create annotations on any page using element selection (E key) or rectangle selection (R key)
  - View, edit, and delete their own annotations
  - Access the management dashboard to view all annotations across pages
  - Toggle the annotation sidebar (S key)
  - Identify themselves via actor prompt when creating annotations

- **What they cannot do:**
  - Access annotation features in production environment
  - Modify the annotation system's core behaviour
  - Export annotations programmatically (manual dashboard viewing only)

### User Research Participants
- **What they can do:**
  - Continue using the prototype normally (annotation overlay is unobtrusive)
  - Optionally create annotations if guided by a researcher

- **What they cannot do:**
  - Accidentally interfere with prototype functionality (Shadow DOM isolation)

---

## 4. Behaviour Overview

### Happy-Path Behaviour
1. Developer starts the application in development mode (`npm run dev`)
2. Prototype-annotator middleware initialises and creates SQLite database if not present
3. Developer navigates to any page in the application
4. The annotation overlay is available but non-intrusive (activated via keyboard shortcuts)
5. Developer presses `E` to enter element selection mode, clicks a UI element, and adds a comment
6. Annotation is saved to SQLite database with full audit trail (timestamp, actor, page URL)
7. Developer can view all annotations via the management dashboard at the configured basePath

### Key Alternatives
- **Rectangle selection:** Developer presses `R` to draw a rectangular region instead of selecting an element
- **Actor identification:** On first annotation, system prompts for actor name (cached for session)
- **Cancel operation:** Developer presses `Escape` to cancel any in-progress selection

### User-Visible Outcomes
- Small, unobtrusive annotation markers appear on annotated elements/regions
- Sidebar displays annotation list for current page when toggled
- Management dashboard provides overview of all annotations across the prototype

---

## 5. State & Lifecycle Interactions

This feature operates **outside the core system lifecycle**. It does not interact with:
- Case states or transitions
- Document processing workflows
- User authentication states (uses its own actor tracking)

### Annotation-Specific States
- **Idle:** Overlay loaded, awaiting user action
- **Element Selection Mode:** User selecting a DOM element to annotate
- **Rectangle Selection Mode:** User drawing a selection region
- **Editing:** User entering annotation text
- **Dashboard View:** User viewing/managing annotations

### State Classification
- **State-creating:** Creates annotation records in SQLite database
- **Not state-transitioning:** Does not affect core system states
- **Not state-constraining:** Does not impose constraints on system behaviour

---

## 6. Rules & Decision Logic

### R1: Environment Restriction
- **Description:** Annotation middleware must only be active in development environment
- **Inputs:** `NODE_ENV` environment variable
- **Outputs:** Middleware mounted (development) or skipped (production/test)
- **Deterministic:** Yes

### R2: Actor Identification
- **Description:** Annotations must be attributed to an identified actor
- **Inputs:** Actor mode configuration, user input (if prompted)
- **Outputs:** Actor name stored with annotation
- **Deterministic:** Depends on mode (prompt = user input, fixed = deterministic)

### R3: URL Canonicalisation
- **Description:** Page URLs should be stored consistently for annotation grouping
- **Inputs:** Current page URL, urlMode configuration
- **Outputs:** Canonical or full URL stored with annotation
- **Deterministic:** Yes

### R4: Annotation Persistence
- **Description:** All annotations persisted to SQLite with audit trail
- **Inputs:** Annotation content, element/region selector, actor, timestamp
- **Outputs:** Persisted record with unique ID
- **Deterministic:** Yes

---

## 7. Dependencies

### System Components
- **Express server** (`server/src/app.ts`): Middleware integration point
- **Vite dev proxy**: Must forward annotator API routes to backend

### External Systems
- **prototype-annotator npm package**: Already installed, provides all annotation functionality
- **SQLite**: Embedded database for annotation storage (no external database required)

### Technical Dependencies
- **Shadow DOM support**: Modern browsers required (not a concern for internal tooling)
- **Keyboard event handling**: Must not conflict with application keyboard shortcuts

### Operational Dependencies
- **Development workflow**: Team must be briefed on keyboard shortcuts and dashboard location
- **File system access**: SQLite database file must be writable in development environment

---

## 8. Non-Functional Considerations

### Performance Sensitivity
- **Low impact:** Annotation overlay uses Shadow DOM isolation, minimal performance overhead
- **SQLite operations:** Lightweight, local file-based storage
- **No production impact:** Feature disabled outside development

### Audit/Logging Needs
- **Built-in audit trail:** Package provides full event logging (annotation created, edited, deleted)
- **Actor attribution:** All actions attributed to identified actor
- **No integration with main audit system:** Annotations are development artifacts, not system records

### Error Tolerance
- **Graceful degradation:** If annotation system fails, core application continues unaffected
- **Database errors:** Should log but not crash application

### Security Implications
- **Development-only:** No security exposure in production
- **No authentication required:** Acceptable for internal development tool
- **SQLite file:** Should be gitignored to prevent accidental commit of development data

---

## 9. Assumptions & Open Questions

### Assumptions
1. The `prototype-annotator` package is already installed as a dependency
2. Development team members have access to keyboard shortcuts documentation
3. SQLite database persistence is acceptable (no need for PostgreSQL integration)
4. The default basePath (`/__prototype-annotator`) does not conflict with existing routes
5. Vite proxy configuration can forward annotator routes to the Express backend

### Open Questions
1. **Database location:** Should the SQLite file be stored in `./prototype-annotator/` (default) or a different location (e.g., `./data/` or `./tmp/`)?
2. **Git handling:** Should the SQLite database be gitignored, or should annotations be shareable via version control?
3. **Actor mode:** Should the system prompt for actor name (`prompt` mode) or use a fixed default (`fixed` mode)?
4. **URL mode:** Should URLs be stored as `full` (with query parameters) or `canonical` (normalised)?

### Recommended Defaults (for BA/Developer decision)
- **dbPath:** `./prototype-annotator/annotator.sqlite` (package default, clear location)
- **actorMode:** `prompt` (ensures attribution during research sessions)
- **urlMode:** `canonical` (groups annotations by page, ignoring query variations)
- **.gitignore:** Add database file to prevent accidental commit

---

## 10. Impact on System Specification

### Alignment Assessment
This feature **reinforces existing system assumptions**:
- Supports iterative, user-centred development process
- Operates orthogonally to core system functionality
- Does not modify domain logic, data models, or access control

### No System Spec Changes Required
- Feature is purely additive development tooling
- No core system behaviours affected
- No new actors introduced to the domain model
- No state model changes

### Tension: None Identified
This feature operates in the development/tooling space and does not interact with the adoption case management domain. No reconciliation required.

---

## 11. Handover to BA (Cass)

### Story Themes
1. **Middleware Integration:** Technical story for adding prototype-annotator to Express server
2. **Configuration:** Story for appropriate development-only configuration
3. **Proxy Setup:** Story for ensuring Vite dev proxy forwards annotator routes
4. **Documentation:** Story for development workflow documentation (keyboard shortcuts, dashboard access)

### Expected Story Boundaries
- Stories should be small and technical, focused on integration rather than feature building
- No user-facing stories (this is internal tooling)
- Clear acceptance criteria around development environment verification

### Areas Needing Careful Story Framing
- **Environment restriction:** Must be explicit that feature is development-only
- **Testing approach:** How to verify integration without automated tests (manual verification acceptable for dev tooling)
- **Documentation scope:** Balance between comprehensive docs and minimal viable documentation

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-03 | Initial feature specification created | New feature request for prototype annotation integration | Alex |
