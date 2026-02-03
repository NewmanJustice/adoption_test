# Story — Update JavaScript Initialisation for GOV.UK Frontend v5

## User Story

As a **developer**, I want to **update the JavaScript initialisation patterns for GOV.UK Frontend components to align with v5 requirements** so that **interactive component behaviours function correctly after the upgrade**.

---

## Context / Scope

- Technical upgrade story
- Applies to: React components with `data-module` attributes and JavaScript initialisation
- Depends on: Completion of investigation story (story-investigate-v5-changes)
- Components with JavaScript behaviour: Header (navigation toggle), SkipLink (focus management)
- This story may result in "no changes required" if initialisation patterns are unchanged

---

## Acceptance Criteria

**AC-1 — Audit current initialisation patterns**
- Given components use `data-module` attributes for GOV.UK JavaScript behaviour,
- When I identify all `data-module` attributes in the codebase,
- Then I document the current initialisation approach for each.

**AC-2 — Update Header JavaScript initialisation**
- Given the Header component uses `data-module="govuk-header"`,
- When I compare against v5 JavaScript API,
- Then I update the initialisation pattern if required,
- Or I confirm no changes are needed and document this verification.

**AC-3 — Update SkipLink JavaScript initialisation**
- Given the SkipLink component uses `data-module="govuk-skip-link"`,
- When I compare against v5 JavaScript API,
- Then I update the initialisation pattern if required,
- Or I confirm no changes are needed and document this verification.

**AC-4 — Update JavaScript import statements**
- Given GOV.UK Frontend v5 may have changed JavaScript export paths,
- When I review JavaScript imports for GOV.UK modules,
- Then I update import paths to match v5 structure.

**AC-5 — Verify React component lifecycle integration**
- Given React manages component lifecycle,
- When GOV.UK JavaScript initialisation is required,
- Then initialisation occurs at the correct point in the React lifecycle (e.g., useEffect),
- And cleanup/teardown is handled appropriately on component unmount.

**AC-6 — Test interactive behaviours**
- Given components have interactive JavaScript behaviours,
- When I interact with each component (e.g., mobile menu toggle, skip link focus),
- Then the behaviours function as expected.

---

## Technical Notes

### Current data-module usage to audit
```jsx
<header data-module="govuk-header">
<a data-module="govuk-skip-link">
```

### v5 initialisation patterns
```javascript
// v4 pattern
import { initAll } from 'govuk-frontend';
initAll();

// v5 pattern (may differ)
import { createAll, Header, SkipLink } from 'govuk-frontend';
createAll(Header);
createAll(SkipLink);
```

### React integration considerations
- Use `useEffect` for initialisation after component mount
- Consider component-level initialisation vs global `initAll()`
- Handle cleanup in effect return function

---

## Out of Scope

- Adding JavaScript behaviours to components that do not currently have them
- Implementing new GOV.UK JavaScript components
- Refactoring React component architecture
- Adding client-side validation patterns

---

## Definition of Done

- [ ] All `data-module` attributes in codebase audited
- [ ] Header JavaScript initialisation verified/updated
- [ ] SkipLink JavaScript initialisation verified/updated
- [ ] JavaScript import paths updated for v5
- [ ] React lifecycle integration verified
- [ ] Interactive behaviours tested and working
- [ ] Documentation updated if initialisation approach changed
