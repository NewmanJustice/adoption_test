# Story 3 — Migrate Document Repository to PostgreSQL

## User story
As a **developer**, I want document metadata to persist to PostgreSQL instead of in-memory storage, so that uploaded documents remain accessible after application restarts.

---

## Context / scope
- Infrastructure story (no user-facing changes)
- Replaces in-memory Map storage in `server/src/repositories/documentRepository.ts` (123 lines)
- Uses existing migration `002_create_documents_table.sql` (already exists)
- Binary file content stored separately (filesystem or Azure Blob Storage)
- Scope: Persist document metadata (filename, type, case ID, upload status) to database

---

## Acceptance criteria

**AC-1 — Documents table migration already exists**
- Given the migration file `002_create_documents_table.sql` exists,
- When migration status is checked,
- Then the `documents` table is confirmed to exist with required columns,
- And no new migration is needed for this story.

**AC-2 — Create document persists metadata to database**
- Given a document is uploaded for case `abc-123`,
- When `createDocument(metadata)` is called,
- Then a new row is inserted into `documents` table with fields: `id`, `case_id`, `filename`, `document_type`, `upload_status`, `created_at`,
- And the file path or blob reference is stored,
- And an audit log entry is inserted,
- And the document metadata is returned to the caller.

**AC-3 — Retrieve document metadata queries database**
- Given a document exists with ID `doc-456`,
- When `getDocumentById('doc-456')` is called,
- Then a SQL SELECT query is executed: `SELECT * FROM documents WHERE id = $1`,
- And the document metadata is returned including filename, type, and upload status.

**AC-4 — List documents by case filters by case_id**
- Given case `abc-123` has 5 uploaded documents,
- When `getDocumentsByCaseId('abc-123')` is called,
- Then a SQL query filters: `SELECT * FROM documents WHERE case_id = $1 ORDER BY created_at DESC`,
- And all 5 documents for that case are returned.

**AC-5 — Update document status modifies database row**
- Given a document exists with `upload_status = 'uploading'`,
- When `updateDocumentStatus(documentId, 'complete')` is called,
- Then a SQL UPDATE query is executed: `UPDATE documents SET upload_status = $1, updated_at = NOW() WHERE id = $2`,
- And the document status is updated to 'complete',
- And an audit log entry records the status change.

**AC-6 — Delete document performs soft delete**
- Given a document exists with ID `doc-456`,
- When `deleteDocument('doc-456')` is called,
- Then a SQL UPDATE query is executed: `UPDATE documents SET deleted_at = NOW() WHERE id = $1`,
- And the document metadata remains in the database but is excluded from list queries,
- And the binary file is not deleted (retained for audit trail).

---

## Out of scope
- Binary file storage migration (filesystem to Azure Blob Storage handled separately)
- Document versioning (single version per document for MVP)
- OCR and virus scan status tracking (metadata fields exist but processing not in scope)
- Document classification AI integration (handled separately)
