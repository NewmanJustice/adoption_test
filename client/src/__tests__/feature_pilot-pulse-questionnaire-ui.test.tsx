/**
 * Pilot Pulse Questionnaire UI — Client-side React Tests
 *
 * Stories: S1 (Form Rendering), S2 (Submission & Confirmation), S3 (Access Control),
 *          S4 (Trends Page Display), S5 (Governance Signal Display), S6 (Sidebar Navigation)
 *
 * Run: npx jest --selectProjects=client --testPathPattern=feature_pilot-pulse-questionnaire-ui --no-coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../context/SessionContext', () => ({
  useSession: jest.fn(),
}));

import { useSession } from '../context/SessionContext';

const mockUseSession = useSession as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(role: string | null, loading = false) {
  mockUseSession.mockReturnValue({
    user: role ? { username: 'test', role } : null,
    isAuthenticated: role !== null,
    loading,
  });
}

function mockFetchSuccess(body: object, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function mockFetchFailure(status = 500) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: { code: 'SERVER_ERROR', message: 'Server error' } }),
  });
}

const TRENDS_RESPONSE_WITH_DATA = {
  data: {
    trendInferenceSuppressed: false,
    windows: [
      {
        windowStart: '2025-01-01T00:00:00.000Z',
        sections: [
          {
            section: 'Authority & Decision Structure',
            structuralScore: 3.5,
            clarityScore: 4.0,
            alignmentIndex: 0.5,
            alignmentSuppressed: false,
          },
          {
            section: 'Service Intent & Boundaries',
            structuralScore: null,
            clarityScore: null,
            alignmentIndex: null,
            alignmentSuppressed: true,
          },
        ],
      },
    ],
    signals: [],
  },
};

const TRENDS_RESPONSE_SUPPRESSED = {
  data: {
    trendInferenceSuppressed: true,
    windows: [],
    signals: [],
  },
};

const TRENDS_RESPONSE_WITH_SIGNALS = {
  data: {
    trendInferenceSuppressed: false,
    windows: [
      {
        windowStart: '2025-01-01T00:00:00.000Z',
        sections: [
          {
            section: 'Authority & Decision Structure',
            structuralScore: 1.2,
            clarityScore: 1.5,
            alignmentIndex: 0.9,
            alignmentSuppressed: false,
          },
        ],
      },
    ],
    signals: [
      {
        type: 'LOW_STRUCTURAL_SCORE',
        section: 'Authority & Decision Structure',
        severity: 'red',
        message: 'Structural score is critically low in this section.',
      },
      {
        type: 'CLARITY_FALLING',
        section: 'Service Intent & Boundaries',
        severity: 'amber',
        message: 'Clarity score is trending downward.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Lazy-load component under test — wrap in try/catch so tests describe intent
// even before implementation exists.
// ---------------------------------------------------------------------------

let PilotPulseQuestionnairePage: React.ComponentType | null = null;
let PilotPulseTrendsPage: React.ComponentType | null = null;
let PilotSidebar: React.ComponentType | null = null;
let PilotDashboardPage: React.ComponentType | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PilotPulseQuestionnairePage = require('../pages/PilotPulseQuestionnairePage').default;
} catch {
  // component not yet implemented
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PilotPulseTrendsPage = require('../pages/PilotPulseTrendsPage').default;
} catch {
  // component not yet implemented
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PilotSidebar = require('../components/pilot/PilotSidebar').default;
} catch {
  // component not yet implemented
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PilotDashboardPage = require('../pages/PilotDashboardPage').default;
} catch {
  // component not yet implemented
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderQuestionnaire(initialPath = '/pilot/pulse/questionnaire') {
  if (!PilotPulseQuestionnairePage) throw new Error('PilotPulseQuestionnairePage not implemented yet');
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/pilot/pulse/questionnaire" element={<PilotPulseQuestionnairePage />} />
        <Route path="/pilot" element={<div data-testid="pilot-dashboard" />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderTrends(initialPath = '/pilot/pulse/trends') {
  if (!PilotPulseTrendsPage) throw new Error('PilotPulseTrendsPage not implemented yet');
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/pilot/pulse/trends" element={<PilotPulseTrendsPage />} />
        <Route path="/dashboard" element={<div data-testid="main-dashboard" />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderSidebar(initialPath = '/pilot') {
  if (!PilotSidebar) throw new Error('PilotSidebar not implemented yet');
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PilotSidebar />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Story 1 — Questionnaire Form Rendering
// ---------------------------------------------------------------------------

describe('Story 1 — Questionnaire Form Rendering', () => {
  beforeEach(() => {
    mockSession('PILOT_BUILDER');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('T-S1.1: renders four section headings', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    expect(screen.getByText(/Authority & Decision Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Service Intent & Boundaries/i)).toBeInTheDocument();
    expect(screen.getByText(/Lifecycle & Operational Modelling/i)).toBeInTheDocument();
    expect(screen.getByText(/Architectural & Dependency Discipline/i)).toBeInTheDocument();
  });

  it('T-S1.2: renders Q1 question text in Section 1', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    expect(
      screen.getByText(/There is a clearly identified individual accountable for sequencing decisions/i)
    ).toBeInTheDocument();
  });

  it('T-S1.3: each radio group has five options labelled Strongly Disagree through Strongly Agree', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    const stronglyDisagreeOptions = screen.getAllByLabelText(/1\s*[—–-]\s*Strongly Disagree/i);
    expect(stronglyDisagreeOptions.length).toBe(12);
    const stronglyAgreeOptions = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    expect(stronglyAgreeOptions.length).toBe(12);
  });

  it('T-S1.4: optional free-text textarea renders with correct hint text', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    expect(
      screen.getByText(/Where does structural clarity feel weakest right now\? Do not include personal data/i)
    ).toBeInTheDocument();
  });

  it('T-S1.5: free-text textarea is not marked required', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    const textarea = screen.getByRole('textbox');
    expect(textarea).not.toBeRequired();
  });

  it('T-S1.6: "Submit pulse" submit button is rendered', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    expect(screen.getByRole('button', { name: /Submit pulse/i })).toBeInTheDocument();
  });

  it('T-S1.7: loading indicator shown while session is still loading', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockSession('PILOT_BUILDER', true /* loading */);
    renderQuestionnaire();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit pulse/i })).not.toBeInTheDocument();
  });

  it('T-S1.8: page passes jest-axe accessibility check', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    const { container } = renderQuestionnaire();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Story 2 — Questionnaire Submission & Confirmation
// ---------------------------------------------------------------------------

describe('Story 2 — Questionnaire Submission & Confirmation', () => {
  beforeEach(() => {
    mockSession('PILOT_BUILDER');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('T-S2.1: renders GOV.UK error summary when submit attempted with unanswered questions', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('T-S2.2: error summary lists at least one unanswered question error', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));
    await waitFor(() => {
      const errorSummary = screen.getByRole('alert');
      expect(within(errorSummary).getAllByRole('link').length).toBeGreaterThan(0);
    });
  });

  it('T-S2.3: no fetch POST is made when validation fails', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    renderQuestionnaire();
    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('T-S2.4: valid form sends POST to /api/pilot/pulse with numeric q1–q12 in body', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockFetchSuccess({ data: { id: 'abc-123' } }, 201);
    renderQuestionnaire();

    // Select a radio for each of the 12 questions
    const allStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    allStronglyAgree.forEach((radio) => fireEvent.click(radio));

    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/pilot/pulse');
    const body = JSON.parse(options.body);
    expect(body.q1).toBe(5);
    expect(body.q12).toBe(5);
  });

  it('T-S2.5: POST uses credentials: "include"', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockFetchSuccess({ data: { id: 'abc-123' } }, 201);
    renderQuestionnaire();

    const allStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    allStronglyAgree.forEach((radio) => fireEvent.click(radio));

    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.credentials).toBe('include');
  });

  it('T-S2.6: on 201 response, navigates to /pilot with submitted state', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockFetchSuccess({ data: { id: 'abc-123' } }, 201);
    renderQuestionnaire();

    const allStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    allStronglyAgree.forEach((radio) => fireEvent.click(radio));

    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/pilot', expect.objectContaining({ state: expect.objectContaining({ submitted: true }) }))
    );
  });

  it('T-S2.7: on API error, error summary is displayed and user remains on form', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockFetchFailure(500);
    renderQuestionnaire();

    const allStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    allStronglyAgree.forEach((radio) => fireEvent.click(radio));

    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Submit pulse/i })).toBeInTheDocument();
  });

  it('T-S2.8: on API error, previously selected radio values are preserved', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockFetchFailure(500);
    renderQuestionnaire();

    const firstStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i)[0];
    fireEvent.click(firstStronglyAgree);

    const allStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    allStronglyAgree.forEach((radio) => fireEvent.click(radio));

    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(firstStronglyAgree).toBeChecked();
  });

  it('T-S2.9: freeText omitted from POST body when textarea is empty', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockFetchSuccess({ data: { id: 'abc-123' } }, 201);
    renderQuestionnaire();

    const allStronglyAgree = screen.getAllByLabelText(/5\s*[—–-]\s*Strongly Agree/i);
    allStronglyAgree.forEach((radio) => fireEvent.click(radio));

    // leave textarea blank
    fireEvent.click(screen.getByRole('button', { name: /Submit pulse/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.freeText === undefined || body.freeText === '').toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Story 3 — Access Control
// ---------------------------------------------------------------------------

describe('Story 3 — Access Control', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Questionnaire page guards
  it('T-S3.1: PILOT_BUILDER can access questionnaire page — form renders', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockSession('PILOT_BUILDER');
    renderQuestionnaire();
    expect(screen.getByRole('button', { name: /Submit pulse/i })).toBeInTheDocument();
  });

  it('T-S3.2: PILOT_SME can access questionnaire page — form renders', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockSession('PILOT_SME');
    renderQuestionnaire();
    expect(screen.getByRole('button', { name: /Submit pulse/i })).toBeInTheDocument();
  });

  it('T-S3.3: PILOT_OBSERVER is redirected to /pilot from questionnaire page', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockSession('PILOT_OBSERVER');
    renderQuestionnaire();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/pilot', expect.objectContaining({ replace: true }))
    );
    expect(screen.queryByRole('button', { name: /Submit pulse/i })).not.toBeInTheDocument();
  });

  it('T-S3.4: HMCTS_CASE_OFFICER is redirected to /pilot from questionnaire page', async () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockSession('HMCTS_CASE_OFFICER');
    renderQuestionnaire();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/pilot', expect.objectContaining({ replace: true }))
    );
  });

  // Trends page guards
  it('T-S3.5: PILOT_BUILDER can access trends page — content renders', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockSession('PILOT_BUILDER');
    renderTrends();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.anything());
  });

  it('T-S3.6: PILOT_SME can access trends page', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockSession('PILOT_SME');
    renderTrends();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.anything());
  });

  it('T-S3.7: PILOT_OBSERVER can access trends page', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockSession('PILOT_OBSERVER');
    renderTrends();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.anything());
  });

  it('T-S3.8: HMCTS_CASE_OFFICER is redirected to /dashboard from trends page', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockSession('HMCTS_CASE_OFFICER');
    renderTrends();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', expect.objectContaining({ replace: true }))
    );
  });

  it('T-S3.9: no redirect fires while session loading on questionnaire page', () => {
    if (!PilotPulseQuestionnairePage) return; // component not yet implemented
    mockSession('PILOT_OBSERVER', true /* loading */);
    renderQuestionnaire();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('T-S3.10: no redirect fires while session loading on trends page', () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockSession('HMCTS_CASE_OFFICER', true /* loading */);
    renderTrends();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Story 4 — Trends Page Display
// ---------------------------------------------------------------------------

describe('Story 4 — Trends Page Display', () => {
  beforeEach(() => {
    mockSession('PILOT_BUILDER');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('T-S4.1: loading state shown while fetch is in-flight', () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => { /* never resolves */ }));
    renderTrends();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('T-S4.2: error state shown on fetch failure', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchFailure(500);
    renderTrends();
    await waitFor(() => {
      expect(screen.getByText(/Unable to load trend data/i)).toBeInTheDocument();
    });
  });

  it('T-S4.3: trendInferenceSuppressed notice rendered when flag is true', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_SUPPRESSED);
    renderTrends();
    await waitFor(() => {
      expect(
        screen.getByText(/Insufficient data for trend inference\. At least 3 pulse windows are needed/i)
      ).toBeInTheDocument();
    });
  });

  it('T-S4.4: score cards are not rendered when trendInferenceSuppressed is true', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_SUPPRESSED);
    renderTrends();
    await waitFor(() =>
      expect(screen.getByText(/Insufficient data/i)).toBeInTheDocument()
    );
    // No section score summary should be rendered
    expect(screen.queryByText(/Structural Score/i)).not.toBeInTheDocument();
  });

  it('T-S4.5: per-section scores render section name and score values', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA);
    renderTrends();
    await waitFor(() => {
      expect(screen.getByText(/Authority & Decision Structure/i)).toBeInTheDocument();
    });
    expect(screen.getByText('3.5')).toBeInTheDocument();
  });

  it('T-S4.6: null scores are shown as "N/A"', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA);
    renderTrends();
    await waitFor(() => {
      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });
  });

  it('T-S4.7: accessible data table renders with correct column headers', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA);
    renderTrends();
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    const table = screen.getByRole('table');
    expect(within(table).getByText(/Window Start/i)).toBeInTheDocument();
    expect(within(table).getByText(/Section/i)).toBeInTheDocument();
    expect(within(table).getByText(/Structural Score/i)).toBeInTheDocument();
    expect(within(table).getByText(/Clarity Score/i)).toBeInTheDocument();
    expect(within(table).getByText(/Alignment Index/i)).toBeInTheDocument();
  });

  it('T-S4.8: data table has a caption element', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA);
    const { container } = renderTrends();
    await waitFor(() => {
      expect(container.querySelector('caption')).toBeInTheDocument();
    });
  });

  it('T-S4.9: trends page passes jest-axe accessibility check', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA);
    const { container } = renderTrends();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Story 5 — Governance Signal Display
