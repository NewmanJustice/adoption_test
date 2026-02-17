import React from 'react';
import { PilotRole } from '@adoption/shared';
import { PILOT_GUIDANCE } from '../../data/pilotGuidance';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface PilotGuidancePanelProps {
  role?: PilotRole;
}

const PilotGuidancePanel: React.FC<PilotGuidancePanelProps> = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('pilotGuidanceCollapsed', false);

  if (!role || !(role in PILOT_GUIDANCE)) {
    return null;
  }

  const guidance = PILOT_GUIDANCE[role];

  return (
    <details className="govuk-details" open={!isCollapsed}>
      <summary
        className="govuk-details__summary"
        onClick={(e) => {
          e.preventDefault();
          setIsCollapsed(!isCollapsed);
        }}
      >
        <span className="govuk-details__summary-text">{guidance.title}</span>
      </summary>
      <div className="govuk-details__text">
        <p className="govuk-body">{guidance.description}</p>
        <h3 className="govuk-heading-s">Your actions</h3>
        <ul className="govuk-list govuk-list--bullet">
          {guidance.actions.map((action: string, index: number) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
        {guidance.tips && guidance.tips.length > 0 && (
          <>
            <h3 className="govuk-heading-s">Tips</h3>
            <ul className="govuk-list govuk-list--bullet">
              {guidance.tips.map((tip: string, index: number) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </details>
  );
};

export default PilotGuidancePanel;
