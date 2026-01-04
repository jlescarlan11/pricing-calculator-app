import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VariantsCalculator } from './VariantsCalculator';
import * as usePresetsHook from '../../hooks/use-presets';
import * as validationUtils from '../../utils/variantValidation';

// Mock child components to simplify integration test and focus on orchestration
vi.mock('./VariantsComparisonTable', () => ({
  VariantsComparisonTable: () => <div data-testid="variants-comparison-table">Comparison Table</div>
}));

// Mock SavePresetModal to avoid useToast dependencies
vi.mock('../presets/SavePresetModal', () => ({
  SavePresetModal: ({ isOpen, onSave }: { isOpen: boolean, onSave: (name: string) => void }) => {
    if (!isOpen) return null;
    return (
      <div role="dialog">
        <button onClick={() => onSave('Saved Cookie')}>Save</button>
      </div>
    );
  }
}));

// Mock usePresets
const mockAddPreset = vi.fn();
vi.mock('../../hooks/use-presets', () => ({
  usePresets: () => ({
    addPreset: mockAddPreset,
    error: null,
  }),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

describe('VariantsCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddPreset.mockResolvedValue(true);
  });

  it('renders the initial state correctly', () => {
    render(<VariantsCalculator />);
    
    expect(screen.getByText('Variant Pricing')).toBeInTheDocument();
    expect(screen.getByText('Base Recipe')).toBeInTheDocument();
    expect(screen.getByText('Variants Configuration')).toBeInTheDocument();
    
    // Check initial inputs
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Batch Size/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Calculate All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Preset/i })).toBeInTheDocument();
  });

  it('validates required fields before calculation', async () => {
    render(<VariantsCalculator />);
    
    const calculateButton = screen.getByRole('button', { name: /Calculate All/i });
    
    fireEvent.click(calculateButton);
    
    // Expect validation errors
    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toHaveAttribute('aria-invalid', 'true');
    });
    
    expect(screen.queryByTestId('variants-comparison-table')).not.toBeInTheDocument();
  });

  it('updates base recipe state', () => {
    render(<VariantsCalculator />);
    
    const nameInput = screen.getByLabelText(/Product Name/i);
    fireEvent.change(nameInput, { target: { value: 'My Test Cookie' } });
    
    expect(nameInput).toHaveValue('My Test Cookie');
    
    const batchInput = screen.getByLabelText(/Total Batch Size/i);
    fireEvent.change(batchInput, { target: { value: '100' } });
    
    expect(batchInput).toHaveValue(100);
  });

  it('performs calculation when valid', async () => {
    render(<VariantsCalculator />);
    
    // 1. Fill Base Recipe
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Cookie' } });
    fireEvent.change(screen.getByLabelText(/Total Batch Size/i), { target: { value: '100' } });
    
    // Add an ingredient (BaseRecipeForm logic)
    // We need to find the "Add Shared Ingredient" button.
    const addIngBtn = screen.getByRole('button', { name: /Add Shared Ingredient/i });
    fireEvent.click(addIngBtn);
    
    // Fill ingredient details
    // Note: IngredientRow Input components have labels "Ingredient Name", "Amount", "Cost"
    const ingNameInputs = screen.getAllByLabelText(/Ingredient Name/i);
    const ingAmountInputs = screen.getAllByLabelText(/Amount/i);
    const ingCostInputs = screen.getAllByLabelText(/Cost/i);
    
    fireEvent.change(ingNameInputs[0], { target: { value: 'Flour' } });
    fireEvent.change(ingAmountInputs[0], { target: { value: '1000' } });
    fireEvent.change(ingCostInputs[0], { target: { value: '50' } });

    // 2. Configure Variant (Default one exists)
    // Use getByLabelText with regex to handle potential asterisks
    const variantNameInput = screen.getByLabelText(/Variant Name/i);
    fireEvent.change(variantNameInput, { target: { value: 'Single' } });
    
    // Quantity / Yield input
    const variantAmountInput = screen.getByLabelText(/Quantity \/ Yield/i);
    // We set amount to 10 to match the batch size of 10 we set below
    fireEvent.change(variantAmountInput, { target: { value: '10' } });

    // Update batch size to 10 to match variant amount (for validation)
    const batchSizeInput = screen.getByLabelText(/Total Batch Size/i);
    fireEvent.change(batchSizeInput, { target: { value: '10' } });
    
    // Trigger calculation
    const calculateButton = screen.getByRole('button', { name: /Calculate All/i });
    fireEvent.click(calculateButton);
    
    // Wait for results
    await waitFor(() => {
        expect(screen.getByTestId('variants-comparison-table')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('saves preset successfully', async () => {
    render(<VariantsCalculator />);
    
    // Fill minimum requirement for Save (Product Name)
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Saved Cookie' } });
    
    const saveButton = screen.getByRole('button', { name: /Save Preset/i });
    fireEvent.click(saveButton);
    
    // Modal should open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Click confirm in modal
    const confirmButton = screen.getByRole('button', { name: /Save Preset/i }); // Button inside modal
    // Note: Use getAllByRole if multiple buttons have same name, but usually modal button is specific.
    // Or assume the modal has a "Save" button.
    
    // Actually, SavePresetModal has "Save Preset" title and button.
    // Let's find the button inside the dialog.
    const modal = screen.getByRole('dialog');
    const modalSaveBtn =  within(modal).getByRole('button', { name: /Save/i }); // Might be "Save" or "Save Preset"
    
    fireEvent.click(modalSaveBtn);
    
    await waitFor(() => {
      expect(mockAddPreset).toHaveBeenCalled();
    });
  });
});

// Helper for 'within'
import { within } from '@testing-library/react';
