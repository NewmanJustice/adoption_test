import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adoptionVisionData } from '../../data/adoptionVisionData';

export const VisionSectionLinks: React.FC = () => {
  const location = useLocation();

  if (!adoptionVisionData.length) return null;

  return (
    <>
      {adoptionVisionData.map((section) => {
        const sectionPath = `/pilot/vision/${section.id}`;
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
