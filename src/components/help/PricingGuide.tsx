import React, { useState } from 'react';
import { Check, X, Info, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { formatCurrency } from '../../utils/formatters';

interface PricingGuideProps {
  onAction?: () => void;
  showActionButton?: boolean;
  initialTab?: 'markup' | 'margin';
}

export const PricingGuide: React.FC<PricingGuideProps> = ({
  onAction,
  showActionButton = true,
  initialTab = 'markup',
}) => {
  const [activeTab, setActiveTab] = useState<'markup' | 'margin'>(initialTab);

  const cost = 100;
  const markupPercent = 50;
  const marginPercent = 50;

  const markupPrice = cost * (1 + markupPercent / 100);
  const markupProfit = markupPrice - cost;

  const marginPrice = cost / (1 - marginPercent / 100);
  const marginProfit = marginPrice - cost;

  return (
    <div className="space-y-xl">
      {/* Tabs */}
      <div className="flex p-xs bg-surface rounded-xl border border-border-subtle">
        <button
          onClick={() => setActiveTab('markup')}
          className={`flex-1 flex items-center justify-center gap-sm py-md text-sm font-bold rounded-lg transition-all duration-300 ${
            activeTab === 'markup'
              ? 'bg-clay text-white shadow-sm'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Markup
        </button>
        <button
          onClick={() => setActiveTab('margin')}
          className={`flex-1 flex items-center justify-center gap-sm py-md text-sm font-bold rounded-lg transition-all duration-300 ${
            activeTab === 'margin'
              ? 'bg-clay text-white shadow-sm'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Profit Margin
        </button>
      </div>

      {activeTab === 'markup' ? (
        <div className="space-y-xl animate-in fade-in slide-in-from-bottom-xs duration-500">
          {/* Markup Definition */}
          <section>
            <div className="flex items-center gap-sm mb-sm">
              <Badge variant="info" className="text-[10px] uppercase tracking-widest px-sm">Definition</Badge>
            </div>
            <p className="text-ink-700 leading-relaxed font-medium">
              Markup is the percentage <strong>added to the cost price</strong> of a product to determine its selling price. It focuses on ensuring each item sold earns a specific profit above its production cost.
            </p>
          </section>

          {/* Markup Visual Example */}
          <section className="bg-surface border border-border-subtle rounded-2xl p-lg">
            <h4 className="text-[10px] font-bold text-ink-500 mb-lg uppercase tracking-[0.2em]">Visual Example (50% Markup)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-center">
              <div className="text-center p-md bg-bg-main rounded-xl border border-border-subtle">
                <p className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-xs">Cost</p>
                <p className="text-xl font-bold text-ink-900 tracking-tight">{formatCurrency(cost)}</p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-border-base rotate-90 md:rotate-0" />
              </div>
              <div className="text-center p-md bg-clay rounded-xl shadow-sm border border-clay/10">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mb-xs">Selling Price</p>
                <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(markupPrice)}</p>
              </div>
            </div>
            <div className="mt-lg pt-lg border-t border-border-subtle flex justify-between items-center">
              <span className="text-sm text-ink-700 font-bold">Profit Earned:</span>
              <span className="text-base font-bold text-moss">{formatCurrency(markupProfit)}</span>
            </div>
            <p className="mt-sm text-[10px] text-ink-400 text-center font-mono">
              Formula: {formatCurrency(cost)} × (1 + 0.50) = {formatCurrency(markupPrice)}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {/* When to use */}
            <section>
              <h4 className="font-bold text-ink-900 mb-md flex items-center gap-sm tracking-tight">
                <Info className="h-4 w-4 text-clay" />
                When to use
              </h4>
              <ul className="space-y-sm text-sm text-ink-700 font-medium">
                <li className="flex gap-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-clay/40 mt-2 shrink-0" />
                  Simple cost-plus pricing
                </li>
                <li className="flex gap-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-clay/40 mt-2 shrink-0" />
                  Handmade or custom goods
                </li>
                <li className="flex gap-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-clay/40 mt-2 shrink-0" />
                  Ensuring item costs are covered
                </li>
              </ul>
            </section>

            {/* Pros & Cons */}
            <section>
              <h4 className="font-bold text-ink-900 mb-md tracking-tight">Considerations</h4>
              <div className="space-y-md">
                <div className="flex gap-sm text-sm font-medium">
                  <Check className="h-4 w-4 text-moss shrink-0 mt-0.5" />
                  <span className="text-ink-700 leading-snug">Very easy to calculate manually</span>
                </div>
                <div className="flex gap-sm text-sm font-medium">
                  <X className="h-4 w-4 text-rust shrink-0 mt-0.5" />
                  <span className="text-ink-700 leading-snug">Ignores market demand and competitors</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-xl animate-in fade-in slide-in-from-bottom-xs duration-500">
          {/* Margin Definition */}
          <section>
            <div className="flex items-center gap-sm mb-sm">
              <Badge variant="success" className="text-[10px] uppercase tracking-widest px-sm">Definition</Badge>
            </div>
            <p className="text-ink-700 leading-relaxed font-medium">
              Profit Margin is the percentage of the <strong>final selling price</strong> that is profit. It tells you how much out of every peso you earn is actually kept by the business after costs.
            </p>
          </section>

          {/* Margin Visual Example */}
          <section className="bg-surface border border-border-subtle rounded-2xl p-lg">
            <h4 className="text-[10px] font-bold text-ink-500 mb-lg uppercase tracking-[0.2em]">Visual Example (50% Margin)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-center">
              <div className="text-center p-md bg-bg-main rounded-xl border border-border-subtle">
                <p className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-xs">Cost</p>
                <p className="text-xl font-bold text-ink-900 tracking-tight">{formatCurrency(cost)}</p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-border-base rotate-90 md:rotate-0" />
              </div>
              <div className="text-center p-md bg-moss rounded-xl shadow-sm border border-moss/10">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mb-xs">Selling Price</p>
                <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(marginPrice)}</p>
              </div>
            </div>
            <div className="mt-lg pt-lg border-t border-border-subtle flex justify-between items-center">
              <span className="text-sm text-ink-700 font-bold">Profit Earned:</span>
              <span className="text-base font-bold text-moss">{formatCurrency(marginProfit)}</span>
            </div>
            <p className="mt-sm text-[10px] text-ink-400 text-center font-mono">
              Formula: {formatCurrency(cost)} ÷ (1 - 0.50) = {formatCurrency(marginPrice)}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {/* When to use */}
            <section>
              <h4 className="font-bold text-ink-900 mb-md flex items-center gap-sm tracking-tight">
                <Info className="h-4 w-4 text-moss" />
                When to use
              </h4>
              <ul className="space-y-sm text-sm text-ink-700 font-medium">
                <li className="flex gap-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-moss/40 mt-2 shrink-0" />
                  Retail and wholesale businesses
                </li>
                <li className="flex gap-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-moss/40 mt-2 shrink-0" />
                  Tracking overall business health
                </li>
                <li className="flex gap-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-moss/40 mt-2 shrink-0" />
                  Comparing profit to total revenue
                </li>
              </ul>
            </section>

            {/* Pros & Cons */}
            <section>
              <h4 className="font-bold text-ink-900 mb-md tracking-tight">Considerations</h4>
              <div className="space-y-md">
                <div className="flex gap-sm text-sm font-medium">
                  <Check className="h-4 w-4 text-moss shrink-0 mt-0.5" />
                  <span className="text-ink-700 leading-snug">Directly shows business profitability</span>
                </div>
                <div className="flex gap-sm text-sm font-medium">
                  <X className="h-4 w-4 text-rust shrink-0 mt-0.5" />
                  <span className="text-ink-700 leading-snug">Slightly more complex math</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <section className="pt-xl border-t border-border-subtle">
        <h4 className="font-bold text-ink-900 mb-lg tracking-tight">Quick Comparison</h4>
        <div className="overflow-hidden rounded-2xl border border-border-subtle shadow-sm bg-bg-main">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-ink-500 font-bold text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-lg py-md border-b border-border-subtle">Feature</th>
                <th className="px-lg py-md border-b border-border-subtle">Markup</th>
                <th className="px-lg py-md border-b border-border-subtle">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-medium">
              <tr>
                <td className="px-lg py-md font-bold text-ink-900 bg-surface/30">Base Value</td>
                <td className="px-lg py-md text-ink-700">Cost Price</td>
                <td className="px-lg py-md text-ink-700">Selling Price</td>
              </tr>
              <tr>
                <td className="px-lg py-md font-bold text-ink-900 bg-surface/30">Calculation</td>
                <td className="px-lg py-md text-clay font-mono text-xs">Cost + (Cost × %)</td>
                <td className="px-lg py-md text-clay font-mono text-xs">Cost ÷ (1 - %)</td>
              </tr>
              <tr>
                <td className="px-lg py-md font-bold text-ink-900 bg-surface/30">Perspective</td>
                <td className="px-lg py-md text-ink-700">Production</td>
                <td className="px-lg py-md text-ink-700">Sales/Business</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {showActionButton && onAction && (
        <div className="flex justify-center pt-md">
          <Button onClick={onAction} variant="secondary" className="px-2xl py-md font-bold tracking-tight rounded-xl">
            Mindfulness Gained
          </Button>
        </div>
      )}
    </div>
  );
};
