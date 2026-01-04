import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VariantsList } from './VariantsList';
import type { VariantInput, VariantCalculation } from '../../types/variants';

// Mock VariantForm to verify props and simplify testing
vi.mock('./VariantForm', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  VariantForm: ({ variant, onUpdate, onDelete, autoFocusName }: any) => (
    <div data-testid={`variant-${variant.id}`}>
      <span data-testid={`variant-name-${variant.id}`}>{variant.name}</span>
      <input 
        data-testid={`variant-amount-${variant.id}`}
        value={variant.amount}
        onChange={(e) => onUpdate(variant.id, { amount: parseFloat(e.target.value) })}
      />
      <button onClick={() => onDelete(variant.id)} data-testid={`delete-${variant.id}`}>Delete</button>
      {autoFocusName && <span data-testid={`focus-${variant.id}`}>Focused</span>}
    </div>
  ),
}));

describe('VariantsList', () => {
  const mockUpdate = vi.fn();
  const totalBatchSize = 100;

  beforeEach(() => {
    mockUpdate.mockClear();
    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'new-variant-id'
      },
      writable: true
    });
  });

  const mockVariants: VariantInput[] = [
    {
      id: 'v1',
      name: 'Variant 1',
      amount: 50,
      unit: 'pc',
      additionalIngredients: [],
      additionalLabor: 0,
      pricingStrategy: 'markup',
      pricingValue: 50,
      currentSellingPrice: null,
    },
    {
      id: 'v2',
      name: 'Variant 2',
      amount: 30,
      unit: 'pc',
      additionalIngredients: [],
      additionalLabor: 0,
      pricingStrategy: 'markup',
      pricingValue: 50,
      currentSellingPrice: null,
    },
  ];

  const mockCalculations: Record<string, VariantCalculation> = {
    v1: { variantId: 'v1', baseCost: 10, additionalCost: 0, totalCost: 10, recommendedPrice: 15, profitMarginPercent: 33, profitPerUnit: 5, profitPerBatch: 250, breakEvenPrice: 10 },
    v2: { variantId: 'v2', baseCost: 10, additionalCost: 0, totalCost: 10, recommendedPrice: 15, profitMarginPercent: 33, profitPerUnit: 5, profitPerBatch: 150, breakEvenPrice: 10 },
  };

  it('renders all variants and allocation info', () => {
    render(
      <VariantsList
        variants={mockVariants}
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    expect(screen.getByTestId('variant-v1')).toBeInTheDocument();
    expect(screen.getByTestId('variant-v2')).toBeInTheDocument();
    
    // Allocation: 50 + 30 = 80 allocated, 20 remaining
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('/ 100')).toBeInTheDocument();
    expect(screen.getByText('20 units remaining')).toBeInTheDocument();
  });

  it('updates allocation status styles correctly (Under)', () => {
    render(
      <VariantsList
        variants={mockVariants} // 80/100
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );
    // Under allocation usually uses neutral/clay colors, but let's check for specific text
    expect(screen.getByText('20 units remaining')).toBeInTheDocument();
  });

  it('updates allocation status styles correctly (Exact)', () => {
    const exactVariants = [
      { ...mockVariants[0], amount: 50 },
      { ...mockVariants[1], amount: 50 },
    ];
    render(
      <VariantsList
        variants={exactVariants} // 100/100
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );
    expect(screen.getByText('Perfectly allocated')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('updates allocation status styles correctly (Over)', () => {
    const overVariants = [
      { ...mockVariants[0], amount: 60 },
      { ...mockVariants[1], amount: 50 },
    ];
    render(
      <VariantsList
        variants={overVariants} // 110/100
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );
    expect(screen.getByText('10 units over limit')).toBeInTheDocument();
  });

  it('adds a new variant with remaining quantity', () => {
    render(
      <VariantsList
        variants={mockVariants} // 80/100, remaining 20
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    const addButton = screen.getByRole('button', { name: /add another variant/i });
    fireEvent.click(addButton);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updatedVariants = mockUpdate.mock.calls[0][0];
    expect(updatedVariants).toHaveLength(3);
    expect(updatedVariants[2].amount).toBe(20); // Should auto-fill remaining
    expect(updatedVariants[2].name).toBe('');
  });

  it('disables add button when fully allocated', () => {
    const fullVariants = [
      { ...mockVariants[0], amount: 100 },
    ];
    render(
      <VariantsList
        variants={fullVariants}
        totalBatchSize={100}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    const addButton = screen.getByRole('button', { name: /add another variant/i });
    expect(addButton).toBeDisabled();
  });

  it('removes a variant', () => {
    render(
      <VariantsList
        variants={mockVariants}
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    const deleteBtn = screen.getByTestId('delete-v1');
    fireEvent.click(deleteBtn);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updatedVariants = mockUpdate.mock.calls[0][0];
    expect(updatedVariants).toHaveLength(1);
    expect(updatedVariants[0].id).toBe('v2');
  });

  it('prevents removing the last variant', () => {
     // The logic for preventing removal is inside handle Delete in VariantsList,
     // but the DELETE BUTTON visibility logic is inside VariantForm.
     // VariantsList `handleDelete` checks `if (variants.length <= 1) return;`.
     // We can test this by trying to trigger delete on a single variant.
     
     const singleVariant = [mockVariants[0]];
     render(
      <VariantsList
        variants={singleVariant}
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    const deleteBtn = screen.getByTestId('delete-v1');
    fireEvent.click(deleteBtn);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('passes autoFocusName to newly added variant', () => {
    // This requires us to simulate the state change where `newlyAddedId` matches the rendered variant.
    // Since `mockUpdate` is just a mock, the component won't re-render with the new variant automatically
    // unless we use a real parent or re-render manually.
    // However, we can inspect the implementation logic by checking if `VariantForm` receives the prop
    // when we pass a variant that matches the internal state.
    // A better integration test is needed here or we trust the logic.
    // Let's rely on the logic check: `autoFocusName={variant.id === newlyAddedId}`.
    // We can't easily test internal state `newlyAddedId` without triggering the add.
    // But `handleAddVariant` calls `setNewlyAddedId`.
    // We can try to test this by re-rendering with the new variant list after the click,
    // assuming the internal state persists? No, internal state persists only if component stays mounted.
    
    // Actually, `render` creates a component instance.
    // If we click add, `setNewlyAddedId` is called.
    // Then `onVariantsUpdate` is called.
    // The parent (test) would theoretically update the `variants` prop.
    // So we can use `rerender` with the new props.
    
    const { rerender } = render(
      <VariantsList
        variants={mockVariants}
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    const addButton = screen.getByRole('button', { name: /add another variant/i });
    fireEvent.click(addButton);

    // Get the ID of the new variant from the mock call
    const newVariants = mockUpdate.mock.calls[0][0];
    // const newVariant = newVariants[2]; // Unused
    
    // Rerender with the new variant
    rerender(
      <VariantsList
        variants={newVariants}
        totalBatchSize={totalBatchSize}
        onVariantsUpdate={mockUpdate}
        calculations={mockCalculations}
      />
    );

    // Check if the new variant is focused
    // In our mock, we render "Focused" if autoFocusName is true
    // The ID will be 'new-variant-id' because of our mock
    expect(screen.getByTestId(`focus-new-variant-id`)).toBeInTheDocument();
  });
});
