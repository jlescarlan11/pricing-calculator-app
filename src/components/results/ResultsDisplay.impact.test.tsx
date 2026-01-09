import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultsDisplay } from './ResultsDisplay';
import { ToastProvider } from '../shared/Toast';
import { PresetsProvider } from '../../context/PresetsContext';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import type { CalculationResult, CalculationInput, PricingConfig } from '../../types/calculator';

// Mock supabase to avoid auth issues in tests
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
    },
    from: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <PresetsProvider>
          <ToastProvider>{ui}</ToastProvider>
        </PresetsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 100,
  ingredients: [],
  laborCost: 0,
  overhead: 0,
  hasVariants: true,
  variants: [
    { id: '1', name: 'V1', batchSize: 25, ingredients: [], laborCost: 0, overhead: 0, pricingConfig: { strategy: 'margin', value: 50 } },
    { id: '2', name: 'V2', batchSize: 25, ingredients: [], laborCost: 0, overhead: 0, pricingConfig: { strategy: 'margin', value: 50 } },
    { id: '3', name: 'V3', batchSize: 25, ingredients: [], laborCost: 0, overhead: 0, pricingConfig: { strategy: 'margin', value: 50 } },
    { id: '4', name: 'V4', batchSize: 25, ingredients: [], laborCost: 0, overhead: 0, pricingConfig: { strategy: 'margin', value: 50 } },
  ],
};

const mockResults: CalculationResult = {
  totalCost: 100,
  costPerUnit: 1,
  breakEvenPrice: 1,
  recommendedPrice: 2,
  profitPerBatch: 100,
  profitPerUnit: 1,
  profitMarginPercent: 50,
  breakdown: { ingredients: 100, labor: 0, overhead: 0 },
  variantResults: [
    { id: '1', name: 'V1', totalCost: 25, costPerUnit: 1, recommendedPrice: 2, profitPerUnit: 1, profitMarginPercent: 50, breakEvenPrice: 1, batchSize: 25 },
    { id: '2', name: 'V2', totalCost: 25, costPerUnit: 1, recommendedPrice: 2, profitPerUnit: 1, profitMarginPercent: 50, breakEvenPrice: 1, batchSize: 25 },
    { id: '3', name: 'V3', totalCost: 25, costPerUnit: 1, recommendedPrice: 2, profitPerUnit: 1, profitMarginPercent: 50, breakEvenPrice: 1, batchSize: 25 },
    { id: '4', name: 'V4', totalCost: 25, costPerUnit: 1, recommendedPrice: 2, profitPerUnit: 1, profitMarginPercent: 50, breakEvenPrice: 1, batchSize: 25 },
  ],
};

const mockConfig: PricingConfig = { strategy: 'margin', value: 50 };

describe('ResultsDisplay Impact Summary Integration', () => {
  it('shows VariantResultsTable when fewer than 4 variants exist', () => {
    const smallResults = {
      ...mockResults,
      variantResults: mockResults.variantResults?.slice(0, 3)
    };

    renderWithProviders(
      <ResultsDisplay 
        results={smallResults} 
        input={mockInput} 
        config={mockConfig} 
        isPreviewMode={true}
      />
    );

    expect(screen.getByText(/Variant Performance/i)).toBeInTheDocument();
    expect(screen.queryByText(/Impact Summary/i)).not.toBeInTheDocument();
  });

  it('shows ImpactSummaryView when more than 3 variants exist and isPreviewMode is true', () => {
    renderWithProviders(
      <ResultsDisplay 
        results={mockResults} 
        input={mockInput} 
        config={mockConfig} 
        isPreviewMode={true}
      />
    );

    expect(screen.queryByText(/Variant Performance/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Impact Summary/i)).toBeInTheDocument();
  });

  it('shows VariantResultsTable when more than 3 variants exist but NOT in preview/analysis mode', () => {
    renderWithProviders(
      <ResultsDisplay 
        results={mockResults} 
        input={mockInput} 
        config={mockConfig} 
        isPreviewMode={false}
      />
    );

    expect(screen.getByText(/Variant Performance/i)).toBeInTheDocument();
    expect(screen.queryByText(/Impact Summary/i)).not.toBeInTheDocument();
  });
});
