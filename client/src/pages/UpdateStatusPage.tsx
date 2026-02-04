import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface CaseDetail {
  id: string;
  caseNumber: string;
  status: string;
}

interface StatusResponse {
  case: CaseDetail;
  validTransitions: string[];
}

const STATUS_LABELS: Record<string, string> = {
  APPLICATION: 'Application',
  DIRECTIONS: 'Directions',
  PLACEMENT_HEARING: 'Placement hearing',
  FINAL_HEARING: 'Final hearing',
  ORDER_GRANTED: 'Order granted',
  ORDER_REFUSED: 'Order refused',
  APPLICATION_WITHDRAWN: 'Application withdrawn',
  ON_HOLD: 'On hold',
};

const STATUSES_REQUIRING_REASON = ['ON_HOLD', 'APPLICATION_WITHDRAWN'];

const UpdateStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [validTransitions, setValidTransitions] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchCaseStatus();
    }
  }, [isAuthenticated, id]);

  const fetchCaseStatus = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Failed to load case');
        return;
      }

      const data: StatusResponse = await response.json();
      setCaseData(data.case);
      setValidTransitions(data.validTransitions || []);
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

  if (error || !caseData) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Error</h1>
          <p className="govuk-body">{error || 'Case not found'}</p>
          <Link to="/cases" className="govuk-link">Back to cases</Link>
        </main>
      </div>
    );
  }

  const validate = (): string | null => {
    if (!selectedStatus) {
      return 'Select a new status';
    }

    if (STATUSES_REQUIRING_REASON.includes(selectedStatus) && !notes.trim()) {
      return 'Reason is required for this status change';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setConflictError(null);

    try {
      const response = await fetch(`/api/cases/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.status === 409) {
        const data = await response.json();
        setConflictError(data.error || 'Case status has changed. Please refresh and try again.');
        return;
      }

      if (response.ok) {
        navigate(`/cases/${id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update status');
      }
    } catch {
      setError('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <Link to={`/cases/${id}`} className="govuk-back-link">Back</Link>

        <h1 className="govuk-heading-xl">Update case status</h1>

        <p className="govuk-body">
          <strong>Current status:</strong> <span>{caseData.status}</span>
        </p>

        {(error || conflictError) && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>
                  <a href="#newStatus">{conflictError || error}</a>
                </li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={`govuk-form-group ${error && !selectedStatus ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                Select new status
              </legend>
              {error && !selectedStatus && (
                <p className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {error}
                </p>
              )}
              <div className="govuk-radios" data-module="govuk-radios" id="newStatus">
                {validTransitions.map((status) => (
                  <div className="govuk-radios__item" key={status}>
                    <input
                      className="govuk-radios__input"
                      id={`status-${status}`}
                      name="status"
                      type="radio"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={`status-${status}`}>
                      {STATUS_LABELS[status] || status}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div className={`govuk-form-group ${error && STATUSES_REQUIRING_REASON.includes(selectedStatus) && !notes.trim() ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-label--m" htmlFor="notes">
              Notes
            </label>
            <div className="govuk-hint">
              {STATUSES_REQUIRING_REASON.includes(selectedStatus)
                ? 'Required: Please provide a reason for this status change.'
                : 'Optional: Add any notes about this status change.'}
            </div>
            {error && STATUSES_REQUIRING_REASON.includes(selectedStatus) && !notes.trim() && (
              <p className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {error}
              </p>
            )}
            <textarea
              className="govuk-textarea"
              id="notes"
              name="notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="govuk-button-group">
            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update status'}
            </button>
            <Link to={`/cases/${id}`} className="govuk-link">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UpdateStatusPage;
