import { supabase } from '../supabase';
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';

/**
 * Service for handling all authentication-related operations using Supabase.
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Logs an error to the console for debugging purposes.
   */
  private logError(method: string, error: unknown): void {
    console.error(`[AuthService.${method}] error:`, error);
  }

  /**
   * Formats Supabase AuthError into a user-friendly message.
   */
  private getErrorMessage(error: AuthError | Error | unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const message = (error as { message: string }).message;
      
      // Map common Supabase error messages to more user-friendly ones if needed
      if (message.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (message.includes('User already registered')) {
        return 'An account with this email already exists.';
      }
      if (message.includes('Email not confirmed')) {
        return 'Please confirm your email address before signing in.';
      }
      if (message.includes('Account is locked') || message.includes('too many failed login attempts')) {
        return 'Your account has been temporarily locked due to too many failed attempts. Please try again later or reset your password.';
      }
      
      return message;
    }
    return 'An unexpected error occurred during authentication.';
  }

  /**
   * Sign up a new user with email and password.
   */
  public async signUp(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      this.logError('signUp', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Sign in an existing user with email and password.
   */
  public async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      this.logError('signIn', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Sign out the current user.
   */
  public async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      this.logError('signOut', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Send a password reset email.
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
    } catch (error) {
      this.logError('resetPassword', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Update the current user's password.
   */
  public async updatePassword(password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      this.logError('updatePassword', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Delete the current user's account.
   * NOTE: Client-side Supabase SDK does not support self-deletion for security.
   * In a production app, this would call an Edge Function that uses the Service Role key
   * to delete the user from auth.users.
   */
  public async deleteAccount(): Promise<void> {
    try {
      // Step 1: Delete all user data (handled by ON DELETE CASCADE in DB if we delete user)
      // Since we can't delete from auth.users directly, we'll sign out and mark for deletion
      // or just simulate for this exercise.
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // In a real scenario, we might call an RPC or Edge Function here:
      // await supabase.functions.invoke('delete-user-account');
      
      return;
    } catch (error) {
      this.logError('deleteAccount', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Get the current user.
   */
  public async getUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      // Not throwing here as it's common to check if user exists
      this.logError('getUser', error);
      return null;
    }
  }

  /**
   * Get the current session.
   */
  public async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      this.logError('getSession', error);
      return null;
    }
  }

  /**
   * Subscribe to authentication state changes.
   * Returns a subscription that can be used to unsubscribe.
   */
  public onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }
}

export const authService = AuthService.getInstance();
