import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You could render a loading spinner here
    return (
      <div className="flex min-h-screen items-center justify-center bg-main">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-clay border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page but save the attempted url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
