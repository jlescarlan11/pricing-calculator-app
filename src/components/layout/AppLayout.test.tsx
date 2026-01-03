import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: MemoryRouter });
  };

  it('renders the title and children', () => {
    renderWithRouter(
      <AppLayout>
        <div data-testid="test-child">Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Pricing Calculator')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('renders the DataWarningBanner', () => {
    renderWithRouter(<AppLayout>Content</AppLayout>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Your data is only saved in this browser session/i)).toBeInTheDocument();
  });

  it('renders version information in the footer', () => {
    renderWithRouter(<AppLayout>Content</AppLayout>);
    
    expect(screen.getByText(/Version 0\.1\.0-alpha/i)).toBeInTheDocument();
  });

  it('shows the sidebar toggle on mobile when sidebar prop is provided', () => {
    renderWithRouter(
      <AppLayout sidebar={<div data-testid="sidebar-content">Sidebar Content</div>}>
        Content
      </AppLayout>
    );

    const toggleButton = screen.getByRole('button', { name: /Toggle sidebar/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('does not show the sidebar toggle when sidebar prop is not provided', () => {
    renderWithRouter(<AppLayout>Content</AppLayout>);
    
    const toggleButton = screen.queryByRole('button', { name: /Toggle sidebar/i });
    expect(toggleButton).not.toBeInTheDocument();
  });

  it('toggles the sidebar when the button is clicked', () => {
    renderWithRouter(
      <AppLayout sidebar={<div data-testid="sidebar-content">Sidebar Content</div>}>
        Content
      </AppLayout>
    );

    const toggleButton = screen.getByRole('button', { name: /Toggle sidebar/i });
    
    // Initially closed on mobile (hidden class) - testing logic instead of CSS classes strictly
    // but we can check if it's "expanded"
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
