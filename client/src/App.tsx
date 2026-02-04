import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyCasesPage from './pages/MyCasesPage';
import { SessionProvider } from './context/SessionContext';

const CaseListPage = lazy(() => import('./pages/CaseListPage'));
const CaseDetailPage = lazy(() => import('./pages/CaseDetailPage'));
const CreateCasePage = lazy(() => import('./pages/CreateCasePage'));
const UpdateStatusPage = lazy(() => import('./pages/UpdateStatusPage'));

// Notify prototype-annotator of route changes
function AnnotatorRouteSync() {
  const location = useLocation();

  useEffect(() => {
    // Call the annotator's refresh API when route changes
    const annotator = (window as Window & { __PROTOTYPE_ANNOTATOR__?: { refresh: () => void } }).__PROTOTYPE_ANNOTATOR__;
    annotator?.refresh();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <AnnotatorRouteSync />
        <Suspense fallback={<div className="govuk-body">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-cases" element={<MyCasesPage />} />
            <Route path="/my-cases/:id" element={<CaseDetailPage />} />
            <Route path="/cases" element={<CaseListPage />} />
            <Route path="/cases/create" element={<CreateCasePage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/cases/:id/status" element={<UpdateStatusPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
