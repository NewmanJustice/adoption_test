import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ALLOWED_EXTENSIONS, DESCRIPTION_MAX_LENGTH, MAX_BULK_UPLOAD } from '@adoption/shared/constants/documentTypes';
import { useSession } from '../context/SessionContext';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';

interface DocumentTypeOption {
  value: string;
  label: string;
  helpText: string;
}

interface FormErrors {
  file?: string;
  documentType?: string;
  description?: string;
  submit?: string;
}

const UPLOAD_ROLES = new Set([
  'HMCTS_CASE_OFFICER',
  'LA_SOCIAL_WORKER',
  'CAFCASS_OFFICER',
  'VAA_WORKER',
  'ADOPTER'
]);

const DocumentUploadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: sessionLoading } = useSession();
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<FileList | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canUpload = user ? UPLOAD_ROLES.has(user.role) : false;
  const fileAccept = useMemo(() => ALLOWED_EXTENSIONS.join(','), []);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchUploadForm();
    }
  }, [isAuthenticated, id]);

  const fetchUploadForm = async () => {
    try {
      const response = await fetch(`/api/cases/${id}/upload-document`, {
        credentials: 'include',
      });

      if (response.status === 403 || response.status === 401) {
        setAccessDenied(true);
        return;
      }

      if (!response.ok) {
        setError('Failed to load upload form');
        return;
      }

      const data = await response.json();
      setDocumentTypes(data.documentTypes || []);
    } catch {
      setError('Failed to load upload form');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
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

  if (!canUpload) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Access denied</h1>
            <p className="govuk-body">You do not have permission to upload documents for this case.</p>
            <Link to={`/cases/${id}`} className="govuk-link">Back to case</Link>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body">Loading upload form...</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (accessDenied || error) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <PhaseBanner />
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Unable to upload documents</h1>
            <p className="govuk-body">{accessDenied ? 'You do not have access to this case.' : error}</p>
            <Link to={`/cases/${id}`} className="govuk-link">Back to case</Link>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const fileCount = files?.length || 0;

    if (fileCount === 0) {
      nextErrors.file = 'Select a file to upload';
    }

    if (fileCount > MAX_BULK_UPLOAD) {
      nextErrors.file = `You can upload up to ${MAX_BULK_UPLOAD} files at once`;
    }

    if (!documentType) {
      nextErrors.documentType = 'Select a document type';
    }

    if (documentType === 'other' && !description.trim()) {
      nextErrors.description = 'Enter a description for "Other" documents';
    }

    if (description.trim().length > DESCRIPTION_MAX_LENGTH) {
      nextErrors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`;
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setError(null);

    try {
      const selectedFiles = files ? Array.from(files) : [];
      const isBulk = selectedFiles.length > 1;
      const endpoint = isBulk
        ? `/api/cases/${id}/upload-documents/bulk`
        : `/api/cases/${id}/upload-document`;

      const formData = new FormData();
      if (isBulk) {
        selectedFiles.forEach((file) => formData.append('files', file));
        formData.append('documentType', documentType);
        if (description.trim()) {
          formData.append('descriptions', JSON.stringify(selectedFiles.map(() => description.trim())));
        }
      } else {
        formData.append('file', selectedFiles[0]);
        formData.append('documentType', documentType);
        if (description.trim()) {
          formData.append('description', description.trim());
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        navigate(data.redirectTo || `/cases/${id}`);
      } else {
        setErrors({ submit: data.error || 'Failed to upload document' });
      }
    } catch {
      setErrors({ submit: 'Failed to upload document' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorList = Object.entries(errors).filter(([, msg]) => msg);
  const selectedHelpText = documentTypes.find((type) => type.value === documentType)?.helpText;
  const fileCount = files?.length || 0;

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <Link to={`/cases/${id}`} className="govuk-back-link">Back to case</Link>

          <h1 className="govuk-heading-xl">Upload document</h1>

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
            <div className={`govuk-form-group ${errors.file ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor="file">
                Select document
              </label>
              <div className="govuk-hint">
                Accepted formats: {ALLOWED_EXTENSIONS.join(', ')}. You can upload up to {MAX_BULK_UPLOAD} files at once.
              </div>
              {errors.file && (
                <p className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {errors.file}
                </p>
              )}
              <input
                className={`govuk-file-upload ${errors.file ? 'govuk-file-upload--error' : ''}`}
                id="file"
                name="file"
                type="file"
                accept={fileAccept}
                multiple
                onChange={(event) => setFiles(event.target.files)}
              />
              {fileCount > 1 && (
                <p className="govuk-body">You have selected {fileCount} files. All files will use the same document type.</p>
              )}
            </div>

            <div className={`govuk-form-group ${errors.documentType ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor="documentType">
                Document type
              </label>
              {errors.documentType && (
                <p className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {errors.documentType}
                </p>
              )}
              <select
                className={`govuk-select ${errors.documentType ? 'govuk-select--error' : ''}`}
                id="documentType"
                name="documentType"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                <option value="">Select a document type</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedHelpText && (
                <div className="govuk-hint">{selectedHelpText}</div>
              )}
            </div>

            <div className={`govuk-form-group ${errors.description ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor="description">
                Description (optional)
              </label>
              <div className="govuk-hint">
                Add context for the document. Required if you select "Other".
              </div>
              {errors.description && (
                <p className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {errors.description}
                </p>
              )}
              <textarea
                className="govuk-textarea"
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {errors.submit && (
              <p className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {errors.submit}
              </p>
            )}

            <div className="govuk-button-group">
              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload document'}
              </button>
              <Link to={`/cases/${id}`} className="govuk-link">Cancel</Link>
            </div>
          </form>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DocumentUploadPage;
