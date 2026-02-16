import React from 'react';
import { PilotDashboardFilters, PilotPhase } from '@adoption/shared';

interface PilotFiltersProps {
  filters: PilotDashboardFilters;
  onChange: (filters: PilotDashboardFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

const phaseOptions: Array<{ value: PilotPhase; label: string }> = [
  { value: 'PHASE_1', label: 'Phase 1 – Structural Foundation' },
  { value: 'PHASE_2', label: 'Phase 2 – Agentic Specification Loops' },
];

const PilotFilters: React.FC<PilotFiltersProps> = ({ filters, onChange, onApply, onClear }) => {
  const updateFilters = (updates: Partial<PilotDashboardFilters>) => {
    onChange({ ...filters, ...updates });
  };

  return (
    <form
      className="govuk-form-group govuk-!-margin-bottom-4"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <label className="govuk-label" htmlFor="pilot-date-from">From</label>
          <input
            className="govuk-input"
            id="pilot-date-from"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(event) => updateFilters({ dateFrom: event.target.value })}
          />
        </div>
        <div className="govuk-grid-column-one-third">
          <label className="govuk-label" htmlFor="pilot-date-to">To</label>
          <input
            className="govuk-input"
            id="pilot-date-to"
            type="date"
            value={filters.dateTo || ''}
            onChange={(event) => updateFilters({ dateTo: event.target.value })}
          />
        </div>
        <div className="govuk-grid-column-one-third">
          <label className="govuk-label" htmlFor="pilot-phase">Phase</label>
          <select
            className="govuk-select"
            id="pilot-phase"
            value={filters.phase || ''}
            onChange={(event) => updateFilters({ phase: event.target.value as PilotPhase })}
          >
            <option value="">All phases</option>
            {phaseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="govuk-button-group govuk-!-margin-top-4">
        <button type="submit" className="govuk-button" data-module="govuk-button">
          Apply filters
        </button>
        <button type="button" className="govuk-button govuk-button--secondary" onClick={onClear}>
          Clear
        </button>
      </div>
    </form>
  );
};

export default PilotFilters;
