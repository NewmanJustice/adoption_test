import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import { useSession } from '../context/SessionContext';
import { PilotPhase } from '@adoption/shared';

const PilotMetricEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSession();
  const [metricKey, setMetricKey] = useState('structural_integrity');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('score');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [phase, setPhase] = useState<PilotPhase>('PHASE_1');
  const [experimentType, setExperimentType] = useState('pilot');
  const [loop, setLoop] = useState(1);
  const [noteEntryId, setNoteEntryId] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const response = await fetch('/api/pilot/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        metricKey,
        value: Number(value),
        unit,
        date,
        phase,
        experimentType,
        loop,
      }),
    });
    const data = await response.json();
    setMessage(response.ok ? `Metric saved with id ${data.entry?.id}` : data.error || 'Unable to save metric');
  };

  const handleNoteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const response = await fetch(`/api/pilot/metrics/${noteEntryId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ note }),
    });
    const data = await response.json();
    setMessage(response.ok ? 'Note saved.' : data.error || 'Unable to save note');
  };

  const canWrite = user?.role === 'PILOT_BUILDER' || user?.role === 'PILOT_DELIVERY_LEAD';
  const canNote = user?.role === 'PILOT_SME';

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Pilot metric entry</h1>
          {message && <p className="govuk-body">{message}</p>}

          {canWrite && (
            <form onSubmit={handleSubmit} className="govuk-!-margin-bottom-6">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="metricKey">Metric key</label>
                <input
                  className="govuk-input"
                  id="metricKey"
                  value={metricKey}
                  onChange={(event) => setMetricKey(event.target.value)}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="value">Value</label>
                <input
                  className="govuk-input"
                  id="value"
                  type="number"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="unit">Unit</label>
                <input
                  className="govuk-input"
                  id="unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="date">Date</label>
                <input
                  className="govuk-input"
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="phase">Phase</label>
                <select
                  className="govuk-select"
                  id="phase"
                  value={phase}
                  onChange={(event) => setPhase(event.target.value as PilotPhase)}
                >
                  <option value="PHASE_1">Phase 1 – Structural Foundation</option>
                  <option value="PHASE_2">Phase 2 – Agentic Specification Loops</option>
                  <option value="PHASE_3">Phase 3 – Controlled Implementation</option>
                </select>
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="experimentType">Experiment type</label>
                <select
                  className="govuk-select"
                  id="experimentType"
                  value={experimentType}
                  onChange={(event) => setExperimentType(event.target.value)}
                >
                  <option value="pilot">Pilot</option>
                  <option value="control">Control</option>
                </select>
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="loop">Loop</label>
                <input
                  className="govuk-input"
                  id="loop"
                  type="number"
                  min={1}
                  value={loop}
                  onChange={(event) => setLoop(Number(event.target.value))}
                />
              </div>
              <button className="govuk-button" type="submit">Save metric</button>
            </form>
          )}

          {canNote && (
            <form onSubmit={handleNoteSubmit}>
              <h2 className="govuk-heading-m">Add SME note</h2>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="noteEntryId">Metric entry id</label>
                <input
                  className="govuk-input"
                  id="noteEntryId"
                  value={noteEntryId}
                  onChange={(event) => setNoteEntryId(event.target.value)}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="note">Note</label>
                <textarea
                  className="govuk-textarea"
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <button className="govuk-button" type="submit">Save note</button>
            </form>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PilotMetricEntryPage;
