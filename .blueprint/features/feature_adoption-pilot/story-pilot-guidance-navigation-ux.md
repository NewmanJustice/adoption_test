# Story — Pilot Guidance Navigation UX Improvements

## User Story

**As a** pilot user  
**I want to** navigate pilot guidance content with a simplified sidebar and GOV.UK-styled content  
**So that** I can easily find and read information without navigating through unnecessary nested sections

---

## User Context

- **User Role:** Builder, SME, or Observer accessing pilot guidance
- **User Goals:** Quickly understand the pilot framework, find specific sections, and read content in a familiar GOV.UK format
- **Use Case:** Navigating to `/pilot/about` to review pilot specification, context, and evaluation criteria

---

## Acceptance Criteria

### AC-1 — Flatten navigation structure
**Given** I am viewing the pilot guidance sidebar  
**When** the sidebar renders  
**Then** only top-level sections (1-10) appear in the navigation list  
**And** subsections (e.g., 3.1, 3.2, 3.3, 3.4) do not appear as separate navigation items  
**And** subsection content is merged into the parent section's page

**Example:**
- ✅ Show: "3. Structural Preconditions for Stable Agentic Delivery"
- ❌ Don't show: "3.1 Clear Authority and Accountability" as separate nav item
- ✅ Include: All 3.1, 3.2, 3.3, 3.4 content on the Section 3 page

### AC-2 — Apply GOV.UK typography to content
**Given** I am viewing a pilot guidance page  
**When** the content renders  
**Then** all headings use GOV.UK heading classes (`govuk-heading-xl`, `govuk-heading-l`, `govuk-heading-m`)  
**And** body text uses GOV.UK body classes (`govuk-body`, `govuk-body-l`)  
**And** lists use GOV.UK list classes (`govuk-list`, `govuk-list--bullet`)  
**And** the font family matches the rest of the site (GOV.UK Transport/Arial)

### AC-3 — Consistent heading hierarchy
**Given** I am viewing a section page (e.g., Section 3)  
**When** the page renders  
**Then** the main section title is an `h1` with class `govuk-heading-xl`  
**And** subsection titles (3.1, 3.2, etc.) are `h2` with class `govuk-heading-l`  
**And** any tertiary headings use `h3` with class `govuk-heading-m`  
**And** the visual hierarchy is clear and follows GOV.UK Design System patterns

### AC-4 — Sidebar navigation styling
**Given** I am viewing the pilot sidebar  
**When** the sidebar renders  
**Then** it uses GOV.UK link styling (`govuk-link`)  
**And** the active page is highlighted with bold font weight (`govuk-!-font-weight-bold`)  
**And** spacing between items uses GOV.UK spacing scale (`govuk-!-margin-bottom-2`)  
**And** the sidebar is visually distinct from the main content

### AC-5 — Content rendering with ReactMarkdown
**Given** content contains markdown formatting  
**When** the page renders  
**Then** bold text, lists, and inline code are rendered correctly  
**And** all rendered elements use GOV.UK classes where applicable  
**And** no unstyled HTML elements appear

### AC-6 — Navigation state preservation
**Given** I navigate from Section 3 to Section 4  
**When** the new page loads  
**Then** the sidebar updates to show Section 4 as active  
**And** the URL changes to `/pilot/about/structural-preconditions` → `/pilot/about/specification-based-development`  
**And** the browser back button works correctly

---

## Definition of Done

- [ ] Code written and peer reviewed
- [ ] `pilotSpecification.ts` data structure updated (flatten children where needed)
- [ ] `AboutPilotPage.tsx` renders subsection content within parent sections
- [ ] `AboutSectionLinks.tsx` only displays top-level sections
- [ ] GOV.UK typography classes applied to all content elements
- [ ] ReactMarkdown component configured to use GOV.UK classes
- [ ] Manual testing confirms correct rendering on all 10+ sections
- [ ] No console errors or warnings
- [ ] Accessibility: Heading hierarchy verified with screen reader
- [ ] Visual regression testing completed (optional)
- [ ] Documentation updated if data structure changed

---

## Additional Details

**Story Points:** 5  
**Priority:** Medium  
**Epic:** Adoption Pilot  
**Feature:** `feature_adoption-pilot`  
**Dependencies:** 
- Requires `story-business-context-guidance.md` (completed - content is rendering)

---

## Technical Approach

### Data Structure Changes
Current structure has nested children:
```typescript
{
  id: 'structural-preconditions',
  title: '3. Structural Preconditions',
  content: 'Brief intro...',
  children: [
    { id: 'clear-authority', title: '3.1 Clear Authority', content: '...' },
    { id: 'service-intent', title: '3.2 Service Intent', content: '...' }
  ]
}
```

