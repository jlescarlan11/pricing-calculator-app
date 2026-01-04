import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './useAuth';
import { authService } from '../services/auth';

// Mock authService
vi.mock('../services/auth', () => ({
  authService: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

describe('useAuth', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSession = { user: mockUser, access_token: 'token' };

  beforeEach(() => {
    vi.clearAllMocks();
    (authService.getSession as any).mockResolvedValue(null);
    (authService.onAuthStateChange as any).mockReturnValue({
      unsubscribe: vi.fn(),
    });
  });

  it('should initialize with loading state and then fetch session', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(authService.getSession).toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should set user when session exists on mount', async () => {
    (authService.getSession as any).mockResolvedValue(mockSession);
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should update state on auth change', async () => {
    let authCallback: any;
    (authService.onAuthStateChange as any).mockImplementation((cb: any) => {
      authCallback = cb;
      return { unsubscribe: vi.fn() };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate auth change
    authCallback('SIGNED_IN', mockSession);

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);

    // Simulate sign out
    authCallback('SIGNED_OUT', null);

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should call authService methods', () => {
    const { result } = renderHook(() => useAuth());

    result.current.signIn('test@example.com', 'password');
    expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password');

    result.current.signUp('new@example.com', 'pass');
    expect(authService.signUp).toHaveBeenCalledWith('new@example.com', 'pass');

    result.current.signOut();
    expect(authService.signOut).toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = vi.fn();
    (authService.onAuthStateChange as any).mockReturnValue({
      unsubscribe: mockUnsubscribe,
    });

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});