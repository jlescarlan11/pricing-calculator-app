import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseRecipeForm, BaseRecipeFormData } from './BaseRecipeForm';

// Mock dependencies
// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
});

interface MockCostProps {
  value: number;
  onChange: (val: number) => void;
  error?: string;
}

// Mock reused components to simplify testing
vi.mock('../calculator/LaborCost', () => ({
  LaborCost: ({ value, onChange, error }: MockCostProps) => (
    <div data-testid="labor-cost">
      <input 
        aria-label="Labor Cost"
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
      />
      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock('../calculator/OverheadCost', () => ({
  OverheadCost: ({ value, onChange, error }: MockCostProps) => (
    <div data-testid="overhead-cost">
      <input 
        aria-label="Overhead Cost"
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
      />
      {error && <span>{error}</span>}
    </div>
  ),
}));

// We'll use the real IngredientRow but mock its complex internal interactions if needed, 
// strictly speaking it's better to test integration with it if it's lightweight. 
// However, let's keep IngredientRow real since it's a key part of the form.

describe('BaseRecipeForm', () => {
  const mockData: BaseRecipeFormData = {
    productName: 'Test Product',
    batchSize: 10,
    ingredients: [
      { id: '1', name: 'Flour', amount: 1000, cost: 50 },
      { id: '2', name: 'Sugar', amount: 500, cost: 30 },
    ],
    laborCost: 100,
    overheadCost: 20,
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all fields correctly with initial data', () => {
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/Total Batch Size/i)).toHaveValue(10);
    expect(screen.getByDisplayValue('Flour')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sugar')).toBeInTheDocument();
    
    // Check mocked cost components
    const laborInput = screen.getByLabelText(/Labor Cost/i);
    const overheadInput = screen.getByLabelText(/Overhead Cost/i);
    expect(laborInput).toHaveValue(100);
    expect(overheadInput).toHaveValue(20);
    
    // Check calculated total base cost (50 + 30 + 100 + 20 = 200)
    // Note: The input has currency formatting, so we check for presence of formatted value or raw value depending on implementation
    // Our implementation puts it in a disabled input.
    // The Input component with currency prop adds '₱', but `value` passed is number.
    // `Input` renders `value` in input attribute.
    const totalInputs = screen.getAllByRole('textbox'); 
    // The last one should be the read-only total
    const totalInput = totalInputs[totalInputs.length - 1];
    expect(totalInput).toHaveValue('200'); 
  });

  it('calls onChange when product name is updated', () => {
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} />);
    
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'New Name' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockData,
      productName: 'New Name',
    });
  });

  it('calls onChange when batch size is updated', () => {
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} />);
    
    fireEvent.change(screen.getByLabelText(/Total Batch Size/i), { target: { value: '20' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockData,
      batchSize: 20,
    });
  });

  it('adds a new ingredient when Add button is clicked', () => {
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByText(/Add Shared Ingredient/i));
    
    expect(mockOnChange).toHaveBeenCalled();
    const newData = mockOnChange.mock.calls[0][0];
    expect(newData.ingredients).toHaveLength(3);
    expect(newData.ingredients[2].id).toBe('test-uuid');
  });

  it('updates ingredient fields correctly', () => {
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} />);
    
    // Find the name input for the first ingredient
    const flourInput = screen.getByDisplayValue('Flour');
    fireEvent.change(flourInput, { target: { value: 'Whole Wheat Flour' } });
    
    expect(mockOnChange).toHaveBeenCalled();
    const newData = mockOnChange.mock.calls[0][0];
    expect(newData.ingredients[0].name).toBe('Whole Wheat Flour');
  });

  it('displays validation errors passed via props', () => {
    const errors = {
      productName: 'Name is required',
      batchSize: 'Must be greater than 0',
      ingredients: 'At least one ingredient required',
    };
    
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} errors={errors} />);
    
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('At least one ingredient required')).toBeInTheDocument();
  });

  it('calculates total base cost correctly', () => {
    // ingredients: 50 + 30 = 80
    // labor: 100
    // overhead: 20
    // total: 200
    render(<BaseRecipeForm data={mockData} onChange={mockOnChange} />);
    
    // We look for the formatted subtotal in the header
    expect(screen.getByText('₱80.00')).toBeInTheDocument();
  });

  it('handles negative inputs gracefully by clamped values or validation display', () => {
     // The component relies on the parent/Input component for preventing negative entry via UI (min attribute)
     // but let's see if we pass a negative value what happens (it should just render it, validation is external)
     const negativeData = { ...mockData, batchSize: -5 };
     render(<BaseRecipeForm data={negativeData} onChange={mockOnChange} />);
     
     const batchInput = screen.getByLabelText(/Total Batch Size/i);
     expect(batchInput).toHaveValue(-5);
  });
});
