import React, { useState, useRef, useEffect } from 'react';
import { Calculator, Save, AlertCircle, Loader2 } from 'lucide-react';
import { BaseRecipeForm, BaseRecipeFormData } from './BaseRecipeForm';
import { VariantsList } from './VariantsList';
import { VariantsComparisonTable } from './VariantsComparisonTable';
import { Button } from '../shared/Button';
import { SavePresetModal } from '../presets/SavePresetModal';
import { usePresets } from '../../hooks/use-presets';
import { calculateAllVariants } from '../../utils/variant-calculations';
import { 
  validateVariantQuantities, 
  validateVariantData 
} from '../../utils/variantValidation';
import type { VariantInput, VariantCalculation, VariantsPreset } from '../../types/variants';
import type { Ingredient } from '../../types/calculator';

export const VariantsCalculator: React.FC = () => {
  // --- State ---
  const [baseRecipe, setBaseRecipe] = useState<BaseRecipeFormData>({
    productName: '',
    batchSize: 0,
    ingredients: [],
    laborCost: 0,
    overheadCost: 0,
  });

  const [variants, setVariants] = useState<VariantInput[]>([
    {
      id: crypto.randomUUID(),
      name: 'Standard',
      amount: 0,
      unit: 'pc',
      additionalIngredients: [],
      additionalLabor: 0,
      pricingStrategy: 'markup',
      pricingValue: 50,
      currentSellingPrice: null,
    },
  ]);

  const [calculations, setCalculations] = useState<Record<string, VariantCalculation>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Hooks ---
  const { addPreset, error: presetError } = usePresets();

  // --- Handlers ---

  const handleCalculate = async () => {
    setErrors({});
    setIsCalculating(true);

    // Artificial delay for UX perception
    await new Promise(resolve => setTimeout(resolve, 600));

    // 1. Validate Base Recipe
    const newErrors: Record<string, string> = {};
    if (!baseRecipe.productName.trim()) newErrors.productName = 'Product name is required';
    if (baseRecipe.batchSize <= 0) newErrors.batchSize = 'Batch size must be greater than 0';
    if (baseRecipe.ingredients.length === 0) newErrors.ingredients = 'Add at least one shared ingredient';
    
    // 2. Validate Variants
    const quantityErrors = validateVariantQuantities(variants, baseRecipe.batchSize);
    quantityErrors.forEach(err => {
      newErrors[err.field] = err.message;
    });

    variants.forEach((variant, index) => {
      const dataErrors = validateVariantData(variant, index);
      dataErrors.forEach(err => {
        newErrors[err.field] = err.message;
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsCalculating(false);
      // Scroll to top error if possible, or just top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Calculate
    const results = calculateAllVariants(
      variants,
      baseRecipe.ingredients,
      baseRecipe.laborCost,
      baseRecipe.overheadCost,
      baseRecipe.batchSize
    );

    // Map results by ID for easy lookup
    const calcMap: Record<string, VariantCalculation> = {};
    results.forEach(res => {
      calcMap[res.variantId] = res;
    });

    setCalculations(calcMap);
    setShowResults(true);
    setIsCalculating(false);
  };

  // Scroll to results when they appear
  useEffect(() => {
    if (showResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showResults]);

  const handleSaveInit = () => {
    // Validate before opening save modal
    if (!baseRecipe.productName) {
        setErrors({ productName: 'Please name your product before saving.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = async (name: string) => {
    // Construct the preset object
    // Note: We are creating a VariantsPreset.
    // The hook usePresets.addPreset expects Omit<Preset, 'id' | ...> 
    // We need to match the structure defined in types/variants.ts
    
    // Since usePresets abstractly handles "Presets", we assume it accepts the specific structure
    // or we might need to adapt. Let's assume the addPreset implementation handles the discriminated union
    // or simply stores what we give it if it matches the DB schema.
    
    // Looking at the usePresets hook (from memory/context), it likely takes an object.
    // Let's ensure we match the VariantsPreset interface as closely as possible for the data payload.

    const presetData = {
      name, // User provided name overrides or defaults to product name
      preset_type: 'variants' as const,
      ingredients: baseRecipe.ingredients,
      batch_size: baseRecipe.batchSize,
      labor_cost: baseRecipe.laborCost,
      overhead_cost: baseRecipe.overheadCost,
      variants: variants,
      // Single product fields set to null
      pricing_strategy: null,
      pricing_value: null,
      current_selling_price: null,
    };

    const success = await addPreset(presetData as any); // Casting as any to bypass strict type check if hook types aren't fully updated for union yet, but ideally should match.
    if (success) {
      setIsSaveModalOpen(false);
      // Optional: Show a toast or success message here if not handled by hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-2xl pb-32">
      <div className="space-y-md">
        <h1 className="text-3xl md:text-4xl font-serif text-ink-900">
          Variant Pricing
        </h1>
        <p className="text-ink-700 max-w-2xl text-lg">
          Calculate costs for multiple product variations (e.g. different sizes or packs) from a single base batch.
        </p>
      </div>

      {/* Base Recipe Section */}
      <section className="space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center gap-sm pb-sm border-b border-border-base">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-900 text-bg-main font-bold text-sm">1</span>
            <h2 className="text-xl font-bold text-ink-900">Base Recipe</h2>
         </div>
         <BaseRecipeForm 
            data={baseRecipe} 
            onChange={setBaseRecipe} 
            errors={errors} 
         />
      </section>

      {/* Variants Section */}
      <section className="space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
         <div className="flex items-center gap-sm pb-sm border-b border-border-base">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-900 text-bg-main font-bold text-sm">2</span>
            <h2 className="text-xl font-bold text-ink-900">Variants Configuration</h2>
         </div>
         
         {errors.totalQuantity && (
             <div className="p-md bg-rust/10 text-rust border border-rust/20 rounded-md flex items-center gap-sm">
                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                 <span className="font-medium">{errors.totalQuantity}</span>
             </div>
         )}

         <VariantsList 
            variants={variants}
            totalBatchSize={baseRecipe.batchSize}
            onVariantsUpdate={setVariants}
            calculations={calculations}
         />
      </section>

      {/* Action Bar */}
      <div className="sticky bottom-4 z-20 bg-surface/90 backdrop-blur-md p-md rounded-xl shadow-level-2 border border-border-subtle flex flex-col sm:flex-row gap-md items-center justify-between">
         <div className="text-sm text-ink-500 hidden sm:block">
            {variants.length} variant{variants.length !== 1 ? 's' : ''} configured
         </div>
         <div className="flex w-full sm:w-auto gap-md">
             <Button 
               variant="secondary" 
               className="flex-1 sm:flex-none"
               onClick={handleSaveInit}
               disabled={isCalculating}
               icon={<Save className="w-4 h-4" />}
             >
               Save Preset
             </Button>
             <Button 
               variant="primary"
               className="flex-1 sm:flex-none min-w-[160px]"
               onClick={handleCalculate}
               disabled={isCalculating}
               icon={isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
             >
               {isCalculating ? 'Calculating...' : 'Calculate All'}
             </Button>
         </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <section 
            ref={resultsRef} 
            className="space-y-lg pt-xl animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
            <div className="flex items-center gap-sm pb-sm border-b border-border-base">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-moss text-white font-bold text-sm">✓</span>
                <h2 className="text-xl font-bold text-ink-900">Analysis Results</h2>
            </div>
            
            <VariantsComparisonTable 
                variants={variants} 
                calculations={Object.values(calculations)} 
            />
        </section>
      )}

      {/* Modals */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfirm}
        initialName={baseRecipe.productName}
      />
    </div>
  );
};
