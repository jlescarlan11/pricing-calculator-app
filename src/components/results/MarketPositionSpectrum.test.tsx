import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarketPositionSpectrum } from './MarketPositionSpectrum';

describe('MarketPositionSpectrum', () => {
  it('renders the spectrum bar', () => {
    render(<MarketPositionSpectrum percentile={50} />);
    expect(screen.getByText('Budget')).toBeDefined();
    expect(screen.getByText('Mid-Market')).toBeDefined();
    expect(screen.getByText('Premium')).toBeDefined();
  });

  it('renders the "You" indicator when percentile is provided', () => {
    render(<MarketPositionSpectrum percentile={75} />);
    const indicator = screen.getByText('You');
    expect(indicator).toBeDefined();
    
    // Check if the positioning style is applied
    const indicatorContainer = indicator.closest('div')?.parentElement;
    expect(indicatorContainer?.style.left).toBe('75%');
  });

  it('does not render the "You" indicator when percentile is null', () => {
    render(<MarketPositionSpectrum percentile={null} />);
    expect(screen.queryByText('You')).toBeNull();
  });

  it('clamps percentile values between 0 and 100', () => {
    const { rerender } = render(<MarketPositionSpectrum percentile={150} />);
    let indicator = screen.getByText('You').closest('div')?.parentElement;
    expect(indicator?.style.left).toBe('100%');

    rerender(<MarketPositionSpectrum percentile={-50} />);
    indicator = screen.getByText('You').closest('div')?.parentElement;
    expect(indicator?.style.left).toBe('0%');
  });

  it('hides labels when showLabels is false', () => {
    render(<MarketPositionSpectrum percentile={50} showLabels={false} />);
    expect(screen.queryByText('Budget')).toBeNull();
    expect(screen.queryByText('Mid-Market')).toBeNull();
    expect(screen.queryByText('Premium')).toBeNull();
    expect(screen.queryByText('You')).toBeNull();
  });
});
