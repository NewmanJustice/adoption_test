import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pilotSpecificationData, PilotSection } from '../../data/pilotSpecification';

function renderSectionLinks(
  nodes: PilotSection[],
  location: ReturnType<typeof useLocation>,
  parentPath = '/pilot/about',
  depth = 0
) {
  return nodes.map((section) => {
    const sectionPath = `${parentPath}/${section.id}`;
    return (
      <React.Fragment key={section.id}>
        <li style={{ marginLeft: depth * 16 }}>
          <Link
            to={sectionPath}
            className={location.pathname === sectionPath ? 'govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold' : 'govuk-link govuk-link--no-visited-state'}
          >
            {section.title}
          </Link>
        </li>
        {section.children && section.children.length > 0 && (
          renderSectionLinks(section.children, location, sectionPath, depth + 1)
        )}
      </React.Fragment>
    );
  });
}

export const AboutSectionLinks: React.FC = () => {
  const location = useLocation();

  if (!pilotSpecificationData.length) return null;

  return <>{renderSectionLinks(pilotSpecificationData, location)}</>;
};

