import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/ToastProvider';
import ErrorBoundary from '../components/ErrorBoundary';
import { initializeErrorMonitoring, setupGlobalErrorHandling, logger } from '../lib/monitoring';

// Initialize error monitoring on app start
initializeErrorMonitoring();
setupGlobalErrorHandling();

// Log app initialization
logger.info('Empire Performance Coaching app initialized', {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

const AppProviders = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
