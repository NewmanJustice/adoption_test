/**
 * Actor-Tailored Dashboard Guidance Tests
 * Tests for PilotGuidancePanel component and role-specific guidance content
 * Story: .blueprint/features/feature_adoption-pilot/story-actor-tailored-guidance.md
 */

import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PilotGuidancePanel from '../components/pilot/PilotGuidancePanel';
import PilotFilters from '../components/pilot/PilotFilters';
import { PILOT_GUIDANCE } from '../data/pilotGuidance';
import { PilotRole, PilotDashboardFilters } from '@adoption/shared';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Actor-Tailored Dashboard Guidance', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('AC-1: Display role-specific guidance', () => {
    it('displays guidance panel for PILOT_BUILDER role', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      expect(screen.getByText('Builder guidance')).toBeInTheDocument();
    });

    it('displays guidance panel for PILOT_SME role', () => {
      render(<PilotGuidancePanel role="PILOT_SME" />);
      
      expect(screen.getByText('Subject Matter Expert guidance')).toBeInTheDocument();
    });

    it('displays guidance panel for PILOT_DELIVERY_LEAD role', () => {
      render(<PilotGuidancePanel role="PILOT_DELIVERY_LEAD" />);
      
      expect(screen.getByText('Delivery Lead guidance')).toBeInTheDocument();
    });

    it('displays guidance panel for PILOT_OBSERVER role', () => {
      render(<PilotGuidancePanel role="PILOT_OBSERVER" />);
      
      expect(screen.getByText('Observer guidance')).toBeInTheDocument();
    });

    it('does not display guidance panel when role is undefined', () => {
      const { container } = render(<PilotGuidancePanel role={undefined} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('does not display guidance panel for non-pilot role', () => {
      // @ts-expect-error Testing invalid role
      const { container } = render(<PilotGuidancePanel role="HMCTS_CASE_OFFICER" />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('AC-2: Builder guidance content', () => {
    it('displays Builder-specific description', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      expect(screen.getByText(/responsible for configuring the pilot and maintaining its structural integrity/i)).toBeInTheDocument();
    });

    it('displays all Builder actions', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      expect(screen.getByText('Configure pilot scope and domain boundaries')).toBeInTheDocument();
      expect(screen.getByText('Confirm Spec Freeze before transitioning to Phase 2')).toBeInTheDocument();
      expect(screen.getByText('Review metrics and deviation trends')).toBeInTheDocument();
      expect(screen.getByText('Identify structural integrity issues')).toBeInTheDocument();
    });

    it('displays Builder tips', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      expect(screen.getByText(/Use the Configure Pilot button/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitor deviations closely after Spec Freeze/i)).toBeInTheDocument();
    });

    it('has correct number of actions for Builder', () => {
      expect(PILOT_GUIDANCE.PILOT_BUILDER.actions).toHaveLength(4);
    });

    it('has correct number of tips for Builder', () => {
      expect(PILOT_GUIDANCE.PILOT_BUILDER.tips).toHaveLength(2);
    });
  });

  describe('AC-3: SME guidance content', () => {
    it('displays SME-specific description', () => {
      render(<PilotGuidancePanel role="PILOT_SME" />);
      
      expect(screen.getByText(/provide domain expertise and feedback on pilot outcomes/i)).toBeInTheDocument();
    });

    it('displays all SME actions', () => {
      render(<PilotGuidancePanel role="PILOT_SME" />);
      
      expect(screen.getByText('Provide feedback inputs on metrics')).toBeInTheDocument();
      expect(screen.getByText('Review prototype outcomes')).toBeInTheDocument();
      expect(screen.getByText('Add contextual notes to metric entries')).toBeInTheDocument();
      expect(screen.getByText('Share domain insights with the delivery team')).toBeInTheDocument();
    });

    it('displays SME tips', () => {
      render(<PilotGuidancePanel role="PILOT_SME" />);
      
      expect(screen.getByText(/Use the Add Metric Entry button/i)).toBeInTheDocument();
      expect(screen.getByText(/Contextual notes help explain variations/i)).toBeInTheDocument();
    });

    it('has correct number of actions for SME', () => {
      expect(PILOT_GUIDANCE.PILOT_SME.actions).toHaveLength(4);
    });

    it('has correct number of tips for SME', () => {
      expect(PILOT_GUIDANCE.PILOT_SME.tips).toHaveLength(2);
    });
  });

  describe('AC-4: Delivery Lead guidance content', () => {
    it('displays Delivery Lead-specific description', () => {
      render(<PilotGuidancePanel role="PILOT_DELIVERY_LEAD" />);
      
      expect(screen.getByText(/manage pilot phases and ensure complete metric coverage/i)).toBeInTheDocument();
    });

    it('displays all Delivery Lead actions', () => {
      render(<PilotGuidancePanel role="PILOT_DELIVERY_LEAD" />);
      
      expect(screen.getByText('Manage pilot phase transitions')).toBeInTheDocument();
      expect(screen.getByText('Ensure metric entry coverage across all dimensions')).toBeInTheDocument();
      expect(screen.getByText('Use filters to identify gaps')).toBeInTheDocument();
      expect(screen.getByText('Review completeness indicators')).toBeInTheDocument();
    });

    it('displays Delivery Lead tips', () => {
      render(<PilotGuidancePanel role="PILOT_DELIVERY_LEAD" />);
      
      expect(screen.getByText(/Check the completeness score/i)).toBeInTheDocument();
      expect(screen.getByText(/Use phase and loop filters/i)).toBeInTheDocument();
    });

    it('has correct number of actions for Delivery Lead', () => {
      expect(PILOT_GUIDANCE.PILOT_DELIVERY_LEAD.actions).toHaveLength(4);
    });

    it('has correct number of tips for Delivery Lead', () => {
      expect(PILOT_GUIDANCE.PILOT_DELIVERY_LEAD.tips).toHaveLength(2);
    });
  });

  describe('AC-5: Observer guidance content', () => {
    it('displays Observer-specific description', () => {
      render(<PilotGuidancePanel role="PILOT_OBSERVER" />);
      
      expect(screen.getByText(/read-only access to monitor pilot progress/i)).toBeInTheDocument();
    });

    it('displays all Observer actions', () => {
      render(<PilotGuidancePanel role="PILOT_OBSERVER" />);
      
      expect(screen.getByText('View metric summaries and trends')).toBeInTheDocument();
      expect(screen.getByText('Interpret summary cards')).toBeInTheDocument();
      expect(screen.getByText('Use filters to explore pilot progress')).toBeInTheDocument();
      expect(screen.getByText('Track deviations from the baseline')).toBeInTheDocument();
    });

    it('displays Observer tips', () => {
      render(<PilotGuidancePanel role="PILOT_OBSERVER" />);
      
      expect(screen.getByText(/Use date range filters/i)).toBeInTheDocument();
      expect(screen.getByText(/Trend tables show how metrics change/i)).toBeInTheDocument();
    });

    it('has correct number of actions for Observer', () => {
      expect(PILOT_GUIDANCE.PILOT_OBSERVER.actions).toHaveLength(4);
    });

    it('has correct number of tips for Observer', () => {
      expect(PILOT_GUIDANCE.PILOT_OBSERVER.tips).toHaveLength(2);
    });
  });

  describe('AC-6: Guidance dismissal and preference persistence', () => {
    it('panel is expanded by default', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const details = screen.getByRole('group') as HTMLDetailsElement;
      expect(details.open).toBe(true);
    });

    it('can collapse the guidance panel', async () => {
      const user = userEvent.setup();
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const summary = screen.getByText('Builder guidance');
      await user.click(summary);
      
      const details = screen.getByRole('group') as HTMLDetailsElement;
      expect(details.open).toBe(false);
    });

    it('saves collapse state to localStorage', async () => {
      const user = userEvent.setup();
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const summary = screen.getByText('Builder guidance');
      await user.click(summary);
      
      const savedState = localStorageMock.getItem('pilotGuidanceCollapsed');
      expect(savedState).toBe('true');
    });

    it('remembers collapsed state on re-render', () => {
      localStorageMock.setItem('pilotGuidanceCollapsed', 'true');
      
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const details = screen.getByRole('group') as HTMLDetailsElement;
      expect(details.open).toBe(false);
    });

    it('can expand a collapsed panel', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('pilotGuidanceCollapsed', 'true');
      
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const summary = screen.getByText('Builder guidance');
      await user.click(summary);
      
      const details = screen.getByRole('group') as HTMLDetailsElement;
      expect(details.open).toBe(true);
      
      const savedState = localStorageMock.getItem('pilotGuidanceCollapsed');
      expect(savedState).toBe('false');
    });

    it('persists state across different roles', () => {
      localStorageMock.setItem('pilotGuidanceCollapsed', 'true');
      
      const { rerender } = render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      let details = screen.getByRole('group') as HTMLDetailsElement;
      expect(details.open).toBe(false);
      
      rerender(<PilotGuidancePanel role="PILOT_SME" />);
      details = screen.getByRole('group') as HTMLDetailsElement;
      expect(details.open).toBe(false);
    });
  });

  describe('AC-7: Contextual help for filters and controls', () => {
    const mockFilters: PilotDashboardFilters = {
      dateFrom: '',
      dateTo: '',
      phase: undefined,
      loop: 1,
    };

    const mockOnChange = jest.fn();
    const mockOnApply = jest.fn();
    const mockOnClear = jest.fn();

    it('displays help text for date from filter', () => {
      render(
        <PilotFilters 
          filters={mockFilters}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );
      
      const hints = screen.getAllByText('Filter metrics by the date they were recorded');
      expect(hints.length).toBeGreaterThan(0);
    });

    it('displays help text for date to filter', () => {
      render(
        <PilotFilters 
          filters={mockFilters}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );
      
      const hints = screen.getAllByText('Filter metrics by the date they were recorded');
      expect(hints).toHaveLength(2); // Both date from and date to
    });

    it('displays help text for phase filter', () => {
      render(
        <PilotFilters 
          filters={mockFilters}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );
      
      expect(screen.getByText('Show metrics from a specific pilot phase (1 or 2)')).toBeInTheDocument();
    });

    it('all filter labels have associated hints', () => {
      render(
        <PilotFilters 
          filters={mockFilters}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );
      
      const fromLabel = screen.getByLabelText('From');
      const toLabel = screen.getByLabelText('To');
      const phaseLabel = screen.getByLabelText('Phase');
      
      expect(fromLabel).toBeInTheDocument();
      expect(toLabel).toBeInTheDocument();
      expect(phaseLabel).toBeInTheDocument();
      
      // Check that hint text appears near each label
      const hints = screen.getAllByText(/Filter metrics by the date they were recorded|Show metrics from a specific pilot phase/i);
      expect(hints.length).toBeGreaterThanOrEqual(3);
    });

    it('hint text uses GOV.UK hint class', () => {
      const { container } = render(
        <PilotFilters 
          filters={mockFilters}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );
      
      const hints = container.querySelectorAll('.govuk-hint');
      expect(hints.length).toBeGreaterThan(0);
    });
  });

  describe('Guidance Data Structure', () => {
    it('all pilot roles have guidance defined', () => {
      const roles: PilotRole[] = ['PILOT_BUILDER', 'PILOT_SME', 'PILOT_DELIVERY_LEAD', 'PILOT_OBSERVER'];
      
      roles.forEach(role => {
        expect(PILOT_GUIDANCE[role]).toBeDefined();
        expect(PILOT_GUIDANCE[role].title).toBeTruthy();
        expect(PILOT_GUIDANCE[role].description).toBeTruthy();
        expect(PILOT_GUIDANCE[role].actions).toBeInstanceOf(Array);
        expect(PILOT_GUIDANCE[role].actions.length).toBeGreaterThan(0);
      });
    });

    it('all guidance entries have required fields', () => {
      Object.values(PILOT_GUIDANCE).forEach(guidance => {
        expect(guidance.title).toBeTruthy();
        expect(typeof guidance.title).toBe('string');
        expect(guidance.description).toBeTruthy();
        expect(typeof guidance.description).toBe('string');
        expect(Array.isArray(guidance.actions)).toBe(true);
        expect(guidance.actions.length).toBeGreaterThan(0);
      });
    });

    it('all actions are non-empty strings', () => {
      Object.values(PILOT_GUIDANCE).forEach(guidance => {
        guidance.actions.forEach(action => {
          expect(typeof action).toBe('string');
          expect(action.length).toBeGreaterThan(0);
        });
      });
    });

    it('all tips are non-empty strings when defined', () => {
      Object.values(PILOT_GUIDANCE).forEach(guidance => {
        if (guidance.tips) {
          guidance.tips.forEach(tip => {
            expect(typeof tip).toBe('string');
            expect(tip.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe('Component Structure', () => {
    it('uses GOV.UK Details component', () => {
      const { container } = render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const details = container.querySelector('.govuk-details');
      expect(details).toBeInTheDocument();
    });

    it('uses GOV.UK summary component', () => {
      const { container } = render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const summary = container.querySelector('.govuk-details__summary');
      expect(summary).toBeInTheDocument();
    });

    it('renders actions as bulleted list', () => {
      const { container } = render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      const bulletList = container.querySelector('.govuk-list--bullet');
      expect(bulletList).toBeInTheDocument();
    });

    it('renders tips section when tips are available', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      expect(screen.getByText('Tips')).toBeInTheDocument();
    });

    it('renders Your actions heading', () => {
      render(<PilotGuidancePanel role="PILOT_BUILDER" />);
      
      expect(screen.getByText('Your actions')).toBeInTheDocument();
    });
  });
});
