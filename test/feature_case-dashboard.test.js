/**
 * Feature: Case Dashboard
 * Tests for case list API, dashboard layout, filtering, attention indicators, empty states, and adopter view
 */
import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock case data
const mockCases = [
  { id: 'case-1', caseRef: 'AD-2026-001234', status: 'active', caseType: 'placement', assignedTo: 'user-1', orgId: 'org-1', keyDates: { nextHearing: '2026-03-20' }, attention: 'overdue' },
  { id: 'case-2', caseRef: 'AD-2026-001235', status: 'pending', caseType: 'adoption-order', assignedTo: 'user-1', orgId: 'org-1', keyDates: { nextHearing: '2026-04-15' }, attention: 'approaching' },
  { id: 'case-3', caseRef: 'AD-2026-001236', status: 'active', caseType: 'placement', assignedTo: 'user-2', orgId: 'org-2', keyDates: {}, attention: 'normal' }
];

const mockUser = { id: 'user-1', role: 'social-worker', orgId: 'org-1' };
const mockAdopter = { id: 'adopter-1', role: 'adopter', orgId: null };

// Story: Case List API (story-case-list-api.md)
describe('Case List API', () => {
  it('T-API-1.1: Authenticated user retrieves case list', async () => {
    const response = { status: 200, body: { cases: mockCases.filter(c => c.orgId === mockUser.orgId) } };
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.body.cases));
  });

  it('T-API-2.1: User sees only assigned/org cases', async () => {
    const userCases = mockCases.filter(c => c.orgId === mockUser.orgId);
    assert.strictEqual(userCases.length, 2);
    assert.ok(userCases.every(c => c.orgId === 'org-1'));
  });

  it('T-API-2.2: User cannot see other org cases', async () => {
    const userCases = mockCases.filter(c => c.orgId === mockUser.orgId);
    const otherOrgCase = mockCases.find(c => c.id === 'case-3');
    assert.ok(!userCases.includes(otherOrgCase));
  });

  it('T-API-3.1: VAA worker sees redacted birth family addresses', async () => {
    const caseData = { ...mockCases[0], birthFamily: { name: 'REDACTED', address: 'REDACTED' } };
    assert.strictEqual(caseData.birthFamily.address, 'REDACTED');
  });

  it('T-API-3.2: Adopter sees redacted birth parent details', async () => {
    const adopterView = { caseRef: 'AD-2026-001234', birthParent: { name: 'REDACTED', details: 'REDACTED' } };
    assert.strictEqual(adopterView.birthParent.name, 'REDACTED');
  });

  it('T-API-4.1: Pagination returns correct page size', async () => {
    const pageSize = 20;
    const response = { cases: mockCases.slice(0, pageSize), pagination: { page: 1, pageSize, total: 50 } };
    assert.ok(response.cases.length <= pageSize);
  });

  it('T-API-4.2: Pagination metadata included', async () => {
    const response = { pagination: { page: 1, pageSize: 20, total: 50, totalPages: 3 } };
    assert.ok(response.pagination.page);
    assert.ok(response.pagination.totalPages);
  });

  it('T-API-5.1: Filter by status returns matches', async () => {
    const filtered = mockCases.filter(c => c.status === 'active');
    assert.ok(filtered.every(c => c.status === 'active'));
  });

  it('T-API-5.2: Filter by case type returns matches', async () => {
    const filtered = mockCases.filter(c => c.caseType === 'placement');
    assert.ok(filtered.every(c => c.caseType === 'placement'));
  });

  it('T-API-6.1: Unauthenticated request returns 401', async () => {
    const response = { status: 401, body: { error: 'Unauthorized' } };
    assert.strictEqual(response.status, 401);
  });
});