**Option 1 - Flatten in data:**
```typescript
{
  id: 'structural-preconditions',
  title: '3. Structural Preconditions',
  content: `Brief intro...

## 3.1 Clear Authority and Accountability
[content]

## 3.2 Explicit Service Intent and Boundaries
[content]
`
}
```

**Option 2 - Flatten in component:**
Keep data structure, but combine children content in rendering logic.

**Recommendation:** Option 1 - cleaner data structure, easier to maintain.

### ReactMarkdown GOV.UK Styling
Use custom component mapping:
```tsx
<ReactMarkdown
  components={{
    h1: ({node, ...props}) => <h1 className="govuk-heading-xl" {...props} />,
    h2: ({node, ...props}) => <h2 className="govuk-heading-l" {...props} />,
    h3: ({node, ...props}) => <h3 className="govuk-heading-m" {...props} />,
    p: ({node, ...props}) => <p className="govuk-body" {...props} />,
    ul: ({node, ...props}) => <ul className="govuk-list govuk-list--bullet" {...props} />,
    strong: ({node, ...props}) => <strong className="govuk-!-font-weight-bold" {...props} />
  }}
>
  {current.content}
</ReactMarkdown>
```

---

## Notes

### Design Considerations
- GOV.UK Design System recommends max 3 levels of heading hierarchy for accessibility
- Current implementation has 2-3 levels already, which is good
- Flattening navigation reduces cognitive load for users
- Single-page sections with subsections match GOV.UK content patterns

### Edge Cases
- Very long sections (e.g., Section 7 with 5 subsections) may need in-page anchor links
- If a section has no content (empty `content: ''`), should display first child's content or show placeholder

### Accessibility Requirements
- Screen readers should announce correct heading levels
- Skip links should work if implemented
- Focus management when navigating between sections
- Color contrast must meet WCAG 2.1 AA standards (GOV.UK already compliant)

### Performance Constraints
- Larger single-page sections may impact initial render
- Consider lazy loading or code splitting if needed (unlikely for text content)

---

## Related Stories
- `story-business-context-guidance.md` - Initial guidance display implementation
- `story-actor-tailored-guidance.md` - Actor-specific guidance (different UX pattern)

---

## Acceptance Test Scenarios

### Test Scenario 1: Navigation shows only top-level sections
```
GIVEN I navigate to /pilot/about
WHEN the sidebar renders
THEN I see exactly 11 navigation items:
  - Core Hypothesis
  - 1. Purpose
  - 2. Context
  - 3. Structural Preconditions
  - 4. Specification-Based Development
  - 5. Pilot Scope
  - 6. Operating Model
  - 7. Evaluation Framework
  - 8. Dashboard Structure
  - 9. Risk and Mitigation
  - 10. Exit Criteria
  - Final Position
AND I do NOT see any "3.1", "3.2", "4.1", etc. items
```

### Test Scenario 2: Section 3 contains all subsection content
```
GIVEN I click "3. Structural Preconditions" in the sidebar
WHEN the page loads
THEN I see the main heading "3. Structural Preconditions for Stable Agentic Delivery"
AND I see subheading "3.1 Clear Authority and Accountability"
AND I see subheading "3.2 Explicit Service Intent and Boundaries"
AND I see subheading "3.3 Explicit Lifecycle and Operational Modelling"
AND I see subheading "3.4 Architectural and Dependency Discipline"
AND all content is on a single page (no separate navigation required)
```

### Test Scenario 3: GOV.UK typography applied
```
GIVEN I am viewing any pilot guidance page
WHEN I inspect the page elements
THEN:
  - h1 has class "govuk-heading-xl"
  - h2 has class "govuk-heading-l"
  - h3 has class "govuk-heading-m"
  - p has class "govuk-body"
  - ul has class "govuk-list govuk-list--bullet"
  - strong has class "govuk-!-font-weight-bold"
AND the font family is "GDS Transport" or fallback Arial
```

### Test Scenario 4: Active state highlighting
```
GIVEN I am viewing "3. Structural Preconditions"
WHEN I look at the sidebar
THEN "3. Structural Preconditions" link has class "govuk-!-font-weight-bold"
AND other links do not have bold font weight
AND when I click "4. Specification-Based Development"
THEN the active state moves to that link
```

---

## Story Change Log
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-02-17 | Story created | Improve pilot guidance navigation UX and GOV.UK consistency | User/Developer |
