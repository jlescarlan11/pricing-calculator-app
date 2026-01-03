import React from 'react';
import { PlayCircle, Info, ArrowRight, PieChart } from 'lucide-react';
import { Card, Button } from '../shared';
import { COOKIE_SAMPLE } from '../../constants';
import { performFullCalculation } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

interface SampleDemoProps {
  onLoadSample: () => void;
}

export const SampleDemo: React.FC<SampleDemoProps> = ({ onLoadSample }) => {
  const sampleResults = performFullCalculation(COOKIE_SAMPLE.input, COOKIE_SAMPLE.config);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <PieChart className="w-24 h-24 text-blue-900" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Sample Demo
            </span>
            <h3 className="text-lg font-bold text-blue-900">Chocolate Chip Cookies Example</h3>
          </div>
          <p className="text-blue-800 text-sm mb-4 leading-relaxed">
            Discover how to price your products for profit. This example shows a batch of 50 cookies 
            with a 30% profit margin.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/50 p-2 rounded-lg border border-blue-100/50">
              <p className="text-[10px] uppercase text-blue-500 font-bold mb-0.5">Total Cost</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(sampleResults.totalCost)}</p>
            </div>
            <div className="bg-white/50 p-2 rounded-lg border border-blue-100/50">
              <p className="text-[10px] uppercase text-blue-500 font-bold mb-0.5">Cost/Unit</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(sampleResults.costPerUnit)}</p>
            </div>
            <div className="bg-white/50 p-2 rounded-lg border border-blue-100/50">
              <p className="text-[10px] uppercase text-blue-500 font-bold mb-0.5">Target Price</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(sampleResults.recommendedPrice)}</p>
            </div>
            <div className="bg-white/50 p-2 rounded-lg border border-blue-100/50">
              <p className="text-[10px] uppercase text-blue-500 font-bold mb-0.5">Profit/Batch</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(sampleResults.profitPerBatch)}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0 w-full lg:w-auto flex flex-col gap-3">
          <Button 
            onClick={onLoadSample}
            variant="primary"
            className="w-full flex items-center justify-center gap-2 shadow-md bg-blue-600 hover:bg-blue-700 h-12 px-6"
          >
            <PlayCircle className="w-5 h-5" />
            Try It Yourself
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium">
            <Info className="w-3.5 h-3.5" />
            Loads {COOKIE_SAMPLE.input.ingredients.length} ingredients into the form
          </div>
        </div>
      </div>
    </Card>
  );
};
