import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import { useSession } from '../context/SessionContext';
import { PilotConfiguration, PilotLifecycleState } from '@adoption/shared';

const PilotConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSession();
  const [config, setConfig] = useState<PilotConfiguration | null>(null);
  const [phase, setPhase] = useState<PilotLifecycleState | null>(null);
  const [domainScope, setDomainScope] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOverview();
    }
  }, [isAuthenticated]);

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/pilot/overview', { credentials: 'include' });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      setConfig(data.config || null);
      setPhase(data.phase || null);
    } catch {
      setError('Unable to load pilot configuration.');
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await fetch('/api/pilot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domainScope }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Unable to save configuration.');
        return;
      }
      await fetchOverview();
    } catch {
      setError('Unable to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSpecFreeze = async () => {
    setError(null);
    try {
      const response = await fetch('/api/pilot/spec-freeze', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Unable to record Spec Freeze.');
        return;
      }
      await fetchOverview();
    } catch {
      setError('Unable to record Spec Freeze.');
    }
  };

  const isBuilder = user?.role === 'PILOT_BUILDER';

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Pilot configuration</h1>
          {error && <p className="govuk-error-message">{error}</p>}

          {config ? (
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__content">
                <p className="govuk-body"><strong>Domain scope:</strong> {config.domainScope}</p>

                {phase && (
                  <p className="govuk-body">
                    <strong>Phase:</strong> {phase.phaseLabel} {phase.specFreezeAt ? '(Spec Freeze set)' : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="govuk-body">No pilot configuration has been set.</p>
          )}

          {isBuilder && !config && (
            <form onSubmit={handleCreate} className="govuk-!-margin-top-4">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="domainScope">Domain scope</label>
                <input
                  className="govuk-input"
                  id="domainScope"
                  value={domainScope}
                  onChange={(event) => setDomainScope(event.target.value)}
                />
              </div>

              <button className="govuk-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save configuration'}
              </button>
            </form>
          )}

          {isBuilder && config && !phase?.specFreezeAt && (
            <button className="govuk-button govuk-button--secondary" onClick={handleSpecFreeze}>
              Record Spec Freeze
            </button>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PilotConfigPage;
