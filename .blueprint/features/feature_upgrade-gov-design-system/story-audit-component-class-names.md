# Story — Audit and Update Component Class Names for v5 Compatibility

## User Story

As a **developer**, I want to **verify and update any GOV.UK Frontend component class names that changed between v4 and v5** so that **all components render correctly with the upgraded design system**.

---

## Context / Scope

- Technical upgrade story
- Applies to: React components wrapping GOV.UK Frontend patterns
- Depends on: Completion of investigation story (story-investigate-v5-changes)
- Components to audit: Header, Footer, PhaseBanner, SkipLink
- Location: `client/src/components/`
- This story may result in "no changes required" if class names are unchanged

---

## Acceptance Criteria

**AC-1 — Audit Header component**
- Given the Header component uses GOV.UK Frontend class names,
- When I compare current usage against v5 class name specifications,
- Then I update any deprecated or changed class names,
- Or I confirm no changes are required and document this verification.

**AC-2 — Audit Footer component**
- Given the Footer component uses GOV.UK Frontend class names,
- When I compare current usage against v5 class name specifications,
- Then I update any deprecated or changed class names,
- Or I confirm no changes are required and document this verification.

**AC-3 — Audit PhaseBanner component**
- Given the PhaseBanner component uses GOV.UK Frontend class names,
- When I compare current usage against v5 class name specifications,
- Then I update any deprecated or changed class names,
- Or I confirm no changes are required and document this verification.

**AC-4 — Audit SkipLink component**
- Given the SkipLink component uses GOV.UK Frontend class names,
- When I compare current usage against v5 class name specifications,
- Then I update any deprecated or changed class names,
- Or I confirm no changes are required and document this verification.

**AC-5 — Audit any additional GOV.UK components**
- Given other components may exist that use GOV.UK Frontend class names,
- When I search the codebase for `govuk-` class prefixes,
- Then I verify all instances are compatible with v5 specifications.

**AC-6 — Update React component props if needed**
- Given component props may reference class names,
- When I identify any prop-based class name usage,
- Then I update these to reflect v5 specifications.

**AC-7 — Verify no hardcoded class names in tests**
- Given test files may contain assertions with class names,
- When I audit test files for GOV.UK Frontend class references,
- Then I update any outdated class name assertions.

---

## Technical Notes

### Common v5 class name patterns to check
- `govuk-header` and child elements
- `govuk-footer` and child elements
- `govuk-phase-banner` and child elements
- `govuk-skip-link`

### Search patterns for audit
```bash
# Find all GOV.UK class references
grep -r "govuk-" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js"
grep -r "govuk-" --include="*.test.tsx" --include="*.test.ts"
```

---

## Out of Scope

- Adding new GOV.UK components not currently in use
- Restructuring component architecture
- Changing component APIs or props beyond class name updates
- Custom component styling changes

---

## Definition of Done

- [ ] Header component class names verified/updated
- [ ] Footer component class names verified/updated
- [ ] PhaseBanner component class names verified/updated
- [ ] SkipLink component class names verified/updated
- [ ] All `govuk-` class references in codebase audited
- [ ] Test file assertions updated if needed
- [ ] Verification document created listing all changes (or confirming no changes)
