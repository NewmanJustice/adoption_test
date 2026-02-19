import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyCasesPage from './pages/MyCasesPage';
import AccessCodePage from './pages/AccessCodePage';
import { SessionProvider } from './context/SessionContext';
import { SiteAccessProvider, useSiteAccess } from './context/SiteAccessContext';

const CaseDetailPage = lazy(() => import('./pages/CaseDetailPage'));
const CreateCasePage = lazy(() => import('./pages/CreateCasePage'));
const UpdateStatusPage = lazy(() => import('./pages/UpdateStatusPage'));
const DocumentUploadPage = lazy(() => import('./pages/DocumentUploadPage'));
const PilotDashboardPage = lazy(() => import('./pages/PilotDashboardPage'));
const PilotConfigPage = lazy(() => import('./pages/PilotConfigPage'));
const PilotMetricEntryPage = lazy(() => import('./pages/PilotMetricEntryPage'));
const AboutPilotPage = lazy(() => import('./pages/AboutPilotPage'));
const AdoptionVisionPage = lazy(() => import('./pages/AdoptionVisionPage'));
const PilotPulseQuestionnairePage = lazy(() => import('./pages/PilotPulseQuestionnairePage'));
const PilotPulseTrendsPage = lazy(() => import('./pages/PilotPulseTrendsPage'));

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

// Guard that redirects to access code page if site access is required but not granted
function SiteAccessGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { required, granted, loading } = useSiteAccess();

  // Don't guard the access page itself
  if (location.pathname === '/access') {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="govuk-body">Loading...</div>;
  }

  if (required && !granted) {
    return <Navigate to="/access" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <SiteAccessGuard>
      <AnnotatorRouteSync />
      <Suspense fallback={<div className="govuk-body">Loading...</div>}>
        <Routes>
          <Route path="/access" element={<AccessCodePage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-cases" element={<MyCasesPage />} />
          <Route path="/my-cases/:id" element={<CaseDetailPage />} />
          <Route path="/cases" element={<Navigate to="/dashboard" replace />} />
          <Route path="/cases/create" element={<CreateCasePage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/cases/:id/status" element={<UpdateStatusPage />} />
          <Route path="/cases/:id/upload-document" element={<DocumentUploadPage />} />
          <Route path="/pilot" element={<PilotDashboardPage />} />
          <Route path="/pilot/vision/:sectionId?" element={<AdoptionVisionPage />} />
          <Route path="/pilot/about/:sectionId?" element={<AboutPilotPage />} />
          <Route path="/pilot/config" element={<PilotConfigPage />} />
          <Route path="/pilot/metrics" element={<PilotMetricEntryPage />} />
          <Route path="/pilot/pulse/questionnaire" element={<PilotPulseQuestionnairePage />} />
          <Route path="/pilot/pulse/trends" element={<PilotPulseTrendsPage />} />
        </Routes>
      </Suspense>
    </SiteAccessGuard>
  );
}

function App() {
  return (
    <SiteAccessProvider>
      <SessionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </SiteAccessProvider>
  );
}

export default App;
