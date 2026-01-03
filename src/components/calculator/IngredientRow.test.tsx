import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngredientRow } from './IngredientRow';

describe('IngredientRow', () => {
  const mockIngredient = {
    id: '123',
    name: 'Test Ingredient',
    amount: 100,
    cost: 50,
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
    expect(screen.getByLabelText(/^Amount/i)).toHaveValue(100);
    expect(screen.getByLabelText(/Cost/i)).toHaveValue(50);
  });

  it('calls onUpdate when inputs change', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
    });
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'name', 'New Name');

    const amountInput = screen.getByLabelText(/^Amount/i);
    act(() => {
      fireEvent.change(amountInput, { target: { value: '200' } });
    });
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('123', 'amount', '200');
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
    expect(screen.getByText('Remove Last Ingredient?')).toBeInTheDocument();

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: 'Remove' });
    act(() => {
      fireEvent.click(confirmBtn);
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

  it('handles Shift+Delete to remove row after animation', () => {
    vi.useFakeTimers();
    renderComponent({ isOnlyRow: false });

    // We can fire the event on the row container or an input.
    // The handler is on the main div, which bubbles.
    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    
    act(() => {
      fireEvent.keyDown(nameInput, { key: 'Delete', shiftKey: true });
    });

    expect(mockHandlers.onRemove).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockHandlers.onRemove).toHaveBeenCalledWith('123');
    vi.useRealTimers();
  });

  it('auto-focuses name input when autoFocus is true', () => {
    renderComponent({ autoFocus: true });
    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    expect(nameInput).toHaveFocus();
  });

  it('does not auto-focus when autoFocus is false', () => {
    renderComponent({ autoFocus: false });
    const nameInput = screen.getByLabelText(/Ingredient Name/i);
    expect(nameInput).not.toHaveFocus();
  });
  
  it('displays validation errors', () => {
    renderComponent({ 
      errors: { 
        name: 'Name required', 
        amount: 'Invalid amount' 
      } 
    });
    
    expect(screen.getByText('Name required')).toBeInTheDocument();
    expect(screen.getByText('Invalid amount')).toBeInTheDocument();
  });
});

