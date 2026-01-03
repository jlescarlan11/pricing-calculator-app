import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataWarningBanner } from './DataWarningBanner';

describe('DataWarningBanner', () => {
  it('renders the warning message', () => {
    render(<DataWarningBanner />);
    
    expect(screen.getByText(/Your data is only saved in this browser session/i)).toBeInTheDocument();
  });

  it('is dismissible', () => {
    render(<DataWarningBanner />);
    
    const bannerText = screen.getByText(/Your data is only saved in this browser session/i);
    expect(bannerText).toBeInTheDocument();
    
    const dismissButton = screen.getByRole('button', { name: /Dismiss warning/i });
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText(/Your data is only saved in this browser session/i)).not.toBeInTheDocument();
  });

  it('has appropriate accessibility roles', () => {
    render(<DataWarningBanner />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
