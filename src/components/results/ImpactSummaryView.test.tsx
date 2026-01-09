import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImpactSummaryView } from './ImpactSummaryView';
import type { CalculationResult, PricingConfig } from '../../types/calculator';

const mockResults: CalculationResult = {
  totalCost: 1000,
  costPerUnit: 10,
  breakEvenPrice: 10,
  recommendedPrice: 20,
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
      profitPerUnit: 10,
      profitMarginPercent: 50,
      breakEvenPrice: 10,
      batchSize: 20,
    },
    {
      id: '2',
      name: 'Variant 2',
      totalCost: 300,
      costPerUnit: 15,
      recommendedPrice: 30, // 50% margin
      profitPerUnit: 15,
      profitMarginPercent: 50,
      breakEvenPrice: 15,
      batchSize: 20,
    },
    {
      id: '3',
      name: 'Variant 3',
      totalCost: 400,
      costPerUnit: 20,
      recommendedPrice: 40, // 50% margin
      profitPerUnit: 20,
      profitMarginPercent: 50,
      breakEvenPrice: 20,
      batchSize: 20,
    },
    {
      id: '4',
      name: 'Variant 4',
      totalCost: 500,
      costPerUnit: 25,
      recommendedPrice: 50, // 50% margin
      profitPerUnit: 25,
      profitMarginPercent: 50,
      breakEvenPrice: 25,
      batchSize: 20,
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

    // Check if average change is displayed (formatted currency)
    // We expect something around 5.83
    expect(screen.getByText(/\+?₱\s?5\.83/)).toBeInTheDocument();
  });

  it('identifies the most impacted variant', () => {
    render(
      <ImpactSummaryView 
        results={mockResults} 
        previousConfig={mockPreviousConfig} 
      />
    );

    // Most impacted is Variant 4 (highest absolute delta/percent shift)
    // Actually all have same percent shift (40% to 50% margin is ~20% price increase)
    // 16.67 -> 20 (+20%), 25 -> 30 (+20%), etc.
    // So any could be "most impacted" if they have same percent. 
    // In our code, it's the first one in the sorted list.
    // Due to 2-decimal rounding in calculation results, Variant 3 
    // actually has a slightly higher calculated percent shift.
    expect(screen.getByText(/Variant 3/i)).toBeInTheDocument();
  });

  it('renders impact for suggested margin', () => {
    render(
      <ImpactSummaryView 
        results={mockResults} 
        suggestedMargin={60} // Suggesting 60% margin
      />
    );

    // Current is 50%. Suggesting 60%.
    // V1: Price 20 (50%). NewPrice(60%) = 10 / 0.4 = 25. Delta = 5.
    // V2: Price 30 (50%). NewPrice(60%) = 15 / 0.4 = 37.5. Delta = 7.5.
    // V3: Price 40 (50%). NewPrice(60%) = 20 / 0.4 = 50. Delta = 10.
    // V4: Price 50 (50%). NewPrice(60%) = 25 / 0.4 = 62.5. Delta = 12.5.
    // Avg Delta = (5+7.5+10+12.5)/4 = 8.75.

    expect(screen.getByText(/\+?₱\s?8\.75/)).toBeInTheDocument();
  });
});