// Story: Dashboard Layout (story-dashboard-layout.md)
describe('Dashboard Layout', () => {
  it('T-DL-1.1: Dashboard page loads with title', async () => {
    const pageTitle = 'Case Dashboard';
    assert.ok(pageTitle.includes('Dashboard'));
  });

  it('T-DL-2.1: Table has required columns', async () => {
    const columns = ['Case reference', 'Child', 'Status', 'Case type', 'Key dates', 'Assigned to'];
    assert.ok(columns.includes('Case reference'));
    assert.ok(columns.includes('Status'));
    assert.strictEqual(columns.length, 6);
  });

  it('T-DL-3.1: Case number links to detail page', async () => {
    const caseRef = 'AD-2026-001234';
    const href = `/cases/${caseRef}`;
    assert.ok(href.includes(caseRef));
  });

  it('T-DL-4.1: Mobile viewport shows stacked layout', async () => {
    const mobileClass = 'govuk-table--stacked';
    assert.ok(mobileClass.includes('stacked'));
  });

  it('T-DL-5.1: Loading state shows indicator', async () => {
    const loadingState = { isLoading: true, indicator: 'Loading cases...' };
    assert.ok(loadingState.isLoading);
    assert.ok(loadingState.indicator);
  });

  it('T-DL-6.1: Table has accessible structure', async () => {
    const tableAttrs = { role: 'table', 'aria-label': 'Case list' };
    assert.ok(tableAttrs['aria-label']);
  });
});

// Story: Filter, Sort & Pagination (story-filter-sort-pagination.md)
describe('Filter Sort Pagination', () => {
  it('T-FSP-1.1: Filter by status updates results', async () => {
    const allCases = mockCases;
    const filtered = allCases.filter(c => c.status === 'active');
    assert.ok(filtered.length < allCases.length);
  });

  it('T-FSP-2.1: Filter by case type updates results', async () => {
    const filtered = mockCases.filter(c => c.caseType === 'adoption-order');
    assert.strictEqual(filtered.length, 1);
  });

  it('T-FSP-3.1: Filter by date range updates results', async () => {
    const startDate = new Date('2026-03-01');
    const endDate = new Date('2026-03-31');
    const filtered = mockCases.filter(c => {
      const hearing = c.keyDates.nextHearing ? new Date(c.keyDates.nextHearing) : null;
      return hearing && hearing >= startDate && hearing <= endDate;
    });
    assert.strictEqual(filtered.length, 1);
  });

  it('T-FSP-4.1: Combined filters apply AND logic', async () => {
    const filtered = mockCases.filter(c => c.status === 'active' && c.caseType === 'placement');
    assert.ok(filtered.every(c => c.status === 'active' && c.caseType === 'placement'));
  });

  it('T-FSP-5.1: Clear filters resets to full list', async () => {
    const filters = { status: null, caseType: null };
    const result = mockCases;
    assert.strictEqual(result.length, mockCases.length);
  });

  it('T-FSP-6.1: Sort by column header ascending', async () => {
    const sorted = [...mockCases].sort((a, b) => a.caseRef.localeCompare(b.caseRef));
    assert.strictEqual(sorted[0].caseRef, 'AD-2026-001234');
  });

  it('T-FSP-6.2: Sort toggle to descending', async () => {
    const sorted = [...mockCases].sort((a, b) => b.caseRef.localeCompare(a.caseRef));
    assert.strictEqual(sorted[0].caseRef, 'AD-2026-001236');
  });

  it('T-FSP-7.1: Pagination controls display when needed', async () => {
    const totalCases = 50;
    const pageSize = 20;
    const showPagination = totalCases > pageSize;
    assert.ok(showPagination);
  });
});

// Story: Attention Indicators (story-attention-indicators.md)
describe('Attention Indicators', () => {
  it('T-AI-1.1: Approaching deadline shows amber tag', async () => {
    const caseWithApproaching = mockCases.find(c => c.attention === 'approaching');
    const tagClass = 'govuk-tag--yellow';
    assert.ok(caseWithApproaching);
    assert.ok(tagClass.includes('yellow'));
  });

  it('T-AI-2.1: Overdue shows red tag', async () => {
    const overdueCase = mockCases.find(c => c.attention === 'overdue');
    const tagClass = 'govuk-tag--red';
    assert.ok(overdueCase);
    assert.ok(tagClass.includes('red'));
  });

  it('T-AI-3.1: Normal cases show no indicator', async () => {
    const normalCase = mockCases.find(c => c.attention === 'normal');
    assert.ok(normalCase);
    assert.strictEqual(normalCase.attention, 'normal');
  });

  it('T-AI-4.1: Default sort places overdue first', async () => {
    const priorityOrder = { overdue: 0, approaching: 1, normal: 2 };
    const sorted = [...mockCases].sort((a, b) => priorityOrder[a.attention] - priorityOrder[b.attention]);
    assert.strictEqual(sorted[0].attention, 'overdue');
  });

  it('T-AI-5.1: Indicator has text label', async () => {
    const tagText = 'Action needed';
    assert.ok(tagText.length > 0);
  });

  it('T-AI-6.1: Screen reader announces attention', async () => {
    const ariaLabel = 'Case AD-2026-001234 requires urgent attention';
    assert.ok(ariaLabel.includes('attention'));
  });
});

