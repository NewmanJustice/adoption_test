import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DOCUMENT_TYPE_LABELS } from '@adoption/shared/constants/documentTypes';
import { useSession } from '../context/SessionContext';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';

interface HistoryEntry {
  from: string | null;
  to: string;
  at: string;
  by: string;
}

interface CaseDetail {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  assignedCourt: string;
  linkedFamilyCourtCaseReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  history?: HistoryEntry[];
}

interface DocumentSummary {
  id: string;
  originalFilename: string;
  documentType: string;
  uploadedAt: string;
  uploadedBy: string;
  ocrStatus: string;
  virusScanStatus: string;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: sessionLoading } = useSession();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchCase();
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchDocuments();
    }
  }, [isAuthenticated, id, documentTypeFilter]);

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        credentials: 'include',
      });

      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }

      if (!response.ok) {
        setError('Failed to load case');
        return;
      }

      const data = await response.json();
      setCaseData(data);
    } catch {
      setError('Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const params = new URLSearchParams();
      if (documentTypeFilter) {
        params.set('documentType', documentTypeFilter);
      }

      const query = params.toString();
      const response = await fetch(`/api/cases/${id}/documents${query ? `?${query}` : ''}`, {
        credentials: 'include',
      });

      if (response.status === 403) {
        setDocumentsError('You do not have permission to view documents for this case.');
        setDocuments([]);
        return;
      }

      if (!response.ok) {
        setDocumentsError('Failed to load documents');
        setDocuments([]);
        return;
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch {
      setDocumentsError('Failed to load documents');
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body">Loading...</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body">Loading...</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (accessDenied) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Access denied</h1>
            <p className="govuk-body">You do not have permission to view this case.</p>
            <Link to="/dashboard" className="govuk-link">Back to cases</Link>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !caseData) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Error</h1>
            <p className="govuk-body">{error || 'Case not found'}</p>
            <Link to="/dashboard" className="govuk-link">Back to cases</Link>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  const canUpdateStatus = user?.role === 'HMCTS_CASE_OFFICER' || user?.role === 'JUDGE_LEGAL_ADVISER';
  const isProfessional = user?.role !== 'ADOPTER';
  const canUploadDocuments = !!user && [
    'HMCTS_CASE_OFFICER',
    'LA_SOCIAL_WORKER',
    'CAFCASS_OFFICER',
    'VAA_WORKER',
    'ADOPTER'
  ].includes(user.role);

  const formatDate = (dateValue: string | Date) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatOcrStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: 'OCR pending',
      processing: 'OCR processing',
      complete: 'OCR complete',
      failed: 'OCR failed',
      'not-applicable': 'OCR not required'
    };
    return map[status] || status;
  };

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <Link to="/dashboard" className="govuk-back-link">Back to cases</Link>

          <h1 className="govuk-heading-xl">{caseData.caseNumber}</h1>

        {canUpdateStatus && (
          <Link to={`/cases/${id}/status`} className="govuk-button govuk-button--secondary">
            Update status
          </Link>
        )}

        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Case type</dt>
            <dd className="govuk-summary-list__value">{caseData.caseType}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Status</dt>
            <dd className="govuk-summary-list__value">{caseData.status}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Assigned court</dt>
            <dd className="govuk-summary-list__value">{caseData.assignedCourt}</dd>
          </div>
          {isProfessional && caseData.linkedFamilyCourtCaseReference && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Linked reference</dt>
              <dd className="govuk-summary-list__value">{caseData.linkedFamilyCourtCaseReference}</dd>
            </div>
          )}
          {isProfessional && caseData.notes && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Notes</dt>
              <dd className="govuk-summary-list__value">{caseData.notes}</dd>
            </div>
          )}
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Created</dt>
            <dd className="govuk-summary-list__value">{formatDate(caseData.createdAt)}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Last updated</dt>
            <dd className="govuk-summary-list__value">{formatDate(caseData.updatedAt)}</dd>
          </div>
        </dl>

        <section className="govuk-!-margin-top-6">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">Documents</h2>
              {canUploadDocuments && (
                <Link to={`/cases/${id}/upload-document`} className="govuk-button">
                  Upload document
                </Link>
              )}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="documentTypeFilter">
                  Filter by document type
                </label>
                <select
                  className="govuk-select"
                  id="documentTypeFilter"
                  name="documentTypeFilter"
                  value={documentTypeFilter}
                  onChange={(event) => setDocumentTypeFilter(event.target.value)}
                >
                  <option value="">All document types</option>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {documentsLoading && (
                <p className="govuk-body">Loading documents...</p>
              )}

              {documentsError && (
                <p className="govuk-body">{documentsError}</p>
              )}

              {!documentsLoading && !documentsError && documents.length === 0 && (
                <p className="govuk-body">No documents have been uploaded for this case yet.</p>
              )}

              {!documentsLoading && !documentsError && documents.length > 0 && (
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">Document</th>
                      <th scope="col" className="govuk-table__header">Type</th>
                      <th scope="col" className="govuk-table__header">Uploaded</th>
                      <th scope="col" className="govuk-table__header">Uploaded by</th>
                      <th scope="col" className="govuk-table__header">OCR status</th>
                      <th scope="col" className="govuk-table__header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="govuk-table__row">
                        <td className="govuk-table__cell">{doc.originalFilename}</td>
                        <td className="govuk-table__cell">
                          {DOCUMENT_TYPE_LABELS[doc.documentType as keyof typeof DOCUMENT_TYPE_LABELS] || doc.documentType}
                        </td>
                        <td className="govuk-table__cell">{formatDate(doc.uploadedAt)}</td>
                        <td className="govuk-table__cell">{doc.uploadedBy}</td>
                        <td className="govuk-table__cell">{formatOcrStatus(doc.ocrStatus)}</td>
                        <td className="govuk-table__cell">
                          {doc.virusScanStatus === 'infected' ? (
                            <span>Virus detected</span>
                          ) : (
                            <a className="govuk-link" href={`/api/documents/${doc.id}/download`}>
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {caseData.history && caseData.history.length > 0 && (
          <>
            <h2 className="govuk-heading-m">Case history</h2>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Date</th>
                  <th scope="col" className="govuk-table__header">From</th>
                  <th scope="col" className="govuk-table__header">To</th>
                  <th scope="col" className="govuk-table__header">By</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {caseData.history.map((entry, index) => (
                  <tr key={index} className="govuk-table__row">
                    <td className="govuk-table__cell">{formatDate(entry.at)}</td>
                    <td className="govuk-table__cell">{entry.from || '-'}</td>
                    <td className="govuk-table__cell">{entry.to}</td>
                    <td className="govuk-table__cell">{entry.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default CaseDetailPage;
