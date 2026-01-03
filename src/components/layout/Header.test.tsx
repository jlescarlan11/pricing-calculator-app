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
    expect(screen.getByText('Pricing Calculator')).toBeInTheDocument();
    expect(screen.getByText(/For Food Entrepreneurs/i)).toBeInTheDocument();
  });

  it('shows version information on desktop', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText(/v0\.1\.0-alpha/i)).toBeInTheDocument();
  });

  it('opens the help modal when clicking the help button', () => {
    renderWithRouter(<Header />);
    // In our new Header, "How it works" is a NavLink, but we might still have modals for some triggers
    // or we might need to update the test to check for navigation.
    // Wait, I replaced the desktop buttons with NavLinks.
    const helpLink = screen.getByRole('link', { name: /How it works/i });
    expect(helpLink).toBeInTheDocument();
    expect(helpLink).toHaveAttribute('href', '/help');
  });

  it('toggles mobile menu when sidebar is NOT present', () => {
    renderWithRouter(<Header showSidebarButton={false} />);
    
    const menuButton = screen.getByRole('button', { name: /Open main menu/i });
    fireEvent.click(menuButton);
    
    // There will be two "Pricing Tips" (one for desktop, one for mobile)
    const pricingTips = screen.getAllByText(/Pricing Tips/i);
    expect(pricingTips.length).toBeGreaterThan(1);
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
