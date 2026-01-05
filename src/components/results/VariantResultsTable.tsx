import React from 'react';
import type { CalculationResult } from '../../types/calculator';
import { Card } from '../shared';

interface VariantResultsTableProps {
  results: CalculationResult;
}

export const VariantResultsTable: React.FC<VariantResultsTableProps> = ({ results }) => {
  if (!results.variantResults || results.variantResults.length === 0) return null;

  // Identify best performers
  const sortedByMargin = [...results.variantResults].sort((a, b) => b.profitMarginPercent - a.profitMarginPercent);
  const bestMarginId = sortedByMargin[0]?.id;
  
  const sortedByProfit = [...results.variantResults].sort((a, b) => b.profitPerUnit - a.profitPerUnit);
  const bestProfitId = sortedByProfit[0]?.id;

  return (
    <Card title="Variant Performance" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-ink-500 uppercase bg-surface border-b border-border-subtle">
            <tr>
              <th className="px-md py-sm font-medium">Variant</th>
              <th className="px-md py-sm font-medium text-right">Cost/Unit</th>
              <th className="px-md py-sm font-medium text-right">Rec. Price</th>
              <th className="px-md py-sm font-medium text-right">Target Margin</th>
              <th className="px-md py-sm font-medium text-right border-l border-border-subtle">Current Price</th>
              <th className="px-md py-sm font-medium text-right">Actual Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {results.variantResults.map((variant) => {
              const isBestMargin = variant.id === bestMarginId && results.variantResults!.length > 1;
              const isBestProfit = variant.id === bestProfitId && results.variantResults!.length > 1;
              const hasCurrentPrice = variant.currentSellingPrice !== undefined && variant.currentSellingPrice > 0;
              
              return (
                <tr key={variant.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-md py-md font-medium text-ink-900">
                    {variant.name}
                    {(isBestMargin || isBestProfit) && (
                      <div className="flex flex-wrap gap-xs mt-1">
                        {isBestMargin && <span className="text-[10px] bg-moss/10 text-moss px-1.5 py-0.5 rounded-full whitespace-nowrap">Best Margin</span>}
                        {isBestProfit && <span className="text-[10px] bg-clay/10 text-clay px-1.5 py-0.5 rounded-full whitespace-nowrap">Best Profit</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-md py-md text-right tabular-nums text-ink-700">
                    {variant.costPerUnit.toFixed(2)}
                  </td>
                  <td className="px-md py-md text-right tabular-nums font-semibold text-ink-900">
                    {variant.recommendedPrice.toFixed(2)}
                  </td>
                  <td className="px-md py-md text-right tabular-nums text-moss">
                     {variant.profitMarginPercent.toFixed(1)}%
                  </td>
                  <td className="px-md py-md text-right tabular-nums border-l border-border-subtle">
                    {hasCurrentPrice ? (
                      <span className="font-medium text-ink-900">{variant.currentSellingPrice?.toFixed(2)}</span>
                    ) : (
                      <span className="text-ink-300">-</span>
                    )}
                  </td>
                  <td className="px-md py-md text-right tabular-nums">
                    {hasCurrentPrice && variant.currentProfitMargin !== undefined ? (
                       <span className={`${variant.currentProfitMargin < 20 ? 'text-rust' : 'text-moss'}`}>
                          {variant.currentProfitMargin.toFixed(1)}%
                       </span>
                    ) : (
                      <span className="text-ink-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-surface border-t border-border-base">
            <tr>
              <td colSpan={4} className="px-md py-md font-bold text-ink-900 text-right">Total Batch Profit (Target)</td>
              <td colSpan={2} className="px-md py-md font-bold text-moss text-right text-lg">
                {results.profitPerBatch.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};
