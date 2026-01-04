import { useState, useCallback, useEffect } from 'react';
import { usePresets } from './use-presets';
import { useSessionStorage } from './use-session-storage';
import { performFullCalculation } from '../utils/calculations';
import { calculateAllVariants } from '../utils/variant-calculations';
import { validateVariantQuantities, validateVariantData } from '../utils/variantValidation';
import { 
  validateProductName, 
  validateBatchSize, 
  validateIngredients 
} from '../utils/validation';
import type { 
  CalculationInput, 
  PricingConfig, 
  CalculationResult, 
  Ingredient
} from '../types/calculator';
import type { Preset } from './use-presets';
import type { VariantInput, VariantCalculation } from '../types/variants';

const SESSION_STORAGE_KEY = 'pricing_calculator_draft';

const initialInput: CalculationInput = {
  productName: '',
  batchSize: 1,
  ingredients: [{ id: 'init-ing', name: '', amount: 0, cost: 0 }],
  laborCost: 0,
  overhead: 0,
  variants: [],
};

const initialConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

export interface CalculatorState {
  input: CalculationInput;
  config: PricingConfig;
  results: CalculationResult | null;
  variantResults: VariantCalculation[];
  errors: Record<string, string>;
  isCalculating: boolean;
  presets: Preset[];
  
  // Actions
  updateInput: (updates: Partial<CalculationInput>) => void;
  updateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  addIngredient: () => void;
  removeIngredient: (id: string) => void;
  updateConfig: (updates: Partial<PricingConfig>) => void;
  
  // Variant Actions
  addVariant: () => void;
  updateVariant: (id: string, updates: Partial<VariantInput>) => void;
  removeVariant: (id: string) => void;

  calculate: () => Promise<CalculationResult | null>;
  reset: () => void;
  
  // Preset Actions
  loadPreset: (preset: Preset) => void;
  saveAsPreset: (name: string) => Promise<Preset>;
  deletePreset: (id: string) => Promise<void>;
}

/**
 * Global calculator state hook.
 * Centralizes management of form state, calculation results, and presets.
 */
export function useCalculatorState(
  initialValues?: { input?: CalculationInput; config?: PricingConfig }
): CalculatorState {
  const { presets, addPreset, deletePreset: removePreset } = usePresets();
  
  // Persistence using sessionStorage
  const [draft, setDraft] = useSessionStorage<{
    input: CalculationInput;
    config: PricingConfig;
  }>(SESSION_STORAGE_KEY, {
    input: initialValues?.input || initialInput,
    config: initialValues?.config || initialConfig,
  });

  const [input, setInput] = useState<CalculationInput>(initialValues?.input || draft.input);
  const [config, setConfig] = useState<PricingConfig>(initialValues?.config || draft.config);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [variantResults, setVariantResults] = useState<VariantCalculation[]>([]);
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
    setInput(prev => ({ ...prev, ...updates }));
    
    // Clear top-level errors if they exist
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(updates).forEach(key => {
        delete next[key];
      });
      return next;
    });
  }, []);

  const updateIngredient = useCallback((id: string, field: keyof Ingredient, value: string | number) => {
    setInput(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));

    // Clear specific ingredient error
    setErrors(prev => {
      const next = { ...prev };
      delete next[`ingredients.${id}.${field}`];
      delete next['ingredients'];
      return next;
    });
  }, []);

  const addIngredient = useCallback(() => {
    setInput(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: crypto.randomUUID?.() || Math.random().toString(36).substring(2), name: '', amount: 0, cost: 0 }
      ]
    }));
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setInput(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<PricingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Variant Actions
  const addVariant = useCallback(() => {
    const newVariant: VariantInput = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
      name: '',
      amount: 1, // Default to 1 unit of base
      unit: '',
      additionalIngredients: [],
      additionalLabor: 0,
      currentSellingPrice: null
    };
    setInput(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  }, []);

  const updateVariant = useCallback((id: string, updates: Partial<VariantInput>) => {
    setInput(prev => ({
      ...prev,
      variants: (prev.variants || []).map(v => 
        v.id === id ? { ...v, ...updates } : v
      )
    }));
    // Clear variant errors
     setErrors(prev => {
      const next = { ...prev };
      // Crude clearing of variant errors
      // In a real app we might want to be more specific
      return next;
    });
  }, []);

  const removeVariant = useCallback((id: string) => {
    setInput(prev => ({
      ...prev,
      variants: (prev.variants || []).filter(v => v.id !== id)
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateProductName(input.productName);
    if (nameErr) newErrors.productName = nameErr.message;

    const batchErr = validateBatchSize(input.batchSize);
    if (batchErr) newErrors.batchSize = batchErr.message;

    const ingErrs = validateIngredients(input.ingredients);
    ingErrs.forEach(err => {
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

    // Validate Variants
    if (input.variants && input.variants.length > 0) {
        const qtyErrors = validateVariantQuantities(input.variants);
        qtyErrors.forEach(err => newErrors[err.field] = err.message);

        input.variants.forEach((v, idx) => {
            const dataErrors = validateVariantData(v, idx);
            dataErrors.forEach(err => newErrors[err.field] = err.message);
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
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const result = performFullCalculation(input, config);
    setResults(result);

    if (input.variants && input.variants.length > 0) {
        const vResults = calculateAllVariants(
            input.variants,
            input.ingredients,
            input.laborCost,
            input.overhead,
            input.batchSize,
            config.strategy,
            config.value
        );
        setVariantResults(vResults);
    } else {
        setVariantResults([]);
    }

    setIsCalculating(false);
    return result;
  }, [input, config, validateForm]);

  const reset = useCallback(() => {
    setInput(initialInput);
    setConfig(initialConfig);
    setResults(null);
    setVariantResults([]);
    setErrors({});
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const loadPreset = useCallback((preset: Preset) => {
    const p = preset as any;
    const input: CalculationInput = p.input || {
        productName: p.name,
        batchSize: p.batch_size,
        ingredients: p.ingredients,
        laborCost: p.labor_cost,
        overhead: p.overhead_cost,
        variants: p.variants || [],
    };
    const config: PricingConfig = p.config || {
        strategy: p.pricing_strategy || 'markup',
        value: p.pricing_value ?? 50,
    };

    setInput(input);
    setConfig(config);
    const result = performFullCalculation(input, config);
    setResults(result);

    if (input.variants && input.variants.length > 0) {
         const vResults = calculateAllVariants(
            input.variants,
            input.ingredients,
            input.laborCost,
            input.overhead,
            input.batchSize,
            config.strategy,
            config.value
        );
        setVariantResults(vResults);
    } else {
        setVariantResults([]);
    }

    setErrors({});
    return result;
  }, []);

  const saveAsPreset = useCallback(async (name: string) => {
    return await addPreset({
      name,
      input,
      config
    });
  }, [addPreset, input, config]);

  const deletePreset = useCallback(async (id: string) => {
    await removePreset(id);
  }, [removePreset]);

  return {
    input,
    config,
    results,
    variantResults,
    errors,
    isCalculating,
    presets,
    updateInput,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateConfig,
    addVariant,
    updateVariant,
    removeVariant,
    calculate,
    reset,
    loadPreset,
    saveAsPreset,
    deletePreset,
  };
}
