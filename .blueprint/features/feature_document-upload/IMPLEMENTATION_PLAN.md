# Implementation Plan — Document Upload & Management

## Summary

This feature implements secure document upload, storage, and access control for adoption cases. The implementation spans backend (Express API with PostgreSQL), file storage abstraction (local dev / Azure production), virus scanning integration, OCR job queueing, and role-based access control. The feature supports single and bulk uploads, document versioning, metadata management, and comprehensive audit logging. Tests are already written in `test/feature_document-upload.test.js` and serve as the behaviour contract.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `server/src/config/storage.ts` | Create | File storage abstraction (local filesystem for dev, Azure Blob for production) |
| `server/src/config/antivirus.ts` | Create | Antivirus service integration (ClamAV / mock for dev, Azure Defender for production) |
| `server/src/config/queue.ts` | Create | Job queue configuration for OCR processing (in-memory queue for MVP) |
| `server/src/middleware/upload.ts` | Create | Multer middleware for file upload handling with validation |
| `server/src/middleware/permissions.ts` | Create | Document access permission checking middleware |
| `server/src/repositories/documentRepository.ts` | Create | Database operations for document metadata (CRUD, versioning, filtering) |
| `server/src/services/documentService.ts` | Create | Business logic: upload processing, virus scan, OCR queueing, duplicate detection |
| `server/src/services/ocrService.ts` | Create | OCR job management and status tracking (foundation for future AI features) |
| `server/src/controllers/documentController.ts` | Create | Route handlers for upload, download, list, metadata operations |
| `server/src/routes/documents.ts` | Create | Document-related routes (`/cases/:caseId/documents/*`) |
| `server/src/utils/fileHash.ts` | Create | SHA-256 file hashing for duplicate detection |
| `server/src/utils/mimeValidation.ts` | Create | File type and MIME type validation utilities |
| `server/src/app.ts` | Modify | Register document routes |
| `server/migrations/<timestamp>_create_documents_table.sql` | Create | Database schema for documents table with metadata fields |
| `server/migrations/<timestamp>_create_audit_log_table.sql` | Create | Database schema for document access audit trail |
| `server/package.json` | Modify | Add dependencies: `multer`, `multer-storage-cloudinary` (or Azure equivalent), `clamscan`, `bull` (job queue) |
| `shared/types/document.ts` | Create | TypeScript types for document metadata, upload requests, OCR status |
| `shared/types/api.ts` | Modify | Add API types for document upload/download endpoints |
| `shared/constants/documentTypes.ts` | Create | Document type enum and categorisation constants |
| `.env.example` | Modify | Add environment variables for storage, antivirus, OCR configuration |

## Implementation Steps

1. **Install dependencies and configure environment**
   - Add `multer`, `clamscan`, `bull`, `@azure/storage-blob` to `server/package.json`
   - Define environment variables for storage paths, file size limits, Azure credentials
   - Run `npm install --workspace=server`

2. **Create database schema**
   - Migration for `documents` table: `id`, `case_id`, `filename`, `original_filename`, `document_type`, `file_size`, `file_hash`, `mime_type`, `storage_path`, `uploaded_by`, `uploaded_at`, `version`, `ocr_status`, `ocr_completed_at`, `description`
   - Migration for `document_audit_log` table: `id`, `document_id`, `user_id`, `action` (upload/download/access_denied), `timestamp`, `ip_address`, `metadata` (JSONB)
   - Add indexes on `case_id`, `uploaded_by`, `document_type`, `file_hash` for query performance

3. **Implement file storage abstraction**
   - Create `storage.ts` with interface for `uploadFile()`, `downloadFile()`, `deleteFile()`, `generateSignedUrl()`
   - Implement local filesystem storage for development
   - Implement Azure Blob Storage adapter for production (conditional based on `NODE_ENV`)
   - Handle file streaming for large files

4. **Implement file validation and virus scanning**
   - Create `mimeValidation.ts` with allowlist of file types and MIME type checking
   - Create `antivirus.ts` with ClamAV integration (mock in tests, real scanner in integration)
   - Implement file size validation in multer configuration
   - Create `upload.ts` middleware with multer setup (memory storage for scanning before persisting)

5. **Implement document repository**
   - Create `documentRepository.ts` with methods: `create()`, `findByCaseId()`, `findById()`, `findByHash()`, `updateOcrStatus()`, `createAuditLog()`
   - Implement duplicate detection by `case_id` + `file_hash`
   - Implement versioning logic (increment version number for same filename with different content)
   - Implement filtering by document type, OCR status, uploader

6. **Implement document service**
   - Create `documentService.ts` with `uploadDocument()`, `uploadBulkDocuments()`, `getDocumentMetadata()`, `listDocuments()`
   - Implement workflow: receive file → validate → virus scan → calculate hash → check duplicates → store file → save metadata → queue OCR
   - Handle partial success in bulk uploads (transaction boundaries per document)
   - Implement role-based filtering of document lists

7. **Implement OCR service foundation**
   - Create `ocrService.ts` with job queue setup using Bull (in-memory Redis for dev)
   - Implement `queueDocument()` to create OCR job with document ID
   - Implement status tracking: `updateOcrStatus(documentId, status, result)`
   - OCR processing itself deferred to future feature; this creates infrastructure

8. **Implement permission middleware**
   - Create `permissions.ts` with `canAccessCase()`, `canUploadToCase()`, `canViewDocument()`, `canDownloadDocument()`
   - Implement role-based logic: case officers/social workers/Cafcass can access assigned cases; adopters have restricted view
   - Implement document-level restrictions (e.g., adopters cannot see certain document types)
   - Log access denial attempts to audit trail

9. **Implement document controller and routes**
   - Create `documentController.ts` with handlers: `uploadSingle`, `uploadBulk`, `download`, `list`, `getMetadata`
   - Create `routes/documents.ts` with routes: `GET /cases/:caseId/upload-document`, `POST /cases/:caseId/upload-document`, `GET /cases/:caseId/documents`, `GET /cases/:caseId/documents/:documentId/download`
   - Implement signed URL generation for downloads (15-minute expiry)
   - Add comprehensive error handling and validation

10. **Iteratively implement and test**
    - Implement one test group at a time (e.g., single upload tests first)
    - Run `npx jest test/feature_document-upload.test.js` after each file change
    - Fix test failures incrementally until all tests pass
    - Final verification: run full test suite and type checking

## Risks/Questions

- **OCR Engine Selection**: Plan assumes in-memory job queue with status tracking only; actual OCR processing deferred to future feature. Need confirmation on whether mock OCR completion should be simulated in tests.
- **Azure Blob Storage**: Local development uses filesystem; production uses Azure. Need Azure credentials and configuration for deployment testing. Storage abstraction isolates this, but end-to-end testing requires Azure access.
- **Virus Scanning Performance**: ClamAV scanning may add 3-5 seconds per file. For bulk uploads, this could cause timeout issues. Consider async scanning with immediate upload acceptance and post-scan quarantine if needed.
- **File Size and Concurrency**: 20MB limit and bulk upload of 10 files = up to 200MB in memory. Multer memory storage may cause issues; consider streaming to temp disk storage instead.
- **Document Versioning UX**: Spec mentions warning users about duplicates, but tests don't explicitly verify user notification. Implementation will auto-version; confirm if user prompt is required or just audit logging.
- **Adopter Document Restrictions**: AC-3 in role-based access story lists specific document types adopters cannot see. Need confirmation on complete list and whether to implement via document type flagging or explicit permission table.
