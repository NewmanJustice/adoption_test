import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AboutSectionLinks } from './AboutSectionLinks';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const PilotSidebar: React.FC = () => {
  const location = useLocation();
  const isOnAboutPage = location.pathname.startsWith('/pilot/about');
  const [aboutOpen, setAboutOpen] = useLocalStorage('pilot-about-section-open', true);

  useEffect(() => {
    if (isOnAboutPage && !aboutOpen) {
      setAboutOpen(true);
    }
  }, [isOnAboutPage]);

  return (
    <nav className="pilot-sidebar govuk-!-margin-top-6" aria-label="Pilot navigation">
      <ul className="govuk-list govuk-list--spaced">
        <li>
          <Link to="/pilot" className={location.pathname === '/pilot' ? 'govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold' : 'govuk-link govuk-link--no-visited-state'}>
            Dashboard
          </Link>
        </li>
        <li>
          <details className="govuk-details govuk-!-margin-bottom-0" open={aboutOpen}>
            <summary
              className="govuk-details__summary"
              onClick={(e) => {
                e.preventDefault();
                setAboutOpen(!aboutOpen);
              }}
            >
              <span className="govuk-details__summary-text govuk-!-font-weight-bold">About the Pilot</span>
            </summary>
            <div className="govuk-details__text govuk-!-padding-top-2">
              <ul className="govuk-list govuk-list--spaced">
                <AboutSectionLinks />
              </ul>
            </div>
          </details>
        </li>
      </ul>
    </nav>
  );
};

export default PilotSidebar;
