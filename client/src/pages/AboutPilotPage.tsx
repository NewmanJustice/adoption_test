import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { pilotSpecificationData } from '../data/pilotSpecification';
import PilotSidebar from '../components/pilot/PilotSidebar';

const AboutPilotPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!sectionId && pilotSpecificationData.length > 0) {
      navigate(`/pilot/about/${pilotSpecificationData[0].id}`, { replace: true });
    }
  }, [sectionId, navigate]);

  const current = pilotSpecificationData.find(section => section.id === sectionId) || pilotSpecificationData[0];

  if (!current) return null;

  return (
    <div className="govuk-width-container govuk-grid-row govuk-!-margin-top-6">
      <div className="govuk-grid-column-one-quarter">
        <PilotSidebar />
      </div>
      <div className="govuk-grid-column-three-quarters">
        <h1 className="govuk-heading-xl">{current.title}</h1>
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="govuk-heading-xl" {...props} />,
            h2: ({node, ...props}) => <h2 className="govuk-heading-l" {...props} />,
            h3: ({node, ...props}) => <h3 className="govuk-heading-m" {...props} />,
            p: ({node, ...props}) => <p className="govuk-body" {...props} />,
            ul: ({node, ...props}) => <ul className="govuk-list govuk-list--bullet" {...props} />,
            ol: ({node, ...props}) => <ol className="govuk-list govuk-list--number" {...props} />,
            strong: ({node, ...props}) => <strong className="govuk-!-font-weight-bold" {...props} />
          }}
        >
          {current.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AboutPilotPage;
