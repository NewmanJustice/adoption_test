import React, { useState } from 'react';

export interface FilterValues {
  status: string | null;
  caseType: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

interface CaseFiltersProps {
  filters: FilterValues;
  onApply: (filters: FilterValues) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'APPLICATION', label: 'Application' },
  { value: 'DIRECTIONS', label: 'Directions' },
  { value: 'CONSENT_AND_REPORTING', label: 'Consent and Reporting' },
  { value: 'FINAL_HEARING', label: 'Final Hearing' },
  { value: 'ORDER_GRANTED', label: 'Order Granted' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

const CASE_TYPE_OPTIONS = [
  { value: '', label: 'All case types' },
  { value: 'AGENCY_ADOPTION', label: 'Agency Adoption' },
  { value: 'STEP_PARENT_ADOPTION', label: 'Step Parent Adoption' },
  { value: 'INTERCOUNTRY_ADOPTION', label: 'Intercountry Adoption' },
  { value: 'FOSTER_TO_ADOPT', label: 'Foster to Adopt' },
];

const CaseFilters: React.FC<CaseFiltersProps> = ({ filters, onApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

  const handleChange = (field: keyof FilterValues, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(localFilters);
  };

  const handleClear = () => {
    const cleared: FilterValues = {
      status: null,
      caseType: null,
      dateFrom: null,
      dateTo: null,
    };
    setLocalFilters(cleared);
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="govuk-form-group">
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h2 className="govuk-fieldset__heading">Filter cases</h2>
        </legend>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="filter-status">
                Status
              </label>
              <select
                className="govuk-select"
                id="filter-status"
                name="status"
                value={localFilters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="filter-case-type">
                Case type
              </label>
              <select
                className="govuk-select"
                id="filter-case-type"
                name="caseType"
                value={localFilters.caseType || ''}
                onChange={(e) => handleChange('caseType', e.target.value)}
              >
                {CASE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="filter-date-from">
                Key date from
              </label>
              <input
                className="govuk-input"
                id="filter-date-from"
                name="dateFrom"
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
              />
            </div>
          </div>

          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="filter-date-to">
                Key date to
              </label>
              <input
                className="govuk-input"
                id="filter-date-to"
                name="dateTo"
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button">
            Apply filters
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={handleClear}
          >
            Clear filters
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default CaseFilters;
