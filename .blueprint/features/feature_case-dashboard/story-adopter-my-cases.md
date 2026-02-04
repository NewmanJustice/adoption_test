# Story — Adopter "My Cases" View

## User story
As an adopter, I want to view my adoption case status in a clear, non-overwhelming format so that I can understand my case progression without seeing sensitive information.

---

## Context / scope
- Adopter role only
- Simplified view compared to professional dashboard
- Route:
  - `GET /my-cases`
- Screen is reached when: adopter logs in and is redirected (per login feature roles config)
- This page displays: adopter's own case(s) with redacted information

---

## Acceptance criteria

**AC-1 — Redirect to My Cases**
- Given I am an authenticated adopter,
- When I log in,
- Then I am redirected to `/my-cases` (not `/dashboard`).

**AC-2 — Simplified page layout**
- Given I am viewing the My Cases page,
- Then I see a GOV.UK-compliant page with:
  - Page title "Your adoption application"
  - Case summary card(s) instead of a table
  - Clear indication of current status and next steps

**AC-3 — Case summary card content**
- Given I have an active case,
- When the case card is displayed,
- Then it shows:
  - Case reference number
  - Application status (e.g., "Application received", "Awaiting hearing")
  - Date application was submitted
  - Next key date (if scheduled)
  - Simple progress indicator
- And birth family identifying information is NOT shown.

**AC-4 — Redacted information**
- Given the case involves birth parents,
- When case data is displayed to me as an adopter,
- Then birth parent names, addresses, and identifying details are not visible,
- And child's details are shown only where legally appropriate.

**AC-5 — Multiple cases (sibling adoption)**
- Given I am an adopter with multiple active cases,
- When I view My Cases,
- Then each case is displayed as a separate card,
- And I can identify which case is which via reference number.

**AC-6 — Case detail navigation**
- Given I click on a case card or "View details" link,
- Then I am navigated to `/my-cases/{caseId}`,
- Which shows an adopter-appropriate view of case details.

**AC-7 — Trauma-informed design**
- Given the page is displayed,
- Then the language is clear and supportive,
- And status updates avoid alarming terminology,
- And contact information for support is visible if the adopter has questions.

---

## Case card layout (GOV.UK Summary Card)

```
+------------------------------------------+
|  Case reference: AD-2026-001234          |
+------------------------------------------+
|  Status          | Application received |
|  Submitted       | 15 January 2026      |
|  Next date       | Hearing: 20 March    |
+------------------------------------------+
|  [View details]                          |
+------------------------------------------+
```

---

## Out of scope
- Adopter editing or submitting documents via this page
- Messaging functionality with case workers
- Detailed case timeline or history
- Push notifications for case updates

---

## References
- Feature Spec: `.blueprint/features/feature_case-dashboard/FEATURE_SPEC.md` (Section 3, Adopter role)
- Feature Spec: Section 11 (Adopter View story theme)
- System Spec: Section 4 (Adopter actor definition)
- System Spec: Section 8 (Trauma-Informed Design)
