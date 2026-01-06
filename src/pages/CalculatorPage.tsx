import { useState, useCallback, useRef, useEffect } from 'react';
import { Info, Package } from 'lucide-react';
import { CalculatorForm, SampleDemo } from '../components/calculator';
import { ResultsDisplay, StickySummary } from '../components/results';
import { PresetsList } from '../components/presets';
import { Modal, useToast } from '../components/shared';
import { COOKIE_SAMPLE } from '../constants';
import { useCalculatorState } from '../hooks';
import type { Preset } from '../types';

export const CalculatorPage: React.FC = () => {
  const { addToast } = useToast();
  const {
    input,
    config,
    results,
    errors,
    isCalculating,
    updateInput,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateConfig,
    calculate,
    reset,
    loadPreset,
    setHasVariants,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantIngredient,
    addVariantIngredient,
    removeVariantIngredient,
  } = useCalculatorState();

  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [showStickySummary, setShowStickySummary] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showResults = !!results;

  // Handle sticky summary visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!resultsRef.current) {
        setShowStickySummary(false);
        return;
      }

      const resultsRect = resultsRef.current.getBoundingClientRect();
      const isResultsVisible = resultsRect.top < window.innerHeight && resultsRect.bottom > 0;

      // Show sticky summary if results exist but are not fully in view
      // and we are currently in the form section
      setShowStickySummary(showResults && !isResultsVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showResults]);

  const handleCalculate = async () => {
    const res = await calculate();
    if (res) {
      addToast('✓ Calculation complete', 'success');
      // Scroll to results at the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the form? This will remove all your progress.')) {
      reset();
      // Scroll to top to see fresh form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoadSample = useCallback(() => {
    loadPreset({
      id: 'sample',
      name: 'Sample Cookie',
      presetType: 'default',
      baseRecipe: COOKIE_SAMPLE.input,
      pricingConfig: COOKIE_SAMPLE.config,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Smooth scroll to form area
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loadPreset]);

  const handleLoadPreset = useCallback(
    (preset: Preset) => {
      loadPreset(preset);
      setIsPresetsModalOpen(false);
      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [loadPreset]
  );

  const handleEditPreset = useCallback(
    (preset: Preset) => {
      loadPreset(preset);
      setIsPresetsModalOpen(false);
      // Scroll to form
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
    [loadPreset]
  );

  return (
    <div className="animate-in fade-in duration-700 relative pb-2xl">
      {/* Intro Section (only when no results) */}
      {!showResults && (
        <div className="space-y-lg mb-lg md:mb-2xl">
          <div className="p-md md:p-lg bg-clay/5 rounded-xl border border-clay/20 flex gap-md items-start animate-in fade-in slide-in-from-top-4 duration-700">
            <Info className="w-5 h-5 md:w-6 md:h-6 text-clay shrink-0 mt-0.5" />
            <div>
              <p className="text-ink-900 font-medium mb-xs text-sm md:text-base">Welcome to your profit partner.</p>
              <p className="text-ink-700 text-xs md:text-sm leading-relaxed">
                Fill in your costs below. We&apos;ll help you find the perfect price to ensure your
                business grows sustainably. Don&apos;t forget to include your labor—your time is
                valuable.
              </p>
            </div>
          </div>

          <SampleDemo onLoadSample={handleLoadSample} />
        </div>
      )}

      {/* Results Section (Top Priority) */}
      {showResults && (
        <div
          ref={resultsRef}
          className="mb-4xl animate-in fade-in slide-in-from-top-8 duration-700"
        >
          <ResultsDisplay
            results={results}
            input={input}
            config={config}
            onEdit={handleScrollToForm}
          />

          <div className="h-px bg-border-subtle my-3xl" role="separator" />
        </div>
      )}

      {/* Input Form Section (Secondary Priority) */}
      <div ref={formRef} id="calculator-form" className="min-h-[600px]">
        <CalculatorForm
          input={input}
          config={config}
          errors={errors}
          isCalculating={isCalculating}
          onUpdateInput={updateInput}
          onUpdateIngredient={updateIngredient}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
          onUpdateConfig={updateConfig}
          onCalculate={handleCalculate}
          onReset={handleReset}
          onSetHasVariants={setHasVariants}
          onAddVariant={addVariant}
          onRemoveVariant={removeVariant}
          onUpdateVariant={updateVariant}
          onUpdateVariantIngredient={updateVariantIngredient}
          onAddVariantIngredient={addVariantIngredient}
          onRemoveVariantIngredient={removeVariantIngredient}
          onOpenPresets={() => setIsPresetsModalOpen(true)}
        />
      </div>

      <StickySummary
        results={results}
        onScrollToResults={handleScrollToResults}
        onCalculate={handleCalculate}
        isCalculating={isCalculating}
        isVisible={showStickySummary}
      />

      {/* Presets Modal */}
      <Modal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        title={
          <div className="flex items-center gap-sm">
            <Package className="text-clay w-5 h-5" />
            <span className="text-ink-900">Saved Products</span>
          </div>
        }
        maxWidth="max-w-3xl"
      >
        <div className="py-md">
          <PresetsList onLoad={handleLoadPreset} onEdit={handleEditPreset} />
        </div>
      </Modal>
    </div>
  );
};
