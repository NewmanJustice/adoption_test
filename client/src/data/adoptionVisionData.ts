/**
 * Adoption Vision Content
 * Sourced from .business_context/ files 01–15
 */

import { PilotSection } from './pilotSpecification';

export const adoptionVisionData: PilotSection[] = [
  {
    id: 'introduction-objectives',
    title: '1. Introduction & Objectives',
    content: `## 1.1 Purpose of the Solution

To design and deliver a digital/AI-enabled platform that supports and streamlines the end-to-end journey of adoption cases in England & Wales, including:

* Agency and non-agency adoption processes
* Step-parent, intercountry, foster-to-adopt, and placement-order pathways
* The court process (application → directions → final hearing → adoption order)
* Multi-agency interactions (Local Authority social care, voluntary adoption agencies, Cafcass, HMCTS)

## 1.2 Core Objectives

* Reduce administrative burden on social workers, legal teams, and judiciary.
* Improve case progression speed and data quality.
* Enhance safeguarding decision-making via AI decision-support (never fully automated).
* Provide clear, guided digital journeys for adopters and professionals.
* Improve visibility, auditability, and compliance.
* Ensure secure, ethical, transparent use of AI aligned with Ministry of Justice standards.
* Facilitate the decommissioning of legacy applications.`,
  },
  {
    id: 'functional-requirements',
    title: '2. Functional Requirements',
    content: `## 2.1 Core Case Management

The system must:

* Create a single digital case record for each adoption type.
* Support ingestion of placement orders, reports, consents, evidence, and court forms (e.g. Form A58).
* Track mandatory statutory milestones (e.g. 10-week placement requirement before adoption order applications).
* Provide referral pathways for Cafcass, Local Authorities (LAs), and voluntary agencies.

## 2.2 Digital Journeys for Case Types

### 2.2.1 Agency Adoption

* Guided intake for adopter applications.
* Automated checks for required documentation (DBS, health, references).
* Matching decision-support (profile summarisation, compliance checklists).

### 2.2.2 Step-Parent Adoption

* Dynamic forms adjusting to parental responsibility arrangements.
* Secure digital consent capture from birth parents.
* Alerts where the court must consider dispensing with consent.

### 2.2.3 Intercountry Adoption

* Workflow to track Hague Convention requirements.
* AI translation assistance with human verification.
* Risk flags for missing or inconsistent international documentation.

### 2.2.4 Non-Agency Adoption

* Eligibility triage questions to route cases correctly.
* Upload and classification of existing orders (e.g. Special Guardianship Orders, care orders).
* Safeguarding flag for historic family court involvement.

### 2.2.5 Foster-to-Adopt / Early Permanence

* Cross-agency data sharing (read-only views where appropriate).
* AI-generated care chronologies.
* Placement monitoring portal for carers.

### 2.2.6 Adoption Following Placement Order

* Automated extraction of placement order details to pre-populate adopter applications.
* Time-based compliance monitoring (e.g. statutory 10-week rule, review dates).
* Pre-bundle generation for the Adoption Order hearing.`,
  },
  {
    id: 'ai-requirements',
    title: '3. AI Requirements',
    content: `## 3.1 Document Intelligence

* OCR and NLP to extract and structure data from:

  * Prospective Adopters Reports (PAR)
  * Health assessments
  * Social work assessments
  * Court orders
* Automatic identification of missing documents.

## 3.2 Decision-Support AI

* Summaries of long reports for judicial and social-work consumption.
* Matching support using child-needs profiles and adopter capability indicators.
* Risk flagging (e.g. contradictory consent data, safeguarding markers, timeline breaches).

AI must NOT:

* Make automated legal decisions.
* Replace social worker recommendations or judicial discretion.
* Generate or alter evidence.

## 3.3 Explainability & Audit

* Every AI output must be traceable, inspectable, and explainable.
* Provide confidence scoring and justification notes.
* Allow users to override AI outputs with commentary.`,
  },
  {
    id: 'user-roles-access',
    title: '4. User Roles & Access Control',
    content: `## 4.1 Key Roles

* HMCTS case officers
* Judges / Legal Advisers
* Cafcass officers
* Local Authority Social Workers
* Voluntary Adoption Agency workers
* Adopters (limited, guided access)

## 4.2 Access Requirements

* Role-based access control with strict need-to-know principles.
* Ability to redact sensitive data for specific views (e.g. adopters cannot see birth family addresses).
* Secure messaging and audit logs across all role interactions.`,
  },
  {
    id: 'integration-requirements',
    title: '5. Integration Requirements',
    content: `## 5.1 External Agency Systems

The platform should integrate with:

* Local Authority case management systems (preferably via APIs)
* Cafcass case management system
* HMCTS Reform platform
* Identity verification services (Gov.UK One Login)

## 5.2 Document & Evidence Handling

* Automated ingestion of PDF, Word, and scanned documents.
* Version control and traceable updates.
* Secure file exchange with external agencies.`,
  },
  {
    id: 'court-process',
    title: '6. Court Process Requirements',
    content: `The system must support:

* **Application stage**: auto-populate Form A58 using existing data.
* **Directions hearing workflow**: schedule, notify, and track compliance with directions.
* **Consent handling**: capture signed consents; flag if consent must be dispensed with.
* **Final hearing preparation**: generate a digital court bundle with AI summaries.
* **Post-order updates**: record adoption order outcome; archive case; manage post-adoption contact plans.`,
  },
  {
    id: 'security-privacy',
    title: '7. Security, Privacy & Compliance',
    content: `The solution must meet:

* Ministry of Justice Security Standards
* GDPR and Data Protection Act requirements
* Safeguarding and information-sharing protocols
* Audit and retention rules for family court proceedings
* Trauma-informed design principles (especially for adopters and birth parents)

AI interactions must:

* Never expose sensitive data to external or non-permitted models.
* Use anonymisation where possible.
* Provide human override and human review checkpoints.`,
  },
  {
    id: 'non-functional-requirements',
    title: '8. Non-Functional Requirements',
    content: `## 8.1 Performance

* Case creation: less than 2 seconds.
* Document upload: less than 10 seconds per file.
* AI document summary available within 60 seconds.

## 8.2 Availability

* 99% uptime excluding planned maintenance.
* Resilient to system or network disruption.

## 8.3 Scalability

* Support national caseload.
* Handle variable multi-agency concurrent access.

## 8.4 Usability

* Plain English design.
* Accessibility: WCAG 2.1 AA standard.
* Mobile-responsive forms for adopters and social workers.`,
  },
  {
    id: 'reporting-analytics',
    title: '9. Reporting & Analytics',
    content: `* Dashboard for case progression and bottlenecks.
* Time-to-decision analytics.
* Equality and diversity metrics (protected characteristic monitoring).
* Caseload and throughput reporting across jurisdictions.
* Safeguarding trend analysis.`,
  },
  {
    id: 'delivery-implementation',
    title: '10. Delivery & Implementation',
    content: `## 10.1 Discovery Expectations

The supplier must:

* Validate all adoption types and workflows with HMCTS, Cafcass, and Local Authorities.
* Produce service blueprints for each adoption pathway.
* Conduct user research with judges, case officers, and social workers.

## 10.2 MVP Definition

Must include:

* Digital application journey
* Document intelligence
* Core case management
* Court directions workflow
* Bundle generation
* Basic AI summarisation

## 10.3 Roadmap Options

* **Phase 1**: Digitise core workflows
* **Phase 2**: Introduce AI summarisation and matching
* **Phase 3**: Expand integrations and multi-agency collaboration
* **Phase 4**: Advanced analytics and predictive case insights`,
  },
  {
    id: 'risks-constraints',
    title: '11. Risks & Constraints',
    content: `* Data sensitivity: high safeguarding risk.
* Multi-agency misalignment.
* Legacy Local Authority systems.
* Need for judicial acceptance of AI-generated insights.
* Cultural resistance to automating historically paper-heavy processes.`,
  },
  {
    id: 'high-level-process',
    title: '12. High Level Process',
    content: `## 1. Placement Order Proceedings (if applicable)

* Triggered during care proceedings when the Local Authority believes a child is at risk.
* The agency applies under Section 21 of the Adoption and Children Act 2002 for a placement order, enabling placement with adopters even without parental agreement.
* The court ensures the statutory threshold is met (child suffering or likely to suffer significant harm) before granting the order.

## 2. Application for Adoption Order

* After a minimum 10-week placement period, adopters submit Form A58 to the Family Court (can be online for post-placement cases).
* Court fee: £207, with possible fee remission.

## 3. Directions Hearings & Pre-Trial Preparation

* Under Family Procedure Rules – Part 14, the court assigns a case number, notifies the parties, and schedules a first directions hearing.
* Directions include:

  * Consent requirements (or dispensing with consent)
  * Submission deadlines for agency reports
  * Timing of health assessments
  * Disclosure of confidential documents

## 4. Consent & Reporting

* A Cafcass reporting officer is appointed (if all parties consent) to:

  * Confirm everyone understands the implications
  * Witness and submit consent forms and a supporting report to the court
* If a parent objects, they or the child may become a party to proceedings, and Cafcass can represent the child's views.

## 5. Final Hearing

* The court issues a Notice of Final Hearing in accordance with procedural rules.
* At the hearing:

  * The panel reviews consents, agency reports, and Cafcass reports
  * The court ensures the child's welfare is paramount
  * A decision is made on whether to grant the adoption order
* Birth parents who consented or are overruled by a placement order cannot oppose the application without leave of the court.

## 6. Adoption Order Outcome & Aftermath

* Once made, the adoption order:

  * Permanently transfers parental responsibility to the adoptive parents
  * Legally severs ties to birth parents (except in step-parent cases)
* The court may decide on post-adoption contact or information arrangements.`,
  },
  {
    id: 'summary-table',
    title: '13. Summary Table',
    content: `| Step | Key Actions |
| ---- | ----------- |
| Placement Order | Local Authority applies; court evaluates risk threshold. |
| Adoption Application | Form A58 submitted; fee paid; application made after a minimum 10-week placement period. |
| Directions Hearings | Court issues case directions under Family Procedure Rules Part 14. |
| Consent & Reporting | Cafcass confirms consent or objection; submits reports to the court. |
| Final Hearing | Court reviews documents and determines whether to grant the adoption order. |
| Adoption Order | Final legal transfer of parental responsibility; decisions on contact or information arrangements made. |`,
  },
  {
    id: 'types-of-adoption',
    title: '14. Types of Adoption',
    content: `## 1. Agency Adoption

Adopting a child through a Local Authority or voluntary adoption agency, typically when the child is looked after by the state.

* Agencies assess adopters, prepare reports, and manage the matching and placement process.

## 2. Step-Parent Adoption

A step-parent legally adopts their partner's child, usually requiring consent from everyone with parental responsibility (unless dispensed with by the court).

* The process often involves assessment by the Local Authority and court approval.

## 3. Intercountry (Overseas) Adoption

Adopting a child from another country and bringing them to the UK, subject to additional checks and compliance with:

* UK adoption law
* The child's country of origin's laws
* Hague Convention requirements (where applicable)

## 4. Non-Agency Adoption

This includes several sub-types where an adoption agency is not involved in placing the child.

### a. Relative Adoption

Adopting a child you are already related to (e.g. grandchild, niece, or nephew).

### b. Adoption by a Special Guardian

When a special guardian seeks to adopt a child already in their long-term care.

### c. Private Adoption (very restricted)

Where a child is placed for adoption directly with prospective adopters but must still be assessed by the Local Authority.

* Private arrangements without notifying the Local Authority are illegal.

## 5. Foster-to-Adopt / Early Permanence Placement

A child is placed with approved adopters who act as foster carers while the court decides whether adoption is the final plan.

* This approach helps reduce the number of moves for vulnerable infants.

## 6. Adoption Following a Placement Order

A child is placed for adoption after the family court grants a placement order because it is deemed necessary for the child's welfare.

* The Local Authority places the child with approved adopters even if the birth parents do not consent.`,
  },
  {
    id: 'digital-tool-mapping',
    title: '15. Digital Tool Mapping',
    content: `> Some of this does not sit with HMCTS but may be useful in a cohesive cross-agency solution.

## 1. Agency Adoption

Children placed via a Local Authority or voluntary adoption agency.

### Relevant Digital Tools

#### a. Case Management Automation

* Automates information intake, document gathering, timelines, and milestone tracking.
* Trigger-based workflow reminders for social workers, legal teams, and adopters.

#### b. AI-Assisted Matching Analytics

* Uses natural language processing (NLP) to summarise child profiles and adopter assessments.
* Machine learning surfaces potential matches based on needs, history, and compatibility indicators.

> Decision-making remains with humans; AI is advisory only.

#### c. Document Intelligence (OCR + NLP)

* Extracts key data from assessments, health reports, and DBS checks.
* Creates structured data for quicker legal and social-work review.

#### d. Digital Consent & Evidence Verification

* Secure portals for submitting identity documents, references, and consents.
* Automated validation (format checks, completeness, tampering detection).

## 2. Step-Parent Adoption

A simpler legal pathway but with high dependency on accurate personal data and consent handling.

### Relevant Digital Tools

#### a. Guided Digital Application Journeys

* Interactive forms that adjust logic based on scenario (e.g. who holds parental responsibility).
* Reduces errors and incomplete submissions.

#### b. Consent Management Tools

* Digitally capture and track consent from birth parents and responsible parties.
* Automated reminders and escalations where consent is not received.

#### c. Identity & Relationship Verification

* Digital verification for marriage or civil partnership documents and birth certificates.
* AI-driven cross-validation to detect inconsistencies.

## 3. Intercountry (Overseas) Adoption

Complex compliance with international agreements and multi-agency documentation.

### Relevant Digital Tools

#### a. Cross-Border Document Translation & Validation

* AI translation for legal documents with human-in-the-loop review.
* Authenticity checks for foreign-issued documents.

#### b. Compliance Workflow Engine

* Tracks requirements under the Hague Convention or bilateral agreements.
* Ensures certifications, immigration steps, and approvals are completed before progression.

#### c. Intelligent Risk Assessment

* Flags missing or contradictory information.
* Highlights documents requiring manual scrutiny due to country-specific risk factors.

## 4. Non-Agency Adoption

Includes relative adoption, adoption by a special guardian, or private adoption where permitted.

### Relevant Digital Tools

#### a. Eligibility Pre-Screening Tools

* Early digital triage indicating whether the case qualifies as non-agency adoption and which steps apply.
* Reduces incorrect or misrouted applications.

#### b. Evidence Upload & Classification

* AI sorts uploaded evidence such as court orders, care history, and special guardianship documentation.
* Suggests missing documents based on case type.

#### c. Safeguarding Decision-Support

* AI flags safeguarding triggers (e.g. previous social care involvement, medical or behavioural indicators).
* Alerts authorities where additional checks are required.

## 5. Foster-to-Adopt / Early Permanence

Adopters are approved foster carers while the long-term care plan is still being finalised.

### Relevant Digital Tools

#### a. Integrated Care–Adoption Data Hub

* Connects family court, social care, fostering providers, and adoption services.
* Ensures up-to-date information is shared across agencies in real time.`,
  },
];
