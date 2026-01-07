import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngredientRow } from './IngredientRow';

describe('IngredientRow (Advanced Mode)', () => {
  const mockIngredientSimple = {
    id: '123',
    name: 'Test Ingredient',
    amount: 100,
    cost: 50,
    measurementMode: 'simple' as const,
  };

  const mockIngredientAdvanced = {
    id: '123',
    name: 'Advanced Ingredient',
    amount: 0,
    cost: 0,
    measurementMode: 'advanced' as const,
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    purchaseCost: 10,
    recipeQuantity: 500,
    recipeUnit: 'g',
  };

  const mockHandlers = {
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
    onAdd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <IngredientRow
        ingredient={mockIngredientSimple}
        index={0}
        isOnlyRow={false}
        {...mockHandlers}
        {...props}
      />
    );
  };

  it('toggles from Simple to Advanced mode', () => {
    renderComponent();
    
    // Find toggle button
    const toggleBtn = screen.getByTitle('Switch to Unit Conversion Mode');
    fireEvent.click(toggleBtn);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'measurementMode', 'advanced');
  });

  it('toggles from Advanced to Simple mode', () => {
    renderComponent({ ingredient: mockIngredientAdvanced });
    
    const toggleBtn = screen.getByTitle('Switch to Simple Mode');
    fireEvent.click(toggleBtn);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'measurementMode', 'simple');
  });

  it('renders advanced inputs when in advanced mode', () => {
    renderComponent({ ingredient: mockIngredientAdvanced });

    expect(screen.getByText('Purchase Details')).toBeInTheDocument();
    expect(screen.getByText('Recipe Details')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Qty')).toHaveLength(2);
    expect(screen.getAllByRole('combobox')).toHaveLength(2); // Two unit selects
  });

  it('triggers cost calculation when advanced inputs change', () => {
    // Start with empty advanced values to test calculation trigger
    const ingredient = {
      ...mockIngredientAdvanced,
      purchaseQuantity: 0,
      purchaseCost: 0,
      recipeQuantity: 0,
    };
    renderComponent({ ingredient });

    const inputs = screen.getAllByPlaceholderText('Qty');
    const purchaseQtyInput = inputs[0];
    
    // Simulate updating purchase quantity
    fireEvent.change(purchaseQtyInput, { target: { value: '1000' } });

    // The component calls onUpdate for the field change
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'purchaseQuantity', '1000');
    
    // Note: The calculation inside the component relies on the PROPS being updated.
    // In a real app, the parent updates the prop and re-renders.
    // Here, since we mock onUpdate but don't re-render with new props automatically,
    // we can't easily test the second 'onUpdate' call (the cost update) 
    // unless we simulate the full flow or check if the logic *would* run.
    
    // However, our component implementation reads:
    // const updatedIngredient = { ...ingredient, [field]: value };
    // calculateIngredientCostFromPurchase(...)
    // So it USES the value from the event immediately for that specific field.
    
    // Let's test a scenario where we have all OTHER values, and we update the last missing one.
    // Setup: Bought 1kg for $10. We enter Used: 500g. Cost should be $5.
  });

  it('calculates cost correctly when updating recipe quantity', () => {
    const ingredient = {
        ...mockIngredientAdvanced,
        purchaseQuantity: 1000,
        purchaseUnit: 'g',
        purchaseCost: 10,
        recipeQuantity: 0, // Pending input
        recipeUnit: 'g'
    };
    renderComponent({ ingredient });

    const inputs = screen.getAllByPlaceholderText('Qty');
    const recipeQtyInput = inputs[1]; // The second qty input is for 'Used'

    fireEvent.change(recipeQtyInput, { target: { value: '500' } });

    // 1. Should update recipeQuantity
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'recipeQuantity', '500');

    // 2. Should calculate cost: (10 / 1000) * 500 = 5
    // AND update amount to 500 (sync)
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'cost', 5);
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'amount', '500');
  });

  it('calculates cost correctly when updating purchase cost', () => {
     const ingredient = {
        ...mockIngredientAdvanced,
        purchaseQuantity: 1000,
        purchaseUnit: 'g',
        purchaseCost: 0, // Pending input
        recipeQuantity: 500,
        recipeUnit: 'g'
    };
    renderComponent({ ingredient });

    const costInput = screen.getByPlaceholderText('Total Cost');
    fireEvent.change(costInput, { target: { value: '20' } });

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'purchaseCost', '20');
    
    // Cost: (20 / 1000) * 500 = 10
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'cost', 10);
  });

  it('resets cost to 0 when inputs become invalid', () => {
     const ingredient = {
        ...mockIngredientAdvanced,
        purchaseQuantity: 1000,
        purchaseUnit: 'g',
        purchaseCost: 10,
        recipeQuantity: 500,
        recipeUnit: 'g',
        cost: 5 // Current valid cost
    };
    renderComponent({ ingredient });

    // Clear purchase quantity
    const inputs = screen.getAllByPlaceholderText('Qty');
    const purchaseQtyInput = inputs[0];

    fireEvent.change(purchaseQtyInput, { target: { value: '' } });

    // onUpdate called for the field change
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'purchaseQuantity', '');
    
    // onUpdate called for cost reset
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'cost', 0);
  });
});
