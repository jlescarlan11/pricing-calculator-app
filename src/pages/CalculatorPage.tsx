import { useState, useCallback, useRef } from 'react';
import { Info, Package } from 'lucide-react';
import { CalculatorForm, SampleDemo } from '../components/calculator';
import { ResultsDisplay } from '../components/results';
import { PresetsList } from '../components/presets';
import { Modal, Tooltip, useToast } from '../components/shared';
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
  } = useCalculatorState();

  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showResults = !!results;

  const handleCalculate = async () => {
    const res = await calculate();
    if (res) {
      addToast('✓ Calculation complete', 'success');
      // Scroll to results at the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const handleLoadPreset = useCallback((preset: Preset) => {
    loadPreset(preset);
    setIsPresetsModalOpen(false);
    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadPreset]);

  const handleEditPreset = useCallback((preset: Preset) => {
    loadPreset(preset);
    setIsPresetsModalOpen(false);
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loadPreset]);

  return (
    <div className="animate-in fade-in duration-700 relative pb-2xl">
      {/* Intro Section (only when no results) */}
      {!showResults && (
        <div className="space-y-lg mb-2xl">
          <div className="p-lg md:p-xl bg-surface rounded-lg border border-border-subtle flex gap-md items-start animate-in fade-in slide-in-from-top-4 duration-700">
            <Info className="w-6 h-6 text-clay shrink-0 mt-xs" />
            <div>
              <p className="text-ink-900 font-medium mb-xs">Welcome to your profit partner.</p>
              <p className="text-ink-700 text-sm leading-relaxed">
                Fill in your costs below. We&apos;ll help you find the perfect price to ensure your business grows sustainably. 
                Don&apos;t forget to include your labor—your time is valuable.
              </p>
            </div>
          </div>

          <SampleDemo onLoadSample={handleLoadSample} />
        </div>
      )}

      {/* Results Section (Top Priority) */}
      {showResults && (
        <div ref={resultsRef} className="mb-4xl animate-in fade-in slide-in-from-top-8 duration-700">
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
        />
      </div>

      {/* Floating Action Button for Presets (Tertiary) */}
      <div className="fixed bottom-lg right-lg z-40 print:hidden">
        <Tooltip content="Your Saved Products" position="left">
          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="w-14 h-14 bg-clay text-white rounded-round shadow-level-3 flex items-center justify-center hover:scale-110 transition-all duration-300 group"
            aria-label="View Saved Products"
          >
            <Package className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </Tooltip>
      </div>

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
          <PresetsList 
            onLoad={handleLoadPreset}
            onEdit={handleEditPreset}
          />
        </div>
      </Modal>
    </div>
  );
};