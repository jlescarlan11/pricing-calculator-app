import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
  })),
}));

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
    expect(screen.getAllByText(/Your progress is temporary/i).length).toBeGreaterThan(0);
  });

  it('renders version information in the footer', () => {
    renderWithRouter(<AppLayout>Content</AppLayout>);

    expect(screen.getByText(/Version 0\.1\.0/i)).toBeInTheDocument();
  });
});
