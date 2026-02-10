# Feature Specification — Document Upload & Management

## 1. Feature Intent

**Why this feature exists.**

This feature enables secure document upload, storage, and management for adoption cases. It solves the critical problem of digitising and organising the complex document trails required for adoption proceedings, replacing paper-heavy legacy processes with structured, auditable, AI-ready document management.

**Problem being addressed:**
- Adoption cases require extensive documentation (health assessments, social worker reports, court forms, birth certificates, court orders, consent forms, etc.)
- Paper documents are slow to process, easily lost, and difficult to share securely between agencies
- Manual document handling creates administrative burden and slows case progression
- Poor document organisation makes compliance checking difficult
- Lack of structured document data prevents AI-assisted analysis

**User need:**
- Case workers, legal advisers, judges, and Cafcass officers need to upload, access, and review case documents quickly and securely
- Multiple agencies need shared access to appropriate documents without duplication or version confusion
- The system needs structured document metadata to support AI summarisation, risk flagging, and compliance monitoring

**Alignment to system purpose:**
This feature is foundational to the Adoption Digital Platform's mission to digitise the end-to-end adoption journey. Without effective document management, the system cannot deliver on its promises of improved case progression speed, data quality, multi-agency collaboration, or AI-assisted decision support (per `.blueprint/system_specification/SYSTEM_SPEC.md` Section 1).

---

## 2. Scope

### In Scope

**Document Upload:**
- Upload documents to a specific case via web interface
- Support multiple file formats: PDF, DOCX, JPG, PNG, TIFF
- Maximum file size: 20MB per document (configurable)
- Virus scanning on upload
- Bulk upload (multiple files in one action)

**Document Metadata Capture:**
- Document type classification (from predefined list aligned to adoption workflows)
- Upload date (system-generated)
- Uploader identity (from authenticated session)
- Optional description field (free text)
- Document version tracking

**Document Type Categories:**
- Application forms (Form A58, placement order applications)
- Identity documents (birth certificates, passports)
- Health assessments (child health, adopter health)
- Social worker reports (PAR, child permanence reports)
- Court orders (placement orders, care orders, special guardianship orders)
- Consent forms (birth parent consent, witness statements)
- Cafcass reports
- Legal correspondence
- Other (with mandatory description)

**Document Viewing & Access:**
- List all documents on a case (filtered by type)
- Download original uploaded document
- View metadata (type, upload date, uploader, version)
- Role-based access control (users only see documents for cases they are assigned to)

**OCR Processing (Foundation):**
- System automatically queues uploaded documents for OCR processing
- OCR extracts text content for future AI analysis (implemented in subsequent features)
- OCR status visible in document metadata (pending, completed, failed)
- This feature lays technical groundwork; AI analysis is out of scope for this feature

### Out of Scope

**Deferred to future features:**
- AI document summarisation (separate feature)
- AI risk flagging based on document content (separate feature)
- Document annotation or commenting
- Document redaction tools (handled manually for MVP)
- Automatic document classification using AI (manual selection for MVP)
- Document comparison or version diffing
- Email-based document submission
- Mobile app upload (web responsive only for MVP)

**Explicitly excluded:**
- Document editing or modification after upload (upload new version instead)
- Document deletion (soft delete with audit trail only; requires admin permission)
- Bulk export or download of all case documents

---

## 3. Actors Involved

**HMCTS Case Officers**
- **Can:** Upload documents to cases they manage; view all documents on assigned cases; download documents; categorise uploaded documents
- **Cannot:** Access documents on cases not assigned to them; delete documents permanently

**Judges / Legal Advisers**
- **Can:** View and download all documents on cases assigned to them; see full metadata and audit trails
- **Cannot:** Upload documents directly (court bundle generation is separate process); modify document metadata

**Cafcass Officers**
- **Can:** Upload Cafcass reports and related documents to assigned cases; view documents relevant to their role; download documents
- **Cannot:** Access documents on cases not assigned to them; upload documents to case types outside their remit

**Local Authority Social Workers**
- **Can:** Upload social worker reports, health assessments, child permanence reports; view documents on cases they manage; download documents
- **Cannot:** Access documents on cases outside their authority; upload documents on behalf of other agencies

**Voluntary Adoption Agency Workers**
- **Can:** Upload adopter assessments (PAR), references, health reports; view documents on cases they are involved with; download documents
- **Cannot:** Access LA-specific documents without permission; upload court forms

**Adopters (Limited Access)**
- **Can:** Upload supporting documents requested by their agency (e.g., proof of identity, references); view documents they have uploaded; view status updates related to their documentation
- **Cannot:** View social worker reports about themselves; view birth family documents; access other adopters' documents; upload documents directly to court

---

## 4. Behaviour Overview

