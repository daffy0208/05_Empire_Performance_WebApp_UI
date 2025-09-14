import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ScreenLoader from '../ui/ScreenLoader';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader message="Checking your access..." />;
  }

  if (!user) {
    return <Navigate to="/login-register" state={{ from: location }} replace />;
  }

  if (allowedRoles && userProfile) {
    const hasAllowedRole = Array.isArray(allowedRoles)
      ? allowedRoles?.includes(userProfile?.role)
      : allowedRoles === userProfile?.role;
    if (!hasAllowedRole) {
      return <Navigate to="/public-landing-page" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

