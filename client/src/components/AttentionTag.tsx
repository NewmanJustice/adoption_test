import React from 'react';

export type AttentionLevel = 'normal' | 'approaching' | 'overdue';

interface AttentionTagProps {
  level: AttentionLevel;
  caseRef?: string;
}

const ATTENTION_CONFIG: Record<AttentionLevel, { className: string; text: string; ariaText: string } | null> = {
  normal: null,
  approaching: {
    className: 'govuk-tag--yellow',
    text: 'Action needed',
    ariaText: 'approaching deadline',
  },
  overdue: {
    className: 'govuk-tag--red',
    text: 'Overdue',
    ariaText: 'requires urgent attention',
  },
};

const AttentionTag: React.FC<AttentionTagProps> = ({ level, caseRef }) => {
  const config = ATTENTION_CONFIG[level];

  if (!config) {
    return null;
  }

  const ariaLabel = caseRef
    ? `Case ${caseRef} ${config.ariaText}`
    : config.ariaText;

  return (
    <span className={`govuk-tag ${config.className}`} aria-label={ariaLabel}>
      {config.text}
      <span className="govuk-visually-hidden">, {config.ariaText}</span>
    </span>
  );
};

export default AttentionTag;
