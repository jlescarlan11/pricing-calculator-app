import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

    expect(screen.getByText('PriceCraft')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('renders the DataWarningBanner', () => {
    renderWithRouter(<AppLayout>Content</AppLayout>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Your progress is temporary/i)).toBeInTheDocument();
  });

  it('renders version information in the footer', () => {
    renderWithRouter(<AppLayout>Content</AppLayout>);
    
    expect(screen.getByText(/v0\.1\.0/i)).toBeInTheDocument();
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