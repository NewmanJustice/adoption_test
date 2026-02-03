# Story — Git Ignore SQLite Database

## User story
As a developer, I want the annotation SQLite database to be excluded from version control so that development annotation data is not accidentally committed to the repository.

---

## Context / scope
- Actor: Development team members
- Environment: Development (local git repository)
- The annotation system persists data to a SQLite file
- This file contains development-time feedback, not production data
- Reference: `/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md`, Section 8

---

## Acceptance criteria

**AC-1 — SQLite database file is gitignored**
- Given the annotator creates a SQLite database at `./prototype-annotator/annotator.sqlite`,
- When I run `git status`,
- Then the database file does not appear as an untracked or modified file.

**AC-2 — Annotator directory is gitignored**
- Given the annotator may create additional files in its directory,
- When any files are created in `./prototype-annotator/`,
- Then those files are excluded from git tracking.

**AC-3 — Gitignore entry is documented**
- Given the `.gitignore` file is updated,
- When a developer reviews the gitignore,
- Then there is a comment explaining why the annotator directory is excluded.

**AC-4 — Existing annotator data is not committed**
- Given there may be existing annotation data from development,
- When the gitignore is added,
- Then any existing annotator files are removed from git tracking (if previously tracked).

---

## Implementation

```gitignore
# .gitignore addition

# Prototype annotator - development annotation data
# Contains SQLite database with development feedback (not for production)
/prototype-annotator/
```

---

## Out of scope
- Sharing annotations between developers via version control
- Migration of annotation data between environments
- Backup strategy for annotation data
