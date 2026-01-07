import React from 'react';
import type { CalculationResult } from '../../types/calculator';
import { Card, Badge } from '../shared';
import { formatCurrency, formatPercent, getMarginColor } from '../../utils/formatters';

interface VariantResultsTableProps {
  results: CalculationResult;
}

export const VariantResultsTable: React.FC<VariantResultsTableProps> = ({ results }) => {
  if (!results.variantResults || results.variantResults.length === 0) return null;

  const getMarginBadgeVariant = (margin: number) => {
    const color = getMarginColor(margin);
    if (color === 'rust') return 'error';
    if (color === 'clay') return 'info';
    return 'success';
  };

  return (
    <Card title="Variant Performance" className="overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-ink-500 uppercase bg-surface border-b border-border-subtle">
            <tr>
              <th className="px-md py-sm font-medium">Variant</th>
              <th className="px-md py-sm font-medium text-right">Cost/Unit</th>
              <th className="px-md py-sm font-medium text-right">Rec. Price</th>
              <th className="px-md py-sm font-medium text-right">Target Margin</th>
              <th className="px-md py-sm font-medium text-right border-l border-border-subtle">
                Current Price
              </th>
              <th className="px-md py-sm font-medium text-right">Actual Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {results.variantResults.map((variant) => {
              const hasCurrentPrice =
                variant.currentSellingPrice !== undefined && variant.currentSellingPrice > 0;

              return (
                <tr key={variant.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-md py-md font-medium text-ink-900">{variant.name}</td>
                  <td className="px-md py-md text-right tabular-nums text-ink-700">
                    {formatCurrency(variant.costPerUnit)}
                  </td>
                  <td className="px-md py-md text-right tabular-nums font-semibold text-ink-900">
                    {formatCurrency(variant.recommendedPrice)}
                  </td>
                  <td className={`px-md py-md text-right tabular-nums font-semibold text-${getMarginColor(variant.profitMarginPercent)}`}>
                    {formatPercent(variant.profitMarginPercent)}
                  </td>
                  <td className="px-md py-md text-right tabular-nums border-l border-border-subtle">
                    {hasCurrentPrice ? (
                      <span className="font-medium text-ink-900">
                        {formatCurrency(variant.currentSellingPrice!)}
                      </span>
                    ) : (
                      <span className="text-ink-300">-</span>
                    )}
                  </td>
                  <td className="px-md py-md text-right tabular-nums">
                    {hasCurrentPrice && variant.currentProfitMargin !== undefined ? (
                      <Badge
                        variant={getMarginBadgeVariant(variant.currentProfitMargin)}
                        className="py-0 px-2"
                      >
                        {formatPercent(variant.currentProfitMargin)}
                      </Badge>
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
              <td colSpan={4} className="px-md py-xl font-bold text-ink-700 text-right uppercase tracking-widest text-xs">
                Total Batch Profit (Target)
              </td>
              <td colSpan={2} className="px-md py-xl font-bold text-moss text-right text-3xl tabular-nums tracking-tight">
                {formatCurrency(results.profitPerBatch)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};
