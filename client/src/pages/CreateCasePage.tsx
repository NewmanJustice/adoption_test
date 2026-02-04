import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';

const CASE_TYPES = [
  { value: '', label: '-- Choose --' },
  { value: 'AGENCY_ADOPTION', label: 'Agency adoption' },
  { value: 'STEP_PARENT_ADOPTION', label: 'Step parent adoption' },
  { value: 'INTERCOUNTRY_ADOPTION', label: 'Intercountry adoption' },
  { value: 'NON_AGENCY_ADOPTION', label: 'Non-agency (private)' },
  { value: 'FOSTER_TO_ADOPT', label: 'Foster to adopt' },
  { value: 'ADOPTION_FOLLOWING_PLACEMENT_ORDER', label: 'Adoption following placement order' },
];

interface FormErrors {
  caseType?: string;
  assignedCourt?: string;
}

const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSession();
  const [caseType, setCaseType] = useState('');
  const [assignedCourt, setAssignedCourt] = useState('');
  const [linkedReference, setLinkedReference] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body">Loading...</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'HMCTS_CASE_OFFICER') {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Access denied</h1>
            <p className="govuk-body">Only HMCTS Case Officers can create cases.</p>
            <Link to="/cases" className="govuk-link">Back to cases</Link>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!caseType) {
      newErrors.caseType = 'Select a case type';
    }
    if (!assignedCourt.trim()) {
      newErrors.assignedCourt = 'Enter an assigned court';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          caseType,
          assignedCourt: assignedCourt.trim(),
          linkedFamilyCourtCaseReference: linkedReference.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Server returns case directly, not wrapped in { case: ... }
        navigate(`/cases/${data.id}`);
      } else {
        const data = await response.json();
        setErrors({ caseType: data.error || 'Failed to create case' });
      }
    } catch {
      setErrors({ caseType: 'Failed to create case' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorList = Object.entries(errors).filter(([, msg]) => msg);

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <Link to="/cases" className="govuk-back-link">Back to cases</Link>

          <h1 className="govuk-heading-xl">Create case</h1>

        {errorList.length > 0 && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" data-module="govuk-error-summary">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {errorList.map(([field, message]) => (
                  <li key={field}>
                    <a href={`#${field}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`govuk-form-group ${errors.caseType ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-label--m" htmlFor="caseType">
              Case type
            </label>
            <select
              className={`govuk-select ${errors.caseType ? 'govuk-select--error' : ''}`}
              id="caseType"
              name="caseType"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
            >
              {CASE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`govuk-form-group ${errors.assignedCourt ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-label--m" htmlFor="assignedCourt">
              Assigned court
            </label>
            <input
              className={`govuk-input ${errors.assignedCourt ? 'govuk-input--error' : ''}`}
              id="assignedCourt"
              name="assignedCourt"
              type="text"
              value={assignedCourt}
              onChange={(e) => setAssignedCourt(e.target.value)}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="linkedReference">
              Linked family court case reference (optional)
            </label>
            <input
              className="govuk-input"
              id="linkedReference"
              name="linkedReference"
              type="text"
              value={linkedReference}
              onChange={(e) => setLinkedReference(e.target.value)}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              className="govuk-textarea"
              id="notes"
              name="notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="govuk-button-group">
            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create case'}
            </button>
            <Link to="/cases" className="govuk-link">Cancel</Link>
          </div>
        </form>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default CreateCasePage;
