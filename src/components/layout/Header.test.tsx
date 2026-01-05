import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  })),
}));

describe('Header', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: MemoryRouter });
  };

  it('renders the application title and subtitle', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('PriceCraft')).toBeInTheDocument();
    expect(screen.getByText(/Mindful Pricing/i)).toBeInTheDocument();
  });

  it('shows version information in mobile menu', () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByRole('button', { name: /Open main menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText(/Version 0\.1\.0/i)).toBeInTheDocument();
  });

  it('contains navigation links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('link', { name: /Calculator/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /How it works/i })).toHaveAttribute('href', '/help');
    expect(screen.getByRole('link', { name: /Pricing Tips/i })).toHaveAttribute('href', '/faq');
  });

  it('toggles mobile menu', () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByRole('button', { name: /Open main menu/i });
    fireEvent.click(menuButton);

    // Check if mobile menu links are visible
    const links = screen.getAllByRole('link', { name: /Calculator/i });
    expect(links.length).toBeGreaterThan(1);
  });
});
