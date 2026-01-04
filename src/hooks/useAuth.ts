import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/auth';

/**
 * Interface for the useAuth hook return value.
 */
export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: typeof authService.signUp;
  signIn: typeof authService.signIn;
  signOut: typeof authService.signOut;
  resetPassword: typeof authService.resetPassword;
  updatePassword: typeof authService.updatePassword;
}

/**
 * A custom React hook that manages user authentication state using Supabase.
 * 
 * Provides current user, session, loading state, and authentication methods.
 * Automatically listens for auth state changes and updates accordingly.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch current session on mount
    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('[useAuth] Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    // Bind methods to authService to ensure 'this' context is preserved
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updatePassword: authService.updatePassword.bind(authService),
  };
}
