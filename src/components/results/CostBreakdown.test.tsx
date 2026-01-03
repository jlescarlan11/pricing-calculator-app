import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CostBreakdown } from './CostBreakdown';
import type { CalculationResult } from '../../types/calculator';

const mockResults: CalculationResult = {
  totalCost: 1000,
  costPerUnit: 50,
  breakdown: {
    ingredients: 700,
    labor: 200,
    overhead: 100,
  },
  breakEvenPrice: 50,
  recommendedPrice: 75,
  profitPerBatch: 500,
  profitPerUnit: 25,
  profitMarginPercent: 33.33,
};

describe('CostBreakdown', () => {
  it('renders total batch cost and cost per unit correctly', () => {
    render(<CostBreakdown results={mockResults} />);
    expect(screen.getByText('₱1,000.00')).toBeDefined();
    expect(screen.getByText('₱50.00')).toBeDefined();
  });

  it('renders breakdown categories with correct values', () => {
    render(<CostBreakdown results={mockResults} />);
    
    expect(screen.getByText('Ingredients')).toBeDefined();
    expect(screen.getByText('₱700.00')).toBeDefined();
    expect(screen.getByText('70.00%')).toBeDefined();

    expect(screen.getByText('Labor')).toBeDefined();
    expect(screen.getByText('₱200.00')).toBeDefined();
    expect(screen.getByText('20.00%')).toBeDefined();

    expect(screen.getByText('Overhead')).toBeDefined();
    expect(screen.getByText('₱100.00')).toBeDefined();
    expect(screen.getByText('10.00%')).toBeDefined();
  });

  it('handles zero total cost gracefully', () => {
    const zeroResults: CalculationResult = {
      ...mockResults,
      totalCost: 0,
      costPerUnit: 0,
      breakdown: {
        ingredients: 0,
        labor: 0,
        overhead: 0,
      },
    };
    render(<CostBreakdown results={zeroResults} />);
    expect(screen.getAllByText('₱0.00').length).toBeGreaterThan(0);
    const percentages = screen.getAllByText('0.00%');
    expect(percentages).toHaveLength(3);
  });
});