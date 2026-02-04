import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';

interface SessionData {
  authenticated: boolean;
  user?: {
    username: string;
    role: string;
  };
  authMode: string;
}

interface AdopterCase {
  id: string;
  caseNumber: string;
  caseRef?: string;
  status: string;
  createdAt: string;
  childName?: string;
}

interface CaseListResponse {
  cases: AdopterCase[];
  pagination: {
    total: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  APPLICATION: 'Application received',
  DIRECTIONS: 'Under review',
  CONSENT_AND_REPORTING: 'Consent and reporting',
  FINAL_HEARING: 'Final hearing scheduled',
  ORDER_GRANTED: 'Adoption order granted',
  APPLICATION_REFUSED: 'Application not approved',
  APPLICATION_WITHDRAWN: 'Application withdrawn',
  ON_HOLD: 'On hold',
  ADJOURNED: 'Adjourned',
};

const MyCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [cases, setCases] = useState<AdopterCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session?.authenticated) {
      if (session.user?.role !== 'adopter' && session.user?.role !== 'ADOPTER') {
        navigate('/dashboard');
        return;
      }
      fetchCases();
    }
  }, [session]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      const data = await response.json();
      setSession(data);

      if (!data.authenticated) {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    setCasesLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cases', {
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load cases');
      }

      const data: CaseListResponse = await response.json();
      setCases(data.cases || []);
    } catch {
      setError('Unable to load your applications. Please try again.');
      setCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/');
    } catch {
      console.error('Logout failed');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body" aria-live="polite">Loading...</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />

        {session?.authMode === 'mock' && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="region" aria-labelledby="mock-auth-title">
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title" id="mock-auth-title">
                Mock Authentication Active
              </h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                Signed in as: <strong>{session.user?.username}</strong>
              </p>
            </div>
          </div>
        )}

        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Your adoption application</h1>

          <p className="govuk-body-l">
            Welcome, {session?.user?.username}. Here you can view the status of your adoption application.
          </p>

          <p className="govuk-body">
            If you have questions, contact your social worker.
          </p>

          {casesLoading && (
            <div className="govuk-inset-text" aria-live="polite">
              <p className="govuk-body">Loading your applications...</p>
            </div>
          )}

          {error && (
            <div className="govuk-inset-text">
              <p className="govuk-body">{error}</p>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={fetchCases}
              >
                Try again
              </button>
            </div>
          )}

          {!casesLoading && !error && cases.length === 0 && (
            <EmptyState variant="adopter-empty" />
          )}

          {!casesLoading && !error && cases.length > 0 && (
            <div className="govuk-summary-card-container">
              {cases.map((caseItem) => (
                <div key={caseItem.id} className="govuk-summary-card">
                  <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title">
                      Application {caseItem.caseRef || caseItem.caseNumber}
                    </h2>
                    <ul className="govuk-summary-card__actions">
                      <li className="govuk-summary-card__action">
                        <Link to={`/my-cases/${caseItem.id}`} className="govuk-link">
                          View details<span className="govuk-visually-hidden"> for {caseItem.caseRef || caseItem.caseNumber}</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="govuk-summary-card__content">
                    <dl className="govuk-summary-list">
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Application reference</dt>
                        <dd className="govuk-summary-list__value">{caseItem.caseRef || caseItem.caseNumber}</dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Status</dt>
                        <dd className="govuk-summary-list__value">
                          {STATUS_LABELS[caseItem.status] || caseItem.status}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Submitted</dt>
                        <dd className="govuk-summary-list__value">{formatDate(caseItem.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">Need help?</h2>
          <p className="govuk-body">
            If you have questions about your adoption application, please contact your social worker. They are here to support you through the process.
          </p>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default MyCasesPage;
