import React, { useState } from 'react';
import { Check, X, Info, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { formatCurrency } from '../../utils/formatters';

interface PricingExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'markup' | 'margin';
}

export const PricingExplainerModal: React.FC<PricingExplainerModalProps> = ({
  isOpen,
  onClose,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pricing Strategies Explained"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('markup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'markup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Markup
          </button>
          <button
            onClick={() => setActiveTab('margin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'margin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Profit Margin
          </button>
        </div>

        {activeTab === 'markup' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Markup Definition */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info">Definition</Badge>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Markup is the percentage <strong>added to the cost price</strong> of a product to determine its selling price. It focus on ensuring each item sold earns a specific profit above its production cost.
              </p>
            </section>

            {/* Markup Visual Example */}
            <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h4 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider">Visual Example (50% Markup)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-blue-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Cost</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(cost)}</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-blue-400 rotate-90 md:rotate-0" />
                </div>
                <div className="text-center p-3 bg-blue-600 rounded-lg shadow-md border border-blue-700">
                  <p className="text-xs text-blue-100 font-medium mb-1">Selling Price</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(markupPrice)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center">
                <span className="text-sm text-blue-800 font-medium">Profit Earned:</span>
                <span className="text-sm font-bold text-blue-900">{formatCurrency(markupProfit)}</span>
              </div>
              <p className="mt-2 text-[10px] text-blue-600/70 text-center italic">
                Formula: {formatCurrency(cost)} × (1 + 0.50) = {formatCurrency(markupPrice)}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* When to use */}
              <section>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  When to use
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    Simple cost-plus pricing
                  </li>
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    Handmade or custom goods
                  </li>
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    Ensuring individual item costs are covered
                  </li>
                </ul>
              </section>

              {/* Pros & Cons */}
              <section>
                <h4 className="font-bold text-gray-900 mb-3">Pros & Cons</h4>
                <div className="space-y-3">
                  <div className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">Very easy to calculate manually</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">Ignores market demand and competitors</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Margin Definition */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success">Definition</Badge>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Profit Margin is the percentage of the <strong>final selling price</strong> that is profit. It tells you how much out of every peso you earn is actually kept by the business after costs.
              </p>
            </section>

            {/* Margin Visual Example */}
            <section className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h4 className="text-sm font-bold text-green-900 mb-4 uppercase tracking-wider">Visual Example (50% Margin)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-green-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Cost</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(cost)}</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-green-400 rotate-90 md:rotate-0" />
                </div>
                <div className="text-center p-3 bg-green-600 rounded-lg shadow-md border border-green-700">
                  <p className="text-xs text-green-100 font-medium mb-1">Selling Price</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(marginPrice)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 flex justify-between items-center">
                <span className="text-sm text-green-800 font-medium">Profit Earned:</span>
                <span className="text-sm font-bold text-green-900">{formatCurrency(marginProfit)}</span>
              </div>
              <p className="mt-2 text-[10px] text-green-600/70 text-center italic">
                Formula: {formatCurrency(cost)} ÷ (1 - 0.50) = {formatCurrency(marginPrice)}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* When to use */}
              <section>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-green-500" />
                  When to use
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    Retail and wholesale businesses
                  </li>
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    Tracking overall business health
                  </li>
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    Comparing profit to total revenue
                  </li>
                </ul>
              </section>

              {/* Pros & Cons */}
              <section>
                <h4 className="font-bold text-gray-900 mb-3">Pros & Cons</h4>
                <div className="space-y-3">
                  <div className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">Directly shows business profitability</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">Slightly more complex math</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <section className="pt-6 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 mb-4">Quick Comparison</h4>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-200">Feature</th>
                  <th className="px-4 py-3 border-b border-gray-200">Markup</th>
                  <th className="px-4 py-3 border-b border-gray-200">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50">Base Value</td>
                  <td className="px-4 py-3 text-gray-600">Cost Price</td>
                  <td className="px-4 py-3 text-gray-600">Selling Price</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50">Calculation</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">Cost + (Cost × %)</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">Cost ÷ (1 - %)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50">Perspective</td>
                  <td className="px-4 py-3 text-gray-600">Production</td>
                  <td className="px-4 py-3 text-gray-600">Sales/Business</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <Button onClick={onClose} variant="secondary" className="px-8">
            Got it, thanks!
          </Button>
        </div>
      </div>
    </Modal>
  );
};
