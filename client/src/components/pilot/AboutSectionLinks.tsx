import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pilotSpecificationData } from '../../data/pilotSpecification';

export const AboutSectionLinks: React.FC = () => {
  const location = useLocation();

  if (!pilotSpecificationData.length) return null;

  return (
    <>
      {pilotSpecificationData.map((section) => {
        const sectionPath = `/pilot/about/${section.id}`;
        const isActive = location.pathname === sectionPath;
        
        return (
          <li key={section.id} className="govuk-!-margin-bottom-2">
            <Link
              to={sectionPath}
              className={isActive ? 'govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold' : 'govuk-link govuk-link--no-visited-state'}
            >
              {section.title}
            </Link>
          </li>
        );
      })}
    </>
  );
};

