import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingRecommendations } from './PricingRecommendations';
import type { CalculationResult } from '../../types/calculator';

describe('PricingRecommendations', () => {
  const mockResults: CalculationResult = {
    totalCost: 100,
    costPerUnit: 10,
    breakEvenPrice: 10,
    recommendedPrice: 15,
    profitPerBatch: 50,
    profitPerUnit: 5,
    profitMarginPercent: 33.33,
    breakdown: {
      ingredients: 6,
      labor: 3,
      overhead: 1,
    },
  };

  it('renders recommended price prominently', () => {
    render(<PricingRecommendations results={mockResults} />);
    expect(screen.getByText('₱15.00')).toBeDefined();
    expect(screen.getByText(/Recommended Selling Price/i)).toBeDefined();
  });

  it('renders secondary metrics correctly', () => {
    render(<PricingRecommendations results={mockResults} />);
    expect(screen.getByText('₱10.00')).toBeDefined(); // Break-even
    expect(screen.getByText('33.33%')).toBeDefined(); // Margin
    expect(screen.getByText('₱5.00')).toBeDefined(); // Profit per unit
    expect(screen.getByText('₱50.00')).toBeDefined(); // Total batch profit
  });

  it('shows healthy profit margin badge for > 25%', () => {
    render(<PricingRecommendations results={mockResults} />);
    const badge = screen.getByText('Healthy profit margin');
    expect(badge).toBeDefined();
    expect(badge.className).toContain('bg-green-100');
  });

  it('shows modest but workable badge for 15-25%', () => {
    const modestResults = { ...mockResults, profitMarginPercent: 20 };
    render(<PricingRecommendations results={modestResults} />);
    const badge = screen.getByText('Modest but workable');
    expect(badge).toBeDefined();
    expect(badge.className).toContain('bg-amber-100');
  });

  it('shows risky badge for < 15%', () => {
    const riskyResults = { ...mockResults, profitMarginPercent: 10 };
    render(<PricingRecommendations results={riskyResults} />);
    const badge = screen.getByText('Very tight margins - risky');
    expect(badge).toBeDefined();
    expect(badge.className).toContain('bg-red-100');
  });
});
