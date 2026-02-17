import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { pilotSpecificationData, PilotSection } from '../data/pilotSpecification';
import PilotSidebar from '../components/pilot/PilotSidebar';

const AboutPilotPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!sectionId && pilotSpecificationData.length > 0) {
      navigate(`/pilot/about/${pilotSpecificationData[0].id}`, { replace: true });
    }
  }, [sectionId, navigate]);

  function findSectionById(nodes: PilotSection[], id?: string): PilotSection | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findSectionById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  const current = findSectionById(pilotSpecificationData, sectionId) || pilotSpecificationData[0];

  if (!current) return null;

  return (
    <div className="govuk-width-container govuk-grid-row govuk-!-margin-top-6">
      <div className="govuk-grid-column-one-quarter">
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
