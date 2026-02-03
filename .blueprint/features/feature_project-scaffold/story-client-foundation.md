# Story — Client Foundation

## User Story

As a **developer**,
I want **a React application with GOV.UK Design System integration and an accessible landing page**,
So that **I can build user-facing features on a compliant, accessible foundation**.

---

## Context / Scope

- **Actor:** Developer
- **Feature:** Project Scaffold
- **Relates to:** System Spec Section 12.1 (Technology Stack - Frontend), Section 12.9 (GOV.UK Design System Integration)
- **This story establishes:** The foundational React application with GOV.UK styling

### What This Story Delivers
- React 18 application with TypeScript
- GOV.UK Frontend package integration
- GOV.UK-styled landing page
- Accessible component structure
- Client directory organisation

### Entry Conditions
- Developer Environment Setup story is complete

### Exit Conditions
- Landing page renders correctly at `http://localhost:3000`
- Page passes accessibility checks
- GOV.UK Design System styling is applied

---

## Acceptance Criteria

**AC-1 — Client application starts successfully**
- Given the environment is configured correctly,
- When I run `npm run dev:client`,
- Then the React development server starts,
- And logs a message indicating it is available at `http://localhost:3000`.

**AC-2 — Landing page renders with GOV.UK Header**
- Given the client application is running,
- When I visit `http://localhost:3000`,
- Then I see a GOV.UK Header component,
- And the header displays the service name "Adoption Digital Platform",
- And the Crown logo is present.

**AC-3 — Landing page displays Phase Banner**
- Given the client application is running,
- When I visit `http://localhost:3000`,
- Then I see a Phase Banner below the header,
- And the banner indicates "ALPHA" status,
- And the banner includes feedback link text.

**AC-4 — Landing page renders with GOV.UK Footer**
- Given the client application is running,
- When I visit `http://localhost:3000`,
- Then I see a GOV.UK Footer component at the bottom of the page,
- And the footer includes standard GOV.UK elements.

**AC-5 — Landing page has welcome content**
- Given the client application is running,
- When I visit `http://localhost:3000`,
- Then I see a main content area with:
  - A heading (h1) welcoming users to the service
  - Brief descriptive text about the platform
- And the content uses GOV.UK typography styles.

**AC-6 — Page has correct document title**
- Given the client application is running,
- When I visit `http://localhost:3000`,
- Then the browser tab displays "Adoption Digital Platform - GOV.UK".

**AC-7 — Client directory structure is organised**
- Given I examine the `/client/src` directory,
- Then I see the following subdirectories:
  - `components/` - Reusable UI components
  - `pages/` - Route-level page components
  - `hooks/` - Custom React hooks
  - `context/` - React Context providers
  - `services/` - API client functions
  - `styles/` - GOV.UK overrides and custom styles

**AC-8 — GOV.UK styles are applied correctly**
- Given the client application is running,
- When I visit `http://localhost:3000`,
- Then the page uses GOV.UK colour palette,
- And typography matches GOV.UK standards,
- And spacing follows GOV.UK patterns.

**AC-9 — Page is keyboard navigable**
- Given the client application is running,
- When I navigate using only the keyboard,
- Then I can access all interactive elements using Tab,
- And focus states are clearly visible,
- And focus order is logical.

**AC-10 — Page has skip link**
- Given the client application is running,
- When I press Tab as the first action on the page,
- Then a "Skip to main content" link becomes visible,
- And activating the link moves focus to the main content area.

**AC-11 — Page uses semantic HTML**
- Given the client application is running,
- When I inspect the page HTML,
- Then I see proper use of:
  - `<header>` for the page header
  - `<main>` for the main content
  - `<footer>` for the page footer
  - Appropriate heading hierarchy (single h1)

**AC-12 — No accessibility violations detected**
- Given the client application is running,
- When I run automated accessibility checks (axe-core),
- Then no WCAG 2.1 AA violations are reported.

---

## Technical Notes

### GOV.UK Frontend Integration
- Install `govuk-frontend` package from npm
- Import GOV.UK styles in the application entry point
- Configure asset paths for fonts and images

### React Component Patterns
- Use functional components with TypeScript
- Prop types should be explicitly defined
- Consider creating wrapper components for GOV.UK patterns

### Styling Approach
- Import GOV.UK Sass files or pre-compiled CSS
- Use GOV.UK design tokens for any custom styling
- Avoid overriding GOV.UK component styles unless necessary

### Page Structure
```html
<!-- Expected page structure -->
<a href="#main-content" class="govuk-skip-link">Skip to main content</a>
<header class="govuk-header">...</header>
<div class="govuk-phase-banner">...</div>
<div class="govuk-width-container">
  <main id="main-content" class="govuk-main-wrapper">
    <h1 class="govuk-heading-xl">...</h1>
    ...
  </main>
</div>
<footer class="govuk-footer">...</footer>
```

---

## Out of Scope

- Routing between pages (single landing page only)
- API integration (covered in server story)
- Authentication UI (separate feature)
- Business domain pages (cases, applications)
- State management configuration (React Query, etc.)
- Form components (beyond what appears on landing page)

---

## Dependencies

- **Depends on:** Developer Environment Setup

---

## Definition of Done

- [ ] Client starts and is accessible at `http://localhost:3000`
- [ ] Landing page displays GOV.UK Header with service name
- [ ] Landing page displays Phase Banner with ALPHA status
- [ ] Landing page displays GOV.UK Footer
- [ ] Page has appropriate welcome content with GOV.UK styling
- [ ] Directory structure follows specification
- [ ] Skip link is present and functional
- [ ] Keyboard navigation works correctly
- [ ] Automated accessibility tests pass
