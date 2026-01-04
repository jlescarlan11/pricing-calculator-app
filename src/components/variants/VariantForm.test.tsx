import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { VariantForm } from './VariantForm';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import type { VariantInput, VariantCalculation } from '../../types/variants';

describe('VariantForm', () => {
  const mockVariant: VariantInput = {
    id: 'v1',
    name: 'Test Variant',
    amount: 10,
    unit: 'pcs',
    additionalIngredients: [],
    additionalLabor: 5,
    pricingStrategy: 'markup',
    pricingValue: 50,
    currentSellingPrice: null,
  };

  const mockCalculation: VariantCalculation = {
    variantId: 'v1',
    baseCost: 20,
    additionalCost: 10,
    totalCost: 30,
    costPerUnit: 30,
    breakEvenPrice: 30,
    recommendedPrice: 45,
    profitPerUnit: 15,
    profitMarginPercent: 33.33,
    profitPerBatch: 150,
    breakdown: {
      ingredients: 25,
      labor: 5,
      overhead: 0,
    },
  };

  const defaultProps = {
    variant: mockVariant,
    index: 0,
    totalBatchSize: 100,
    isOnlyVariant: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    calculation: mockCalculation,
  };

  it('renders variant name and collapsed state initially', () => {
    render(<VariantForm {...defaultProps} />);
    
    // Header should be visible
    expect(screen.getByText('Test Variant')).toBeInTheDocument();
    
    // Should be expanded by default
    expect(screen.getByRole('textbox', { name: /Variant Name/i })).toBeInTheDocument();
  });

  it('toggles collapse state on header click', () => {
    render(<VariantForm {...defaultProps} />);
    
    const header = screen.getByText('Test Variant').closest('div')?.parentElement;
    
    if (header) {
      // First click: Collapse
      fireEvent.click(header);
      expect(screen.queryByRole('textbox', { name: /Variant Name/i })).not.toBeInTheDocument();
      
      // Second click: Expand
      fireEvent.click(header);
      expect(screen.getByRole('textbox', { name: /Variant Name/i })).toBeInTheDocument();
    } else {
        throw new Error("Header not found");
    }
  });

  it('calls onUpdate when inputs change', () => {
    render(<VariantForm {...defaultProps} />);
    
    const nameInput = screen.getByRole('textbox', { name: /Variant Name/i });
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith('v1', { name: 'New Name' });
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<VariantForm {...defaultProps} />);
    
    const deleteBtn = screen.getByLabelText('Delete variant');
    fireEvent.click(deleteBtn);
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith('v1');
  });

  it('hides delete button if isOnlyVariant is true', () => {
    render(<VariantForm {...defaultProps} isOnlyVariant={true} />);
    
    expect(screen.queryByLabelText('Delete variant')).not.toBeInTheDocument();
  });

  it('displays correct calculation results', () => {
    render(<VariantForm {...defaultProps} />);
    
    // Check for base cost, additional cost, recommended price using formatter
    expect(screen.getByText(formatCurrency(45))).toBeInTheDocument(); // Recommended Price
    expect(screen.getByText(formatCurrency(20))).toBeInTheDocument(); // Base Cost
    expect(screen.getByText(formatCurrency(10))).toBeInTheDocument(); // Added Cost
  });

  it('handles adding additional ingredients', () => {
    render(<VariantForm {...defaultProps} />);
    
    const addBtn = screen.getByText('Add Ingredient');
    fireEvent.click(addBtn);
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(
      'v1', 
      expect.objectContaining({
        additionalIngredients: expect.arrayContaining([
            expect.objectContaining({ name: '', amount: 0 })
        ])
      })
    );
  });

  it('displays percentage of batch correctly', () => {
    render(<VariantForm {...defaultProps} totalBatchSize={20} variant={{...mockVariant, amount: 10}} />);
    
    // 10 / 20 = 50%
    const percentText = formatPercent(50);
    // Escape special regex chars if any (though usually fine for simple strings)
    const regex = new RegExp(`Represents ${percentText} of the total batch`, 'i');
    expect(screen.getByText(regex)).toBeInTheDocument();
  });
});
