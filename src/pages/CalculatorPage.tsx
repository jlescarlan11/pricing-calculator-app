import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Package } from 'lucide-react';
import { CalculatorForm, PriceHistory } from '../components/calculator';
import { ResultsDisplay, StickySummary, PriceTrendChart } from '../components/results';
import { PresetsList } from '../components/presets';
import { Modal, useToast } from '../components/shared';
import { COOKIE_SAMPLE } from '../constants';
import { useCalculatorState, usePresets } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { triggerHapticFeedback } from '../utils/haptics';
import type { Preset } from '../types';
import type { MarketDataContext } from '../components/results/AnalyzePriceCard';

export const CalculatorPage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const {
    input,
    config,
    results,
    liveResult,
    isDirty,
    isPreviewMode,
    errors,
    isCalculating,
    presets,
    currentPresetId,
    originalConfig,
    updateInput,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateConfig,
    calculate,
    applyStrategy,
    discardPreview,
    commitPreview,
    reset,
    loadPreset,
    setHasVariants,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantIngredient,
    addVariantIngredient,
    removeVariantIngredient,
    createSnapshot,
    variantOverrides,
    updateVariantOverride,
  } = useCalculatorState();

  const { setIsSyncBlocked, updatePreset } = usePresets();
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [showStickySummary, setShowStickySummary] = useState(false);
  const [historyVariantId, setHistoryVariantId] = useState<string>('base');
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showResults = !!results;

  // Sync isPreviewMode with PresetsContext to block cloud sync
  useEffect(() => {
    setIsSyncBlocked(isPreviewMode);
  }, [isPreviewMode, setIsSyncBlocked]);

  const [renderTimestamp] = useState(() => Date.now());

  // Derive market data context (shared with ResultsDisplay logic)
  const marketDataContext = useMemo((): MarketDataContext => {
    const currentPreset = currentPresetId ? presets.find(p => p.id === currentPresetId) : null;
    const competitors = currentPreset?.competitors || [];

    if (competitors.length === 0) {
      return { status: 'missing', competitorCount: 0 };
    }

    const sortedByDate = [...competitors].sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    const oldestDate = sortedByDate[0]?.updatedAt;
    
    // Check if stale (> 30 days)
    const isStale = oldestDate 
      ? (renderTimestamp - new Date(oldestDate).getTime()) > (30 * 24 * 60 * 60 * 1000)
      : false;

    if (competitors.length < 2) {
       return { 
         status: 'insufficient', 
         competitorCount: competitors.length, 
         oldestCompetitorDate: oldestDate 
       };
    }

    if (isStale) {
      return { 
        status: 'stale', 
        competitorCount: competitors.length, 
        oldestCompetitorDate: oldestDate 
      };
    }

    return { 
      status: 'fresh', 
      competitorCount: competitors.length, 
      oldestCompetitorDate: oldestDate 
    };
  }, [currentPresetId, presets, renderTimestamp]);

  // Reset history variant selection if the variant is removed
  if (historyVariantId !== 'base' && results?.variantResults) {
    const exists = results.variantResults.some((v) => v.id === historyVariantId);
    if (!exists) {
      setHistoryVariantId('base');
    }
  }

  // Derive snapshots for the current preset (including fallback for v1)
  const historySnapshots = useMemo(() => {
    if (!currentPresetId) return [];

    const explicitSnapshots = presets
      .filter((p) => p.isSnapshot && p.snapshotMetadata?.parentPresetId === currentPresetId)
      .sort(
        (a, b) =>
          new Date(b.snapshotMetadata!.snapshotDate).getTime() -
          new Date(a.snapshotMetadata!.snapshotDate).getTime()
      );

    // If explicit snapshots exist, use them
    if (explicitSnapshots.length > 0) return explicitSnapshots;

    // Fallback: Use the saved preset as Version 1 if available
    // This ensures "Earliest saved preset (automatically considered version 1)"
    const savedPreset = presets.find((p) => p.id === currentPresetId);
    if (savedPreset) {
      // Mock a snapshot structure for display
      const virtualSnapshot: Preset = {
        ...savedPreset,
        isSnapshot: true,
        snapshotMetadata: {
          snapshotDate: savedPreset.createdAt,
          isTrackedVersion: true,
          versionNumber: 1,
          parentPresetId: currentPresetId,
        },
      };
      return [virtualSnapshot];
    }

    return [];
  }, [currentPresetId, presets]);

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

  const handleApplyStrategy = (margin: number, variantMargins?: Record<string, number>) => {
    applyStrategy(margin, variantMargins);
    addToast('Previewing AI suggested strategy.', 'info');
    // Scroll to top to see effects in ResultsDisplay
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDiscardPreview = () => {
    discardPreview();
    addToast('AI pricing discarded. Your manual cost updates were kept.', 'success');
  };

  const handleCommitPreview = async () => {
    const targetConfig = { ...config };
    commitPreview();
    
    if (currentPresetId) {
      try {
        await updatePreset(currentPresetId, {
          pricingConfig: targetConfig,
        });
        addToast('✓ Strategy applied and saved.', 'success');
        
        // Optionally auto-pin milestone on commitment of AI strategy
        await handlePinVersion();
      } catch (err) {
        console.error('Failed to save committed strategy:', err);
        addToast('Strategy applied locally, but failed to sync.', 'warning');
      }
    } else {
      addToast('✓ Strategy applied to current calculation.', 'success');
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

  const handlePinVersion = async () => {
    if (currentPresetId) {
      await createSnapshot(currentPresetId);
      triggerHapticFeedback(50);
      addToast('✓ Version pinned', 'success');
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
              onApplyStrategy={handleApplyStrategy}
              onDiscard={handleDiscardPreview}
              onConfirm={handleCommitPreview}
              presetId={currentPresetId}
              userId={user?.id}
              marketDataContext={marketDataContext}
              isPreviewMode={isPreviewMode}
              originalConfig={originalConfig}
              variantOverrides={variantOverrides}
              onUpdateVariantOverride={updateVariantOverride}
            />

            {/* Price History & Milestones (Only for saved products) */}
            {currentPresetId && results && (
              <div className="mt-4xl space-y-4xl animate-in fade-in duration-1000 delay-300">
                <PriceTrendChart
                  snapshots={historySnapshots}
                  selectedVariantId={historyVariantId}
                />
                <PriceHistory
                  presetId={currentPresetId}
                  currentResult={results}
                  isUnsaved={isDirty || isPreviewMode}
                  onRestore={handleLoadPreset}
                  snapshots={historySnapshots}
                  onPin={handlePinVersion}
                  selectedVariantId={historyVariantId}
                  onVariantSelect={setHistoryVariantId}
                  marketData={marketDataContext}
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
            isPreviewMode={isPreviewMode}
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
        isPreviewMode={isPreviewMode}
        onDiscard={handleDiscardPreview}
        onConfirm={handleCommitPreview}
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