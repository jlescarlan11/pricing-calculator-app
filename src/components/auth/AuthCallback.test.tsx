import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './AuthCallback';
import { useAuth } from '../../hooks/useAuth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('AuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('renders loading state initially', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    expect(screen.getByText(/Completing sign in/i)).toBeInTheDocument();
  });

  it('redirects to home after successful authentication', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );

    // Should still show loading initially
    expect(screen.getByText(/Completing sign in/i)).toBeInTheDocument();

    // Advancing timers should redirect to home by default
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('redirects to the path stored in sessionStorage', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    // Set a custom redirect path
    sessionStorage.setItem('auth_redirect_path', '/custom-path');

    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/custom-path" element={<div>Custom Path Content</div>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Custom Path Content')).toBeInTheDocument();
    expect(sessionStorage.getItem('auth_redirect_path')).toBeNull();
  });
});
