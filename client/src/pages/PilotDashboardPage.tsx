import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import PilotFilters from '../components/pilot/PilotFilters';
import PilotSummaryCards from '../components/pilot/PilotSummaryCards';
import PilotTrendTable from '../components/pilot/PilotTrendTable';
import PilotCompletenessIndicator from '../components/pilot/PilotCompletenessIndicator';
import { useSession } from '../context/SessionContext';
import { PilotDashboardFilters, PilotDashboardResponse, PilotCompareSummary } from '@adoption/shared';

const defaultFilters: PilotDashboardFilters = {
  dateFrom: '',
  dateTo: '',
  phase: undefined,
  loop: 1,
  experimentType: 'pilot',
  compare: false,
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
  const isBuilder = user?.role === 'PILOT_BUILDER';

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
      <div className="govuk-width-container">
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
            {canWrite && (
              <Link to="/pilot/metrics" className="govuk-button govuk-button--secondary">
                Add metric entry
              </Link>
            )}
          </div>

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
              {dashboard.compare?.warning && (
                <p className="govuk-body govuk-!-margin-top-3">{dashboard.compare.warning}</p>
              )}
              {dashboard.compare?.summaries && (
                <CompareSummaryTable summaries={dashboard.compare.summaries} />
              )}
              <h2 className="govuk-heading-l govuk-!-margin-top-6">Pilot trends</h2>
              <PilotTrendTable trends={dashboard.trends} />
              {dashboard.compare?.trends && (
                <section className="govuk-!-margin-top-6">
                  <h3 className="govuk-heading-m">Control trends</h3>
                  <PilotTrendTable trends={dashboard.compare.trends} />
                </section>
              )}
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
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

const CompareSummaryTable: React.FC<{ summaries: PilotCompareSummary[] }> = ({ summaries }) => {
  return (
    <table className="govuk-table govuk-!-margin-top-4">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th className="govuk-table__header">Metric</th>
          <th className="govuk-table__header">Pilot</th>
          <th className="govuk-table__header">Control</th>
          <th className="govuk-table__header">Delta</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {summaries.map((summary) => (
          <tr key={summary.metricKey} className="govuk-table__row">
            <td className="govuk-table__cell">{summary.metricKey.replace(/_/g, ' ')}</td>
            <td className="govuk-table__cell">{formatValue(summary.pilotValue, summary.unit)}</td>
            <td className="govuk-table__cell">{formatValue(summary.controlValue, summary.unit)}</td>
            <td className="govuk-table__cell">{formatDelta(summary.delta, summary.direction)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function buildQuery(filters: PilotDashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.phase) params.set('phase', filters.phase);
  if (filters.loop) params.set('loop', String(filters.loop));
  if (filters.experimentType) params.set('experimentType', filters.experimentType);
  if (filters.compare) params.set('compare', 'true');
  return params.toString();
}

function formatValue(value: number | null, unit: string): string {
  return value === null ? '—' : `${value} ${unit}`;
}

function formatDelta(delta: number | null, direction: string | null): string {
  if (delta === null) return '—';
  const indicator = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  return `${indicator} ${delta}`;
}

export default PilotDashboardPage;
