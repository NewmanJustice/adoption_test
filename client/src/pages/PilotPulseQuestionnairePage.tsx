import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import PilotSidebar from '../components/pilot/PilotSidebar';

type Answers = Record<string, number | undefined>;

const SECTIONS = [
  {
    id: 's1',
    heading: 'Section 1 — Authority & Decision Structure',
    questions: [
      { key: 'q1', text: 'There is a clearly identified individual accountable for sequencing decisions.' },
      { key: 'q2', text: 'Structural decisions are made quickly when needed.' },
      { key: 'q3', text: 'I believe there is shared understanding of who holds authority for delivery decisions.' },
    ],
  },
  {
    id: 's2',
    heading: 'Section 2 — Service Intent & Boundaries',
    questions: [
      { key: 'q4', text: 'The service vision and purpose are clearly articulated.' },
      { key: 'q5', text: 'The boundary of the service (where it starts and stops) is explicit.' },
      { key: 'q6', text: 'I believe there is shared understanding of what this service is responsible for.' },
    ],
  },
  {
    id: 's3',
    heading: 'Section 3 — Lifecycle & Operational Modelling',
    questions: [
      { key: 'q7', text: 'The service lifecycle can be described as a coherent state model.' },
      { key: 'q8', text: 'Exceptional and edge-case transitions are explicitly identified.' },
      { key: 'q9', text: 'I believe there is shared understanding of how the lifecycle behaves.' },
    ],
  },
  {
    id: 's4',
    heading: 'Section 4 — Architectural & Dependency Discipline',
    questions: [
      { key: 'q10', text: 'Non-functional requirements shape sequencing decisions.' },
      { key: 'q11', text: 'External dependencies are explicitly identified and managed.' },
      { key: 'q12', text: 'I believe there is shared understanding of architectural constraints.' },
    ],
  },
];

const SCALE_OPTIONS = [
  { value: 1, label: '1 — Strongly Disagree' },
  { value: 2, label: '2 — Disagree' },
  { value: 3, label: '3 — Unsure' },
  { value: 4, label: '4 — Agree' },
  { value: 5, label: '5 — Strongly Agree' },
];

const ALL_QUESTION_KEYS = SECTIONS.flatMap((s) => s.questions.map((q) => q.key));

const PilotPulseQuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useSession();

  const [answers, setAnswers] = useState<Answers>({});
  const [freeText, setFreeText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return <p className="govuk-body">Loading...</p>;
  }

  const role = user?.role;
  if (role !== 'PILOT_BUILDER' && role !== 'PILOT_SME') {
    navigate('/pilot', { replace: true });
    return null;
  }

  const handleRadioChange = (key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string[] => {
    const missing = ALL_QUESTION_KEYS.filter((k) => answers[k] === undefined);
    if (missing.length > 0) {
      return [`Please answer all ${missing.length} unanswered question(s).`];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    const body: Record<string, number | string> = {};
    ALL_QUESTION_KEYS.forEach((k) => {
      body[k] = answers[k] as number;
    });
    if (freeText.trim()) {
      body.freeText = freeText;
    }

    try {
      const response = await fetch('/api/pilot/pulse', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.status === 201) {
        navigate('/pilot', { state: { submitted: true } });
      } else {
        setErrors(['There was a problem submitting your response. Please try again.']);
        setTimeout(() => errorRef.current?.focus(), 0);
      }
    } catch {
      setErrors(['There was a problem submitting your response. Please try again.']);
      setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container govuk-grid-row">
        <PilotSidebar />
        <div className="govuk-grid-column-three-quarters">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Pilot Pulse Questionnaire</h1>

        {errors.length > 0 && (
          <div
            className="govuk-error-summary"
            role="alert"
            tabIndex={-1}
            ref={errorRef}
          >
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {errors.map((err, i) => (
                  <li key={i}>
                    <a href="#q1-1">{err}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {SECTIONS.map((section) => (
            <fieldset key={section.id} className="govuk-fieldset govuk-!-margin-bottom-6">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h2 className="govuk-fieldset__heading">{section.heading}</h2>
              </legend>

              {section.questions.map((q) => (
                <div key={q.key} className="govuk-form-group govuk-!-margin-bottom-4">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend">
                      <span className="govuk-body">{q.text}</span>
                    </legend>
                    <div className="govuk-radios govuk-radios--inline">
                      {SCALE_OPTIONS.map((opt) => (
                        <div key={opt.value} className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id={`${q.key}-${opt.value}`}
                            name={q.key}
                            type="radio"
                            value={opt.value}
                            checked={answers[q.key] === opt.value}
                            onChange={() => handleRadioChange(q.key, opt.value)}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={`${q.key}-${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ))}
            </fieldset>
          ))}

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="freeText">
              Optional comments
            </label>
            <div id="freeText-hint" className="govuk-hint">
              Where does structural clarity feel weakest right now? Do not include personal data.
            </div>
            <textarea
              className="govuk-textarea"
              id="freeText"
              name="freeText"
              rows={5}
              aria-describedby="freeText-hint"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="govuk-button"
            disabled={submitting}
          >
            Submit pulse
          </button>
        </form>
      </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PilotPulseQuestionnairePage;
