import { useState, useCallback, useEffect } from 'react';
import { usePresets } from './use-presets';
import { useSessionStorage } from './use-session-storage';
import { performFullCalculation } from '../utils/calculations';
import { validateProductName, validateBatchSize, validateIngredients } from '../utils/validation';
import { calculateMaxVariantBatch } from '../utils/variantValidation';
import type {
  CalculationInput,
  PricingConfig,
  CalculationResult,
  Ingredient,
  Preset,
  Variant,
} from '../types/calculator';

const SESSION_STORAGE_KEY = 'pricing_calculator_draft';

const initialInput: CalculationInput = {
  productName: '',
  batchSize: 1,
  ingredients: [{ id: crypto.randomUUID(), name: '', amount: 0, cost: 0 }],
  laborCost: 0,
  overhead: 0,
  hasVariants: false,
  variants: [],
};

const initialConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

/**
 * Safely merges partial or corrupted input with default values.
 */
const sanitizeInput = (input: Partial<CalculationInput>): CalculationInput => {
  return {
    ...initialInput,
    ...input,
    productName: input.productName || initialInput.productName,
    ingredients: Array.isArray(input.ingredients) ? input.ingredients : initialInput.ingredients,
    variants: Array.isArray(input.variants) ? input.variants : initialInput.variants,
    batchSize: typeof input.batchSize === 'number' ? input.batchSize : initialInput.batchSize,
    laborCost: typeof input.laborCost === 'number' ? input.laborCost : initialInput.laborCost,
    overhead: typeof input.overhead === 'number' ? input.overhead : initialInput.overhead,
  };
};

export interface CalculatorState {
  input: CalculationInput;
  config: PricingConfig;
  results: CalculationResult | null;
  errors: Record<string, string>;
  isCalculating: boolean;
  presets: Preset[];

  // Actions
  updateInput: (updates: Partial<CalculationInput>) => void;
  updateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  addIngredient: () => void;
  removeIngredient: (id: string) => void;
  updateConfig: (updates: Partial<PricingConfig>) => void;
  calculate: () => Promise<CalculationResult | null>;
  reset: () => void;

  // Variant Actions
  setHasVariants: (enabled: boolean) => void;
  addVariant: () => void;
  removeVariant: (id: string) => void;
  updateVariant: (id: string, updates: Partial<Variant>) => void;
  updateVariantIngredient: (
    variantId: string,
    ingredientId: string,
    field: keyof Ingredient,
    value: string | number
  ) => void;
  addVariantIngredient: (variantId: string) => void;
  removeVariantIngredient: (variantId: string, ingredientId: string) => void;

  // Preset Actions
  loadPreset: (preset: Preset) => void;
  saveAsPreset: (name: string) => Promise<Preset>;
  deletePreset: (id: string) => void;
}

/**
 * Global calculator state hook.
 * Centralizes management of form state, calculation results, and presets.
 */
