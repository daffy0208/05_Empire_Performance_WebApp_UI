import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';

const AuthGuard = ({ children, requireAuth = true, allowedRoles = null, requiredRole = null }) => {
  const { user, userProfile, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access this page.</p>
          <a 
            href="/login-register" 
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check role requirements
  const effectiveAllowed = requiredRole ? [requiredRole] : allowedRoles;
  if (requireAuth && effectiveAllowed && userProfile) {
    const hasAllowedRole = Array.isArray(effectiveAllowed) 
      ? effectiveAllowed?.includes(userProfile?.role)
      : effectiveAllowed === userProfile?.role;

    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md">
            <Icon name="ShieldAlert" size={48} className="text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this page. 
              Required role: {Array.isArray(effectiveAllowed) ? effectiveAllowed?.join(', ') : effectiveAllowed}
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default AuthGuard;