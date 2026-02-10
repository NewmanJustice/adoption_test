import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

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

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: sessionLoading } = useSession();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchCase();
    }
  }, [isAuthenticated, id]);

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

  if (sessionLoading) {
    return <p className="govuk-body">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <p className="govuk-body">Loading...</p>;
  }

  if (accessDenied) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Access denied</h1>
          <p className="govuk-body">You do not have permission to view this case.</p>
          <Link to="/dashboard" className="govuk-link">Back to cases</Link>
        </main>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Error</h1>
          <p className="govuk-body">{error || 'Case not found'}</p>
          <Link to="/dashboard" className="govuk-link">Back to cases</Link>
        </main>
      </div>
    );
  }

  const canUpdateStatus = user?.role === 'HMCTS_CASE_OFFICER' || user?.role === 'JUDGE_LEGAL_ADVISER';
  const isProfessional = user?.role !== 'ADOPTER';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="govuk-width-container">
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
  );
};

export default CaseDetailPage;
