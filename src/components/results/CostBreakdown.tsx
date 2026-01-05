import React from 'react';
import type { CalculationResult } from '../../types/calculator';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../shared/Card';

interface CostBreakdownProps {
  results: CalculationResult;
  className?: string;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ results, className }) => {
  const { totalCost, costPerUnit, breakdown, variantResults, profitPerBatch } = results;
  const hasVariants = variantResults && variantResults.length > 0;

  // 1. Simple View (No Variants)
  if (!hasVariants) {
    const categories = [
      { label: 'Ingredients', value: breakdown.ingredients },
      { label: 'Labor', value: breakdown.labor },
      { label: 'Overhead', value: breakdown.overhead },
    ];

    return (
      <Card title="Cost Analysis" className={className}>
        <div className="space-y-md">
          {categories.map((category) => (
            <div key={category.label} className="flex items-center justify-between py-xs border-b border-border-subtle last:border-0">
              <span className="text-sm font-medium text-ink-700">{category.label}</span>
              <span className="text-base font-bold text-ink-900 tabular-nums">
                {formatCurrency(category.value)}
              </span>
            </div>
          ))}
          
          <div className="pt-md mt-md bg-surface rounded-lg p-md">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-sm font-bold text-ink-900 uppercase tracking-widest">Total Batch Cost</span>
              <span className="text-xl font-bold text-ink-900 tabular-nums">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-500 uppercase tracking-widest">Cost Per Unit</span>
              <span className="text-lg font-bold text-clay tabular-nums">{formatCurrency(costPerUnit)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 2. Variant View (Detailed Breakdown)
  return (
    <div className={`space-y-lg ${className}`}>
      {/* Batch Level Summary */}
      <Card title="Batch Summary" className="bg-surface border-l-4 border-l-clay">
        <div className="grid grid-cols-2 gap-md">
          <div>
            <p className="text-xs font-medium text-ink-500 uppercase tracking-widest mb-1">Total Batch Cost</p>
            <p className="text-2xl font-bold text-ink-900 tabular-nums">{formatCurrency(totalCost)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500 uppercase tracking-widest mb-1">Total Expected Profit</p>
            <p className="text-2xl font-bold text-moss tabular-nums">{formatCurrency(profitPerBatch)}</p>
          </div>
        </div>
      </Card>

      {/* Per-Variant Breakdown */}
      <Card title="Cost Analysis per Variant">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-ink-500 uppercase bg-surface border-b border-border-subtle">
              <tr>
                <th className="px-md py-sm font-medium">Variant</th>
                <th className="px-md py-sm font-medium text-right">Base Alloc.</th>
                <th className="px-md py-sm font-medium text-right text-ink-400">+</th>
                <th className="px-md py-sm font-medium text-right">Add-ons</th>
                <th className="px-md py-sm font-medium text-right text-ink-400">=</th>
                <th className="px-md py-sm font-medium text-right">Total Batch</th>
                <th className="px-md py-sm font-medium text-right border-l border-border-subtle">Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {variantResults.map((variant) => {
                const bd = variant.breakdown || { baseAllocation: 0, specificIngredients: 0, specificLabor: 0, specificOverhead: 0 };
                const totalAddons = bd.specificIngredients + bd.specificLabor + bd.specificOverhead;

                return (
                  <tr key={variant.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-md py-md font-medium text-ink-900">{variant.name}</td>
                    <td className="px-md py-md text-right tabular-nums text-ink-500">{formatCurrency(bd.baseAllocation)}</td>
                    <td className="px-md py-md text-right tabular-nums text-ink-300">+</td>
                    <td className="px-md py-md text-right tabular-nums text-ink-700" title={`Ing: ${formatCurrency(bd.specificIngredients)}, Lab: ${formatCurrency(bd.specificLabor)}, Ov: ${formatCurrency(bd.specificOverhead)}`}>
                      {formatCurrency(totalAddons)}
                    </td>
                    <td className="px-md py-md text-right tabular-nums text-ink-300">=</td>
                    <td className="px-md py-md text-right tabular-nums font-semibold text-ink-900">{formatCurrency(variant.totalCost)}</td>
                    <td className="px-md py-md text-right tabular-nums font-bold text-clay border-l border-border-subtle">{formatCurrency(variant.costPerUnit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};