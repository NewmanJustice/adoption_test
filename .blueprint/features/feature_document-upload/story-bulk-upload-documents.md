# Story — Bulk Upload Documents

## User story
As a Cafcass officer, I want to upload multiple documents at once so that I can efficiently submit all required reports.

---

## Context / scope
- Professional users (Case Officers, Social Workers, Cafcass Officers, Agency Workers)
- All adoption case types
- Screen reached when: User selects multiple files in upload interface
- Route:
  - `GET /cases/:caseId/upload-document`
  - `POST /cases/:caseId/upload-document` (handles multiple files)
- This screen captures: Multiple document files, document types, optional descriptions

---

## Acceptance criteria

**AC-1 — Multiple file selection**
- Given I am on the upload screen,
- When I select multiple files (up to 10),
- Then all selected files are listed with individual type dropdowns.

**AC-2 — Bulk file limit**
- Given I am on the upload screen,
- When I attempt to select more than 10 files at once,
- Then an error message displays: "You can upload a maximum of 10 files at once"
- And only the first 10 files are accepted.

**AC-3 — Individual file validation**
- Given I have selected multiple files,
- When any file has an invalid type or exceeds 20MB,
- Then that specific file is marked with an error
- And I can remove the invalid file and continue with remaining files.

**AC-4 — Document type assignment**
- Given I have selected multiple files,
- When I assign document types,
- Then I can either:
  - assign the same type to all files via "Apply to all" option, OR
  - assign individual types to each file via table view
- And all files must have a type before submission.

**AC-5 — Partial upload success**
- Given I submit multiple files,
- When some files pass validation and others fail,
- Then successful uploads are completed and saved
- And failed uploads are reported with specific error messages
- And I see a summary: "X of Y documents uploaded successfully"
- And I remain on the upload screen to retry failed uploads.

**AC-6 — Bulk upload success**
- Given I submit multiple valid files with assigned types,
- When all uploads complete successfully,
- Then I see a success message: "10 documents uploaded successfully"
- And I am redirected to the case detail page
- And all documents appear in the case document list with status "OCR pending".

**AC-7 — Progress indication**
- Given I am uploading multiple files,
- When the upload is processing,
- Then a progress bar displays showing "Uploading X of Y documents..."
- And individual file statuses are shown (uploading, scanning, complete, failed).

---

## Session persistence

```js
// No session storage required - document metadata persisted to database
```

---

## Out of scope
- Uploading more than 10 files at once (require multiple batches)
- Drag-and-drop for bulk upload (separate story)
- Automatic document type detection
