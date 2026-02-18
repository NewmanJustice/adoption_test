import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PilotSidebar from '../components/pilot/PilotSidebar';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import PilotFilters from '../components/pilot/PilotFilters';
import PilotSummaryCards from '../components/pilot/PilotSummaryCards';
import PilotTrendTable from '../components/pilot/PilotTrendTable';
import PilotCompletenessIndicator from '../components/pilot/PilotCompletenessIndicator';
import PilotGuidancePanel from '../components/pilot/PilotGuidancePanel';
import PilotOutcomeSummaryPanel from '../components/pilot/PilotOutcomeSummary';
import { useSession } from '../context/SessionContext';
import { PilotDashboardFilters, PilotDashboardResponse, PilotRole } from '@adoption/shared';

const defaultFilters: PilotDashboardFilters = {
  dateFrom: '',
  dateTo: '',
  phase: undefined,
  loop: 1,

};

const PilotDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSession();
  const [filters, setFilters] = useState<PilotDashboardFilters>(defaultFilters);
  const [dashboard, setDashboard] = useState<PilotDashboardResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard(filters);
    }
  }, [filters, isAuthenticated]);

  const fetchDashboard = async (nextFilters: PilotDashboardFilters) => {
    setLoadingData(true);
    setError(null);
    try {
      const response = await fetch(`/api/pilot/dashboard?${buildQuery(nextFilters)}`, {
        credentials: 'include',
      });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }
      const data: PilotDashboardResponse = await response.json();
      setDashboard(data);
    } catch {
      setError('Unable to load pilot dashboard.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleClear = () => {
    setFilters({ ...defaultFilters });
  };

  const canWrite = user?.role === 'PILOT_BUILDER' || user?.role === 'PILOT_DELIVERY_LEAD';
  const isSME = user?.role === 'PILOT_SME';
  const isBuilder = user?.role === 'PILOT_BUILDER';
  
  const isPilotRole = (role: string): role is PilotRole => {
    return ['PILOT_BUILDER', 'PILOT_SME', 'PILOT_DELIVERY_LEAD', 'PILOT_OBSERVER'].includes(role);
  };
  
  const pilotRole = user?.role && isPilotRole(user.role) ? user.role : undefined;

  if (loading) {
    return (
      <div className="govuk-width-container">
        <p className="govuk-body">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <PilotSidebar />
        </div>
        <div className="govuk-grid-column-three-quarters">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Adoption Pilot Dashboard</h1>
          <p className="govuk-body">Signed in as {user?.username} ({user?.role}).</p>
          <div className="govuk-button-group">
            {isBuilder && (
              <Link to="/pilot/config" className="govuk-button govuk-button--secondary">
                Configure pilot
              </Link>
            )}
            {(canWrite || isSME) && (
              <Link to="/pilot/metrics" className="govuk-button govuk-button--secondary">
                Add metric entry
              </Link>
            )}
          </div>

          <PilotGuidancePanel role={pilotRole} />

          <PilotFilters
            filters={filters}
            onChange={setFilters}
            onApply={() => fetchDashboard(filters)}
            onClear={handleClear}
          />

          {loadingData && <p className="govuk-body">Loading dashboard...</p>}
          {error && <p className="govuk-body govuk-error-message">{error}</p>}

          {dashboard && !loadingData && !error && (
            <>
              <PilotCompletenessIndicator
                score={dashboard.completeness.score}
                missingMetricKeys={dashboard.completeness.missingMetricKeys}
              />
              <PilotSummaryCards summaries={dashboard.summary} />
              <h2 className="govuk-heading-l govuk-!-margin-top-6">Pilot trends</h2>
              <PilotTrendTable trends={dashboard.trends} />
              {dashboard.deviations.length > 0 && (
                <section className="govuk-!-margin-top-6">
                  <h2 className="govuk-heading-m">Spec Freeze deviations</h2>
                  <ul className="govuk-list govuk-list--bullet">
                    {dashboard.deviations.map((deviation) => (
                      <li key={deviation.id}>
                        {deviation.description} ({new Date(deviation.createdAt).toLocaleDateString('en-GB')})
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {dashboard.outcomeSummary?.length > 0 && (
                <PilotOutcomeSummaryPanel outcomes={dashboard.outcomeSummary} />
              )}
            </>
          )}
        </main>
        </div>
      </div>
      <Footer />
    </>
  );
};


function buildQuery(filters: PilotDashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.phase) params.set('phase', filters.phase);
  if (filters.loop) params.set('loop', String(filters.loop));

  return params.toString();
}


export default PilotDashboardPage;
