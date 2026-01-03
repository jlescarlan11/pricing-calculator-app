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
      color: 'bg-clay',
    },
    {
      label: 'Labor',
      value: breakdown.labor,
      color: 'bg-moss',
    },
    {
      label: 'Overhead',
      value: breakdown.overhead,
      color: 'bg-rust',
    },
  ];

  return (
    <Card title={<span className="text-ink-900">Cost Breakdown</span>} className={className}>
      <div className="space-y-xl">
        <div className="flex justify-between items-end border-b border-border-subtle pb-lg">
          <div>
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest block mb-xs">
              Total Batch Cost
            </span>
            <span className="text-3xl font-bold text-ink-900 leading-none tracking-tight">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest block mb-xs">
              Cost Per Unit
            </span>
            <span className="text-lg font-bold text-clay leading-none">
              {formatCurrency(costPerUnit)}
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-4 w-full flex rounded-round overflow-hidden bg-surface border border-border-subtle p-[2px]">
          {categories.map((category) => {
            const percentage = totalCost > 0 ? (category.value / totalCost) * 100 : 0;
            return (
              <div
                key={category.label}
                className={`h-full ${category.color} transition-all duration-1000 ease-out first:rounded-l-round last:rounded-r-round`}
                style={{ width: `${percentage}%` }}
                title={`${category.label}: ${formatPercent(percentage)}`}
              />
            );
          })}
        </div>

        {/* Legend / Details */}
        <div className="space-y-md">
          {categories.map((category) => {
            const percentage = totalCost > 0 ? (category.value / totalCost) * 100 : 0;
            return (
              <div key={category.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-sm">
                  <div className={`w-3.5 h-3.5 rounded-round ${category.color} shadow-level-1 border border-bg-main`} />
                  <span className="text-sm font-semibold text-ink-700 group-hover:text-ink-900 transition-colors">
                    {category.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">
                    {formatCurrency(category.value)}
                  </p>
                  <p className="text-[10px] text-ink-500 font-bold uppercase tracking-wider">
                    {formatPercent(percentage)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
