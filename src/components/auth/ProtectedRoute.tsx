import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * A wrapper component for routes that require authentication.
 * 
 * If the user is authenticated, it renders the children or an Outlet.
 * If the user is not authenticated, it redirects to the login page
 * while preserving the current location so they can be redirected back
 * after a successful login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <p className="text-sm text-ink-500 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
