import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface SectionTrend {
  section: string;
  structuralScore: number | null;
  clarityScore: number | null;
  alignmentIndex: number | null;
  alignmentSuppressed: boolean;
}

interface TrendWindow {
  windowStart: string;
  sections: SectionTrend[];
}

interface Signal {
  type: string;
  section: string;
  severity: 'red' | 'amber';
  message: string;
}

interface TrendsData {
  trendInferenceSuppressed: boolean;
  windows: TrendWindow[];
  signals: Signal[];
}

function formatScore(value: number | null): string {
  return value === null ? 'N/A' : String(value);
}

const PilotPulseTrendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user?.role?.startsWith('PILOT_')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchTrends();
  }, [loading, user]);

  const fetchTrends = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const response = await fetch('/api/pilot/pulse/trends', { credentials: 'include' });
      if (!response.ok) throw new Error('fetch failed');
      const data = await response.json();
      setTrends(data.data);
    } catch {
      setError('Unable to load trend data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <p className="govuk-body">Loading...</p>;
  }

  if (error) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <p className="govuk-body govuk-error-message">{error}</p>
        </main>
      </div>
    );
  }

  if (!trends) return null;

  const { trendInferenceSuppressed, windows, signals } = trends;

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <h1 className="govuk-heading-xl">Structural Trends</h1>

        {signals.length > 0 && (
          <section aria-label="Governance signals">
            {signals.map((signal, i) => (
              signal.severity === 'red' ? (
                <div key={i} className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-visually-hidden">Warning</span>
                    <span>{signal.section}: </span><span>{signal.message}</span>
                  </strong>
                </div>
              ) : (
                <div key={i} className="govuk-inset-text" style={{ borderLeftColor: '#f47738' }}>
                  <p className="govuk-body"><strong>{signal.section}</strong></p>
                  <p className="govuk-body">{signal.message}</p>
                </div>
              )
            ))}
          </section>
        )}

        {trendInferenceSuppressed ? (
          <div className="govuk-inset-text">
            <p className="govuk-body">
              Insufficient data for trend inference. At least 3 pulse windows are needed before trends can be displayed.
            </p>
          </div>
        ) : (
          <>
            <table className="govuk-table">
              <caption className="govuk-table__caption">Pulse trend data</caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Window Start</th>
                  <th scope="col" className="govuk-table__header">Section</th>
                  <th scope="col" className="govuk-table__header">Structural Score</th>
                  <th scope="col" className="govuk-table__header">Clarity Score</th>
                  <th scope="col" className="govuk-table__header">Alignment Index</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {windows.flatMap((w) =>
                  w.sections.map((s) => (
                    <tr key={`row-${w.windowStart}-${s.section}`} className="govuk-table__row">
                      <td className="govuk-table__cell">{new Date(w.windowStart).toLocaleDateString('en-GB')}</td>
                      <td className="govuk-table__cell">{s.section}</td>
                      <td className="govuk-table__cell">{formatScore(s.structuralScore)}</td>
                      <td className="govuk-table__cell">{formatScore(s.clarityScore)}</td>
                      <td className="govuk-table__cell">{formatScore(s.alignmentIndex)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
};

export default PilotPulseTrendsPage;
