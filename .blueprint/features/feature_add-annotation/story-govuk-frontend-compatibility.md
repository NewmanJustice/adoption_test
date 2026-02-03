# Story — GOV.UK Frontend Compatibility

## User story
As a developer, I want the annotation overlay to work correctly with GOV.UK Frontend components so that I can annotate any element on government-styled prototype pages.

---

## Context / scope
- Actor: Development team members
- Environment: Development (React frontend with GOV.UK Design System)
- The platform uses `govuk-frontend` v5 with the 2024 rebrand
- Prototype-annotator uses Shadow DOM isolation to avoid style conflicts
- Reference: `/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md`
- Reference: `/workspaces/adoption_test/.blueprint/system_specification/SYSTEM_SPEC.md`, Section 12.9

---

## Acceptance criteria

**AC-1 — Annotation overlay does not break GOV.UK styling**
- Given a page using GOV.UK Frontend components,
- When the annotation overlay is active,
- Then all GOV.UK components render correctly with proper styling (header, forms, buttons, etc.).

**AC-2 — GOV.UK components can be annotated**
- Given a page with GOV.UK form components (inputs, radios, checkboxes),
- When I press `E` and click on a GOV.UK component,
- Then the component is selected for annotation,
- And an annotation marker appears on that element.

**AC-3 — Annotation markers do not interfere with GOV.UK focus states**
- Given a GOV.UK form element has an annotation marker,
- When I tab to that element,
- Then the GOV.UK focus ring is displayed correctly,
- And the element remains keyboard accessible.

**AC-4 — Annotation sidebar does not overlap critical content**
- Given the annotation sidebar is open (S key),
- When viewing a page with the GOV.UK layout,
- Then the sidebar does not obscure the main content area or navigation.

**AC-5 — Annotation system respects accessibility standards**
- Given the platform requires WCAG 2.1 AA compliance,
- When using the annotation system,
- Then keyboard shortcuts are accessible,
- And annotation markers have sufficient colour contrast,
- And screen readers can navigate past annotation elements.

---

## Verification approach
Manual verification during development:
1. Navigate to pages with various GOV.UK components
2. Activate annotation mode and test element selection
3. Verify styling is preserved
4. Test keyboard navigation alongside annotations

---

## Out of scope
- Custom styling of annotation markers to match GOV.UK design
- Accessibility certification of the annotation system itself
- Responsive behaviour testing (desktop development tool)
