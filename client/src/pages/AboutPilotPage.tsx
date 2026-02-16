import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { parseMarkdownSections, MarkdownSectionNode } from './markdownSectionUtils';
import PilotSidebar from '../components/pilot/PilotSidebar';

const AboutPilotPage: React.FC = () => {
  const [sections, setSections] = React.useState<MarkdownSectionNode[]>([]);
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('/api/static/pilot-spec')
      .then((res) => res.text())
      .then((md) => {
        const secs = parseMarkdownSections(md);
        setSections(secs);
        if (!sectionId && secs.length > 0) {
          navigate(`/pilot/about/${secs[0].id}`, { replace: true });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function findSectionById(nodes: MarkdownSectionNode[], id?: string): MarkdownSectionNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findSectionById(node.children, id);
    if (found) return found;
  }
  return undefined;
}

const current = findSectionById(sections, sectionId) || sections[0];

if (!current) return null;

return (
  <div className="govuk-width-container govuk-grid-row govuk-!-margin-top-6">
    <div className="govuk-grid-column-one-quarter">
      {/* Sidebar navigation for About the Pilot */}
      <PilotSidebar />
    </div>
    <div className="govuk-grid-column-three-quarters">
      <h1 className="govuk-heading-xl">{current.title}</h1>
      <ReactMarkdown>{current.content.filter(Boolean).join('\n')}</ReactMarkdown>
    </div>
  </div>
);
};

export default AboutPilotPage;
