import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AboutSectionLinks } from './AboutSectionLinks';

const PilotSidebar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="pilot-sidebar govuk-!-margin-top-6" aria-label="Pilot navigation">
      <ul className="govuk-list govuk-list--spaced">
        <li>
          <Link to="/pilot" className={location.pathname === '/pilot' ? 'govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold' : 'govuk-link govuk-link--no-visited-state'}>
            Dashboard
          </Link>
        </li>
        <li><span className="govuk-!-font-weight-bold">About the Pilot</span></li>
        <AboutSectionLinks />
      </ul>
    </nav>
  );
};

export default PilotSidebar;