export function useCalculatorState(initialValues?: {
  input?: CalculationInput;
  config?: PricingConfig;
}): CalculatorState {
  const { presets, addPreset, deletePreset: removePreset } = usePresets();

  // Persistence using sessionStorage
  const [draft, setDraft] = useSessionStorage<{
    input: CalculationInput;
    config: PricingConfig;
  }>(SESSION_STORAGE_KEY, {
    input: initialValues?.input || initialInput,
    config: initialValues?.config || initialConfig,
  });

  const [input, setInput] = useState<CalculationInput>(
    sanitizeInput(initialValues?.input || draft.input)
  );
  const [config, setConfig] = useState<PricingConfig>(initialValues?.config || draft.config);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Auto-save to sessionStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDraft({ input, config });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [input, config, setDraft]);

  const updateInput = useCallback((updates: Partial<CalculationInput>) => {
    setInput((prev) => ({ ...prev, ...updates }));

    // Clear top-level errors if they exist
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  }, []);

  const updateIngredient = useCallback(
    (id: string, field: keyof Ingredient, value: string | number) => {
      setInput((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((ing) =>
          ing.id === id ? { ...ing, [field]: value } : ing
        ),
      }));

      // Clear specific ingredient error
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`ingredients.${id}.${field}`];
        delete next['ingredients'];
        return next;
      });
    },
    []
  );

  const addIngredient = useCallback(() => {
    setInput((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: crypto.randomUUID(), name: '', amount: 0, cost: 0 }],
    }));
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setInput((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== id),
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<PricingConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Variant Actions
  const setHasVariants = useCallback(
    (enabled: boolean) => {
      updateInput({ hasVariants: enabled });
    },
    [updateInput]
  );

  const addVariant = useCallback(() => {
    setInput((prev) => {
      const currentVariants = prev.variants || [];
      const totalUsed = currentVariants.reduce((sum, v) => sum + v.batchSize, 0);
      const remaining = Math.max(0, prev.batchSize - totalUsed);

      // If no capacity remains, don't add a new variant
      if (remaining <= 0 && currentVariants.length > 0) {
        return prev;
      }

      const newVariant: Variant = {
        id: crypto.randomUUID(),
        name: `Variant ${(currentVariants.length || 0) + 1}`,
        batchSize: remaining,
        ingredients: [],
        laborCost: 0,
        overhead: 0,
        pricingConfig: { ...config },
      };

      return {
        ...prev,
        variants: [...currentVariants, newVariant],
      };
    });
  }, [config]);

  const removeVariant = useCallback((id: string) => {
    setInput((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((v) => v.id !== id),
    }));
  }, []);

  const updateVariant = useCallback((id: string, updates: Partial<Variant>) => {
    setInput((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  }, []);

  const updateVariantIngredient = useCallback(
    (variantId: string, ingredientId: string, field: keyof Ingredient, value: string | number) => {
      setInput((prev) => ({
        ...prev,
        variants: (prev.variants || []).map((v) => {
          if (v.id !== variantId) return v;
          return {
            ...v,
            ingredients: v.ingredients.map((ing) =>
              ing.id === ingredientId ? { ...ing, [field]: value } : ing
            ),
          };
        }),
      }));
    },
    []
  );

  const addVariantIngredient = useCallback((variantId: string) => {
    setInput((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          ingredients: [
            ...v.ingredients,
            { id: crypto.randomUUID(), name: '', amount: 0, cost: 0 },
          ],
        };
      }),
    }));
  }, []);

  const removeVariantIngredient = useCallback((variantId: string, ingredientId: string) => {
    setInput((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          ingredients: v.ingredients.filter((ing) => ing.id !== ingredientId),
        };
      }),
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateProductName(input.productName);
    if (nameErr) newErrors.productName = nameErr.message;

    const batchErr = validateBatchSize(input.batchSize);
    if (batchErr) newErrors.batchSize = batchErr.message;

    const ingErrs = validateIngredients(input.ingredients);
    ingErrs.forEach((err) => {
      const match = err.field.match(/ingredients\[(\d+)\]\.(\w+)/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        const id = input.ingredients[index].id;
        newErrors[`ingredients.${id}.${field}`] = err.message;
      } else {
        newErrors[err.field] = err.message;
      }
    });

    if (input.laborCost < 0 || isNaN(input.laborCost)) {
      newErrors.laborCost = 'Labor cost must be a valid number.';
    }

    if (input.overhead < 0 || isNaN(input.overhead)) {
      newErrors.overhead = 'Overhead must be a valid number.';
    }

    if (input.hasVariants && input.variants) {
      const totalVariantBatch = input.variants.reduce((sum, v) => sum + v.batchSize, 0);
      if (totalVariantBatch > input.batchSize) {
        newErrors.variants = `Total variant batch size (${totalVariantBatch}) exceeds base batch size (${input.batchSize}).`;
      }

      input.variants.forEach((variant) => {
        if (!variant.name.trim()) {
          newErrors[`variants.${variant.id}.name`] = 'Variant name is required.';
        }
        if (variant.batchSize < 0) {
          newErrors[`variants.${variant.id}.batchSize`] = 'Batch size cannot be negative.';
        }

        const maxAllowed = calculateMaxVariantBatch(
          variant.id,
          variant.batchSize,
          input.batchSize,
          input.variants || []
        );
        if (variant.batchSize > maxAllowed) {
          newErrors[`variants.${variant.id}.batchSize`] =
            `Allocation exceeds available units (Max: ${maxAllowed}).`;
        }

        // Variant ingredients validation
        /* 
           Technically variant ingredients are optional (e.g. just a smaller size pack),
           but if added, must be valid.
        */
        const vIngErrs = validateIngredients(variant.ingredients);
        vIngErrs.forEach((err) => {
          const match = err.field.match(/ingredients\[(\d+)\]\.(\w+)/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];
            const id = variant.ingredients[index].id;
            newErrors[`variants.${variant.id}.ingredients.${id}.${field}`] = err.message;
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [input]);

  const calculate = useCallback(async (): Promise<CalculationResult | null> => {
    if (!validateForm()) {
      return null;
    }

    setIsCalculating(true);

    // Artificial delay for UX (except in tests)
    if (import.meta.env.MODE !== 'test') {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const result = performFullCalculation(input, config);
    setResults(result);
    setIsCalculating(false);
    return result;
  }, [input, config, validateForm]);

  const reset = useCallback(() => {
    setInput(initialInput);
    setConfig(initialConfig);
    setResults(null);
    setErrors({});
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const loadPreset = useCallback((preset: Preset) => {
    if (!preset) return;

    // Defensive check: ensure baseRecipe exists or use a default shape
    const baseRecipe = preset.baseRecipe || {
      productName: '',
      batchSize: 1,
      ingredients: [],
      laborCost: 0,
      overhead: 0,
    };

    const sanitizedInput = sanitizeInput({
      ...baseRecipe,
      hasVariants: preset.presetType === 'variant',
      variants: preset.variants || [],
    });

    setInput(sanitizedInput);
    setConfig(preset.pricingConfig);

    const result = performFullCalculation(sanitizedInput, preset.pricingConfig);
    setResults(result);
    setErrors({});
  }, []);

  const saveAsPreset = useCallback(
    async (name: string) => {
      return addPreset({
        name,
        baseRecipe: input,
        pricingConfig: config,
        presetType: input.hasVariants ? 'variant' : 'default',
        variants: input.variants || [],
      });
    },
    [addPreset, input, config]
  );

  const deletePreset = useCallback(
    (id: string) => {
      removePreset(id);
    },
    [removePreset]
  );

  return {
    input,
    config,
    results,
    errors,
    isCalculating,
    presets,
    updateInput,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateConfig,
    calculate,
    reset,
    loadPreset,
    saveAsPreset,
    deletePreset,

    // Variant Actions Export
    setHasVariants,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantIngredient,
    addVariantIngredient,
    removeVariantIngredient,
  };
}
