import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignUp } from './SignUp';
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

describe('SignUp Component', () => {
  const mockSignUp = vi.fn();
  const mockSignInWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: vi.fn(),
      resendConfirmationEmail: vi.fn(),
      loading: false,
      user: null,
      session: null,
      isAuthenticated: false,
      signIn: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      signOut: vi.fn(),
    } as UseAuthReturn);
  });

  const renderSignUp = () => {
    return render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
  };

  it('renders all form fields', () => {
    renderSignUp();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to the/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email on blur', async () => {
    renderSignUp();
    const emailInput = screen.getByLabelText(/Email Address/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('updates password strength requirements as user types', () => {
    renderSignUp();
    const passwordInput = screen.getByLabelText(/^Password/i);

    // Requirements only show when password is not empty
    fireEvent.change(passwordInput, { target: { value: 'p' } });

    // Initial state: 'Minimum 8 characters' should be visible and have text-ink-500 (not met)
    expect(screen.getByText(/Minimum 8 characters/i)).toHaveClass('text-ink-500');

    fireEvent.change(passwordInput, { target: { value: 'Pass123!' } });

    // After typing 'Pass123!', most requirements should be met (text-ink-900)
    expect(screen.getByText(/Minimum 8 characters/i)).toHaveClass('text-ink-900');
    expect(screen.getByText(/At least one uppercase letter/i)).toHaveClass('text-ink-900');
    expect(screen.getByText(/At least one lowercase letter/i)).toHaveClass('text-ink-900');
    expect(screen.getByText(/At least one number/i)).toHaveClass('text-ink-900');
    expect(screen.getByText(/At least one special character/i)).toHaveClass('text-ink-900');
  });

  it('shows error when passwords do not match', async () => {
    renderSignUp();
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.blur(confirmInput);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('disables submit button if terms are not accepted', () => {
    renderSignUp();
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongPass123!' } });

    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/I agree to the/i));
    expect(submitButton).not.toBeDisabled();
  });

  it('calls signUp and shows success message on successful registration', async () => {
    mockSignUp.mockResolvedValueOnce({ user: { email: 'test@example.com' }, session: null });
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'StrongPass123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'StrongPass123!' } });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'StrongPass123!');
    
    expect(await screen.findByText(/Check your email/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('shows error message if signUp fails', async () => {
    mockSignUp.mockRejectedValueOnce(new Error('User already registered'));
    renderSignUp();

    // Fill valid form
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'StrongPass123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'StrongPass123!' } });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText(/User already registered/i)).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Google button is clicked', () => {
    renderSignUp();
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    renderSignUp();
    const passwordInput = screen.getByLabelText(/^Password/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
