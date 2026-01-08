import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SnapshotComparisonCard } from './SnapshotComparisonCard';

describe('SnapshotComparisonCard', () => {
  const defaultProps = {
    currentTotalCost: 150,
    currentRecommendedPrice: 300,
    currentMargin: 50,
    lastTotalCost: 100,
    lastRecommendedPrice: 200,
    lastMargin: 50,
    lastSnapshotDate: '2026-01-01T00:00:00.000Z',
  };

  it('renders all metrics', () => {
    render(<SnapshotComparisonCard {...defaultProps} />);

    expect(screen.getByText(/Total Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested Price/i)).toBeInTheDocument();
    expect(screen.getByText(/Profit Margin/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan 01, 2026/i)).toBeInTheDocument();
  });

  it('displays correct deltas when values increase', () => {
    render(<SnapshotComparisonCard {...defaultProps} />);

    // Cost increased by 50 (Positive delta for cost is red/rust)
    expect(screen.getByText('+₱50.00')).toBeInTheDocument();
    
    // Price increased by 100
    expect(screen.getByText('+₱100.00')).toBeInTheDocument();

    // Margin no change
    expect(screen.getByText(/No change/i)).toBeInTheDocument();
  });

  it('displays correct deltas when values decrease', () => {
    const props = {
      ...defaultProps,
      currentTotalCost: 80,
      currentRecommendedPrice: 180,
      currentMargin: 45,
    };
    render(<SnapshotComparisonCard {...props} />);

    // Use getAllByText and check for two occurrences since both cost and price dropped by 20
    const deltas = screen.getAllByText('-₱20.00');
    expect(deltas).toHaveLength(2);

    // Margin decreased by 5
    expect(screen.getByText('-5.00%')).toBeInTheDocument();
  });

  it('applies correct color classes for cost (negative is good)', () => {
    const props = {
      ...defaultProps,
      currentTotalCost: 80, // Decrease (good)
    };
    const { container } = render(<SnapshotComparisonCard {...props} />);
    
    const costDelta = screen.getByText('-₱20.00');
    expect(costDelta).toHaveClass('text-moss');
  });

  it('applies correct color classes for cost (positive is bad)', () => {
    const props = {
      ...defaultProps,
      currentTotalCost: 120, // Increase (bad)
    };
    render(<SnapshotComparisonCard {...props} />);
    
    const costDelta = screen.getByText('+₱20.00');
    expect(costDelta).toHaveClass('text-rust');
  });
});
