import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { adoptionVisionData } from '../data/adoptionVisionData';
import PilotSidebar from '../components/pilot/PilotSidebar';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';

const AdoptionVisionPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!sectionId && adoptionVisionData.length > 0) {
      navigate(`/pilot/vision/${adoptionVisionData[0].id}`, { replace: true });
    }
  }, [sectionId, navigate]);

  const current = adoptionVisionData.find(section => section.id === sectionId) || adoptionVisionData[0];

  if (!current) return null;

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-one-quarter">
            <PilotSidebar />
          </div>
          <div className="govuk-grid-column-three-quarters">
            <main className="govuk-main-wrapper" id="main-content" role="main">
              <h1 className="govuk-heading-xl">{current.title}</h1>
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="govuk-heading-xl" {...props} />,
                  h2: ({node, ...props}) => <h2 className="govuk-heading-l" {...props} />,
                  h3: ({node, ...props}) => <h3 className="govuk-heading-m" {...props} />,
                  h4: ({node, ...props}) => <h4 className="govuk-heading-s" {...props} />,
                  p: ({node, ...props}) => <p className="govuk-body" {...props} />,
                  ul: ({node, ...props}) => <ul className="govuk-list govuk-list--bullet" {...props} />,
                  ol: ({node, ...props}) => <ol className="govuk-list govuk-list--number" {...props} />,
                  strong: ({node, ...props}) => <strong className="govuk-!-font-weight-bold" {...props} />,
                  table: ({node, ...props}) => <table className="govuk-table" {...props} />,
                  thead: ({node, ...props}) => <thead className="govuk-table__head" {...props} />,
                  tbody: ({node, ...props}) => <tbody className="govuk-table__body" {...props} />,
                  tr: ({node, ...props}) => <tr className="govuk-table__row" {...props} />,
                  th: ({node, ...props}) => <th className="govuk-table__header" {...props} />,
                  td: ({node, ...props}) => <td className="govuk-table__cell" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="govuk-inset-text" {...props} />,
                }}
              >
                {current.content}
              </ReactMarkdown>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdoptionVisionPage;
