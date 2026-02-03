# Story — Case Data Model and Database Schema

## User Story

As a **developer implementing case management features**, I want **a well-defined case data model and database schema** so that **all case-related features have a consistent foundation for storing and retrieving case information**.

---

## Context / Scope

- **Story Type:** Technical enabler
- **Actors:** System (data layer operates transparently)
- **Dependencies:**
  - PostgreSQL database available
  - Database migration infrastructure
- **This story establishes:**
  - Case entity schema definition
  - Adoption type enumeration
  - Case status enumeration
  - Database migration scripts
  - TypeScript type definitions for shared use

---

## Acceptance Criteria

**AC-1 — Case table created**
- Given the database migration runs,
- When the migration completes successfully,
- Then a `cases` table exists with the required columns.

**AC-2 — Required case fields**
- Given the case table exists,
- When examining the schema,
- Then the following required fields are present:
  - `id` (UUID, primary key),
  - `case_number` (string, unique, not null),
  - `case_type` (enum, not null),
  - `status` (enum, not null, default 'APPLICATION'),
  - `assigned_court` (string, not null),
  - `created_at` (timestamp, not null),
  - `updated_at` (timestamp, not null),
  - `created_by` (string, not null).

**AC-3 — Optional case fields**
- Given the case table exists,
- When examining the schema,
- Then the following optional fields are present:
  - `linked_case_reference` (string, nullable),
  - `notes` (text, nullable).

**AC-4 — Adoption type enumeration**
- Given the case type field,
- When validating allowed values,
- Then only the following six types are accepted:
  - `AGENCY_ADOPTION`,
  - `STEP_PARENT_ADOPTION`,
  - `INTERCOUNTRY_ADOPTION`,
  - `NON_AGENCY_ADOPTION`,
  - `FOSTER_TO_ADOPT`,
  - `ADOPTION_FOLLOWING_PLACEMENT_ORDER`.

**AC-5 — Case status enumeration**
- Given the case status field,
- When validating allowed values,
- Then only the following nine statuses are accepted:
  - `APPLICATION`,
  - `DIRECTIONS`,
  - `CONSENT_AND_REPORTING`,
  - `FINAL_HEARING`,
  - `ORDER_GRANTED`,
  - `APPLICATION_REFUSED`,
  - `APPLICATION_WITHDRAWN`,
  - `ON_HOLD`,
  - `ADJOURNED`.

**AC-6 — Case number uniqueness**
- Given a case exists with a specific case number,
- When attempting to create another case with the same number,
- Then the database rejects the insert with a unique constraint violation.

**AC-7 — Timestamps auto-populated**
- Given a new case is created,
- When the insert completes,
- Then `created_at` is automatically set to current timestamp,
- And `updated_at` is automatically set to current timestamp.

**AC-8 — Updated timestamp auto-refreshed**
- Given an existing case is updated,
- When the update completes,
- Then `updated_at` is automatically set to current timestamp.

**AC-9 — Soft delete support**
- Given the case table schema,
- When examining the design,
- Then a `deleted_at` (timestamp, nullable) field exists for soft deletes,
- And queries by default exclude soft-deleted records.

**AC-10 — TypeScript types exported**
- Given the shared types package,
- When importing case types,
- Then the following are available:
  - `Case` interface,
  - `AdoptionType` enum,
  - `CaseStatus` enum,
  - `CreateCaseRequest` interface,
  - `UpdateCaseRequest` interface.

---

## Data Model

```typescript
// shared/types/case.ts

export enum AdoptionType {
  AGENCY_ADOPTION = 'AGENCY_ADOPTION',
  STEP_PARENT_ADOPTION = 'STEP_PARENT_ADOPTION',
  INTERCOUNTRY_ADOPTION = 'INTERCOUNTRY_ADOPTION',
  NON_AGENCY_ADOPTION = 'NON_AGENCY_ADOPTION',
  FOSTER_TO_ADOPT = 'FOSTER_TO_ADOPT',
  ADOPTION_FOLLOWING_PLACEMENT_ORDER = 'ADOPTION_FOLLOWING_PLACEMENT_ORDER'
}

export enum CaseStatus {
  APPLICATION = 'APPLICATION',
  DIRECTIONS = 'DIRECTIONS',
  CONSENT_AND_REPORTING = 'CONSENT_AND_REPORTING',
  FINAL_HEARING = 'FINAL_HEARING',
  ORDER_GRANTED = 'ORDER_GRANTED',
  APPLICATION_REFUSED = 'APPLICATION_REFUSED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',
  ON_HOLD = 'ON_HOLD',
  ADJOURNED = 'ADJOURNED'
}

export interface Case {
  id: string;
  caseNumber: string;
  caseType: AdoptionType;
  status: CaseStatus;
  assignedCourt: string;
  linkedCaseReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  deletedAt?: string;
}

export interface CreateCaseRequest {
  caseType: AdoptionType;
  assignedCourt: string;
  linkedCaseReference?: string;
  notes?: string;
}

export interface UpdateCaseRequest {
  status?: CaseStatus;
  assignedCourt?: string;
  linkedCaseReference?: string;
  notes?: string;
}
```

---

## Database Schema

```sql
-- migrations/001_create_cases_table.sql

CREATE TYPE adoption_type AS ENUM (
  'AGENCY_ADOPTION',
  'STEP_PARENT_ADOPTION',
  'INTERCOUNTRY_ADOPTION',
  'NON_AGENCY_ADOPTION',
  'FOSTER_TO_ADOPT',
  'ADOPTION_FOLLOWING_PLACEMENT_ORDER'
);

CREATE TYPE case_status AS ENUM (
  'APPLICATION',
  'DIRECTIONS',
  'CONSENT_AND_REPORTING',
  'FINAL_HEARING',
  'ORDER_GRANTED',
  'APPLICATION_REFUSED',
  'APPLICATION_WITHDRAWN',
  'ON_HOLD',
  'ADJOURNED'
);

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  case_type adoption_type NOT NULL,
  status case_status NOT NULL DEFAULT 'APPLICATION',
  assigned_court VARCHAR(255) NOT NULL,
  linked_case_reference VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_assigned_court ON cases(assigned_court);
CREATE INDEX idx_cases_deleted_at ON cases(deleted_at) WHERE deleted_at IS NULL;

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Out of Scope

- Party/participant junction table (separate feature)
- Document associations (separate feature)
- Hearing associations (separate feature)
- Case assignment table for user-case relationships (addressed in access control story)
- Full-text search indexes (future enhancement)
- Data archival and retention policies

---

## Assumptions

1. UUID is acceptable as primary key format
2. Case number format will follow pattern: COURT/YEAR/SEQUENCE (generation logic in separate story)
3. PostgreSQL 14+ is available with gen_random_uuid() support
4. Soft delete pattern is preferred over hard delete for audit trail preservation
