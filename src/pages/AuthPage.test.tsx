import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthPage } from './AuthPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UseAuthReturn } from '../hooks/useAuth';

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('AuthPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: false,
      user: null,
      session: null,
      isAuthenticated: false,
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      resendConfirmationEmail: vi.fn(),
    } as UseAuthReturn);
  });

  const renderAuthPage = (initialEntries = ['/auth']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/signup" element={<AuthPage />} />
          <Route path="/auth/forgot-password" element={<AuthPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders onboarding view by default', () => {
    renderAuthPage();
    expect(screen.getByText(/Sync Your Work/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In with Email/i })).toBeInTheDocument();
  });

  it('renders login view when navigating to /auth/login', () => {
    renderAuthPage(['/auth/login']);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders signup view when navigating to /auth/signup', () => {
    renderAuthPage(['/auth/signup']);
    expect(screen.getByText(/Create Account/i, { selector: 'h1' })).toBeInTheDocument();
  });

  it('renders forgot-password view when navigating to /auth/forgot-password', () => {
    renderAuthPage(['/auth/forgot-password']);
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
  });

  it('navigates between views', async () => {
    renderAuthPage();
    
    // Go to Login
    fireEvent.click(screen.getByRole('button', { name: /Sign In with Email/i }));
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    
    // Go to Forgot Password from Login
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
    
    // Go back to Login
    const backBtns = screen.getAllByText(/Back to Sign In/i);
    fireEvent.click(backBtns[0]);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it('redirects to the "from" location if user is already authenticated', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: false,
      user: { id: '123' },
      isAuthenticated: true,
    } as UseAuthReturn);

    render(
      <MemoryRouter initialEntries={[{ pathname: '/auth/login', state: { from: { pathname: '/calculator' } } }]}>
        <Routes>
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/calculator" element={<div>Calculator Content</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Calculator Content')).toBeInTheDocument();
  });
});
