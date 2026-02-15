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
  { value: 'PHASE_3', label: 'Phase 3 – Controlled Implementation' },
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
      <div className="govuk-grid-row govuk-!-margin-top-3">
        <div className="govuk-grid-column-one-third">
          <label className="govuk-label" htmlFor="pilot-experiment">Experiment</label>
          <select
            className="govuk-select"
            id="pilot-experiment"
            value={filters.experimentType || 'pilot'}
            onChange={(event) => updateFilters({ experimentType: event.target.value as any })}
          >
            <option value="pilot">Pilot</option>
            <option value="control">Control</option>
          </select>
        </div>
        <div className="govuk-grid-column-one-third">
          <label className="govuk-label" htmlFor="pilot-loop">Loop</label>
          <input
            className="govuk-input"
            id="pilot-loop"
            type="number"
            min={1}
            value={filters.loop || 1}
            onChange={(event) => updateFilters({ loop: Number(event.target.value) })}
          />
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-checkboxes govuk-!-margin-top-6">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="pilot-compare"
                type="checkbox"
                checked={Boolean(filters.compare)}
                onChange={(event) => updateFilters({ compare: event.target.checked })}
              />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="pilot-compare">
                Compare pilot vs control
              </label>
            </div>
          </div>
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
