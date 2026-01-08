import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculatorState } from './useCalculatorState';
import { usePresets } from './use-presets';

vi.mock('./use-presets');

describe('useCalculatorState', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.mocked(usePresets).mockReturnValue({
      presets: [],
      addPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
      getPreset: vi.fn(),
      getAllPresets: vi.fn(),
      syncStatus: 'synced',
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof usePresets>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCalculatorState());

    expect(result.current.input.productName).toBe('');
    expect(result.current.input.batchSize).toBe(1);
    expect(result.current.input.ingredients).toHaveLength(1);
    expect(result.current.config.strategy).toBe('markup');
    expect(result.current.results).toBeNull();
    expect(result.current.isCalculating).toBe(false);
  });

  it('should update input', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.updateInput({ productName: 'New Cake' });
    });

    expect(result.current.input.productName).toBe('New Cake');
  });

  it('should update ingredients', () => {
    const { result } = renderHook(() => useCalculatorState());
    const ingredientId = result.current.input.ingredients[0].id;

    act(() => {
      result.current.updateIngredient(ingredientId, 'name', 'Flour');
      result.current.updateIngredient(ingredientId, 'cost', 100);
    });

    expect(result.current.input.ingredients[0].name).toBe('Flour');
    expect(result.current.input.ingredients[0].cost).toBe(100);
  });

  it('should add and remove ingredients', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.addIngredient();
    });
    expect(result.current.input.ingredients).toHaveLength(2);

    const secondId = result.current.input.ingredients[1].id;
    act(() => {
      result.current.removeIngredient(secondId);
    });
    expect(result.current.input.ingredients).toHaveLength(1);
  });

  it('should perform calculation and set results', async () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.updateInput({
        productName: 'Brownies',
        batchSize: 10,
        laborCost: 100,
        overhead: 50,
      });
      const id = result.current.input.ingredients[0].id;
      result.current.updateIngredient(id, 'name', 'Sugar');
      result.current.updateIngredient(id, 'purchaseQuantity', 1);
      result.current.updateIngredient(id, 'purchaseUnit', 'piece');
      result.current.updateIngredient(id, 'purchaseCost', 50);
      result.current.updateIngredient(id, 'recipeQuantity', 1);
      result.current.updateIngredient(id, 'recipeUnit', 'piece');
      result.current.updateIngredient(id, 'cost', 50);
      result.current.updateIngredient(id, 'amount', 1);
    });

    let calculationResult;
    await act(async () => {
      const promise = result.current.calculate();
      // Fast-forward any timers if they exist (though we're in test mode which skips delay)
      calculationResult = await promise;
    });

    expect(calculationResult).not.toBeNull();
    expect(result.current.results).not.toBeNull();
    expect(result.current.results?.totalCost).toBe(200); // 50 (ing) + 100 (labor) + 50 (overhead)
    expect(result.current.results?.costPerUnit).toBe(20); // 200 / 10
  });

  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useCalculatorState());

    // Invalid input: empty name
    act(() => {
      result.current.updateInput({ productName: '' });
    });

    await act(async () => {
      const calcResult = await result.current.calculate();
      expect(calcResult).toBeNull();
    });

    expect(result.current.errors.productName).toBeDefined();
  });

  it('should load a preset', () => {
    const { result } = renderHook(() => useCalculatorState());
    const mockPreset = {
      id: '1',
      name: 'Loaded Preset',
      baseRecipe: {
        productName: 'Preset Product',
        batchSize: 5,
        ingredients: [
          {
            id: 'i1',
            name: 'Ing 1',
            amount: 1,
            cost: 10,
            purchaseQuantity: 1,
            purchaseUnit: 'piece',
            purchaseCost: 10,
            recipeQuantity: 1,
            recipeUnit: 'piece',
          },
        ],
        laborCost: 20,
        overhead: 5,
      },
      pricingConfig: { strategy: 'margin', value: 30 },
      updatedAt: new Date().toISOString(),
    } as unknown as Preset;

    act(() => {
      result.current.loadPreset(mockPreset);
    });

    expect(result.current.input.productName).toBe('Preset Product');
    expect(result.current.config.strategy).toBe('margin');
    expect(result.current.results).not.toBeNull();
    expect(result.current.results?.costPerUnit).toBe(7); // (10+20+5) / 5 = 7
  });

  it('should handle loading a corrupted preset gracefully', () => {
    const { result } = renderHook(() => useCalculatorState());

    // Preset with missing fields in baseRecipe
    const corruptedPreset = {
      id: 'corrupted',
      name: 'Corrupted Preset',
      baseRecipe: {
        // Missing productName, ingredients, batchSize
      },
      pricingConfig: { strategy: 'markup', value: 50 },
      updatedAt: new Date().toISOString(),
    } as unknown as Preset;

    act(() => {
      result.current.loadPreset(corruptedPreset);
    });

    // Should not crash and should fall back to defaults
    expect(result.current.input.productName).toBe('');
    expect(result.current.input.ingredients).toBeDefined();
    expect(Array.isArray(result.current.input.ingredients)).toBe(true);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.updateInput({ productName: 'To Be Reset' });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.input.productName).toBe('');
    expect(result.current.errors).toEqual({});
  });
});
