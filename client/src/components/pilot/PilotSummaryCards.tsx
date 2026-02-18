import React from 'react';
import { PilotMetricSummary } from '@adoption/shared';

interface PilotSummaryCardsProps {
  summaries: PilotMetricSummary[];
}

const PilotSummaryCards: React.FC<PilotSummaryCardsProps> = ({ summaries }) => {
  if (!summaries.length) {
    return <p className="govuk-body">No metrics available for this range.</p>;
  }

  return (
    <div className="govuk-grid-row app-grid-row--equal-height">
      {summaries.map((summary) => (
        <div className="govuk-grid-column-one-third" key={summary.metricKey}>
          <div className="govuk-summary-card">
            <div className="govuk-summary-card__title-wrapper">
              <h3 className="govuk-summary-card__title">{summary.metricKey.replace(/_/g, ' ')}</h3>
            </div>
            <div className="govuk-summary-card__content">
              {summary.incomplete && (
                <p className="govuk-!-margin-bottom-2">
                  <span className="govuk-tag govuk-tag--red">Incomplete</span>
                </p>
              )}
              <p className="govuk-body-l govuk-!-margin-bottom-1">
                {summary.value === null ? '—' : summary.value} {summary.unit}
              </p>
              {summary.latestAt && (
                <p className="govuk-body-s govuk-!-margin-bottom-0">Updated {new Date(summary.latestAt).toLocaleDateString('en-GB')}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PilotSummaryCards;
