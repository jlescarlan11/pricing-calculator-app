import { useState, useCallback, useEffect } from 'react';
import { Info, Package } from 'lucide-react';
import { CalculatorForm, SampleDemo } from '../components/calculator';
import { ResultsDisplay } from '../components/results';
import { FAQ } from '../components/help';
import { PresetsList } from '../components/presets';
import { COOKIE_SAMPLE } from '../constants';
import { useCalculatorState } from '../hooks';
import type { SavedPreset } from '../types';

interface CalculatorPageProps {
  setSidebar: (sidebar: React.ReactNode) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ setSidebar }) => {
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

  const [view, setView] = useState<'form' | 'results'>('form');

  const handleCalculate = async () => {
    const res = await calculate();
    if (res) {
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = () => {
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the form? This will remove all your progress.')) {
      reset();
      setView('form');
    }
  };

  const handleLoadSample = useCallback(() => {
    loadPreset({
      id: 'sample',
      name: 'Sample Cookie',
      input: COOKIE_SAMPLE.input,
      config: COOKIE_SAMPLE.config,
      lastModified: Date.now(),
    });
    
    // Smooth scroll to form area
    const formElement = document.getElementById('calculator-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loadPreset]);

  const handleLoadPreset = useCallback((preset: SavedPreset) => {
    loadPreset(preset);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadPreset]);

  const handleEditPreset = useCallback((preset: SavedPreset) => {
    loadPreset(preset);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadPreset]);

  // Update sidebar on mount
  useEffect(() => {
    setSidebar(
      <div className="p-md space-y-lg">
        <div className="flex items-center gap-sm px-sm">
          <Package className="text-clay w-5 h-5" />
          <h3 className="text-ink-900">Saved Products</h3>
        </div>
        <PresetsList 
          onLoad={handleLoadPreset}
          onEdit={handleEditPreset}
        />
      </div>
    );
    return () => setSidebar(null);
  }, [setSidebar, handleLoadPreset, handleEditPreset]);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Intro Section (only on form view) */}
      {view === 'form' && (
        <div className="space-y-lg mb-2xl">
          <div className="p-lg md:p-xl bg-surface rounded-2xl border border-border-subtle flex gap-md items-start animate-in fade-in slide-in-from-top-4 duration-700">
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

      <div id="calculator-form" className="min-h-[600px]">
        {view === 'form' ? (
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
        ) : (
          results && (
            <ResultsDisplay 
              results={results} 
              input={input} 
              config={config}
              onEdit={handleEdit} 
            />
          )
        )}
      </div>

      <div className="mt-3xl border-t border-border-subtle pt-3xl">
        <div className="text-center mb-2xl">
          <h3 className="text-xl text-ink-900">Mindful Pricing Knowledge</h3>
          <p className="text-sm text-ink-500 font-medium mt-xs">Foundational concepts for your business journey.</p>
        </div>
        <FAQ />
      </div>
    </div>
  );
};
