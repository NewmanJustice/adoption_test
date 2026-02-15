import React from 'react';
import { PilotTrendSeries } from '@adoption/shared';

interface PilotTrendTableProps {
  trends: PilotTrendSeries[];
}

const PilotTrendTable: React.FC<PilotTrendTableProps> = ({ trends }) => {
  if (!trends.length) {
    return <p className="govuk-body">No trend data available.</p>;
  }

  return (
    <div>
      {trends.map((series) => (
        <div key={series.metricKey} className="govuk-!-margin-bottom-6">
          <h3 className="govuk-heading-m">{series.metricKey.replace(/_/g, ' ')}</h3>
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Bucket</th>
                <th className="govuk-table__header">Value</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {series.points.map((point) => (
                <tr key={point.bucket} className="govuk-table__row">
                  <td className="govuk-table__cell">{point.bucket}</td>
                  <td className="govuk-table__cell">
                    {point.value === null ? '—' : `${point.value} ${series.unit}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PilotTrendTable;
