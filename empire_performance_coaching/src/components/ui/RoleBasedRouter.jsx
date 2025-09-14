import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRouter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle role-based navigation after authentication
  React.useEffect(() => {
    if (user) {
      const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'parent';
      
      switch (userRole) {
        case 'director': navigate('/director-dashboard', { replace: true });
          break;
        case 'coach': navigate('/coach-dashboard', { replace: true });
          break;
        case 'parent':
        default:
          navigate('/parent-dashboard', { replace: true });
          break;
      }
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
};

export default RoleBasedRouter;