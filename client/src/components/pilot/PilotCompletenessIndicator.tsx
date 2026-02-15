import React from 'react';

interface PilotCompletenessIndicatorProps {
  score: number;
  missingMetricKeys: string[];
}

const PilotCompletenessIndicator: React.FC<PilotCompletenessIndicatorProps> = ({ score, missingMetricKeys }) => {
  return (
    <div className="govuk-inset-text">
      <p className="govuk-body">
        Completeness score: <strong>{score}%</strong>
      </p>
      {missingMetricKeys.length > 0 && (
        <div>
          <p className="govuk-body">Missing metrics:</p>
          <ul className="govuk-list govuk-list--bullet">
            {missingMetricKeys.map((metric) => (
              <li key={metric}>{metric.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PilotCompletenessIndicator;
