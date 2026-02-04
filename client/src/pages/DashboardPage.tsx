import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';
import CaseFilters, { FilterValues } from '../components/CaseFilters';
import AttentionTag, { AttentionLevel } from '../components/AttentionTag';
import EmptyState from '../components/EmptyState';

interface SessionData {
  authenticated: boolean;
  user?: {
    username: string;
    role: string;
  };
  authMode: string;
}

interface KeyDates {
  nextHearing?: string;
}

interface DashboardCase {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  assignedCourt: string;
  createdAt: string;
  keyDates: KeyDates;
  attention: AttentionLevel;
  childName?: string;
  localAuthority?: string;
}

interface CaseListResponse {
  cases: DashboardCase[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const ROLE_LABELS: Record<string, string> = {
  hmcts_case_officer: 'HMCTS Case Officer',
  HMCTS_CASE_OFFICER: 'HMCTS Case Officer',
  judge: 'Judge / Legal Adviser',
  JUDGE_LEGAL_ADVISER: 'Judge / Legal Adviser',
  cafcass_officer: 'Cafcass Officer',
  CAFCASS_OFFICER: 'Cafcass Officer',
  la_social_worker: 'Local Authority Social Worker',
  LA_SOCIAL_WORKER: 'Local Authority Social Worker',
  vaa_worker: 'Voluntary Adoption Agency Worker',
  VAA_WORKER: 'Voluntary Adoption Agency Worker',
  adopter: 'Adopter',
  ADOPTER: 'Adopter',
};

const STATUS_COLORS: Record<string, string> = {
  APPLICATION: 'govuk-tag--blue',
  DIRECTIONS: 'govuk-tag--blue',
  CONSENT_AND_REPORTING: 'govuk-tag--purple',
  FINAL_HEARING: 'govuk-tag--purple',
  ORDER_GRANTED: 'govuk-tag--green',
  APPLICATION_REFUSED: 'govuk-tag--red',
  APPLICATION_WITHDRAWN: 'govuk-tag--red',
  ON_HOLD: 'govuk-tag--yellow',
  ADJOURNED: 'govuk-tag--grey',
};

const TABLE_COLUMNS = ['Case reference', 'Child', 'Status', 'Case type', 'Key dates', 'Assigned to'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [cases, setCases] = useState<DashboardCase[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFiltersFromParams = useCallback((): FilterValues => ({
    status: searchParams.get('status'),
    caseType: searchParams.get('caseType'),
    dateFrom: searchParams.get('dateFrom'),
    dateTo: searchParams.get('dateTo'),
  }), [searchParams]);

  const [filters, setFilters] = useState<FilterValues>(getFiltersFromParams());

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session?.authenticated) {
      if (session.user?.role === 'adopter' || session.user?.role === 'ADOPTER') {
        navigate('/my-cases');
        return;
      }
      fetchCases();
    }
  }, [session, searchParams]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      const data = await response.json();
      setSession(data);

      if (!data.authenticated) {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    setCasesLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/cases?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load cases');
      }

      const data: CaseListResponse = await response.json();
      setCases(data.cases || []);
      setPagination(data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } catch {
      setError('Unable to load cases. Please try again.');
      setCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterValues) => {
    const params = new URLSearchParams();
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.caseType) params.set('caseType', newFilters.caseType);
    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo);
    setFilters(newFilters);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const cleared: FilterValues = { status: null, caseType: null, dateFrom: null, dateTo: null };
    setFilters(cleared);
    setSearchParams(new URLSearchParams());
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/');
    } catch {
      console.error('Logout failed');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  if (loading) {
    return (
      <>
        <SkipLink />
        <Header />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <p className="govuk-body" aria-live="polite">Loading cases...</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />

        {session?.authMode === 'mock' && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="region" aria-labelledby="mock-auth-title">
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title" id="mock-auth-title">
                Mock Authentication Active
              </h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                Signed in as: <strong>{session.user?.username}</strong> ({ROLE_LABELS[session.user?.role || ''] || session.user?.role})
              </p>
            </div>
          </div>
        )}

        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Case Dashboard</h1>

          <p className="govuk-body-l">
            Welcome, {session?.user?.username}. You are signed in as a {ROLE_LABELS[session?.user?.role || ''] || session?.user?.role}.
          </p>

          {session?.user?.role === 'HMCTS_CASE_OFFICER' && (
            <Link to="/cases/create" className="govuk-button govuk-button--primary">
              Create new case
            </Link>
          )}

          <CaseFilters filters={filters} onApply={handleApplyFilters} onClear={handleClearFilters} />

          {casesLoading && (
            <div className="govuk-inset-text" aria-live="polite">
              <p className="govuk-body">Loading cases...</p>
            </div>
          )}

          {error && <EmptyState variant="error" />}

          {!casesLoading && !error && cases.length === 0 && (
            <EmptyState
              variant={hasActiveFilters ? 'no-results' : 'no-cases'}
              activeFilters={hasActiveFilters ? { status: filters.status, caseType: filters.caseType } : undefined}
              onClearFilters={handleClearFilters}
            />
          )}

          {!casesLoading && !error && cases.length > 0 && (
            <>
              <table className="govuk-table" role="table" aria-label="Case list">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    {TABLE_COLUMNS.map((col) => (
                      <th key={col} scope="col" className="govuk-table__header">
                        {col}
                      </th>
                    ))}
                    <th scope="col" className="govuk-table__header">Attention</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {cases.map((c) => (
                    <tr key={c.id} className="govuk-table__row">
                      <td className="govuk-table__cell">
                        <Link to={`/cases/${c.id}`} className="govuk-link">
                          {c.caseNumber}
                        </Link>
                      </td>
                      <td className="govuk-table__cell">{c.childName || '-'}</td>
                      <td className="govuk-table__cell">
                        <span className={`govuk-tag ${STATUS_COLORS[c.status] || ''}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="govuk-table__cell">{c.caseType}</td>
                      <td className="govuk-table__cell">{formatDate(c.keyDates?.nextHearing)}</td>
                      <td className="govuk-table__cell">{c.localAuthority || c.assignedCourt}</td>
                      <td className="govuk-table__cell">
                        <AttentionTag level={c.attention} caseRef={c.caseNumber} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination.totalPages > 1 && (
                <nav className="govuk-pagination" aria-label="Pagination">
                  {pagination.page > 1 && (
                    <div className="govuk-pagination__prev">
                      <button
                        className="govuk-link govuk-pagination__link"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('page', String(pagination.page - 1));
                          setSearchParams(params);
                        }}
                      >
                        <span className="govuk-pagination__link-title">Previous</span>
                      </button>
                    </div>
                  )}
                  <ul className="govuk-pagination__list">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <li
                        key={p}
                        className={`govuk-pagination__item ${p === pagination.page ? 'govuk-pagination__item--current' : ''}`}
                      >
                        <button
                          className="govuk-link govuk-pagination__link"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('page', String(p));
                            setSearchParams(params);
                          }}
                          aria-current={p === pagination.page ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {pagination.page < pagination.totalPages && (
                    <div className="govuk-pagination__next">
                      <button
                        className="govuk-link govuk-pagination__link"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('page', String(pagination.page + 1));
                          setSearchParams(params);
                        }}
                      >
                        <span className="govuk-pagination__link-title">Next</span>
                      </button>
                    </div>
                  )}
                </nav>
              )}
            </>
          )}

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
