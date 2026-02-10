# Story — Document Type Categorisation

## User story
As a case officer, I want to assign a document type from a predefined list when uploading so that documents are organised for compliance checking and bundle generation.

---

## Context / scope
- Professional users uploading documents (Case Officers, Social Workers, Cafcass Officers, Agency Workers)
- All adoption case types
- Screen reached when: User is on the upload document screen
- Route:
  - `GET /cases/:caseId/upload-document` (displays document type options)
- This screen captures: Document type selection with inline help

---

## Acceptance criteria

**AC-1 — Document type dropdown displays**
- Given I am on the upload document screen,
- When the page loads,
- Then a document type dropdown displays with predefined categories:
  - Application forms (Form A58, placement order applications)
  - Identity documents (birth certificates, passports)
  - Health assessments (child health, adopter health)
  - Social worker reports (PAR, child permanence reports)
  - Court orders (placement orders, care orders, special guardianship orders)
  - Consent forms (birth parent consent, witness statements)
  - Cafcass reports
  - Legal correspondence
  - Other
- And categories are ordered by frequency of use (most common first).

**AC-2 — Inline help text**
- Given I am viewing the document type dropdown,
- When I hover over or focus on each option,
- Then inline help text explains what that document type includes
- And examples are provided for clarity (e.g., "Health assessments: Child health reports, medical histories, GP letters").

**AC-3 — "Other" type requires description**
- Given I select "Other" as the document type,
- When I proceed to submit,
- Then a mandatory description field appears
- And I must provide a description before upload is allowed
- And the description field has a character limit of 500 characters.

**AC-4 — Document type persistence**
- Given I have uploaded a document with a specific type,
- When I view the document in the case document list,
- Then the assigned document type is displayed
- And the document can be filtered by this type.

**AC-5 — Document type audit trail**
- Given a document type is assigned,
- When the document is saved,
- Then the document type is recorded in the audit log
- And any subsequent changes to document metadata (re-upload as new version) are logged with the new type.

**AC-6 — Role-appropriate types**
- Given I am a Cafcass officer,
- When I view the document type dropdown,
- Then "Cafcass reports" is highlighted as the recommended type for my role
- And I can still select other types if needed.

---

## Session persistence

```js
// Document type stored in database with document metadata
// No session storage required
```

---

## Out of scope
- Automatic document classification using AI (manual selection for MVP)
- Custom document type creation by users
- Document type validation against case phase (e.g., blocking certain types in certain phases)
- Multi-category assignment (one document can only have one type)
