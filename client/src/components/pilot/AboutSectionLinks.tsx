import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const AboutSectionLinks: React.FC = () => {
  const location = useLocation();
  const [sections, setSections] = React.useState<{ id: string; title: string }[]>([]);

  React.useEffect(() => {
    fetch('/api/static/pilot-spec')
      .then((res) => res.text())
      .then((md) => {
        const matches = Array.from(md.matchAll(/^# (.+)$/gm));
        setSections(matches.map((m) => ({
          id: m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          title: m[1],
        })));
      });
  }, []);

  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => (
        <li key={section.id}>
          <Link
            to={`/pilot/about/${section.id}`}
            className={location.pathname === `/pilot/about/${section.id}` ? 'govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold' : 'govuk-link govuk-link--no-visited-state'}
          >
            {section.title}
          </Link>
        </li>
      ))}
    </>
  );
};
