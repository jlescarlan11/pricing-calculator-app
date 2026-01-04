import React from 'react';
import { Card } from '../shared/Card';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import type { VariantCalculation } from '../../types/variants';
import type { CalculationInput } from '../../types/calculator';

interface VariantResultsSummaryProps {
  variantResults: VariantCalculation[];
  input: CalculationInput;
}

export const VariantResultsSummary: React.FC<VariantResultsSummaryProps> = ({
  variantResults,
  input,
}) => {
  if (!variantResults || variantResults.length === 0) return null;

  return (
    <Card 
        title={<h3 className="text-xl font-serif text-ink-900">Variant Pricing</h3>}
        className="print:break-inside-avoid"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-border-base text-ink-500 text-sm">
                    <th className="py-md pr-lg font-medium">Variant</th>
                    <th className="py-md px-lg font-medium text-right">Cost</th>
                    <th className="py-md px-lg font-medium text-right text-clay">Price</th>
                    <th className="py-md px-lg font-medium text-right">Profit</th>
                    <th className="py-md pl-lg font-medium text-right">Margin</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
                {variantResults.map((result) => {
                    // Find variant name from input.variants
                    const variant = input.variants?.find(v => v.id === result.variantId);
                    const name = variant?.name || 'Unknown Variant';

                    return (
                        <tr key={result.variantId} className="group hover:bg-surface transition-colors">
                            <td className="py-md pr-lg font-medium text-ink-900">{name}</td>
                            <td className="py-md px-lg text-right text-ink-700 font-tabular-nums">
                                {formatCurrency(result.totalCost)}
                            </td>
                            <td className="py-md px-lg text-right text-clay font-bold font-tabular-nums text-lg">
                                {formatCurrency(result.recommendedPrice)}
                            </td>
                            <td className="py-md px-lg text-right text-moss font-medium font-tabular-nums">
                                {formatCurrency(result.profitPerUnit)}
                            </td>
                            <td className="py-md pl-lg text-right text-ink-500 font-tabular-nums">
                                {formatPercent(result.profitMarginPercent)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </Card>
  );
};
