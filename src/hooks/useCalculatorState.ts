import { useState, useCallback, useEffect } from 'react';
import { usePresets } from './use-presets';
import { useSessionStorage } from './use-session-storage';
import { performFullCalculation } from '../utils/calculations';
import { 
  validateProductName, 
  validateBatchSize, 
  validateIngredients 
} from '../utils/validation';
import type { 
  CalculationInput, 
  PricingConfig, 
  CalculationResult, 
  Ingredient,
  SavedPreset
} from '../types/calculator';

const SESSION_STORAGE_KEY = 'pricing_calculator_draft';

const initialInput: CalculationInput = {
  productName: '',
  batchSize: 1,
  ingredients: [{ id: crypto.randomUUID(), name: '', amount: 0, cost: 0 }],
  laborCost: 0,
  overhead: 0,
};

const initialConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

export interface CalculatorState {
  input: CalculationInput;
  config: PricingConfig;
  results: CalculationResult | null;
  errors: Record<string, string>;
  isCalculating: boolean;
  presets: SavedPreset[];
  
  // Actions
  updateInput: (updates: Partial<CalculationInput>) => void;
  updateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  addIngredient: () => void;
  removeIngredient: (id: string) => void;
  updateConfig: (updates: Partial<PricingConfig>) => void;
  calculate: () => Promise<CalculationResult | null>;
  reset: () => void;
  
  // Preset Actions
  loadPreset: (preset: SavedPreset) => void;
  saveAsPreset: (name: string) => Promise<SavedPreset>;
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
        { id: crypto.randomUUID(), name: '', amount: 0, cost: 0 }
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

  const loadPreset = useCallback((preset: SavedPreset) => {
    setInput(preset.input);
    setConfig(preset.config);
    const result = performFullCalculation(preset.input, preset.config);
    setResults(result);
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
  };
}
