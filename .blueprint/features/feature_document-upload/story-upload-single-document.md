# Story — Upload Single Document

## User story
As a case officer, I want to upload a document to a case so that it is securely stored and accessible to authorised users.

---

## Context / scope
- Professional users (Case Officers, Social Workers, Cafcass Officers, Agency Workers)
- All adoption case types
- Screen reached when: User navigates to case detail page and clicks "Upload document"
- Route:
  - `GET /cases/:caseId/upload-document`
  - `POST /cases/:caseId/upload-document`
- This screen captures: Document file, document type, optional description

---

## Acceptance criteria

**AC-1 — Upload interface displays**
- Given I am on a case detail page,
- When I click "Upload document",
- Then I am taken to the upload screen with a file picker and document type dropdown.

**AC-2 — File selection validation**
- Given I am on the upload screen,
- When I select a file with an invalid type (not PDF, DOCX, DOC, JPG, JPEG, PNG, TIFF),
- Then an error message displays: "The selected file must be a PDF, DOCX, DOC, JPG, JPEG, PNG, or TIFF"
- And the file is not uploaded.

**AC-3 — File size validation**
- Given I am on the upload screen,
- When I select a file larger than 20MB,
- Then an error message displays: "The selected file must be smaller than 20MB"
- And the file is not uploaded.

**AC-4 — Document type selection required**
- Given I have selected a valid file,
- When I submit without selecting a document type,
- Then an error message displays: "Select a document type"
- And the form is not submitted.

**AC-5 — Virus scanning**
- Given I submit a file that passes file validation,
- When the file is uploaded,
- Then the system performs a virus scan before accepting the file
- And if a virus is detected, the upload is rejected with message: "The selected file contains a virus and cannot be uploaded"
- And no document record is created.

**AC-6 — Successful upload**
- Given I have selected a valid file and document type,
- When I click "Upload document",
- Then the document is stored securely with metadata (filename, type, upload date, uploader identity)
- And I see a success message: "Document '[filename]' uploaded successfully"
- And I am redirected to the case detail page
- And the document appears in the case document list with status "OCR pending".

**AC-7 — Progress indication**
- Given I am uploading a file,
- When the upload is processing,
- Then a loading indicator displays with text "Uploading and scanning document..."
- And the submit button is disabled until complete.

---

## Session persistence

```js
// No session storage required - document metadata persisted to database
```

---

## Out of scope
- Bulk upload (separate story)
- Document editing after upload
- Drag-and-drop upload (separate story)
- Mobile app upload
