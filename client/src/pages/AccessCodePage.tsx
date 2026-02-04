import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteAccess } from '../context/SiteAccessContext';

const AccessCodePage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAccess } = useSiteAccess();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Enter the access code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/site-access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        await checkAccess();
        navigate('/');
      } else {
        setError(data.error || 'Invalid access code');
      }
    } catch {
      setError('Unable to verify access code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Access required</h1>
            <p className="govuk-body">
              This site is in early development. Please enter the access code to continue.
            </p>

            {error && (
              <div className="govuk-error-summary" data-module="govuk-error-summary">
                <div role="alert">
                  <h2 className="govuk-error-summary__title">There is a problem</h2>
                  <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                      <li><a href="#code">{error}</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="code">
                  Access code
                </label>
                {error && (
                  <p className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-10 ${error ? 'govuk-input--error' : ''}`}
                  id="code"
                  name="code"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessCodePage;
