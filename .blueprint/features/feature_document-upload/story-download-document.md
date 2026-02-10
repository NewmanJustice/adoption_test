# Story — Download Document

## User story
As a social worker, I want to download case documents for my records so that I can work offline and maintain local case files.

---

## Context / scope
- Professional users with case access (Case Officers, Judges, Legal Advisers, Cafcass Officers, Social Workers, Agency Workers)
- Adopters with limited access to their own documents
- All adoption case types
- Action available from: Case detail page document list
- Route:
  - `GET /cases/:caseId/documents/:documentId/download`
- This action: Serves original uploaded file for download and logs access

---

## Acceptance criteria

**AC-1 — Download link available**
- Given I am viewing the document list on a case,
- When I see a document I have permission to access,
- Then a "Download" link is displayed next to the document
- And the link clearly shows the original filename.

**AC-2 — Download initiates**
- Given I click "Download" on a document,
- When the download request is processed,
- Then the original file is served with correct MIME type
- And the browser initiates a download with the original filename
- And the file content is identical to the uploaded file.

**AC-3 — Access logging**
- Given I download a document,
- When the download completes,
- Then an audit log entry is created recording:
  - User ID
  - Document ID
  - Case ID
  - Download timestamp
  - IP address
- And the log entry is immutable.

**AC-4 — Time-limited access URL**
- Given a download URL is generated,
- When the URL is accessed,
- Then the URL expires after 15 minutes
- And expired URLs return an error: "This download link has expired. Please request a new download."

**AC-5 — Role-based download permissions**
- Given I am viewing a case document list,
- When I do not have permission to access a document,
- Then the "Download" link is not displayed for that document
- And attempting to access the download URL directly returns an error: "You do not have permission to access this document."

**AC-6 — Failed download retry**
- Given a download fails due to network issues,
- When I click "Download" again,
- Then a new download attempt is initiated
- And a fresh time-limited URL is generated.

**AC-7 — Virus scan status**
- Given a document failed virus scanning on upload,
- When I view the document list,
- Then that document has no "Download" link
- And a message displays: "This document cannot be downloaded due to security concerns."

---

## Session persistence

```js
// No session storage required - access logged to database audit trail
```

---

## Out of scope
- Bulk download of multiple documents
- Email delivery of documents
- Document preview without download
- Document conversion (e.g., DOCX to PDF)
