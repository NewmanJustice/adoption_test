import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import { useSession } from '../context/SessionContext';
import { PilotMetricEntry, PilotMetricNote, PilotPhase } from '@adoption/shared';

const SmeNotesViewer: React.FC<{ entries: PilotMetricEntry[] }> = ({ entries }) => {
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState<PilotMetricNote[]>([]);

  const loadNotes = async (entryId: string) => {
    setSelectedId(entryId);
    if (!entryId) { setNotes([]); return; }
    const res = await fetch(`/api/pilot/metrics/${entryId}/notes`, { credentials: 'include' });
    const data = await res.json();
    setNotes(data.notes ?? []);
  };

  if (!entries.length) return <p className="govuk-body govuk-hint">No metric entries available.</p>;

  return (
    <>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="viewNotesEntry">Select metric entry</label>
        <select
          className="govuk-select"
          id="viewNotesEntry"
          value={selectedId}
          onChange={(e) => loadNotes(e.target.value)}
        >
          <option value="">— select a metric entry —</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.metricKey.replace(/_/g, ' ')} — {entry.date} (loop {entry.loop})
            </option>
          ))}
        </select>
      </div>
      {selectedId && notes.length === 0 && <p className="govuk-body govuk-hint">No notes for this entry.</p>}
      {notes.length > 0 && (
        <ul className="govuk-list govuk-list--bullet">
          {notes.map((n) => (
            <li key={n.id}>
              {n.note} <span className="govuk-hint">— {new Date(n.createdAt).toLocaleDateString('en-GB')}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

const PilotMetricEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSession();
  const [metricKey, setMetricKey] = useState('structural_integrity');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('score');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [phase, setPhase] = useState<PilotPhase>('PHASE_1');

  const [loop, setLoop] = useState(1);
  const [noteEntryId, setNoteEntryId] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [metricEntries, setMetricEntries] = useState<PilotMetricEntry[]>([]);
  const [entryNotes, setEntryNotes] = useState<PilotMetricNote[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const canWrite = user?.role === 'PILOT_BUILDER' || user?.role === 'PILOT_DELIVERY_LEAD';
  const canNote = user?.role === 'PILOT_SME';

  useEffect(() => {
    if (canNote || canWrite) {
      fetch('/api/pilot/metrics', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setMetricEntries(data.entries ?? []))
        .catch(() => setMetricEntries([]));
    }
  }, [canNote, canWrite]);

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
    if (response.ok) {
      setMessage('Note saved.');
      setNote('');
      const notesRes = await fetch(`/api/pilot/metrics/${noteEntryId}/notes`, { credentials: 'include' });
      const notesData = await notesRes.json();
      setEntryNotes(notesData.notes ?? []);
    } else {
      setMessage(data.error || 'Unable to save note');
    }
  };

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
              <h2 className="govuk-heading-m">Add contextual note</h2>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="noteEntryId">Metric entry</label>
                {metricEntries.length > 0 ? (
                  <select
                    className="govuk-select"
                    id="noteEntryId"
                    value={noteEntryId}
                    onChange={(event) => {
                      setNoteEntryId(event.target.value);
                      setEntryNotes([]);
                    }}
                  >
                    <option value="">— select a metric entry —</option>
                    {metricEntries.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.metricKey.replace(/_/g, ' ')} — {entry.date} (loop {entry.loop})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="govuk-body govuk-hint">No metric entries available yet.</p>
                )}
              </div>
              {entryNotes.length > 0 && (
                <div className="govuk-inset-text govuk-!-margin-bottom-4">
                  <h3 className="govuk-heading-s">Existing notes</h3>
                  <ul className="govuk-list govuk-list--bullet">
                    {entryNotes.map((n) => (
                      <li key={n.id}>{n.note} <span className="govuk-hint">— {new Date(n.createdAt).toLocaleDateString('en-GB')}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="note">Note</label>
                <textarea
                  className="govuk-textarea"
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <button className="govuk-button" type="submit" disabled={!noteEntryId}>Save note</button>
            </form>
          )}

          {canWrite && (
            <section className="govuk-!-margin-top-6">
              <h2 className="govuk-heading-m">SME notes</h2>
              <SmeNotesViewer entries={metricEntries} />
            </section>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PilotMetricEntryPage;
