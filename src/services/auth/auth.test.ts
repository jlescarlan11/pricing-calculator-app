import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './index';
import { supabase } from '../supabase';

// Mock the supabase client
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'mock-anon-key',
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should call supabase.auth.signUp and return data', async () => {
      const mockData = { user: { id: '123' }, session: { access_token: 'token' } };
      (supabase.auth.signUp as any).mockResolvedValue({ data: mockData, error: null });

      const result = await authService.signUp('test@example.com', 'password123');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockData);
    });

    it('should throw formatted error when supabase.auth.signUp fails', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      await expect(authService.signUp('test@example.com', 'password123'))
        .rejects.toThrow('An account with this email already exists.');
    });
  });

  describe('signIn', () => {
    it('should call supabase.auth.signInWithPassword and return data', async () => {
      const mockData = { user: { id: '123' }, session: { access_token: 'token' } };
      (supabase.auth.signInWithPassword as any).mockResolvedValue({ data: mockData, error: null });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockData);
    });

    it('should throw formatted error when signIn fails', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(authService.signIn('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password. Please try again.');
    });
  });

  describe('signOut', () => {
    it('should call supabase.auth.signOut', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      await authService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when signOut fails', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({ error: { message: 'Sign out error' } });

      await expect(authService.signOut()).rejects.toThrow('Sign out error');
    });
  });

  describe('resetPassword', () => {
    it('should call supabase.auth.resetPasswordForEmail', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

      await authService.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/auth/update-password'),
      });
    });

    it('should throw error when resetPassword fails', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: { message: 'Reset error' } });

      await expect(authService.resetPassword('test@example.com')).rejects.toThrow('Reset error');
    });
  });

  describe('updatePassword', () => {
    it('should call supabase.auth.updateUser', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

      await authService.updatePassword('newpassword123');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
    });

    it('should throw error when updatePassword fails', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ error: { message: 'Update error' } });

      await expect(authService.updatePassword('newpassword123')).rejects.toThrow('Update error');
    });
  });

  describe('getUser', () => {
    it('should return user from supabase.auth.getUser', async () => {
      const mockUser = { id: '123' };
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await authService.getUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null and log error when getUser fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: { message: 'Get user error' } });

      const result = await authService.getUser();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getSession', () => {
    it('should return session from supabase.auth.getSession', async () => {
      const mockSession = { access_token: 'token' };
      (supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession }, error: null });

      const result = await authService.getSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('should return null and log error when getSession fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: { message: 'Get session error' } });

      const result = await authService.getSession();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('onAuthStateChange', () => {
    it('should call supabase.auth.onAuthStateChange', () => {
      const mockSubscription = { unsubscribe: vi.fn() };
      (supabase.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: mockSubscription } });

      const callback = vi.fn();
      const result = authService.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
      expect(result).toEqual(mockSubscription);
    });
  });
});