import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
  })),
}));

const TestWrapper = ({
  onCalculate,
  initialInput,
  initialConfig,
}: {
  onCalculate?: (
    results: CalculationResult,
    input: CalculationInput,
    config: PricingConfig
  ) => void;
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
          if (
            window.confirm(
              'Are you sure you want to clear the form? This will remove all your progress.'
            )
          ) {
            state.reset();
          }
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

describe('CalculatorForm', () => {
  const mockOnCalculate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all sub-components', () => {
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Labor Cost/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Overhead Cost/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Pricing Strategy/i })).toBeInTheDocument();
  });

  it('updates product name and saves to session storage', async () => {
    vi.useFakeTimers();
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'New Product' } });

    expect(input).toHaveValue('New Product');

    // Fast-forward for the auto-save effect
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Check session storage
    const storedStr = window.sessionStorage.getItem('pricing_calculator_draft');
    expect(storedStr).not.toBeNull();
    const stored = JSON.parse(storedStr!);
    expect(stored.input.productName).toBe('New Product');
    vi.useRealTimers();
  });

  it('updates business name and saves to session storage', async () => {
    vi.useFakeTimers();
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    const input = screen.getByLabelText(/Business Name/i);
    fireEvent.change(input, { target: { value: 'My Bakery' } });

    expect(input).toHaveValue('My Bakery');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const storedStr = window.sessionStorage.getItem('pricing_calculator_draft');
    const stored = JSON.parse(storedStr!);
    expect(stored.input.businessName).toBe('My Bakery');
    vi.useRealTimers();
  });

  it('adds and removes ingredients', () => {
    vi.useFakeTimers();
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    const addButton = screen.getByText(/Add Item/i);
    fireEvent.click(addButton);

    expect(screen.getAllByLabelText(/Ingredient Name/i)).toHaveLength(2);

    const removeButtons = screen.getAllByTitle(/Remove ingredient/i);
    fireEvent.click(removeButtons[1]);

    act(() => {
      vi.advanceTimersByTime(310);
    });

    expect(screen.getAllByLabelText(/Ingredient Name/i)).toHaveLength(1);
    vi.useRealTimers();
  });

  it('triggers validation on calculate click', async () => {
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    const calculateBtns = screen.getAllByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateBtns[0]);

    expect(await screen.findByText(/Please provide a name for your product/i)).toBeInTheDocument();
    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  it('performs calculation when form is valid', async () => {
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Valid Product' },
    });
    fireEvent.change(screen.getByLabelText(/Batch Size/i), { target: { value: '10' } });

    const nameInputs = screen.getAllByLabelText(/Ingredient Name/i);
    const amountInputs = screen.getAllByLabelText(/Amount/i);
    // Cost label has an asterisk since it's required
    const costInputs = screen.getAllByLabelText(/Cost/);
    const costInput = costInputs.find((input) => input.tagName === 'INPUT');

    fireEvent.change(nameInputs[0], { target: { value: 'Flour' } });
    fireEvent.change(amountInputs[0], { target: { value: '1000' } });
    fireEvent.change(costInput!, { target: { value: '50' } });

    const calculateBtns = screen.getAllByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateBtns[0]);

    await waitFor(() => {
      expect(mockOnCalculate).toHaveBeenCalledWith(
        expect.objectContaining({
          totalCost: expect.any(Number),
          recommendedPrice: expect.any(Number),
        }),
        expect.objectContaining({
          productName: 'Valid Product',
          batchSize: 10,
        }),
        expect.objectContaining({
          strategy: expect.any(String),
          value: expect.any(Number),
        })
      );
    });

    const result = mockOnCalculate.mock.calls[0][0];
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.recommendedPrice).toBeGreaterThan(0);
  });

  it('restores draft from session storage', () => {
    const draft = {
      input: {
        productName: 'Saved Draft',
        batchSize: 24,
        ingredients: [{ id: '1', name: 'Saved Ing', amount: 100, cost: 20 }],
        laborCost: 10,
        overhead: 5,
      },
      config: { strategy: 'margin', value: 30 },
    };
    window.sessionStorage.setItem('pricing_calculator_draft', JSON.stringify(draft));

    render(<TestWrapper onCalculate={mockOnCalculate} />);

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Saved Draft');
    expect(screen.getByLabelText(/Batch Size/i)).toHaveValue(24);
    expect(screen.getByLabelText(/Ingredient Name/i)).toHaveValue('Saved Ing');
  });

  it('clears form when reset is clicked', () => {
    const confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);

    render(<TestWrapper onCalculate={mockOnCalculate} />);
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'To Be Cleared' },
    });

    const resetBtns = screen.getAllByRole('button', { name: /^Reset$/ });
    fireEvent.click(resetBtns[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('');
    expect(window.sessionStorage.getItem('pricing_calculator_draft')).toBeNull();

    vi.unstubAllGlobals();
  });

  it('displays real-time validation feedback', () => {
    render(<TestWrapper onCalculate={mockOnCalculate} />);

    expect(screen.getByText(/Start by naming your product/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'New Product' } });
    // Since it starts with one empty ingredient, it should say "Almost there"
    expect(screen.getByText(/Almost there! Complete your ingredients/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Ingredient Name/i), { target: { value: 'Flour' } });

    const costInputs = screen.getAllByLabelText(/Cost/);
    const costInput = costInputs.find((input) => input.tagName === 'INPUT');
    fireEvent.change(costInput!, { target: { value: '50' } });

    expect(screen.getByText(/Ready to calculate/i)).toBeInTheDocument();
  });

  it('populates state when initialInput and initialConfig props are provided', () => {
    const input = {
      productName: 'Initial Product',
      batchSize: 100,
      ingredients: [{ id: 'ext-1', name: 'Ext Ing', amount: 50, cost: 10 }],
      laborCost: 100,
      overhead: 50,
    };
    const config = { strategy: 'markup', value: 20 } as const;

    render(
      <TestWrapper onCalculate={mockOnCalculate} initialInput={input} initialConfig={config} />
    );

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Initial Product');
    expect(screen.getByLabelText(/Batch Size/i)).toHaveValue(100);
    expect(screen.getByLabelText(/Ingredient Name/i)).toHaveValue('Ext Ing');
  });
});
