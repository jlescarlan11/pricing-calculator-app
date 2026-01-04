import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgotPassword } from './ForgotPassword';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UseAuthReturn } from '../../hooks/useAuth';

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ForgotPassword Component', () => {
  const mockResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      resetPassword: mockResetPassword,
      resendConfirmationEmail: vi.fn(),
      loading: false,
      user: null,
      session: null,
      isAuthenticated: false,
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      updatePassword: vi.fn(),
      signOut: vi.fn(),
    } as UseAuthReturn);
  });

  const renderForgotPassword = (props = {}) => {
    return render(
      <BrowserRouter>
        <ForgotPassword {...props} />
      </BrowserRouter>
    );
  };

  it('renders correctly', () => {
    renderForgotPassword();
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByText(/Back to Sign In/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    renderForgotPassword();
    const emailInput = screen.getByLabelText(/Email Address/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeDisabled();
  });

  it('submits successfully and shows success message', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });

    expect(await screen.findByText(/Check Your Email/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('handles error during submission', async () => {
    const errorMessage = 'Too many requests. Please try again later.';
    mockResetPassword.mockRejectedValueOnce(new Error(errorMessage));
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('allows trying another email after success', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    renderForgotPassword();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    const tryAnotherButton = await screen.findByRole('button', { name: /Try Another Email/i });
    fireEvent.click(tryAnotherButton);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('calls onLoginClick when back link is clicked', () => {
    const onLoginClick = vi.fn();
    renderForgotPassword({ onLoginClick });
    
    fireEvent.click(screen.getByText(/Back to Sign In/i));
    expect(onLoginClick).toHaveBeenCalled();
  });
});