**Happy-path upload flow:**
1. User navigates to case detail page and selects "Upload document"
2. User selects file(s) from local device (drag-and-drop or file picker)
3. System validates file type, size, and performs virus scan
4. User assigns document type from dropdown list
5. User optionally adds description
6. User submits upload
7. System stores document in secure file storage, saves metadata to database, and queues document for OCR processing
8. User sees confirmation message with document name and upload timestamp
9. Document appears in case document list immediately with status "OCR pending"

**Key alternative flows:**

**Virus detected:**
- Upload rejected with clear error message
- No document record created
- User prompted to scan file locally and retry

**Invalid file type or size:**
- Upload prevented before submission
- Client-side validation shows error immediately
- User can select different file

**Bulk upload:**
- User selects multiple files (up to 10 at once)
- Each file assigned same document type (or individually categorised via table view)
- All files uploaded in single transaction
- Partial success handled: successful uploads saved, failed uploads reported

**Document already exists (duplicate detection):**
- System checks filename + file hash against existing documents on case
- If exact duplicate detected, warn user but allow upload (treated as re-submission for audit purposes)
- If filename matches but content differs, upload as new version automatically

**OCR processing failure:**
- Document remains accessible for download
- OCR status marked "failed" with reason (e.g., "Image quality too low")
- User notified via status indicator
- Does not block document use; AI features gracefully degrade

**User-visible outcomes:**
- Comprehensive, searchable document list on case page
- Clear status indicators (uploaded, OCR pending, OCR complete, OCR failed)
- Audit trail showing who uploaded what and when
- Documents available for download by authorised users
- Foundation for AI features (summarisation, risk flagging) in subsequent releases

---

## 5. State & Lifecycle Interactions

**States entered:**
- **Document Uploaded:** Document record created in database with metadata; file stored in secure storage
- **OCR Pending:** Document queued for OCR processing
- **OCR Complete:** Text content extracted and stored; document ready for AI analysis
- **OCR Failed:** Text extraction failed; document accessible but AI features may be limited

**States modified:**
- **Case Status:** When mandatory documents for a case type are uploaded, case may transition from "Awaiting Documents" to "Documents Complete" (compliance tracking feature)
- **Application Lifecycle:** Document uploads during "Application" phase allow progression to "Directions" phase once all required documents present

**States exited:**
- Not applicable (this feature does not remove cases from states)

**Lifecycle role:**
- **State-creating:** Creates new document records; initiates OCR processing state
- **State-constraining:** Cases cannot progress to certain phases without required documents (enforced by separate compliance feature, but document upload is prerequisite)

**Relationship to system lifecycle (SYSTEM_SPEC.md Section 6):**
- Primarily active during **Application** and **Directions** phases when case documents are being assembled
- Also used during **Consent & Reporting** phase when agencies submit reports
- Supports **Final Hearing** phase by ensuring all documents are digitally accessible for bundle generation

---

## 6. Rules & Decision Logic

