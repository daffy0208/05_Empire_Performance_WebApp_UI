import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/ToastProvider';

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
};

export default AppProviders;
