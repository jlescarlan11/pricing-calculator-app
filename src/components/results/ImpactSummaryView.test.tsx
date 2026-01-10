import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImpactSummaryView } from './ImpactSummaryView';
import type { CalculationResult, PricingConfig } from '../../types/calculator';

const mockResults: CalculationResult = {
  totalCost: 1000,
  costPerUnit: 10,
  breakEvenPrice: 10,
  recommendedPrice: 20,
  recommendedPriceInclTax: 20,
  profitPerBatch: 1000,
  profitPerUnit: 10,
  profitMarginPercent: 50,
  breakdown: { ingredients: 500, labor: 300, overhead: 200 },
  variantResults: [
    {
      id: '1',
      name: 'Variant 1',
      totalCost: 200,
      costPerUnit: 10,
      recommendedPrice: 20, // 50% margin
      recommendedPriceInclTax: 20,
      profitPerUnit: 10,
      profitMarginPercent: 50,
      breakEvenPrice: 10,
      batchSize: 20,
      currentSellingPrice: 15,
    },
    {
      id: '2',
      name: 'Variant 2',
      totalCost: 300,
      costPerUnit: 15,
      recommendedPrice: 30, // 50% margin
      recommendedPriceInclTax: 30,
      profitPerUnit: 15,
      profitMarginPercent: 50,
      breakEvenPrice: 15,
      batchSize: 20,
      currentSellingPrice: 25,
    },
    {
      id: '3',
      name: 'Variant 3',
      totalCost: 400,
      costPerUnit: 20,
      recommendedPrice: 40, // 50% margin
      recommendedPriceInclTax: 40,
      profitPerUnit: 20,
      profitMarginPercent: 50,
      breakEvenPrice: 20,
      batchSize: 20,
      currentSellingPrice: 35,
    },
    {
      id: '4',
      name: 'Variant 4',
      totalCost: 500,
      costPerUnit: 25,
      recommendedPrice: 50, // 50% margin
      recommendedPriceInclTax: 50,
      profitPerUnit: 25,
      profitMarginPercent: 50,
      breakEvenPrice: 25,
      batchSize: 20,
      currentSellingPrice: 45,
    },
  ],
};

const mockPreviousConfig: PricingConfig = {
  strategy: 'margin',
  value: 40, // Previous margin was 40%
};

describe('ImpactSummaryView', () => {
  it('renders aggregated summary correctly for strategy change', () => {
    render(
      <ImpactSummaryView 
        results={mockResults} 
        previousConfig={mockPreviousConfig} 
      />
    );

    // Header check
    expect(screen.getByText(/Impact Summary \(4 variants\)/i)).toBeInTheDocument();

    // Average price change calculation:
    // V1: Cost 10, OldPrice(40%) = 10/(1-0.4) = 16.67. NewPrice(50%) = 20. Delta = 3.33
    // V2: Cost 15, OldPrice(40%) = 15/0.6 = 25. NewPrice(50%) = 30. Delta = 5
    // V3: Cost 20, OldPrice(40%) = 20/0.6 = 33.33. NewPrice(50%) = 40. Delta = 6.67
    // V4: Cost 25, OldPrice(40%) = 25/0.6 = 41.67. NewPrice(50%) = 50. Delta = 8.33
    // Total Delta = 3.33 + 5 + 6.67 + 8.33 = 23.33
    // Avg Delta = 23.33 / 4 = 5.83

    expect(screen.getByText(/\+?₱\s?5\.83/)).toBeInTheDocument();
  });

  it('identifies the most impacted variant', () => {
    render(
      <ImpactSummaryView 
        results={mockResults} 
        previousConfig={mockPreviousConfig} 
      />
    );

    // All variants have roughly the same percent shift. Variant 3 or 4 should be identified.
    // Given the sort order and rounding, Variant 3 matches in previous test.
    expect(screen.getByText(/Variant 3/i)).toBeInTheDocument();
  });

  it('toggles the expanded grid view', () => {
    render(
      <ImpactSummaryView 
        results={mockResults} 
        previousConfig={mockPreviousConfig} 
      />
    );

    const toggleButton = screen.getByText(/View All Impacts/i);
    fireEvent.click(toggleButton);

    expect(screen.getByText(/Psychological Rounding Editor/i)).toBeInTheDocument();
    expect(screen.getByText(/Hide All Impacts/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Hide All Impacts/i));
    expect(screen.queryByText(/Psychological Rounding Editor/i)).not.toBeInTheDocument();
  });

  it('calls onOverrideChange when manual price is edited', () => {
    const onOverrideChange = vi.fn();
    render(
      <ImpactSummaryView 
        results={mockResults} 
        previousConfig={mockPreviousConfig} 
        onOverrideChange={onOverrideChange}
      />
    );

    fireEvent.click(screen.getByText(/View All Impacts/i));

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '19.99' } });

    expect(onOverrideChange).toHaveBeenCalledWith('1', 19.99);
  });

  it('updates summary calculations based on overrides', () => {
    // We pass overrides as props now
    const overrides = { '1': 25 }; // Override Variant 1 to 25 (from 20)
    
    render(
      <ImpactSummaryView 
        results={mockResults} 
        previousConfig={mockPreviousConfig} 
        overrides={overrides}
      />
    );

    // V1 oldPrice = 16.67. NewPrice was 20 (delta 3.33). Now 25 (delta 8.33).
    // Total Delta change = +5.
    // New Total Delta = 23.33 + 5 = 28.33.
    // New Avg Delta = 28.33 / 4 = 7.08.

    expect(screen.getByText(/\+?₱\s?7\.08/)).toBeInTheDocument();
  });
});