**R1: File Type Validation**
- **Description:** Only approved file types can be uploaded
- **Inputs:** File extension, MIME type
- **Outputs:** Upload allowed (true/false), error message if rejected
- **Logic:** Permitted extensions: `.pdf`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`, `.tiff`. MIME type must match extension.
- **Deterministic:** Yes

**R2: File Size Limit**
- **Description:** Files exceeding maximum size are rejected
- **Inputs:** File size in bytes
- **Outputs:** Upload allowed (true/false), error message if rejected
- **Logic:** Maximum size = 20MB (20,971,520 bytes). Configurable via environment variable.
- **Deterministic:** Yes

**R3: Virus Scanning**
- **Description:** All uploads scanned for malware before storage
- **Inputs:** File binary content
- **Outputs:** Scan result (clean, infected, scan failed)
- **Logic:** Integration with antivirus service (ClamAV or Azure equivalent). If infected or scan fails, upload rejected.
- **Deterministic:** Yes (though antivirus definitions update over time)

**R4: Document Type Classification**
- **Description:** User must assign a document type from predefined list
- **Inputs:** User-selected document type from dropdown
- **Outputs:** Document type stored in metadata
- **Logic:** Document types aligned to adoption workflows (per Section 2). "Other" type requires description.
- **Discretionary:** Yes (user selects appropriate type)

**R5: Role-Based Upload Permissions**
- **Description:** Only users with appropriate role can upload documents to a case
- **Inputs:** User role, case assignment
- **Outputs:** Upload button visible (true/false), upload allowed (true/false)
- **Logic:** User must have case role (case officer, social worker, Cafcass officer, agency worker, adopter). Adopters can only upload to their own application cases, not court-managed cases.
- **Deterministic:** Yes (based on role assignments)

**R6: OCR Queueing**
- **Description:** Uploaded documents automatically queued for OCR processing
- **Inputs:** Document ID, file type
- **Outputs:** OCR job created, status set to "pending"
- **Logic:** All document types queued except images under 100KB (assumed to be non-text). OCR processed asynchronously via job queue.
- **Deterministic:** Yes

**R7: Duplicate Detection**
- **Description:** System warns if duplicate document uploaded but allows it
- **Inputs:** Filename, file hash (SHA-256)
- **Outputs:** Warning message, document uploaded as new version
- **Logic:** Compare hash of new file against existing documents on same case. If match found, increment version number and warn user.
- **Deterministic:** Yes

**R8: Audit Logging**
- **Description:** All document upload actions logged for audit trail
- **Inputs:** User ID, document ID, action timestamp, file metadata
- **Outputs:** Audit log entry created
- **Logic:** Immutable log entry capturing: who uploaded, what file, when, to which case, file hash, file size, document type.
- **Deterministic:** Yes

---

## 7. Dependencies

**System components:**
- **Authentication system:** User identity required to attribute uploads and enforce role-based access
- **Case management:** Documents must be linked to an existing case record
- **Database:** PostgreSQL for document metadata storage (per SYSTEM_SPEC.md Section 12.6)
- **File storage:** Azure Blob Storage (production) or local filesystem (development) for binary document storage
- **Job queue:** Asynchronous processing for OCR tasks (e.g., Bull queue with Redis)

**External systems:**
- **Antivirus service:** ClamAV (local development) or Azure Defender for Storage (production)
- **OCR engine:** Azure Computer Vision OCR API or Tesseract (for offline fallback)
- **Anthropic Claude API:** Future dependency for AI summarisation and analysis of OCR output (not in this feature scope)

**Policy dependencies:**
- **Ministry of Justice Security Standards:** Encryption at rest and in transit; access logging; secure deletion procedures
- **GDPR and Data Protection Act:** Personal data handling; right to access; retention policies
- **Family Procedure Rules Part 14:** Court bundle requirements inform document type categories

**Operational dependencies:**
- **Storage capacity monitoring:** Alerts when storage approaches capacity limits
- **Backup and recovery:** Document storage must be backed up daily; recovery procedures documented
- **Virus definition updates:** Antivirus service must receive regular updates

---

## 8. Non-Functional Considerations

**Performance:**
- Upload of 20MB file completes in < 30 seconds on standard broadband connection
- Document list for case with 100+ documents loads in < 2 seconds
- OCR processing completes within 60 seconds for typical PDF (10 pages) (per SYSTEM_SPEC.md Section 9)
- Bulk upload of 10 files queued in < 5 seconds; processing asynchronous

**Security:**
- All uploads transmitted over HTTPS (enforced by Azure App Service; per SYSTEM_SPEC.md Section 9)
- Stored documents encrypted at rest using Azure Storage Service Encryption
- Access URLs time-limited (signed URLs expire after 15 minutes)
- No direct public access to document storage; all access mediated by API with authorisation checks

**Audit/Logging:**
- Every upload, download, and access attempt logged with user ID, timestamp, IP address, case ID, document ID
- Logs retained for 7 years (adoption case retention period)
- Logs immutable; deletion requires admin override with justification
- Failed virus scans logged with file hash for security monitoring

**Error Tolerance:**
- Upload failures retry automatically (up to 3 attempts with exponential backoff)
- Partial uploads discarded; no orphaned files
- OCR failures do not block document use; status clearly indicated
- If file storage unavailable, uploads gracefully rejected with "Service temporarily unavailable" message; user prompted to retry

**Accessibility:**
- Upload interface keyboard-navigable
- Drag-and-drop alternative provided (file picker button)
- Screen reader announces upload progress and completion
- Error messages clearly associated with relevant form fields
- File type requirements explained in plain English

**Usability:**
- Drag-and-drop upload for efficiency
- Clear progress indicators during upload and virus scanning
- Immediate visual confirmation when upload completes
- Document type dropdown organised by frequency of use (most common types first)
- Inline help text explains what each document type means

---

## 9. Assumptions & Open Questions

**Assumptions:**
1. Users have reliable internet connection capable of uploading multi-megabyte files
2. Most documents will be PDFs or scanned images; DOCX support is secondary
3. OCR accuracy of 95%+ is achievable for typed documents; handwritten documents may require manual transcription
4. Azure Blob Storage pricing is acceptable for projected document volume (rough estimate: 10,000 cases/year × 50 documents/case × 2MB average = ~1TB/year)
5. Document retention period is 7 years post-case closure (adoption records retention standard)
6. Antivirus scanning adds < 5 seconds to upload time for typical documents
7. Users understand document type categories without extensive training (supported by inline help)

**Open Questions:**
1. **OCR Engine Selection:** Should we use Azure Computer Vision (cloud, cost per page) or Tesseract (open source, requires compute)? Trade-off: accuracy vs. cost vs. data sovereignty.
2. **Large Document Handling:** What if a document exceeds 20MB (e.g., comprehensive medical history)? Should we allow exception uploads, or require users to split files?
3. **Document Versioning UI:** When a duplicate is detected, should we explicitly prompt "Upload as new version?" or silently version? User research needed.
4. **OCR Language Support:** Intercountry adoption cases may include non-English documents. Should OCR support multi-language detection? If so, which languages? (Hague Convention countries: French, Spanish, Russian, Chinese priority?)
5. **Legacy Document Migration:** Will existing paper case files be scanned and uploaded? If so, who is responsible, and what metadata quality can we expect?
6. **Document Redaction:** For birth parent information visible to adopters, who performs redaction, and when? Manual process for MVP, but needs workflow definition.
7. **Expired Document Handling:** Some documents have expiry dates (e.g., DBS checks valid for 3 months). Should system flag expired documents? (Likely a compliance monitoring feature, but impacts metadata capture here.)

---

## 10. Impact on System Specification

**Alignment to existing system assumptions:**

This feature **reinforces** the following system specification assumptions:
- **Single digital case record (SYSTEM_SPEC.md Section 7):** Documents are integral to the case record; this feature delivers on that promise.
- **AI-ready architecture (Section 3.1):** OCR processing creates structured text data required for AI document intelligence.
- **Multi-agency collaboration (Section 5):** Role-based document access enables secure sharing between HMCTS, Cafcass, LAs, and voluntary agencies.
- **Full audit trail (Section 7):** Every document action logged, supporting judicial review and appeals.
- **Security and compliance (Section 9):** Encryption, access control, and virus scanning meet MoJ security standards.

**Tensions identified:**

None. This feature operates within existing system boundaries and does not contradict any system-level assumptions.

**Potential future specification changes:**

As this feature matures, we may discover that:
- **Document linking:** Cases may need to reference the same document across multiple proceedings (e.g., placement order document used in multiple adoption applications). This could require a shift from "document belongs to case" to "document referenced by case" model. *Flag for future consideration.*
- **Real-time collaboration:** If multiple users are uploading documents concurrently, optimistic locking or conflict resolution may be needed. Current assumption is that document uploads are relatively infrequent and conflicts are rare. *Monitor usage patterns.*

---

## 11. Handover to BA (Cass)

**Story themes to explore:**

1. **Basic Upload & Viewing:** "As a case officer, I can upload a document to a case so that it is securely stored and accessible to authorised users."
2. **Document Categorisation:** "As a social worker, I can assign a document type when uploading so that documents are organised for compliance checking and bundle generation."
3. **Bulk Upload Efficiency:** "As a Cafcass officer, I can upload multiple documents at once so that I can efficiently submit all required reports."
4. **OCR Processing Visibility:** "As a legal adviser, I can see whether a document has been OCR processed so that I know if it is ready for AI summarisation."
5. **Role-Based Access Control:** "As a judge, I can view all documents on my assigned cases but cannot access documents on cases outside my docket."
6. **Download & Audit:** "As an adoption agency worker, I can download documents I need for my records, and my access is logged for audit purposes."
7. **Error Handling:** "As a user, I receive clear feedback if my upload fails due to file type, size, or virus scan issues so that I can correct and retry."

**Expected story boundaries:**

- **One story per upload scenario:** Separate stories for single upload, bulk upload, duplicate handling
- **One story per user role:** Role-based access control likely needs stories per actor type to capture specific permissions
- **Technical infrastructure stories:** OCR setup, virus scanning integration, file storage configuration (may be implementation tasks rather than user stories)

**Areas needing careful story framing:**

- **OCR as enabler, not feature:** OCR processing is technical infrastructure for future AI features. Stories should frame it as "making document text searchable" or "preparing documents for analysis," not as an end-user feature itself.
- **Adopter upload restrictions:** Adopter upload permissions are limited and context-specific. Story must clearly define what adopters can/cannot upload and when.
- **Audit logging invisibility:** Audit logging is critical but mostly invisible to users. May need separate technical story or acceptance criteria on user stories.
- **File storage abstraction:** Development uses local filesystem, production uses Azure Blob Storage. Stories should be environment-agnostic; implementation handles the switch.

**Dependencies for story sequencing:**

- Authentication and role management must exist before role-based access control stories can be implemented
- Case management features must exist before documents can be linked to cases
- Job queue infrastructure must exist before OCR processing can be implemented

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|-----|------|--------|-----------|
| 2026-02-04 | Initial feature specification created | Baseline design for document upload and management feature | Alex (System Spec Agent) |
