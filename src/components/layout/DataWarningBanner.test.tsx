import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataWarningBanner } from './DataWarningBanner';

describe('DataWarningBanner', () => {
  it('renders the warning message', () => {
    render(<DataWarningBanner />);

    expect(screen.getAllByText(/Your progress is temporary/i).length).toBeGreaterThan(0);
  });

  it('is dismissible', () => {
    render(<DataWarningBanner />);

    const bannerText = screen.getAllByText(/Your progress is temporary/i)[0];
    expect(bannerText).toBeInTheDocument();

    const dismissButton = screen.getByRole('button', { name: /Dismiss warning/i });
    fireEvent.click(dismissButton);

    expect(screen.queryByText(/Your progress is temporary/i)).not.toBeInTheDocument();
  });

  it('has appropriate accessibility roles', () => {
    render(<DataWarningBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
