# Implementation Plan — Pilot Guidance Navigation UX Improvements

## Summary
Flatten the pilot guidance navigation structure to show only top-level sections in the sidebar, merge subsection content into parent sections within `pilotSpecification.ts`, and apply GOV.UK typography classes to all rendered content via ReactMarkdown component mapping. This simplifies navigation and ensures visual consistency with GOV.UK Design System patterns.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `client/src/data/pilotSpecification.ts` | Modify | Flatten structure by merging `children` content into parent `content` field with markdown headings |
| `client/src/pages/AboutPilotPage.tsx` | Modify | Add ReactMarkdown component mapping to apply GOV.UK classes to all rendered elements |
| `client/src/components/pilot/AboutSectionLinks.tsx` | Modify | Remove recursive rendering of children; only display top-level sections |

## Implementation Steps

1. **Update `pilotSpecification.ts`** — Merge each section's `children` array content into the parent section's `content` field using level 2 markdown headings (`## 3.1 Title`). Remove all `children` properties.

2. **Update `AboutSectionLinks.tsx`** — Remove recursive `renderSectionLinks` logic and children rendering. Iterate only over `pilotSpecificationData` array directly with no nesting.

3. **Update `AboutPilotPage.tsx`** — Configure ReactMarkdown with `components` prop to map `h1`/`h2`/`h3` to GOV.UK heading classes, `p` to `govuk-body`, `ul` to `govuk-list govuk-list--bullet`, and `strong` to `govuk-!-font-weight-bold`.

4. **Simplify section lookup** — Since `children` are removed, simplify `findSectionById` to a flat array search or use `.find()` directly on `pilotSpecificationData`.

5. **Test navigation** — Verify sidebar shows exactly 11 top-level items (Core Hypothesis, 1-10, Final Position). Verify clicking Section 3 loads all subsection content on one page.

6. **Test typography** — Inspect rendered elements to confirm GOV.UK classes are applied to all headings, paragraphs, lists, and bold text.

7. **Test active state** — Verify active section is bold in sidebar and updates correctly when navigating between sections.

8. **Run client tests** — Execute `npx jest --selectProjects=client` to ensure no regressions. Run integration tests with `npx jest --selectProjects=scaffold` for navigation assertions.

9. **Manual accessibility check** — Verify heading hierarchy (h1 → h2 → h3) with browser dev tools or screen reader. Ensure no skipped heading levels.

10. **Clean up imports** — Remove unused `PilotSection.children` references if TypeScript interface is updated (optional: keep interface with optional `children?` for backward compatibility).

## Risks/Questions

- **Long sections:** Section 7 (Evaluation Framework) has 5 subsections. May result in long single-page content. Mitigation: acceptable for guidance pages; users can scroll or use browser find.
- **Markdown heading levels:** Ensure merged content uses `## ` (h2) for subsections, not `### ` (h3), to maintain correct hierarchy after page title h1.
- **ReactMarkdown version compatibility:** Verify `components` prop syntax matches installed ReactMarkdown version (v8+ uses object, older versions use different API).
- **Type safety:** If `PilotSection` interface enforces `children` as required (not optional), update to `children?: PilotSection[]` to avoid TypeScript errors after removal.
