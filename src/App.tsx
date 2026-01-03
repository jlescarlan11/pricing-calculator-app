import { useState } from 'react';
import { ChefHat, Info } from 'lucide-react';
import { CalculatorForm } from './components/calculator';
import { ResultsDisplay } from './components/results';
import type { CalculationResult, CalculationInput } from './types/calculator';

function App() {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [lastInput, setLastInput] = useState<CalculationInput | null>(null);
  const [view, setView] = useState<'form' | 'results'>('form');

  const handleCalculate = (result: CalculationResult, input: CalculationInput) => {
    setResults(result);
    setLastInput(input);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = () => {
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResults(null);
    setLastInput(null);
    setView('form');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Pricing <span className="text-blue-600">Calculator</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">Pricing Tips</a>
            <div className="h-4 w-px bg-gray-200"></div>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">My Saved Products</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Intro Section (only on form view) */}
        {view === 'form' && (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-4 items-start">
            <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 font-semibold mb-1">Welcome to your profit partner!</p>
              <p className="text-blue-800 text-sm leading-relaxed">
                Fill in your costs below. We&apos;ll help you find the perfect price to ensure your business grows sustainably. 
                Don&apos;t forget to include your labor—your time is valuable!
              </p>
            </div>
          </div>
        )}

        {view === 'form' ? (
          <CalculatorForm onCalculate={handleCalculate} onReset={handleReset} />
        ) : (
          results && lastInput && (
            <ResultsDisplay 
              results={results} 
              input={lastInput} 
              onEdit={handleEdit} 
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Pricing Calculator App. Designed for Philippine Food Entrepreneurs.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Terms</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Privacy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;