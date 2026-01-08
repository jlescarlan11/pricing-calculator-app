import { useState, useCallback, useRef, useEffect } from 'react';
import { Package } from 'lucide-react';
import { CalculatorForm, PriceHistory } from '../components/calculator';
import { ResultsDisplay, StickySummary, PriceTrendChart } from '../components/results';
import { PresetsList } from '../components/presets';
import { Modal, useToast } from '../components/shared';
import { COOKIE_SAMPLE } from '../constants';
import { useCalculatorState } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { triggerHapticFeedback } from '../utils/haptics';
import type { Preset } from '../types';

export const CalculatorPage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const {
    input,
    config,
    results,
    liveResult,
    isDirty,
    errors,
    isCalculating,
    presets,
    currentPresetId,
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
      // Handle Visibility Logic
      // Case 1: Results exist (committed)
      if (showResults && resultsRef.current) {
        const resultsRect = resultsRef.current.getBoundingClientRect();
        // Results are visible if their top is within viewport
        const isResultsVisible = resultsRect.top < window.innerHeight && resultsRect.bottom > 0;
        setShowStickySummary(!isResultsVisible);
        return;
      }

      // Case 2: No results yet, but we have live data (user is typing)
      if (!showResults && liveResult && liveResult.totalCost > 0) {
        setShowStickySummary(true);
        return;
      }

      setShowStickySummary(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showResults, liveResult]);

  const handleCalculate = async () => {
    const res = await calculate();
    if (res) {
      triggerHapticFeedback(50);
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
      name: 'Sample Product',
      presetType: 'default',
      baseRecipe: COOKIE_SAMPLE.input,
      pricingConfig: COOKIE_SAMPLE.config,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSnapshot: false,
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
    <>
      <div className="animate-in fade-in duration-700 relative">
        {/* Intro Section (only when no results and form is empty) */}
        {!showResults && (
          <div className="space-y-lg mb-lg md:mb-2xl">
            <div className="p-md md:p-lg bg-clay/5 rounded-xl border border-clay/20 animate-in fade-in slide-in-from-top-4 duration-700">
              <p className="text-ink-900 font-medium mb-xs text-sm md:text-base">
                Welcome to your profit partner.
              </p>
              <p className="text-ink-700 text-xs md:text-sm leading-relaxed">
                Fill in your costs below. We&apos;ll help you find the perfect price to ensure your
                business grows sustainably. Don&apos;t forget to include your labor—your time is
                valuable.
              </p>
            </div>
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
              presetId={currentPresetId}
              userId={user?.id}
            />

            {/* Price History & Milestones (Only for saved products) */}
            {currentPresetId && results && (
              <div className="mt-4xl space-y-4xl animate-in fade-in duration-1000 delay-300">
                <PriceTrendChart
                  snapshots={presets.filter(
                    (p) => p.isSnapshot && p.snapshotMetadata?.parentPresetId === currentPresetId
                  )}
                />
                <PriceHistory
                  presetId={currentPresetId}
                  currentResult={results}
                  isUnsaved={isDirty}
                />
              </div>
            )}

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
            onLoadSample={handleLoadSample}
          />
        </div>
      </div>

      <StickySummary
        results={liveResult}
        hasCommittedResults={showResults}
        isStale={isDirty}
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
    </>
  );
};
