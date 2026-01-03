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
      color: 'bg-blue-500',
    },
    {
      label: 'Labor',
      value: breakdown.labor,
      color: 'bg-green-500',
    },
    {
      label: 'Overhead',
      value: breakdown.overhead,
      color: 'bg-orange-500',
    },
  ];

  return (
    <Card title="Cost Breakdown" className={className}>
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-gray-50 pb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Total Batch Cost
            </span>
            <span className="text-2xl font-black text-gray-900 leading-none">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Cost Per Unit
            </span>
            <span className="text-lg font-bold text-blue-600 leading-none">
              {formatCurrency(costPerUnit)}
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-4 w-full flex rounded-full overflow-hidden bg-gray-100 shadow-inner">
          {categories.map((category) => {
            const percentage = totalCost > 0 ? (category.value / totalCost) * 100 : 0;
            return (
              <div
                key={category.label}
                className={`h-full ${category.color} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
                title={`${category.label}: ${formatPercent(percentage)}`}
              />
            );
          })}
        </div>

        {/* Legend / Details */}
        <div className="space-y-3">
          {categories.map((category) => {
            const percentage = totalCost > 0 ? (category.value / totalCost) * 100 : 0;
            return (
              <div key={category.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color} shadow-sm`} />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                    {category.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(category.value)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
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
