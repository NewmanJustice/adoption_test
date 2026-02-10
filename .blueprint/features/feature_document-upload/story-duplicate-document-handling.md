# Story — Duplicate Document Handling

## User story
As a case officer, I want to be warned when uploading a duplicate document so that I can decide whether to upload a new version or cancel.

---

## Context / scope
- Professional users uploading documents (Case Officers, Social Workers, Cafcass Officers, Agency Workers)
- All adoption case types
- Screen reached when: User uploads a document with matching filename and/or file hash
- Route:
  - `POST /cases/:caseId/upload-document` (includes duplicate detection)
- This story covers: Duplicate detection logic, user notification, and versioning

---

## Acceptance criteria

**AC-1 — Exact duplicate detection**
- Given a document with the same filename and file hash (SHA-256) already exists on the case,
- When I attempt to upload the same file,
- Then a warning message displays: "This document has already been uploaded to this case. Upload it again as a re-submission?"
- And I can choose to "Continue upload" or "Cancel".

**AC-2 — Filename match with different content**
- Given a document with the same filename but different file hash exists on the case,
- When I upload the file,
- Then a notification displays: "A document with this filename already exists. This will be saved as version 2."
- And the upload proceeds automatically
- And the new document is saved with an incremented version number.

**AC-3 — Document versioning**
- Given I upload a new version of a document,
- When the upload completes,
- Then the document list shows both versions:
  - "[filename] (v1)" - original upload date and uploader
  - "[filename] (v2)" - new upload date and uploader
- And both versions remain downloadable
- And the latest version is clearly indicated as "Current version".

**AC-4 — Re-submission for audit purposes**
- Given I choose to upload an exact duplicate as a re-submission,
- When the upload completes,
- Then a new document record is created with the same file hash
- And the audit log records the re-submission with timestamp and user
- And the document list shows both uploads with their respective dates.

**AC-5 — Hash calculation**
- Given I upload a document,
- When the system processes the file,
- Then a SHA-256 hash is calculated from the file content
- And the hash is stored in the document metadata
- And hash calculation occurs before virus scanning.

**AC-6 — Duplicate detection across document types**
- Given a document with the same file hash exists on the case but with a different document type,
- When I upload the file with a new document type,
- Then a warning displays: "This file content has been uploaded before as '[previous document type]'. Continue?"
- And I can choose to proceed or cancel.

---

## Session persistence

```js
// File hash and version stored in database with document metadata
// No session storage required
```

---

## Out of scope
- Automatic deletion of old versions
- Document merge or comparison tools
- Cross-case duplicate detection (only checks within same case)
- User-initiated version rollback
