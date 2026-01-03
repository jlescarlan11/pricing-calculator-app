import { render, screen } from '@testing-library/react';
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
});