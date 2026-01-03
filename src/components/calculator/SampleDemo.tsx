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
    <Card noPadding className="bg-surface border-border-subtle relative shadow-none">
      <div className="absolute top-0 right-0 p-lg opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <PieChart className="w-32 h-32 text-clay" />
      </div>

      <div className="flex flex-col lg:flex-row gap-xl items-start lg:items-center p-xl">
        <div className="flex-1">
          <div className="flex items-center gap-md mb-md">
            <span className="bg-clay text-white text-[9px] font-bold px-sm py-[2px] rounded-sm uppercase tracking-[0.2em]">
              Interactive Example
            </span>
            <h3 className="text-xl font-bold text-ink-900 tracking-tight">Artisan Cookie Case Study</h3>
          </div>
          <p className="text-ink-700 text-sm mb-lg leading-relaxed font-medium">
            Discover how to price your products with intention. This example shows a batch of 50 cookies 
            with a sustainable 30% profit margin.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
            <div className="bg-bg-main p-md rounded-md border border-border-subtle shadow-level-1">
              <p className="text-[10px] uppercase text-ink-500 font-bold tracking-wider mb-xs">Total Cost</p>
              <p className="text-base font-bold text-ink-900">{formatCurrency(sampleResults.totalCost)}</p>
            </div>
            <div className="bg-bg-main p-md rounded-md border border-border-subtle shadow-level-1">
              <p className="text-[10px] uppercase text-ink-500 font-bold tracking-wider mb-xs">Cost/Unit</p>
              <p className="text-base font-bold text-ink-900">{formatCurrency(sampleResults.costPerUnit)}</p>
            </div>
            <div className="bg-bg-main p-md rounded-md border border-border-subtle shadow-level-1">
              <p className="text-[10px] uppercase text-ink-500 font-bold tracking-wider mb-xs">Target Price</p>
              <p className="text-base font-bold text-clay">{formatCurrency(sampleResults.recommendedPrice)}</p>
            </div>
            <div className="bg-bg-main p-md rounded-md border border-border-subtle shadow-level-1">
              <p className="text-[10px] uppercase text-ink-500 font-bold tracking-wider mb-xs">Profit/Batch</p>
              <p className="text-base font-bold text-moss">{formatCurrency(sampleResults.profitPerBatch)}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0 w-full lg:w-auto flex flex-col gap-md">
          <Button 
            onClick={onLoadSample}
            variant="primary"
            className="w-full flex items-center justify-center gap-sm h-14 px-xl font-bold tracking-tight rounded-sm"
          >
            <PlayCircle className="w-5 h-5" />
            Explore Sample
            <ArrowRight className="w-4 h-4 ml-xs" />
          </Button>
          <div className="flex items-center justify-center gap-sm text-xs text-ink-500 font-bold uppercase tracking-widest">
            <Info className="w-3.5 h-3.5 opacity-50" />
            Populate form instantly
          </div>
        </div>
      </div>
        </Card>
      );
    };
