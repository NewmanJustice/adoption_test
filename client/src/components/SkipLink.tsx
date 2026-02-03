import React from 'react';

interface SkipLinkProps {
  href?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href = '#main-content' }) => {
  return (
    <a href={href} className="govuk-skip-link" data-module="govuk-skip-link">
      Skip to main content
    </a>
  );
};

export default SkipLink;
