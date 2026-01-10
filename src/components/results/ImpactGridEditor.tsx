import React from 'react';
import type { VariantResult } from '../../types/calculator';
import { formatCurrency, formatPercent, getMarginColor } from '../../utils/formatters';
import { ArrowRight, Info } from 'lucide-react';
import { calculateProfitMargin } from '../../utils/calculations';

interface ImpactGridEditorProps {
  variantResults: VariantResult[];
  overrides: Record<string, number>;
  onOverrideChange: (id: string, value: number) => void;
}

export const ImpactGridEditor: React.FC<ImpactGridEditorProps> = ({
  variantResults,
  overrides,
  onOverrideChange,
}) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="py-md px-lg text-[10px] font-bold text-ink-500 uppercase tracking-widest">
              Variant
            </th>
            <th className="py-md px-lg text-[10px] font-bold text-ink-500 uppercase tracking-widest text-right">
              Current Price
            </th>
            <th className="py-md px-lg text-[10px] font-bold text-ink-500 uppercase tracking-widest text-center w-12">
              {/* Spacer for arrow */}
            </th>
            <th className="py-md px-lg text-[10px] font-bold text-ink-500 uppercase tracking-widest text-right">
              New Recommended
            </th>
            <th className="py-md px-lg text-[10px] font-bold text-ink-500 uppercase tracking-widest text-right">
              % Change
            </th>
            <th className="py-md px-lg text-[10px] font-bold text-ink-500 uppercase tracking-widest text-right">
              New Margin
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/50">
          {variantResults.map((variant) => {
            const currentPrice = variant.currentSellingPrice || variant.costPerUnit;
            const newPrice = overrides[variant.id] ?? variant.recommendedPrice;
            const delta = newPrice - currentPrice;
            const percentChange = currentPrice > 0 ? (delta / currentPrice) * 100 : 0;
            const isPositive = delta >= 0;
            
            const newMargin = calculateProfitMargin(variant.costPerUnit, newPrice);
            const marginColor = getMarginColor(newMargin);

            return (
              <tr key={variant.id} className="hover:bg-surface/50 transition-colors">
                <td className="py-lg px-lg">
                  <span className="text-sm font-bold text-ink-900 block truncate max-w-[150px] sm:max-w-[200px]" title={variant.name}>
                    {variant.name}
                  </span>
                  <span className="text-[10px] text-ink-500 font-medium uppercase tracking-tighter">
                    Cost: {formatCurrency(variant.costPerUnit)}
                  </span>
                </td>
                <td className="py-lg px-lg text-right tabular-nums text-sm font-medium text-ink-500">
                  {formatCurrency(currentPrice)}
                </td>
                <td className="py-lg px-lg text-center">
                  <ArrowRight className="w-4 h-4 text-ink-200 inline" />
                </td>
                <td className="py-lg px-lg text-right">
                  <div className="relative inline-block w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-300">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPrice}
                      onChange={(e) => onOverrideChange(variant.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-border-base rounded-md py-1.5 pl-7 pr-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-clay/20 focus:border-clay outline-none transition-all tabular-nums text-right"
                    />
                  </div>
                </td>
                <td className="py-lg px-lg text-right tabular-nums">
                  <span className={`text-sm font-bold ${isPositive ? 'text-moss' : 'text-rust'}`}>
                    {isPositive ? '+' : ''}{formatPercent(percentChange)}
                  </span>
                </td>
                <td className="py-lg px-lg text-right tabular-nums">
                  <span className={`text-sm font-bold text-${marginColor}`}>
                    {formatPercent(newMargin)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="p-lg bg-surface/50 border-t border-border-subtle flex items-start gap-md">
        <Info className="w-4 h-4 text-ink-300 shrink-0 mt-0.5" />
        <p className="text-xs text-ink-500 leading-relaxed font-medium">
          <strong>Psychological Rounding:</strong> Adjusting prices slightly (e.g., PHP 51.20 to PHP 49.00) can make products feel significantly more affordable to customers while only slightly impacting your margin.
        </p>
      </div>
    </div>
  );
};