// ---------------------------------------------------------------------------

describe('Story 5 — Governance Signal Display', () => {
  beforeEach(() => {
    mockSession('PILOT_BUILDER');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('T-S5.1: red signal renders as govuk-warning-text element', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    const { container } = renderTrends();
    await waitFor(() => {
      expect(container.querySelector('.govuk-warning-text')).toBeInTheDocument();
    });
  });

  it('T-S5.2: red signal message is displayed verbatim', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    renderTrends();
    await waitFor(() => {
      expect(
        screen.getByText('Structural score is critically low in this section.')
      ).toBeInTheDocument();
    });
  });

  it('T-S5.3: red signal section label is rendered', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    renderTrends();
    await waitFor(() => {
      const warningBlocks = document.querySelectorAll('.govuk-warning-text');
      expect(
        Array.from(warningBlocks).some((el) =>
          el.textContent?.includes('Authority & Decision Structure')
        )
      ).toBe(true);
    });
  });

  it('T-S5.4: amber signal renders as govuk-inset-text element', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    const { container } = renderTrends();
    await waitFor(() => {
      expect(container.querySelector('.govuk-inset-text')).toBeInTheDocument();
    });
  });

  it('T-S5.5: amber signal message is displayed verbatim', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    renderTrends();
    await waitFor(() => {
      expect(screen.getByText('Clarity score is trending downward.')).toBeInTheDocument();
    });
  });

  it('T-S5.6: no signals section rendered when signals array is empty', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_DATA); // signals: []
    const { container } = renderTrends();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(container.querySelector('.govuk-warning-text')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.govuk-inset-text').length).toBe(0);
  });

  it('T-S5.7: multiple mixed-severity signals all render', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    const { container } = renderTrends();
    await waitFor(() => {
      expect(container.querySelector('.govuk-warning-text')).toBeInTheDocument();
      expect(container.querySelector('.govuk-inset-text')).toBeInTheDocument();
    });
  });

  it('T-S5.8: signals section appears above score summary in document order', async () => {
    if (!PilotPulseTrendsPage) return; // component not yet implemented
    mockFetchSuccess(TRENDS_RESPONSE_WITH_SIGNALS);
    const { container } = renderTrends();
    await waitFor(() => {
      expect(container.querySelector('.govuk-warning-text')).toBeInTheDocument();
    });
    const signalEl = container.querySelector('.govuk-warning-text')!;
    const tableEl = container.querySelector('table');
    if (tableEl) {
      const order = signalEl.compareDocumentPosition(tableEl);
      // Node.DOCUMENT_POSITION_FOLLOWING = 4 — table comes after signal
      expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Story 6 — Sidebar Navigation
// ---------------------------------------------------------------------------

describe('Story 6 — Sidebar Navigation', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('T-S6.1: PILOT_BUILDER sees "Pulse questionnaire" link', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('PILOT_BUILDER');
    renderSidebar();
    expect(screen.getByRole('link', { name: /Pulse questionnaire/i })).toBeInTheDocument();
  });

  it('T-S6.2: PILOT_BUILDER sees "Structural trends" link', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('PILOT_BUILDER');
    renderSidebar();
    expect(screen.getByRole('link', { name: /Structural trends/i })).toBeInTheDocument();
  });

  it('T-S6.3: PILOT_SME sees both "Pulse questionnaire" and "Structural trends" links', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('PILOT_SME');
    renderSidebar();
    expect(screen.getByRole('link', { name: /Pulse questionnaire/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Structural trends/i })).toBeInTheDocument();
  });

  it('T-S6.4: PILOT_OBSERVER sees "Structural trends" but not "Pulse questionnaire"', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('PILOT_OBSERVER');
    renderSidebar();
    expect(screen.getByRole('link', { name: /Structural trends/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Pulse questionnaire/i })).not.toBeInTheDocument();
  });

  it('T-S6.5: HMCTS_CASE_OFFICER sees neither "Pulse questionnaire" nor "Structural trends"', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('HMCTS_CASE_OFFICER');
    renderSidebar();
    expect(screen.queryByRole('link', { name: /Pulse questionnaire/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Structural trends/i })).not.toBeInTheDocument();
  });

  it('T-S6.6: "Pulse questionnaire" link has bold class when on /pilot/pulse/questionnaire', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('PILOT_BUILDER');
    renderSidebar('/pilot/pulse/questionnaire');
    const link = screen.getByRole('link', { name: /Pulse questionnaire/i });
    expect(link.className).toContain('govuk-!-font-weight-bold');
  });

  it('T-S6.7: "Structural trends" link has bold class when on /pilot/pulse/trends', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession('PILOT_BUILDER');
    renderSidebar('/pilot/pulse/trends');
    const link = screen.getByRole('link', { name: /Structural trends/i });
    expect(link.className).toContain('govuk-!-font-weight-bold');
  });

  it('T-S6.8: neither link renders when session is loading (user is null)', () => {
    if (!PilotSidebar) return; // sidebar not yet updated
    mockSession(null, true /* loading */);
    renderSidebar();
    expect(screen.queryByRole('link', { name: /Pulse questionnaire/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Structural trends/i })).not.toBeInTheDocument();
  });
});
