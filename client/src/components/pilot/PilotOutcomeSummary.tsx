import React from 'react';
import { PilotOutcomeSummary } from '@adoption/shared';

interface PilotOutcomeSummaryProps {
  outcomes: PilotOutcomeSummary[];
}

const PilotOutcomeSummaryPanel: React.FC<PilotOutcomeSummaryProps> = ({ outcomes }) => {
  if (!outcomes.length) return null;

  return (
    <section className="govuk-!-margin-top-6">
      <h2 className="govuk-heading-l">Prototype outcomes</h2>
      <table className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header">Loop</th>
            <th className="govuk-table__header">Outcomes</th>
            <th className="govuk-table__header">Met expectations</th>
            <th className="govuk-table__header">Avg rating</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {outcomes.map((o) => (
            <tr className="govuk-table__row" key={o.loop}>
              <td className="govuk-table__cell">{o.loop}</td>
              <td className="govuk-table__cell">{o.totalOutcomes}</td>
              <td className="govuk-table__cell">{o.metExpectationsCount}</td>
              <td className="govuk-table__cell">{o.averageRating > 0 ? o.averageRating.toFixed(1) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default PilotOutcomeSummaryPanel;
