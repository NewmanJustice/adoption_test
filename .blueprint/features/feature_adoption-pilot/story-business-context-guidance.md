# Story — Business context guidance display

## User story
As a pilot user, I want to view the pilot framework guidance so that I understand the ask, process, and evaluation criteria.

## Context
- Reference: `.blueprint/features/feature_adoption-pilot/FEATURE_SPEC.md`
- Content source: `.business_context/Specification-Led-Agentic-Delivery-Pilot.md`

## Acceptance criteria
**AC-1 — Display pilot framework document**
- Given I navigate to the pilot guidance section,
- When the page loads,
- Then the content from `.business_context/Specification-Led-Agentic-Delivery-Pilot.md` is rendered in a readable format.

**AC-2 — Render markdown structure**
- Given the guidance content is displayed,
- When I view the page,
- Then headings, lists, code blocks, and emphasis formatting are rendered correctly.

**AC-3 — Navigation within document**
- Given the guidance content is long-form,
- When I view the page,
- Then a table of contents or anchor links allow navigation to major sections (Purpose, Structural Preconditions, Operating Model, Evaluation Framework, etc.).

**AC-4 — Access control**
- Given I am authenticated as any pilot role (Builder, SME, or Observer),
- When I access the guidance,
- Then the content is visible without restriction.

**AC-5 — Performance**
- Given the guidance page is requested,
- When the page loads,
- Then the full content renders within 2 seconds.

## Out of scope
- Editing the guidance content within the application
- Version history of the guidance document
- Downloading or exporting the guidance as a separate file
