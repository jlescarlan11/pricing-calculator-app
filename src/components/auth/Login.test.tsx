import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from './Login';
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

describe('Login Component', () => {
  const mockSignIn = vi.fn();
  const mockSignInWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      resendConfirmationEmail: vi.fn(),
      loading: false,
      user: null,
      session: null,
      isAuthenticated: false,
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      signOut: vi.fn(),
    } as UseAuthReturn);
  });

  const renderLogin = (props = {}) => {
    return render(
      <BrowserRouter>
        <Login {...props} />
      </BrowserRouter>
    );
  };

  it('renders all form fields and buttons', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });

  it('loads persisted email from localStorage', () => {
    localStorage.setItem('last_login_email', 'saved@example.com');
    renderLogin();
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('saved@example.com');
  });

  it('shows validation errors for empty fields on submit', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    // Initial state button is disabled because fields are empty
    expect(submitButton).toBeDisabled();

    // Fill and then clear to trigger touched
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email Address/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/^Password/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('calls signIn and persists email on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ user: { email: 'test@example.com' }, session: {} });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password123!' } });

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'Password123!');
    });
    
    expect(localStorage.getItem('last_login_email')).toBe('test@example.com');
    expect(mockNavigate).toHaveBeenCalledWith('/account', { replace: true });
  });

  it('displays error message on login failure', async () => {
    const errorMessage = 'Invalid email or password. Please try again.';
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'wrong-password' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Google button is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('calls onSignUpClick when sign up link is clicked', () => {
    const onSignUpClick = vi.fn();
    renderLogin({ onSignUpClick });
    
    fireEvent.click(screen.getByText(/Create Account/i));
    expect(onSignUpClick).toHaveBeenCalled();
  });

  it('calls onForgotPasswordClick when forgot password link is clicked', () => {
    const onForgotPasswordClick = vi.fn();
    renderLogin({ onForgotPasswordClick });
    
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    expect(onForgotPasswordClick).toHaveBeenCalled();
  });

  it('shows loading state on button during submission', async () => {
    mockSignIn.mockReturnValue(new Promise(() => {})); // Never resolves
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Button should be in loading state (implementation of Button handles this via spinner/disabled)
    // We expect the button to be disabled at least
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeDisabled();
  });
});
