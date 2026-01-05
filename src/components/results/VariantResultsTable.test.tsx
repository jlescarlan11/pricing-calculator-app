import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VariantResultsTable } from './VariantResultsTable';
import type { CalculationResult } from '../../types/calculator';

describe('VariantResultsTable', () => {
  const mockResults: CalculationResult = {
    totalCost: 100,
    costPerUnit: 10,
    breakEvenPrice: 10,
    recommendedPrice: 15,
    profitPerBatch: 50,
    profitPerUnit: 5,
    profitMarginPercent: 33.3,
    breakdown: { ingredients: 80, labor: 10, overhead: 10 },
    variantResults: [
      {
        id: 'v1',
        name: 'Variant A',
        totalCost: 50,
        costPerUnit: 10,
        recommendedPrice: 20,
        profitPerUnit: 10,
        profitMarginPercent: 50,
        breakEvenPrice: 10,
        currentSellingPrice: 25,
        currentProfitPerUnit: 15,
        currentProfitMargin: 60
      },
      {
        id: 'v2',
        name: 'Variant B',
        totalCost: 50,
        costPerUnit: 10,
        recommendedPrice: 15,
        profitPerUnit: 5,
        profitMarginPercent: 33.3,
        breakEvenPrice: 10,
        // No current price
      }
    ]
  };

  it('renders variant results correctly', () => {
    render(<VariantResultsTable results={mockResults} />);
    
    expect(screen.getByText('Variant A')).toBeInTheDocument();
    expect(screen.getByText('Variant B')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText('20.00')).toBeInTheDocument(); // Rec Price A
    expect(screen.getByText('15.00')).toBeInTheDocument(); // Rec Price B
  });

  it('does NOT display "Best Margin" or "Best Profit" badges', () => {
    render(<VariantResultsTable results={mockResults} />);
    
    expect(screen.queryByText(/Best Margin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Best Profit/i)).not.toBeInTheDocument();
  });

  it('handles missing current price gracefully', () => {
    render(<VariantResultsTable results={mockResults} />);
    
    // Variant A has current price
    expect(screen.getByText('25.00')).toBeInTheDocument();
    
    // Variant B does not - should show "-"
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });
});
