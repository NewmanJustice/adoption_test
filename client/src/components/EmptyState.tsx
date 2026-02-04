import React from 'react';
import { Link } from 'react-router-dom';

export type EmptyStateVariant = 'no-cases' | 'no-results' | 'error' | 'adopter-empty';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  activeFilters?: Record<string, string | null>;
  onClearFilters?: () => void;
}

interface EmptyStateConfig {
  heading: string;
  body: string;
  showClearFilters?: boolean;
  actionLink?: { href: string; text: string };
}

const EMPTY_STATE_CONFIG: Record<EmptyStateVariant, EmptyStateConfig> = {
  'no-cases': {
    heading: 'You have no cases assigned',
    body: 'Cases will appear here once they are assigned to you.',
    actionLink: { href: '/cases/create', text: 'Create a new case' },
  },
  'no-results': {
    heading: 'No cases match your filters',
    body: 'Try adjusting your search criteria or clear the filters to see all cases.',
    showClearFilters: true,
  },
  'error': {
    heading: 'Unable to load cases',
    body: 'Unable to load cases. Please try again.',
    actionLink: { href: '#', text: 'Try again' },
  },
  'adopter-empty': {
    heading: 'You do not have any adoption applications',
    body: 'You do not currently have any adoption applications. If you have questions, please contact your social worker.',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({ variant, activeFilters, onClearFilters }) => {
  const config = EMPTY_STATE_CONFIG[variant];

  const hasActiveFilters = activeFilters && Object.values(activeFilters).some((v) => v !== null);

  return (
    <div className="govuk-inset-text">
      <h2 className="govuk-heading-m">{config.heading}</h2>
      <p className="govuk-body">{config.body}</p>

      {hasActiveFilters && (
        <p className="govuk-body govuk-!-font-size-14">
          Showing:{' '}
          {Object.entries(activeFilters)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')}
        </p>
      )}

      {config.showClearFilters && onClearFilters && (
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      )}

      {config.actionLink && !config.showClearFilters && (
        <Link to={config.actionLink.href} className="govuk-link">
          {config.actionLink.text}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
