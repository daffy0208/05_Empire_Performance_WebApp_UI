import React from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ScrollToTop from './components/ScrollToTop';
import ScreenLoader from './components/ui/ScreenLoader';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Page Imports (lazy-loaded)
const PublicLandingPage = React.lazy(() => import('./pages/public-landing-page'));
const MultiStepBookingFlow = React.lazy(() => import('./pages/multi-step-booking-flow'));
const LoginRegister = React.lazy(() => import('./pages/login-register'));
const ParentDashboard = React.lazy(() => import('./pages/parent-dashboard'));
const CoachDashboard = React.lazy(() => import('./pages/coach-dashboard'));
const DirectorDashboard = React.lazy(() => import('./pages/director-dashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Component Imports
import RoleBasedRouter from './components/ui/RoleBasedRouter';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#F5F5F5' }}>
          Something went wrong
        </h2>
        <p className="text-lg mb-6" style={{ color: '#CFCFCF' }}>
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <div className="space-x-4">
          <button
            onClick={resetErrorBoundary}
            className="bg-[#C9A43B] text-[#000000] hover:bg-[#C9A43B]/90 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/public-landing-page'}
            className="border border-[#C9A43B] text-[#C9A43B] hover:bg-[#C9A43B]/10 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
        {import.meta.env?.DEV && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm" style={{ color: '#CFCFCF' }}>
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-[#1A1A1D] border border-[#2A2A2E] rounded text-xs overflow-auto" style={{ color: '#CFCFCF' }}>
              {error?.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function Routes() {
  return (
    <BrowserRouter>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location?.reload()}
      >
        <ScrollToTop />
        <React.Suspense fallback={<ScreenLoader message="Loading page..." />}>
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLandingPage />} />
            <Route path="/public-landing-page" element={<PublicLandingPage />} />
            <Route path="/multi-step-booking-flow" element={<MultiStepBookingFlow />} />
            <Route path="/login-register" element={<LoginRegister />} />
            
            {/* Protected Dashboard Routes */}
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach-dashboard"
              element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/director-dashboard"
              element={
                <ProtectedRoute allowedRoles={["director"]}>
                  <DirectorDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Role-based router for post-auth navigation */}
            <Route path="/auth/callback" element={<RoleBasedRouter />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </React.Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Routes;