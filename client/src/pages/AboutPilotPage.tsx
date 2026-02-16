import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { splitMarkdownSections } from './markdownSectionUtils';
import PilotSidebar from '../components/pilot/PilotSidebar';

const AboutPilotPage: React.FC = () => {
  const [sections, setSections] = React.useState<{ id: string; title: string; content: string }[]>([]);
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('/api/static/pilot-spec')
      .then((res) => res.text())
      .then((md) => {
        const secs = splitMarkdownSections(md);
        setSections(secs);
        if (!sectionId && secs.length > 0) {
          navigate(`/pilot/about/${secs[0].id}`, { replace: true });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = sections.find((s) => s.id === sectionId) || sections[0];

  if (!current) return null;

  return (
    <div className="govuk-width-container govuk-grid-row govuk-!-margin-top-6">
      <div className="govuk-grid-column-one-quarter">
        {/* Sidebar navigation for About the Pilot */}
        <PilotSidebar />
      </div>
      <div className="govuk-grid-column-three-quarters">
        <h1 className="govuk-heading-xl">{current.title}</h1>
        <ReactMarkdown>{current.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default AboutPilotPage;
