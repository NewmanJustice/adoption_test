/**
 * Frontend Tests - Case Management Feature (Phase 2)
 * Tests for React UI components: CaseListPage, CaseDetailPage, CreateCasePage, UpdateStatusPage
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock session context
const mockSessionContext = {
  user: null as MockUser | null,
  isAuthenticated: false,
};

interface MockUser {
  username: string;
  role: string;
  courtAssignment?: string;
}

// Test user fixtures
const TEST_USERS = {
  hmctsCaseOfficer: {
    username: 'hmcts-officer',
    role: 'HMCTS_CASE_OFFICER',
    courtAssignment: 'Birmingham Family Court',
  },
  judge: {
    username: 'judge-user',
    role: 'JUDGE_LEGAL_ADVISER',
    courtAssignment: 'Birmingham Family Court',
  },
  adopter: {
    username: 'adopter-user',
    role: 'ADOPTER',
  },
  socialWorker: {
    username: 'sw-user',
    role: 'LA_SOCIAL_WORKER',
  },
};

// Mock case data
const MOCK_CASE = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  caseNumber: 'BFC/2026/00001',
  caseType: 'AGENCY_ADOPTION',
  status: 'APPLICATION',
  assignedCourt: 'Birmingham Family Court',
  linkedFamilyCourtCaseReference: 'FAM-2026-001',
  notes: 'Initial application notes',
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
  createdBy: 'hmcts-officer',
};

const MOCK_CASES_LIST = [
  MOCK_CASE,
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    caseNumber: 'BFC/2026/00002',
    caseType: 'STEP_PARENT_ADOPTION',
    status: 'DIRECTIONS',
    assignedCourt: 'Birmingham Family Court',
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-02T10:00:00Z',
  },
];

// Session context mock
jest.mock('../context/SessionContext', () => ({
  useSession: () => mockSessionContext,
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Helper to set authenticated user
const setAuthenticatedUser = (user: MockUser | null) => {
  mockSessionContext.user = user;
  mockSessionContext.isAuthenticated = user !== null;
};

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

// Reset mocks before each test
beforeEach(() => {
  mockFetch.mockReset();
  setAuthenticatedUser(null);
});

// Placeholder components (to be implemented)
const CaseListPage = React.lazy(() => import('../pages/CaseListPage'));
const CaseDetailPage = React.lazy(() => import('../pages/CaseDetailPage'));
const CreateCasePage = React.lazy(() => import('../pages/CreateCasePage'));
const UpdateStatusPage = React.lazy(() => import('../pages/UpdateStatusPage'));

// =============================================================================
// CASE LIST PAGE TESTS
// =============================================================================

describe('CaseListPage', () => {
  const renderCaseListPage = () => {
    return renderWithRouter(
      <React.Suspense fallback={<div>Loading...</div>}>
        <CaseListPage />
      </React.Suspense>,
      { route: '/cases' }
    );
  };

  describe('T-CL-1.1: Table displays with correct columns', () => {
    it('renders case list table with required columns', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: MOCK_CASES_LIST, total: 2 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      // Verify column headers
      expect(screen.getByRole('columnheader', { name: /case number/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /court/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument();
    });
  });

  describe('T-CL-8.1: Empty state message shown when no cases', () => {
    it('displays empty state when no cases returned', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: [], total: 0 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        expect(screen.getByText(/no cases found/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-CL-10.1: Pagination controls displayed when > 25 cases', () => {
    it('shows pagination when more than 25 cases exist', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: MOCK_CASES_LIST, total: 50 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-CL-13.1: Clicking row navigates to case detail', () => {
    it('navigates to case detail when row is clicked', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: MOCK_CASES_LIST, total: 2 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        expect(screen.getByText('BFC/2026/00001')).toBeInTheDocument();
      });

      const caseLink = screen.getByRole('link', { name: /BFC\/2026\/00001/i });
      expect(caseLink).toHaveAttribute('href', `/cases/${MOCK_CASE.id}`);
    });
  });

  describe('T-CL-14.1: HMCTS user sees Create case button', () => {
    it('displays Create case button for HMCTS Case Officer', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: MOCK_CASES_LIST, total: 2 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /create case/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-CL-15.1: Non-HMCTS user does not see Create case button', () => {
    it('hides Create case button for Adopter role', async () => {
      setAuthenticatedUser(TEST_USERS.adopter);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: [], total: 0 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /create case/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('T-CL-16.1: Unauthenticated user redirected to login', () => {
    it('redirects to login when not authenticated', async () => {
      setAuthenticatedUser(null);

      renderWithRouter(
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/cases" element={<div>Redirects to Dashboard</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </React.Suspense>,
        { route: '/cases' }
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('T-CL-18.1: Status displayed with GOV.UK tag styling', () => {
    it('renders status with govuk-tag class', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: MOCK_CASES_LIST, total: 2 }),
      });

      renderCaseListPage();

      await waitFor(() => {
        const statusCell = screen.getByText('APPLICATION');
        expect(statusCell).toHaveClass('govuk-tag');
      });
    });
  });

  describe('T-CL-19.1: Table has proper accessibility attributes', () => {
    it('passes accessibility checks', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cases: MOCK_CASES_LIST, total: 2 }),
      });

      const { container } = renderCaseListPage();

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// =============================================================================
// CASE DETAIL PAGE TESTS
// =============================================================================

describe('CaseDetailPage', () => {
  const renderCaseDetailPage = (caseId: string = MOCK_CASE.id) => {
    return renderWithRouter(
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </React.Suspense>,
      { route: `/cases/${caseId}` }
    );
  };

  describe('T-CD-1.1: Case details displayed', () => {
    it('renders case number, type, status, court, and dates', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText('BFC/2026/00001')).toBeInTheDocument();
        expect(screen.getByText('AGENCY_ADOPTION')).toBeInTheDocument();
        expect(screen.getByText('APPLICATION')).toBeInTheDocument();
        expect(screen.getByText('Birmingham Family Court')).toBeInTheDocument();
      });
    });
  });

  describe('T-CD-2.1: Professional user sees unredacted fields', () => {
    it('displays linked reference and notes for HMCTS officer', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText('FAM-2026-001')).toBeInTheDocument();
        expect(screen.getByText('Initial application notes')).toBeInTheDocument();
      });
    });
  });

  describe('T-CD-3.1: Adopter sees redacted view', () => {
    it('hides linked reference and notes for Adopter role', async () => {
      setAuthenticatedUser(TEST_USERS.adopter);
      const redactedCase = { ...MOCK_CASE };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: redactedCase }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText('BFC/2026/00001')).toBeInTheDocument();
      });

      expect(screen.queryByText('FAM-2026-001')).not.toBeInTheDocument();
      expect(screen.queryByText('Initial application notes')).not.toBeInTheDocument();
    });
  });

  describe('T-CD-9.1: Access denied message for unauthorized case', () => {
    it('displays access denied when user cannot view case', async () => {
      setAuthenticatedUser(TEST_USERS.adopter);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-CD-10.1: Case history section displays status changes', () => {
    it('renders case history with status transitions', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      const caseWithHistory = {
        ...MOCK_CASE,
        history: [
          { from: null, to: 'APPLICATION', at: '2026-02-01T10:00:00Z', by: 'hmcts-officer' },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: caseWithHistory }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /case history/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-CD-11.1: HMCTS/Judge sees Update status button', () => {
    it('displays Update status action for authorized users', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /update status/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-CD-12.1: Adopter does not see edit/update actions', () => {
    it('hides Update status action for Adopter role', async () => {
      setAuthenticatedUser(TEST_USERS.adopter);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText('BFC/2026/00001')).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: /update status/i })).not.toBeInTheDocument();
    });
  });

  describe('T-CD-13.1: Back to cases link navigates correctly', () => {
    it('renders back link pointing to /cases', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      renderCaseDetailPage();

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to cases/i });
        expect(backLink).toHaveAttribute('href', '/cases');
      });
    });
  });

  describe('T-CD-14.1: Unauthenticated user redirected to login', () => {
    it('redirects to login when not authenticated', async () => {
      setAuthenticatedUser(null);

      renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('T-CD-16.1: Page passes accessibility checks', () => {
    it('has no accessibility violations', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      const { container } = renderCaseDetailPage();

      await waitFor(() => {
        expect(screen.getByText('BFC/2026/00001')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// =============================================================================
// CREATE CASE PAGE TESTS
// =============================================================================

describe('CreateCasePage', () => {
  const renderCreateCasePage = () => {
    return renderWithRouter(
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/cases/create" element={<CreateCasePage />} />
          <Route path="/cases/:id" element={<div>Case Detail Page</div>} />
          <Route path="/cases" element={<div>Case List Page</div>} />
        </Routes>
      </React.Suspense>,
      { route: '/cases/create' }
    );
  };

  describe('T-CC-1.1: Form displays all required fields', () => {
    it('renders form with type, court, reference, notes, and buttons', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByLabelText(/case type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/assigned court/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/linked family court/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create case/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /cancel/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-CC-2.1: All 6 adoption types displayed as options', () => {
    it('shows all valid adoption type options', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /agency adoption/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /step parent/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /intercountry/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /non-agency/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /foster to adopt/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /placement order/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-CC-3.1: Validation error when case type not selected', () => {
    it('displays error when submitting without case type', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create case/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create case/i }));

      await waitFor(() => {
        expect(screen.getByText(/select a case type/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-CC-4.1: Validation error when assigned court empty', () => {
    it('displays error when submitting without court', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create case/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create case/i }));

      await waitFor(() => {
        expect(screen.getByText(/enter an assigned court/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-CC-5.1: Successful submission redirects to case detail', () => {
    it('redirects to new case on successful creation', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ case: MOCK_CASE }),
      });

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByLabelText(/case type/i)).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText(/case type/i), 'AGENCY_ADOPTION');
      await user.type(screen.getByLabelText(/assigned court/i), 'Birmingham Family Court');
      await user.click(screen.getByRole('button', { name: /create case/i }));

      await waitFor(() => {
        expect(screen.getByText('Case Detail Page')).toBeInTheDocument();
      });
    });
  });

  describe('T-CC-14.1: Non-HMCTS user sees access denied', () => {
    it('displays access denied for Adopter role', async () => {
      setAuthenticatedUser(TEST_USERS.adopter);

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-CC-15.1: Cancel button navigates to /cases', () => {
    it('cancel link points to case list', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      renderCreateCasePage();

      await waitFor(() => {
        const cancelLink = screen.getByRole('link', { name: /cancel/i });
        expect(cancelLink).toHaveAttribute('href', '/cases');
      });
    });
  });

  describe('T-CC-16.1: Error summary displayed at top', () => {
    it('shows error summary with links to fields', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create case/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create case/i }));

      await waitFor(() => {
        const errorSummary = screen.getByRole('alert');
        expect(errorSummary).toBeInTheDocument();
        expect(within(errorSummary).getAllByRole('link').length).toBeGreaterThan(0);
      });
    });
  });

  describe('T-CC-17.1: Form passes accessibility checks', () => {
    it('has no accessibility violations', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);

      const { container } = renderCreateCasePage();

      await waitFor(() => {
        expect(screen.getByLabelText(/case type/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// =============================================================================
// UPDATE STATUS PAGE TESTS
// =============================================================================

describe('UpdateStatusPage', () => {
  const renderUpdateStatusPage = (caseId: string = MOCK_CASE.id) => {
    return renderWithRouter(
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/cases/:id/status" element={<UpdateStatusPage />} />
          <Route path="/cases/:id" element={<div>Case Detail Page</div>} />
        </Routes>
      </React.Suspense>,
      { route: `/cases/${caseId}/status` }
    );
  };

  describe('T-US-1.1: Form displays current status and available transitions', () => {
    it('renders current status and transition options', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          case: MOCK_CASE,
          validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
        }),
      });

      renderUpdateStatusPage();

      await waitFor(() => {
        expect(screen.getByText(/current status/i)).toBeInTheDocument();
        expect(screen.getByText('APPLICATION')).toBeInTheDocument();
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /update status/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /cancel/i })).toBeInTheDocument();
      });
    });
  });

  describe('T-US-2.1: Only valid transitions shown as options', () => {
    it('displays only valid next statuses as radio options', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          case: MOCK_CASE,
          validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
        }),
      });

      renderUpdateStatusPage();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /directions/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /on hold/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /withdrawn/i })).toBeInTheDocument();
      });

      // Invalid transitions should not be shown
      expect(screen.queryByRole('radio', { name: /final hearing/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: /order granted/i })).not.toBeInTheDocument();
    });
  });

  describe('T-US-5.1: Successful update redirects with notification', () => {
    it('redirects to case detail on successful status update', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            case: MOCK_CASE,
            validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            case: { ...MOCK_CASE, status: 'DIRECTIONS' },
            previousStatus: 'APPLICATION',
          }),
        });

      renderUpdateStatusPage();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /directions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /directions/i }));
      await user.click(screen.getByRole('button', { name: /update status/i }));

      await waitFor(() => {
        expect(screen.getByText('Case Detail Page')).toBeInTheDocument();
      });
    });
  });

  describe('T-US-13.1: Reason required for ON_HOLD/WITHDRAWN', () => {
    it('shows error when submitting ON_HOLD without reason', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          case: MOCK_CASE,
          validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
        }),
      });

      renderUpdateStatusPage();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /on hold/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /on hold/i }));
      await user.click(screen.getByRole('button', { name: /update status/i }));

      await waitFor(() => {
        expect(screen.getByText(/reason is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-US-14.1: Cancel navigates back to case detail', () => {
    it('cancel link points to case detail page', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          case: MOCK_CASE,
          validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
        }),
      });

      renderUpdateStatusPage();

      await waitFor(() => {
        const cancelLink = screen.getByRole('link', { name: /cancel/i });
        expect(cancelLink).toHaveAttribute('href', `/cases/${MOCK_CASE.id}`);
      });
    });
  });

  describe('T-US-15.1: Conflict error displayed when status changed', () => {
    it('shows conflict error when status was updated by another user', async () => {
      const user = userEvent.setup();
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            case: MOCK_CASE,
            validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({
            error: 'Case status has changed. Please refresh and try again.',
            currentStatus: 'DIRECTIONS',
          }),
        });

      renderUpdateStatusPage();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /directions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /directions/i }));
      await user.click(screen.getByRole('button', { name: /update status/i }));

      await waitFor(() => {
        expect(screen.getByText(/status has changed/i)).toBeInTheDocument();
      });
    });
  });

  describe('T-US-16.1: Form passes accessibility checks', () => {
    it('has no accessibility violations', async () => {
      setAuthenticatedUser(TEST_USERS.hmctsCaseOfficer);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          case: MOCK_CASE,
          validTransitions: ['DIRECTIONS', 'ON_HOLD', 'APPLICATION_WITHDRAWN'],
        }),
      });

      const { container } = renderUpdateStatusPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update status/i })).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
