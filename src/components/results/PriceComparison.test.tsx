import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceComparison } from './PriceComparison';

describe('PriceComparison', () => {
  const defaultProps = {
    currentPrice: 12,
    recommendedPrice: 15,
    costPerUnit: 10,
    batchSize: 10,
  };

  it('does not render if currentPrice is undefined', () => {
    const { container } = render(<PriceComparison {...defaultProps} currentPrice={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render if currentPrice is 0', () => {
    const { container } = render(<PriceComparison {...defaultProps} currentPrice={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when currentPrice is lower than recommendedPrice', () => {
    render(<PriceComparison {...defaultProps} currentPrice={12} recommendedPrice={15} />);

    expect(screen.getByText('₱12.00')).toBeDefined();
    expect(screen.getByText('₱15.00')).toBeDefined();
    expect(screen.getByText(/There's an opportunity for ₱3.00 more per unit/i)).toBeDefined();
  });

  it('renders correctly when currentPrice is higher than recommendedPrice', () => {
    render(<PriceComparison {...defaultProps} currentPrice={20} recommendedPrice={15} />);

    expect(screen.getByText('₱20.00')).toBeDefined();
    expect(screen.getByText('₱15.00')).toBeDefined();
    expect(screen.getByText(/Your price is ₱5.00 higher than the recommendation/i)).toBeDefined();
  });

  it('renders correctly when currentPrice matches recommendedPrice', () => {
    render(<PriceComparison {...defaultProps} currentPrice={15} recommendedPrice={15} />);

    expect(screen.getByText(/Your pricing is perfectly aligned/i)).toBeDefined();
  });
  it('calculates current profit correctly', () => {
    render(<PriceComparison {...defaultProps} currentPrice={12} costPerUnit={10} batchSize={10} />);

    // Profit per unit: 12 - 10 = 2
    expect(screen.getByText('₱2.00')).toBeDefined();
    // Profit per batch: 2 * 10 = 20
    expect(screen.getByText('₱20.00')).toBeDefined();
  });

  it('shows negative profit in red', () => {
    render(<PriceComparison {...defaultProps} currentPrice={8} costPerUnit={10} batchSize={10} />);

    // In PHP locale, negative might be -₱2.00
    const profitUnit = screen.getByText(/2\.00/);
    expect(profitUnit).toBeDefined();
    expect(profitUnit.className).toContain('text-rust');
  });
});
