# Story — OCR Processing Visibility

## User story
As a legal adviser, I want to see whether a document has been OCR processed so that I know if it is ready for AI summarisation and text search.

---

## Context / scope
- All user roles viewing case documents
- All adoption case types
- Visible on: Case detail page document list
- This story covers: OCR status display, queueing, and failure handling

---

## Acceptance criteria

**AC-1 — OCR status visible**
- Given I am viewing the document list on a case,
- When documents have different OCR processing states,
- Then each document displays an OCR status indicator:
  - "OCR pending" (grey tag, icon indicating processing in progress)
  - "OCR complete" (green tag, checkmark icon)
  - "OCR failed" (red tag, warning icon with reason)
- And the status is updated automatically when OCR processing completes.

**AC-2 — Automatic OCR queueing**
- Given I upload a document,
- When the upload completes successfully,
- Then the document is automatically queued for OCR processing
- And the document status is set to "OCR pending"
- And I do not need to manually trigger OCR.

**AC-3 — OCR processing completion**
- Given a document is queued for OCR,
- When OCR processing completes successfully (typically within 60 seconds for a 10-page PDF),
- Then the document status changes to "OCR complete"
- And extracted text is stored in the database
- And the document is now searchable and ready for AI analysis.

**AC-4 — OCR failure handling**
- Given OCR processing fails for a document (e.g., image quality too low, unsupported format),
- When the failure is detected,
- Then the document status changes to "OCR failed"
- And a reason is displayed (e.g., "Image quality too low", "Handwritten text not supported")
- And the document remains downloadable and accessible
- And a notification is sent to the uploader.

**AC-5 — OCR status does not block document use**
- Given a document has status "OCR pending" or "OCR failed",
- When I attempt to download the document,
- Then the download proceeds normally
- And I can still view document metadata
- And the document is included in filtered lists.

**AC-6 — OCR retry option**
- Given a document has status "OCR failed",
- When I view the document details,
- Then a "Retry OCR" button is displayed
- And clicking it re-queues the document for OCR processing
- And the status changes back to "OCR pending".

---

## Session persistence

```js
// OCR status stored in database with document metadata
// No session storage required
```

---

## Out of scope
- Manual text extraction or editing
- OCR for handwritten documents (acknowledged limitation)
- Multi-language OCR (English only for MVP)
- OCR accuracy guarantees (best-effort basis)
- User control over OCR settings (automatic with default settings)
