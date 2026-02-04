import React, { useState } from 'react';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const ROLES = [
  { value: 'HMCTS_CASE_OFFICER', label: 'HMCTS Case Officer' },
  { value: 'JUDGE_LEGAL_ADVISER', label: 'Judge / Legal Adviser' },
  { value: 'CAFCASS_OFFICER', label: 'Cafcass Officer' },
  { value: 'LA_SOCIAL_WORKER', label: 'Local Authority Social Worker' },
  { value: 'VAA_WORKER', label: 'Voluntary Adoption Agency Worker' },
  { value: 'ADOPTER', label: 'Adopter' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSession } = useSession();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Enter your name');
      return;
    }

    if (!role) {
      setError('Select a role');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), role }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await refreshSession();
        navigate(data.redirectUrl || '/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">

              {/* Mock Auth Warning */}
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-visually-hidden">Warning</span>
                  This is a mock authentication system for development and testing only.
                </strong>
              </div>

              <h1 className="govuk-heading-xl">Sign in</h1>

              {error && (
                <div className="govuk-error-summary" data-module="govuk-error-summary">
                  <div role="alert">
                    <h2 className="govuk-error-summary__title">There is a problem</h2>
                    <div className="govuk-error-summary__body">
                      <ul className="govuk-list govuk-error-summary__list">
                        <li><a href="#username">{error}</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={`govuk-form-group ${error && !username ? 'govuk-form-group--error' : ''}`}>
                  <label className="govuk-label govuk-label--m" htmlFor="username">
                    Your name
                  </label>
                  <div className="govuk-hint">
                    Enter any name for testing purposes
                  </div>
                  {error && !username && (
                    <p className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> Enter your name
                    </p>
                  )}
                  <input
                    className={`govuk-input govuk-input--width-20 ${error && !username ? 'govuk-input--error' : ''}`}
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className={`govuk-form-group ${error && !role ? 'govuk-form-group--error' : ''}`}>
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      Select your role
                    </legend>
                    <div className="govuk-hint">
                      Choose the role you want to test
                    </div>
                    {error && !role && (
                      <p className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> Select a role
                      </p>
                    )}
                    <div className="govuk-radios" data-module="govuk-radios">
                      {ROLES.map((r) => (
                        <div className="govuk-radios__item" key={r.value}>
                          <input
                            className="govuk-radios__input"
                            id={`role-${r.value}`}
                            name="role"
                            type="radio"
                            value={r.value}
                            checked={role === r.value}
                            onChange={(e) => setRole(e.target.value)}
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor={`role-${r.value}`}>
                            {r.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
