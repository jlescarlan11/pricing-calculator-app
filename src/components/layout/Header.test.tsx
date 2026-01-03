import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: MemoryRouter });
  };

  it('renders the application title and subtitle', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('PriceCraft')).toBeInTheDocument();
    expect(screen.getByText(/Mindful Pricing/i)).toBeInTheDocument();
  });

  it('shows version information on desktop', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText(/v0\.1\.0/i)).toBeInTheDocument();
  });

  it('contains navigation links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('link', { name: /Calculator/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /How it works/i })).toHaveAttribute('href', '/help');
    expect(screen.getByRole('link', { name: /Pricing Tips/i })).toHaveAttribute('href', '/faq');
  });

  it('toggles mobile menu when sidebar is NOT present', () => {
    renderWithRouter(<Header showSidebarButton={false} />);
    
    const menuButton = screen.getByRole('button', { name: /Open main menu/i });
    fireEvent.click(menuButton);
    
    // Check if mobile menu links are visible
    const links = screen.getAllByRole('link', { name: /Calculator/i });
    expect(links.length).toBeGreaterThan(1);
  });

  it('calls onToggleSidebar when sidebar button is clicked', () => {
    const onToggleSidebar = vi.fn();
    renderWithRouter(<Header showSidebarButton={true} onToggleSidebar={onToggleSidebar} />);
    
    const sidebarButton = screen.getByRole('button', { name: /Toggle sidebar/i });
    fireEvent.click(sidebarButton);
    
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('shows different icon when sidebar is open', () => {
    renderWithRouter(<Header showSidebarButton={true} isSidebarOpen={true} />);
    
    const sidebarButton = screen.getByRole('button', { name: /Toggle sidebar/i });
    expect(sidebarButton).toHaveAttribute('aria-expanded', 'true');
  });
});