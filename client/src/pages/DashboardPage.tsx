import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';

interface SessionData {
  authenticated: boolean;
  user?: {
    username: string;
    role: string;
  };
  authMode: string;
}

const ROLE_LABELS: Record<string, string> = {
  hmcts_case_officer: 'HMCTS Case Officer',
  judge: 'Judge / Legal Adviser',
  cafcass_officer: 'Cafcass Officer',
  la_social_worker: 'Local Authority Social Worker',
  vaa_worker: 'Voluntary Adoption Agency Worker',
  adopter: 'Adopter',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

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
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body">Loading...</p>
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

        {/* Mock Auth Indicator */}
        {session?.authMode === 'mock' && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="region" aria-labelledby="mock-auth-title">
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title" id="mock-auth-title">
                Mock Authentication Active
              </h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                Signed in as: <strong>{session.user?.username}</strong> ({ROLE_LABELS[session.user?.role || ''] || session.user?.role})
              </p>
            </div>
          </div>
        )}

        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Dashboard</h1>

          <p className="govuk-body-l">
            Welcome, {session?.user?.username}. You are signed in as a {ROLE_LABELS[session?.user?.role || ''] || session?.user?.role}.
          </p>

          <h2 className="govuk-heading-m">Quick actions</h2>

          <ul className="govuk-list">
            <li>
              <a href="/cases" className="govuk-link">View cases</a>
            </li>
            {session?.user?.role === 'HMCTS_CASE_OFFICER' && (
              <li>
                <a href="/cases/create" className="govuk-link">Create new case</a>
              </li>
            )}
            <li>
              <a href="#" className="govuk-link">Upload documents (coming soon)</a>
            </li>
          </ul>

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

export default DashboardPage;
