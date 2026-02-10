# Test Specification — Document Upload & Management

## Understanding

This feature enables secure document upload, storage, and access control for adoption cases. Users can upload single or multiple documents with virus scanning, assign document types, and manage versions. OCR processing queues automatically for AI-readiness. Role-based access ensures confidentiality. Key workflows tested: upload (single/bulk), categorisation, duplicate handling, OCR visibility, role-based access, viewing/filtering, and downloading.

Core behaviours: file validation (type/size), virus scanning, document type assignment, duplicate detection with versioning, automatic OCR queueing, role-based permissions, audit logging, and metadata display.

## AC → Test ID Mapping

| Story | AC | Test ID | Scenario |
|-------|-----|---------|----------|
| upload-single-document | AC-1 | T-1.1 | Upload interface displays correctly |
| upload-single-document | AC-2 | T-1.2.1 | Invalid file type rejected (e.g., .txt) |
| upload-single-document | AC-2 | T-1.2.2 | Invalid MIME type rejected |
| upload-single-document | AC-3 | T-1.3 | File exceeding 20MB rejected |
| upload-single-document | AC-4 | T-1.4 | Submit without document type shows error |
| upload-single-document | AC-5 | T-1.5.1 | Clean file passes virus scan |
| upload-single-document | AC-5 | T-1.5.2 | Infected file rejected |
| upload-single-document | AC-6 | T-1.6 | Successful upload saves document |
| upload-single-document | AC-7 | T-1.7 | Progress indicator during upload |
| bulk-upload-documents | AC-1 | T-2.1 | Multiple files selected (up to 10) |
| bulk-upload-documents | AC-2 | T-2.2 | More than 10 files limited |
| bulk-upload-documents | AC-3 | T-2.3 | Individual file validation in batch |
| bulk-upload-documents | AC-4 | T-2.4.1 | Assign same type to all files |
| bulk-upload-documents | AC-4 | T-2.4.2 | Assign individual types |
| bulk-upload-documents | AC-5 | T-2.5 | Partial success saves valid uploads |
| bulk-upload-documents | AC-6 | T-2.6 | Bulk upload all successful |
| bulk-upload-documents | AC-7 | T-2.7 | Progress bar shows status |
| document-type-categorisation | AC-1 | T-3.1 | Document type dropdown displays |
| document-type-categorisation | AC-2 | T-3.2 | Inline help text visible |
| document-type-categorisation | AC-3 | T-3.3 | "Other" requires description |
| document-type-categorisation | AC-4 | T-3.4 | Document type persisted |
| document-type-categorisation | AC-5 | T-3.5 | Document type audit logged |
| document-type-categorisation | AC-6 | T-3.6 | Role-appropriate type highlighted |
| download-document | AC-1 | T-4.1 | Download link available |
| download-document | AC-2 | T-4.2 | Download initiates with correct file |
| download-document | AC-3 | T-4.3 | Access logged to audit trail |
| download-document | AC-4 | T-4.4 | Time-limited URL expires |
| download-document | AC-5 | T-4.5 | Unauthorized access blocked |
| download-document | AC-6 | T-4.6 | Failed download retries |
| download-document | AC-7 | T-4.7 | Virus-infected document not downloadable |
| duplicate-document-handling | AC-1 | T-5.1 | Exact duplicate shows warning |
| duplicate-document-handling | AC-2 | T-5.2 | Same filename, different content versions |
| duplicate-document-handling | AC-3 | T-5.3 | Document versioning displayed |
| duplicate-document-handling | AC-4 | T-5.4 | Re-submission creates audit record |
| duplicate-document-handling | AC-5 | T-5.5 | SHA-256 hash calculated |
| duplicate-document-handling | AC-6 | T-5.6 | Duplicate detection across types |
| ocr-processing-visibility | AC-1 | T-6.1 | OCR status indicators display |
| ocr-processing-visibility | AC-2 | T-6.2 | Automatic OCR queueing on upload |
| ocr-processing-visibility | AC-3 | T-6.3 | OCR completion updates status |
| ocr-processing-visibility | AC-4 | T-6.4 | OCR failure handled gracefully |
| ocr-processing-visibility | AC-5 | T-6.5 | OCR status doesn't block download |
| ocr-processing-visibility | AC-6 | T-6.6 | OCR retry option available |
| role-based-document-access | AC-1 | T-7.1 | Unassigned case access denied |
| role-based-document-access | AC-2 | T-7.2 | Professional user sees all documents |
| role-based-document-access | AC-3 | T-7.3 | Adopter restricted access |
| role-based-document-access | AC-4 | T-7.4.1 | Case officer upload allowed |
| role-based-document-access | AC-4 | T-7.4.2 | Adopter upload restricted |
| role-based-document-access | AC-5 | T-7.5 | Redacted documents hidden from adopters |
| role-based-document-access | AC-6 | T-7.6 | Cross-agency visibility |
| role-based-document-access | AC-7 | T-7.7 | Denied access logged |
| view-filter-documents | AC-1 | T-8.1 | Document list displays metadata |
| view-filter-documents | AC-2 | T-8.2 | Filter by document type |
| view-filter-documents | AC-3 | T-8.3 | Clear filters resets view |
| view-filter-documents | AC-4 | T-8.4 | Sort by column headers |
| view-filter-documents | AC-5 | T-8.5 | OCR status indicators visible |
| view-filter-documents | AC-6 | T-8.6 | Empty state displays |
| view-filter-documents | AC-7 | T-8.7 | Role-based document filtering |

## Key Assumptions

- **File storage**: Tests use local filesystem in test environment (not Azure Blob Storage)
- **Virus scanning**: Mock antivirus service for unit tests; real scanner in integration tests if available
- **OCR processing**: Asynchronous job queue simulated; tests verify queueing, not actual OCR execution
- **Authentication**: User session and role assignments pre-configured in test setup
- **SHA-256 hashing**: File hash calculation tested with known test files
- **MIME type validation**: Both extension and MIME type checked; tests cover common mismatch scenarios
- **Audit logging**: Immutable audit records verified; no deletion capability tested
- **Time-limited URLs**: 15-minute expiry enforced; tests use time manipulation to verify expiry
- **Maximum file count**: Bulk upload limited to 10 files; enforced client and server-side
- **Document retention**: 7-year retention policy not tested (out of scope for functional tests)
