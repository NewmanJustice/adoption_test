# Story — Role-Based Document Access

## User story
As a judge, I want to view all documents on my assigned cases but cannot access documents on cases outside my docket, so that confidentiality is maintained.

---

## Context / scope
- All user roles (Judges, Case Officers, Social Workers, Cafcass Officers, Agency Workers, Adopters)
- All adoption case types
- Access control applied to: Document viewing, downloading, and upload permissions
- This story covers: Role-based permissions and case assignment enforcement

---

## Acceptance criteria

**AC-1 — Case assignment enforcement**
- Given I am a user attempting to access a case,
- When I am not assigned to the case,
- Then I receive an error: "You do not have permission to access this case"
- And the case detail page (including documents) is not accessible.

**AC-2 — Professional user document access**
- Given I am a professional user (Case Officer, Judge, Legal Adviser, Cafcass Officer, Social Worker, Agency Worker) assigned to a case,
- When I view the case detail page,
- Then I can see all documents on the case
- And I can download any document.

**AC-3 — Adopter restricted access**
- Given I am an adopter viewing my own adoption case,
- When I view the case detail page,
- Then I can see:
  - Documents I have uploaded
  - Documents explicitly shared with me (e.g., court orders, public notices)
- And I cannot see:
  - Social worker reports about me (PAR, assessments)
  - Birth family identifying documents
  - Cafcass internal reports
  - Court correspondence not intended for me.

**AC-4 — Upload permissions by role**
- Given I am a user with a specific role,
- When I attempt to upload a document,
- Then upload is allowed only if:
  - Case Officers: can upload to any assigned case
  - Social Workers: can upload to cases managed by their Local Authority
  - Cafcass Officers: can upload to assigned cases
  - Agency Workers: can upload to cases involving their agency
  - Adopters: can upload to their own application cases (not court-managed cases)
- And inappropriate upload attempts are blocked with: "You do not have permission to upload documents to this case."

**AC-5 — Document redaction enforcement**
- Given a document contains birth parent identifying information,
- When an adopter views the document list,
- Then that document is not displayed in their view
- And attempting to access the document URL directly returns an error.

**AC-6 — Cross-agency document visibility**
- Given I am a Local Authority social worker,
- When I view a case involving a Voluntary Adoption Agency,
- Then I can see documents uploaded by the agency (with appropriate sharing permissions)
- And the agency can see documents I have uploaded
- And role-based restrictions are maintained across agencies.

**AC-7 — Audit logging of access attempts**
- Given a user attempts to access a document,
- When the access is denied due to permissions,
- Then an audit log entry is created recording:
  - User ID
  - Document ID
  - Access attempt timestamp
  - Denial reason (e.g., "Not assigned to case", "Role restriction")
- And the log entry is immutable.

---

## Session persistence

```js
// User role and case assignments stored in session after authentication
session.user = {
  id: 'user-123',
  role: 'case-officer' | 'judge' | 'social-worker' | 'cafcass-officer' | 'agency-worker' | 'adopter',
  assignedCases: ['case-001', 'case-002'],
  organisation: 'HMCTS Manchester' | 'Birmingham LA' | 'Barnardos'
}
```

---

## Out of scope
- Granular document-level permissions (permissions are role and case-based)
- Temporary document sharing links
- Document sharing outside the platform (e.g., email)
- Time-limited access permissions
