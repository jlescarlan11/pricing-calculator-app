import React from 'react';
import { Card } from '../shared/Card';
import type { CalculationResult } from '../../types/calculator';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface CostBreakdownProps {
  results: CalculationResult;
  className?: string;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ results, className }) => {
  const { totalCost, costPerUnit, breakdown } = results;

  const categories = [
    {
      label: 'Ingredients',
      value: breakdown.ingredients,
    },
    {
      label: 'Labor',
      value: breakdown.labor,
    },
    {
      label: 'Overhead',
      value: breakdown.overhead,
    },
  ];

  return (
    <div className={`space-y-xl ${className}`}>
      <h3 className="text-xl font-serif text-ink-900">Cost Analysis</h3>
      
      <div className="space-y-md">
        {categories.map((category) => (
          <div key={category.label} className="flex items-center justify-between py-xs">
            <span className="text-sm font-medium text-ink-700">
              {category.label}
            </span>
            <span className="text-base font-bold text-ink-900 tabular-nums">
              {formatCurrency(category.value)}
            </span>
          </div>
        ))}
        
        <div className="pt-md mt-md border-t border-border-subtle flex items-center justify-between">
          <span className="text-sm font-bold text-ink-900 uppercase tracking-widest">
            Total Batch Cost
          </span>
          <span className="text-xl font-bold text-ink-900 tabular-nums">
            {formatCurrency(totalCost)}
          </span>
        </div>

        <div className="flex items-center justify-between py-xs">
          <span className="text-xs font-medium text-ink-500 uppercase tracking-widest">
            Cost Per Unit
          </span>
          <span className="text-lg font-bold text-clay tabular-nums">
            {formatCurrency(costPerUnit)}
          </span>
        </div>
      </div>
    </div>
  );
};
