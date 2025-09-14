import React from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ScrollToTop from './components/ScrollToTop';

// Page Imports
import PublicLandingPage from './pages/public-landing-page';
import MultiStepBookingFlow from './pages/multi-step-booking-flow';
import LoginRegister from './pages/login-register';
import ParentDashboard from './pages/parent-dashboard';
import CoachDashboard from './pages/coach-dashboard';
import DirectorDashboard from './pages/director-dashboard';
import NotFound from './pages/NotFound';

// Component Imports
import { AuthProvider } from './contexts/AuthContext';
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
        {process.env?.NODE_ENV === 'development' && (
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
        <AuthProvider>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLandingPage />} />
            <Route path="/public-landing-page" element={<PublicLandingPage />} />
            <Route path="/multi-step-booking-flow" element={<MultiStepBookingFlow />} />
            <Route path="/login-register" element={<LoginRegister />} />
            
            {/* Role-based Dashboard Routes - Now with proper role gating */}
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/coach-dashboard" element={<CoachDashboard />} />
            <Route path="/director-dashboard" element={<DirectorDashboard />} />
            
            {/* Role-based router for post-auth navigation */}
            <Route path="/auth/callback" element={<RoleBasedRouter />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Routes;