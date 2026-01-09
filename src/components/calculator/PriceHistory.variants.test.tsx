import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PriceHistory } from './PriceHistory';
import type { CalculationResult, Preset } from '../../types';

// Mock calculations
vi.mock('../../utils/calculations', () => ({
  performFullCalculation: vi.fn((base, config) => ({
    totalCost: 100,
    costPerUnit: 10,
    recommendedPrice: 20,
    profitMarginPercent: 50,
    variantResults: [
      {
        id: 'var-1',
        name: 'Variant 1',
        totalCost: 50, // Batch cost
        costPerUnit: 15,
        recommendedPrice: 30,
        profitMarginPercent: 50,
      },
      {
        id: 'var-2',
        name: 'Variant 2',
        totalCost: 60,
        costPerUnit: 12,
        recommendedPrice: 24,
        profitMarginPercent: 50,
      },
    ],
  })),
}));

const mockSnapshot: Preset = {
  id: 'snap-1',
  name: 'Snapshot 1',
  presetType: 'default',
  baseRecipe: {
    ingredients: [],
    laborCost: 0,
    overhead: 0,
    batchSize: 1,
    productName: 'Test',
    hasVariants: false,
    variants: [],
  },
  pricingConfig: { strategy: 'markup', value: 50 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isSnapshot: true,
  snapshotMetadata: {
    snapshotDate: new Date().toISOString(),
    versionNumber: 1,
    parentPresetId: 'parent-1',
  },
};

const mockCurrentResult: CalculationResult = {
  totalCost: 200,
  costPerUnit: 20,
  recommendedPrice: 40,
  profitMarginPercent: 50,
  breakEvenPrice: 20,
  profitPerBatch: 200,
  profitPerUnit: 20,
  breakdown: { ingredients: 100, labor: 50, overhead: 50 },
  variantResults: [
    {
      id: 'var-1',
      name: 'Variant 1',
      totalCost: 100,
      costPerUnit: 25,
      recommendedPrice: 50,
      profitMarginPercent: 50,
      breakEvenPrice: 25,
      profitPerUnit: 25,
      breakdown: { baseAllocation: 0, specificIngredients: 0, specificLabor: 0, specificOverhead: 0 },
    },
    {
      id: 'var-2',
      name: 'Variant 2',
      totalCost: 120,
      costPerUnit: 30,
      recommendedPrice: 60,
      profitMarginPercent: 50,
      breakEvenPrice: 30,
      profitPerUnit: 30,
      breakdown: { baseAllocation: 0, specificIngredients: 0, specificLabor: 0, specificOverhead: 0 },
    },
  ],
};

describe('PriceHistory Variant Selection', () => {
  const defaultProps = {
    presetId: 'parent-1',
    currentResult: mockCurrentResult,
    isUnsaved: false,
    snapshots: [mockSnapshot],
    onPin: vi.fn(),
    onRestore: vi.fn(),
    onVariantSelect: vi.fn(),
  };

  it('renders variant selector when variants exist', () => {
    render(<PriceHistory {...defaultProps} selectedVariantId="base" />);
    
    expect(screen.getByLabelText('Compare Context')).toBeInTheDocument();
    const select = screen.getByLabelText('Compare Context') as HTMLSelectElement;
    expect(select.value).toBe('base');
    expect(screen.getByText('Total Batch / Base Product')).toBeInTheDocument();
    expect(screen.getByText('Variant 1')).toBeInTheDocument();
    expect(screen.getByText('Variant 2')).toBeInTheDocument();
  });

  it('calls onVariantSelect when selection changes', () => {
    const onSelect = vi.fn();
    render(<PriceHistory {...defaultProps} selectedVariantId="base" onVariantSelect={onSelect} />);
    
    const select = screen.getByLabelText('Compare Context');
    fireEvent.change(select, { target: { value: 'var-1' } });
    
    expect(onSelect).toHaveBeenCalledWith('var-1');
  });

  it('displays base stats when base is selected', () => {
    // Current Base Total Cost: 200
    // Last Base Total Cost: 100
    // Delta: +100
    
    render(<PriceHistory {...defaultProps} selectedVariantId="base" />);
    
    expect(screen.getByText('₱200.00')).toBeInTheDocument(); 
    // We expect the delta to be displayed
    // The text content might be split by the icon, but generally testing library finds text content.
    // Based on DOM output: "+ ₱100.00"
    expect(screen.getByText((content, element) => {
        return element?.textContent === '+₱100.00';
    })).toBeInTheDocument();
  });

  it('displays variant stats when variant is selected', () => {
    // Current Variant 1 total cost: 100
    // Snapshot Variant 1 total cost: 50
    // Delta: +50
    
    render(<PriceHistory {...defaultProps} selectedVariantId="var-1" />);
    
    expect(screen.getByText('₱100.00')).toBeInTheDocument(); // Current
    expect(screen.getByText((content, element) => {
        return element?.textContent === '+₱50.00';
    })).toBeInTheDocument();
  });
});
