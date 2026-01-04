import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResetPassword } from './ResetPassword';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UseAuthReturn } from '../../hooks/useAuth';

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ResetPassword Component', () => {
  const mockUpdatePassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updatePassword: mockUpdatePassword,
      resendConfirmationEmail: vi.fn(),
      loading: false,
      user: { 
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: { 
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      },
      isAuthenticated: true,
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
    } as UseAuthReturn);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderResetPassword = () => {
    return render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
  };

  it('renders correctly when authenticated (session present)', () => {
    renderResetPassword();
    expect(screen.getByText(/Create New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('shows error message when not authenticated (session missing/expired)', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    } as UseAuthReturn);
    
    renderResetPassword();
    expect(screen.getByText(/Your reset link may have expired or is invalid/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request New Link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeDisabled();
  });

  it('validates password length', async () => {
    renderResetPassword();
    const passwordInput = screen.getByLabelText(/^New Password/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.blur(passwordInput);

    expect(await screen.findByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    renderResetPassword();
    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'password123' } });
    
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    fireEvent.change(confirmInput, { target: { value: 'mismatch' } });
    fireEvent.blur(confirmInput);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('submits successfully and shows success message', async () => {
    mockUpdatePassword.mockResolvedValueOnce(undefined);
    renderResetPassword();

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123');
    });

    expect(await screen.findByText(/Password Reset!/i)).toBeInTheDocument();
  });

  it('redirects to login after success', async () => {
    vi.useFakeTimers();
    mockUpdatePassword.mockResolvedValueOnce(undefined);
    renderResetPassword();

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    // Let the updatePassword promise resolve and any state updates happen
    await vi.runAllTimersAsync();

    expect(screen.getByText(/Password Reset!/i)).toBeInTheDocument();
    
    // Advance 3 seconds for the redirect
    vi.advanceTimersByTime(3000);
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
  });

  it('handles error during submission', async () => {
    const errorMessage = 'Password is too weak.';
    mockUpdatePassword.mockRejectedValueOnce(new Error(errorMessage));
    renderResetPassword();

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: '123456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
