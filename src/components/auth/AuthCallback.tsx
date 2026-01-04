import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component to handle Supabase OAuth callback redirects.
 * 
 * After a user signs in with Google, Supabase redirects them back to a URL
 * which this component handles. It waits for the session to be established
 * and then redirects the user to the home page or their intended destination.
 */
export function AuthCallback() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Get the intended destination from sessionStorage
      const redirectTo = sessionStorage.getItem('auth_redirect_path') || '/';
      sessionStorage.removeItem('auth_redirect_path');

      // Small delay to ensure session is fully processed
      const timer = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
        <p className="text-sm text-ink-500 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}
