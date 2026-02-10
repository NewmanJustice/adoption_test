# Story — View and Filter Case Documents

## User story
As a legal adviser, I want to view all documents on a case filtered by type so that I can quickly find relevant evidence for bundle preparation.

---

## Context / scope
- All user roles with case access (Case Officers, Judges, Legal Advisers, Cafcass Officers, Social Workers, Agency Workers, Adopters)
- All adoption case types
- Screen reached when: User views case detail page
- Route:
  - `GET /cases/:caseId` (includes document list)
- This screen displays: Complete list of case documents with filtering and metadata

---

## Acceptance criteria

**AC-1 — Document list displays**
- Given I am viewing a case detail page,
- When the page loads,
- Then I see a "Documents" section listing all documents on the case
- And each document shows: filename, document type, upload date, uploaded by, OCR status.

**AC-2 — Filter by document type**
- Given the case has multiple documents of different types,
- When I select a document type from the filter dropdown (e.g., "Health assessments"),
- Then only documents of that type are displayed
- And a count shows "Showing X of Y documents".

**AC-3 — Clear filters**
- Given I have applied a document type filter,
- When I click "Clear filters",
- Then all documents are displayed again
- And the filter dropdown resets to "All document types".

**AC-4 — Sort documents**
- Given I am viewing the document list,
- When I click column headers (Upload date, Document type, Uploaded by),
- Then documents are sorted by that column
- And I can toggle between ascending and descending order.

**AC-5 — OCR status indicators**
- Given documents have different OCR processing states,
- When I view the document list,
- Then OCR status is clearly indicated with:
  - "OCR pending" (grey tag)
  - "OCR complete" (green tag)
  - "OCR failed" (red tag with reason)
- And documents are accessible regardless of OCR status.

**AC-6 — Empty state**
- Given a case has no documents uploaded,
- When I view the case detail page,
- Then I see a message: "No documents have been uploaded to this case yet"
- And an "Upload document" button is displayed.

**AC-7 — Role-based access**
- Given I am an adopter viewing my case,
- When I view the document list,
- Then I only see documents I have uploaded and documents explicitly shared with me
- And I do not see social worker reports or birth family documents.

---

## Session persistence

```js
// Filter preferences optionally stored in session for user experience
session.documentFilters = {
  caseId: 'case-123',
  documentType: 'health-assessment' | null,
  sortBy: 'uploadDate' | 'documentType' | 'uploadedBy',
  sortOrder: 'asc' | 'desc'
}
```

---

## Out of scope
- Document annotation or commenting
- Document comparison or version diffing
- Bulk download of documents
- Document editing
