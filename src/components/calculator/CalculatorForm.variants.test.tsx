import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CalculatorForm } from './CalculatorForm';
import { ToastProvider } from '../shared/Toast';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import type { CalculationInput, PricingConfig, CalculationResult } from '../../types/calculator';

// Mock usePresets
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(() => ({
    presets: [],
    addPreset: vi.fn(),
    deletePreset: vi.fn(),
  }))
}));

const TestWrapper = ({ 
  onCalculate, 
  initialInput, 
  initialConfig 
}: { 
  onCalculate?: (results: CalculationResult, input: CalculationInput, config: PricingConfig) => void; 
  initialInput?: CalculationInput;
  initialConfig?: PricingConfig;
}) => {
  const state = useCalculatorState({ input: initialInput, config: initialConfig });
  return (
    <ToastProvider>
      <CalculatorForm 
        {...state} 
        onUpdateInput={state.updateInput}
        onUpdateIngredient={state.updateIngredient}
        onAddIngredient={state.addIngredient}
        onRemoveIngredient={state.removeIngredient}
        onUpdateConfig={state.updateConfig}
        onCalculate={async () => {
          const res = await state.calculate();
          if (res && onCalculate) onCalculate(res, state.input, state.config);
        }}
        onReset={() => {
          state.reset();
        }}
        onSetHasVariants={state.setHasVariants}
        onAddVariant={state.addVariant}
        onRemoveVariant={state.removeVariant}
        onUpdateVariant={state.updateVariant}
        onUpdateVariantIngredient={state.updateVariantIngredient}
        onAddVariantIngredient={state.addVariantIngredient}
        onRemoveVariantIngredient={state.removeVariantIngredient}
      />
    </ToastProvider>
  );
};

describe('CalculatorForm Variants', () => {
  const mockOnCalculate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toggles variant mode UI', () => {
    render(<TestWrapper onCalculate={mockOnCalculate} />);
    
    // Initially OFF
    const toggle = screen.getByLabelText(/Enable Variants/i);
    expect(toggle).not.toBeChecked();
    
    // Check Single Mode UI exists (Pricing Strategy section)
    expect(screen.getByText(/Pricing Strategy/i)).toBeInTheDocument();
    
    // Toggle ON
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    
    // Check Variant UI appears
    expect(screen.getByText(/Base Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Remaining Base Batch/i)).toBeInTheDocument();
    
    // Single Mode UI hidden
    expect(screen.queryByText(/Pricing Strategy/i)).not.toBeInTheDocument();
  });

  it('adds a variant and updates capacity', async () => {
    const input = {
        productName: 'Test Base',
        batchSize: 10,
        ingredients: [{ id: '1', name: 'Flour', amount: 1000, cost: 50 }],
        laborCost: 0,
        overhead: 0,
        hasVariants: true, // Start with variants enabled
        variants: []
    };
    
    render(<TestWrapper initialInput={input} />);
    
    // Verify initial remaining batch
    expect(screen.getByText('10')).toBeInTheDocument(); // 10 units remaining
    
    // Add Variant
    const addBtn = screen.getByText(/Add Variant/i);
    fireEvent.click(addBtn);
    
    // New variant should take up all remaining space (10)
    // Wait for update
    const variantNameInput = await screen.findByDisplayValue('Variant 1');
    expect(variantNameInput).toBeInTheDocument();
    
    // Remaining should now be 0
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Button should be disabled / text changed
    expect(screen.getByText(/No Batch Capacity Remaining/i)).toBeInTheDocument();
    
    // Reduce variant batch size to 6
    // Find the variant card to scope search
    const variantCard = variantNameInput.closest('.border-l-4');
    expect(variantCard).not.toBeNull();
    
    // Find input with value 10 inside this card
    const batchInput = within(variantCard as HTMLElement).getByDisplayValue('10');
    fireEvent.change(batchInput, { target: { value: '6' } });
    
    // Remaining should be 4
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Button enabled again
    expect(screen.getByRole('button', { name: 'Add Variant' })).toBeInTheDocument();
  });

  it('removes a variant and restores capacity', async () => {
    const input = {
        productName: 'Test Base',
        batchSize: 10,
        ingredients: [],
        laborCost: 0,
        overhead: 0,
        hasVariants: true,
        variants: [
            { id: 'v1', name: 'Variant A', batchSize: 5, ingredients: [], laborCost: 0, overhead: 0, pricingConfig: { strategy: 'markup', value: 50 } }
        ]
    };
    
    render(<TestWrapper initialInput={input} />);
    
    expect(screen.getByText('5')).toBeInTheDocument(); // Remaining
    
    const removeBtn = screen.getByLabelText('Remove Variant');
    fireEvent.click(removeBtn);
    
    // Restores full capacity
    expect(await screen.findByText('10')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Variant A')).not.toBeInTheDocument();
  });
});