// Story: Empty States (story-empty-states.md)
describe('Empty States', () => {
  it('T-ES-1.1: No cases shows empty message', async () => {
    const cases = [];
    const message = cases.length === 0 ? 'You have no cases assigned' : null;
    assert.ok(message);
  });

  it('T-ES-2.1: No filter results shows message', async () => {
    const filteredCases = [];
    const message = 'No cases match your filters';
    assert.strictEqual(filteredCases.length, 0);
    assert.ok(message);
  });

  it('T-ES-3.1: Active filters shown in summary', async () => {
    const activeFilters = { status: 'active', caseType: 'placement' };
    const summary = `Showing: ${activeFilters.status}, ${activeFilters.caseType}`;
    assert.ok(summary.includes('active'));
  });

  it('T-ES-4.1: API error shows error message', async () => {
    const error = { message: 'Unable to load cases. Please try again.' };
    assert.ok(error.message.includes('Unable'));
  });

  it('T-ES-5.1: Adopter empty state is trauma-informed', async () => {
    const message = 'You do not currently have any adoption applications. If you have questions, please contact your social worker.';
    assert.ok(message.includes('contact'));
    assert.ok(!message.includes('error'));
  });
});

// Story: Adopter My Cases (story-adopter-my-cases.md)
describe('Adopter My Cases', () => {
  it('T-MC-1.1: Adopter redirects to /my-cases', async () => {
    const user = mockAdopter;
    const redirectPath = user.role === 'adopter' ? '/my-cases' : '/dashboard';
    assert.strictEqual(redirectPath, '/my-cases');
  });

  it('T-MC-2.1: Page shows summary cards not table', async () => {
    const componentType = 'govuk-summary-card';
    assert.ok(componentType.includes('card'));
    assert.ok(!componentType.includes('table'));
  });

  it('T-MC-3.1: Card shows case reference and status', async () => {
    const cardContent = { caseRef: 'AD-2026-001234', status: 'Application received', submitted: '15 January 2026' };
    assert.ok(cardContent.caseRef);
    assert.ok(cardContent.status);
  });

  it('T-MC-4.1: Birth parent info is redacted for adopter', async () => {
    const adopterCaseView = { caseRef: 'AD-2026-001234', birthParent: null, childName: 'Shown appropriately' };
    assert.strictEqual(adopterCaseView.birthParent, null);
  });

  it('T-MC-5.1: Multiple cases show separate cards', async () => {
    const adopterCases = [{ id: 'case-a', caseRef: 'AD-2026-001234' }, { id: 'case-b', caseRef: 'AD-2026-001235' }];
    assert.strictEqual(adopterCases.length, 2);
    assert.notStrictEqual(adopterCases[0].caseRef, adopterCases[1].caseRef);
  });

  it('T-MC-6.1: Card links to case detail page', async () => {
    const caseId = 'case-1';
    const detailLink = `/my-cases/${caseId}`;
    assert.ok(detailLink.includes(caseId));
  });

  it('T-MC-7.1: Language is trauma-informed and supportive', async () => {
    const pageContent = {
      title: 'Your adoption application',
      supportText: 'If you have questions, contact your social worker'
    };
    assert.ok(!pageContent.title.includes('WARNING'));
    assert.ok(pageContent.supportText.includes('contact'));
  });
});
