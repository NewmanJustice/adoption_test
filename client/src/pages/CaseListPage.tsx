import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface Case {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  assignedCourt: string;
  createdAt: string;
}

interface CaseListResponse {
  cases: Case[];
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  APPLICATION: 'govuk-tag--blue',
  DIRECTIONS: 'govuk-tag--blue',
  PLACEMENT_HEARING: 'govuk-tag--purple',
  FINAL_HEARING: 'govuk-tag--purple',
  ORDER_GRANTED: 'govuk-tag--green',
  ORDER_REFUSED: 'govuk-tag--red',
  APPLICATION_WITHDRAWN: 'govuk-tag--red',
  ON_HOLD: 'govuk-tag--yellow',
};

const CaseListPage: React.FC = () => {
  const { user, isAuthenticated } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    if (isAuthenticated) {
      fetchCases();
    }
  }, [isAuthenticated, page]);

  const fetchCases = async () => {
    try {
      const response = await fetch(`/api/cases?page=${page}&limit=${pageSize}`, {
        credentials: 'include',
      });
      const data: CaseListResponse = await response.json();
      setCases(data.cases);
      setTotal(data.total);
    } catch {
      setCases([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const canCreateCase = user?.role === 'HMCTS_CASE_OFFICER';
  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return <p className="govuk-body">Loading...</p>;
  }

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <h1 className="govuk-heading-xl">Cases</h1>

        {canCreateCase && (
          <Link to="/cases/create" className="govuk-button govuk-button--primary">
            Create case
          </Link>
        )}

        {cases.length === 0 ? (
          <p className="govuk-body">No cases found.</p>
        ) : (
          <>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Case number</th>
                  <th scope="col" className="govuk-table__header">Type</th>
                  <th scope="col" className="govuk-table__header">Status</th>
                  <th scope="col" className="govuk-table__header">Court</th>
                  <th scope="col" className="govuk-table__header">Created</th>
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
                    <td className="govuk-table__cell">{c.caseType}</td>
                    <td className="govuk-table__cell">
                      <span className={`govuk-tag ${STATUS_COLORS[c.status] || ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="govuk-table__cell">{c.assignedCourt}</td>
                    <td className="govuk-table__cell">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <nav className="govuk-pagination" aria-label="Pagination">
                {page > 1 && (
                  <div className="govuk-pagination__prev">
                    <button
                      className="govuk-link govuk-pagination__link"
                      onClick={() => setPage(page - 1)}
                    >
                      <span className="govuk-pagination__link-title">Previous</span>
                    </button>
                  </div>
                )}
                <ul className="govuk-pagination__list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <li
                      key={p}
                      className={`govuk-pagination__item ${p === page ? 'govuk-pagination__item--current' : ''}`}
                    >
                      <button
                        className="govuk-link govuk-pagination__link"
                        onClick={() => setPage(p)}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
                {page < totalPages && (
                  <div className="govuk-pagination__next">
                    <button
                      className="govuk-link govuk-pagination__link"
                      onClick={() => setPage(page + 1)}
                    >
                      <span className="govuk-pagination__link-title">Next</span>
                    </button>
                  </div>
                )}
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CaseListPage;
