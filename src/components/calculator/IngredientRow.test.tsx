import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngredientRow } from './IngredientRow';

describe('IngredientRow', () => {
  const mockIngredient = {
    id: '123',
    name: 'Test Ingredient',
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    purchaseCost: 100,
    recipeQuantity: 100,
    recipeUnit: 'g',
    cost: 10,
    amount: 100,
    useFullQuantity: false,
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
        ingredient={mockIngredient}
        index={0}
        isOnlyRow={false}
        {...mockHandlers}
        {...props}
      />
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/Ingredient Name/i)).toHaveValue('Test Ingredient');
    const qtyInputs = screen.getAllByPlaceholderText('Qty');
    expect(qtyInputs[0]).toHaveValue(1000); // Purchase Qty
    expect(screen.getByPlaceholderText('Total Cost')).toHaveValue(100); // Purchase Cost
    expect(qtyInputs[1]).toHaveValue(100); // Recipe Qty
  });

  it('calls onUpdate when inputs change', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
    });
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'name', 'New Name');

    const purchaseQtyInput = screen.getAllByPlaceholderText('Qty')[0];
    act(() => {
      fireEvent.change(purchaseQtyInput, { target: { value: '2000' } });
    });
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'purchaseQuantity', '2000');
  });

  it('handles "Use 100% of purchase quantity" toggle', () => {
    renderComponent();

    const toggle = screen.getByLabelText(/Use 100% of purchase quantity/i);
    act(() => {
      fireEvent.click(toggle);
    });

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'useFullQuantity', true);
    // Should sync recipe fields
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'recipeQuantity', 1000);
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'recipeUnit', 'g');
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'cost', 100);
  });

  it('disables recipe inputs when useFullQuantity is true', () => {
    renderComponent({
      ingredient: { ...mockIngredient, useFullQuantity: true },
    });

    const qtyInputs = screen.getAllByPlaceholderText('Qty');
    const recipeQtyInput = qtyInputs[1];
    expect(recipeQtyInput).toBeDisabled();
  });

  it('calls onRemove after animation when not the only row', () => {
    vi.useFakeTimers();
    renderComponent({ isOnlyRow: false });

    const deleteBtn = screen.getByRole('button', { name: /Remove Test Ingredient/i });
    act(() => {
      fireEvent.click(deleteBtn);
    });

    // Should not be called immediately
    expect(mockHandlers.onRemove).not.toHaveBeenCalled();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockHandlers.onRemove).toHaveBeenCalledWith('123');
    vi.useRealTimers();
  });

  it('shows confirmation modal when removing the only row', async () => {
    vi.useFakeTimers();
    renderComponent({ isOnlyRow: true });

    const deleteBtn = screen.getByRole('button', { name: /Remove Test Ingredient/i });
    act(() => {
      fireEvent.click(deleteBtn);
    });

    // Mock should not be called yet
    expect(mockHandlers.onRemove).not.toHaveBeenCalled();

    // Modal should be visible
    expect(screen.getByText('Remove ingredient?')).toBeInTheDocument();

    // Click confirm
    const modalRemoveBtn = screen.getByRole('button', { name: /^Remove$/ });
    act(() => {
      fireEvent.click(modalRemoveBtn);
    });

    // Still not called immediately (wait for exit animation)
    expect(mockHandlers.onRemove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockHandlers.onRemove).toHaveBeenCalledWith('123');
    vi.useRealTimers();
  });

  it('handles Enter key to add new row', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    act(() => {
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    });

    expect(mockHandlers.onAdd).toHaveBeenCalled();
  });

  it('auto-focuses name input when autoFocus is true', () => {
    renderComponent({ autoFocus: true });
    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    expect(nameInput).toHaveFocus();
  });

  it('displays validation errors', () => {
    renderComponent({
      errors: {
        name: 'Name required',
        purchaseQuantity: 'Invalid qty',
      },
    });

    expect(screen.getByText('Name required')).toBeInTheDocument();
    expect(screen.getByText('Invalid qty')).toBeInTheDocument();
  });

  describe('Unit Compatibility', () => {
    it('filters recipe unit options based on purchase unit', () => {
      renderComponent({
        ingredient: { ...mockIngredient, purchaseUnit: 'kg', recipeUnit: 'g' },
      });

      const selects = screen.getAllByRole('combobox');
      const recipeUnitSelect = selects[1];

      // Helper to check options within a specific select
      const getOptions = (select: HTMLElement) => 
        Array.from(select.querySelectorAll('option')).map(opt => opt.textContent);

      const options = getOptions(recipeUnitSelect);

      // Weight units should be present, but 'kg' (the purchase unit) should be hidden
      expect(options).toContain('g');
      expect(options).not.toContain('kg');
      expect(options).toContain('oz');
      expect(options).toContain('lb');

      // Volume units should NOT be present in recipe unit options
      expect(options).not.toContain('L');
    });

    it('auto-updates recipe unit if purchase unit category changes', () => {
      renderComponent({
        ingredient: { ...mockIngredient, purchaseUnit: 'kg', recipeUnit: 'g' },
      });

      const selects = screen.getAllByRole('combobox');
      const purchaseUnitSelect = selects[0];

      act(() => {
        fireEvent.change(purchaseUnitSelect, { target: { value: 'l' } });
      });

      // Should update both purchaseUnit and recipeUnit because they were incompatible
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'purchaseUnit', 'l');
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'recipeUnit', 'l');
    });
  });
});
