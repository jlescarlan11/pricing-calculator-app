import React, { useMemo, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, Award } from 'lucide-react';
import { Card } from '../shared/Card';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import type { VariantInput, VariantCalculation } from '../../types/variants';

interface VariantsComparisonTableProps {
  variants: VariantInput[];
  calculations: VariantCalculation[];
  currencySymbol?: string;
}

type SortField = 'name' | 'amount' | 'profitPerUnit' | 'profitPerBatch' | 'profitMarginPercent';
type SortDirection = 'asc' | 'desc';

interface CombinedVariantData {
  id: string;
  name: string;
  amount: number;
  unit: string;
  costPerUnit: number;
  price: number;
  profitPerUnit: number;
  profitPerBatch: number;
  profitMarginPercent: number;
}

export const VariantsComparisonTable: React.FC<VariantsComparisonTableProps> = ({
  variants,
  calculations,
  currencySymbol = '₱',
}) => {
  const [sortField, setSortField] = useState<SortField>('profitPerBatch');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Combine input and calculation data
  const combinedData: CombinedVariantData[] = useMemo(() => {
    return variants.map((variant) => {
      const calc = calculations.find((c) => c.variantId === variant.id);
      return {
        id: variant.id,
        name: variant.name,
        amount: variant.amount,
        unit: variant.unit,
        costPerUnit: calc?.costPerUnit || 0,
        price: calc?.recommendedPrice || 0,
        profitPerUnit: calc?.profitPerUnit || 0,
        profitPerBatch: calc?.profitPerBatch || 0,
        profitMarginPercent: calc?.profitMarginPercent || 0,
      };
    });
  }, [variants, calculations]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...combinedData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [combinedData, sortField, sortDirection]);

  // Calculate totals and insights
  const { totalQuantity, totalBatchProfit, averageMargin, bestPerformer } = useMemo(() => {
    const totalQty = combinedData.reduce((sum, item) => sum + item.amount, 0);
    const totalProfit = combinedData.reduce((sum, item) => sum + item.profitPerBatch, 0);
    const avgMargin =
      combinedData.length > 0
        ? combinedData.reduce((sum, item) => sum + item.profitMarginPercent, 0) /
          combinedData.length
        : 0;
    
    // Find best performer based on total profit
    const best = combinedData.reduce((prev, current) => 
      (prev.profitPerBatch > current.profitPerBatch) ? prev : current
    , combinedData[0]);

    return {
      totalQuantity: totalQty,
      totalBatchProfit: totalProfit,
      averageMargin: avgMargin,
      bestPerformer: best,
    };
  }, [combinedData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for numbers usually
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-clay" />
    ) : (
      <ArrowDown className="w-3 h-3 text-clay" />
    );
  };

  return (
    <div className="space-y-lg">
      {/* Mobile/Card View (< md) */}
      <div className="md:hidden space-y-md">
        {sortedData.map((item) => (
          <Card 
            key={item.id} 
            className={`p-lg ${item.id === bestPerformer?.id ? 'border-l-4 border-l-moss' : ''}`}
          >
            <div className="flex justify-between items-start mb-sm">
              <div>
                <h4 className="font-serif text-lg font-medium text-ink-900">{item.name}</h4>
                <p className="text-sm text-ink-500">{item.amount} {item.unit}</p>
              </div>
              {item.id === bestPerformer?.id && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-moss/10 text-moss text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3 h-3" /> Best Value
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-y-sm gap-x-md text-sm">
              <div className="flex flex-col">
                <span className="text-ink-500 text-xs uppercase tracking-wider">Price</span>
                <span className="font-medium text-ink-900">
                  {formatCurrency(item.price, currencySymbol)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-500 text-xs uppercase tracking-wider">Cost</span>
                <span className="font-medium text-ink-900">
                  {formatCurrency(item.costPerUnit, currencySymbol)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-500 text-xs uppercase tracking-wider">Profit/Unit</span>
                <span className="font-medium text-moss">
                  +{formatCurrency(item.profitPerUnit, currencySymbol)}
                </span>
              </div>
               <div className="flex flex-col">
                <span className="text-ink-500 text-xs uppercase tracking-wider">Total Profit</span>
                <span className="font-medium text-moss font-semibold">
                  +{formatCurrency(item.profitPerBatch, currencySymbol)}
                </span>
              </div>
              <div className="flex flex-col col-span-2 mt-xs pt-xs border-t border-border-subtle">
                <div className="flex justify-between items-center">
                  <span className="text-ink-500 text-xs uppercase tracking-wider">Margin</span>
                  <span className={`font-bold ${item.profitMarginPercent < 20 ? 'text-rust' : 'text-moss'}`}>
                    {formatPercent(item.profitMarginPercent)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Mobile Totals Card */}
        <Card className="p-lg bg-surface border-dashed border-2 border-border-base">
           <h4 className="font-serif text-lg font-medium text-ink-900 mb-md flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-clay" /> Batch Summary
           </h4>
           <div className="space-y-sm">
             <div className="flex justify-between text-sm">
               <span className="text-ink-500">Total Items</span>
               <span className="font-medium text-ink-900">{totalQuantity} units</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-ink-500">Avg. Margin</span>
               <span className="font-medium text-ink-900">{formatPercent(averageMargin)}</span>
             </div>
             <div className="flex justify-between text-base pt-sm border-t border-border-subtle">
               <span className="font-bold text-ink-900">Total Profit</span>
               <span className="font-bold text-moss">{formatCurrency(totalBatchProfit, currencySymbol)}</span>
             </div>
           </div>
        </Card>
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border-base shadow-level-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-border-base">
              {[
                { label: 'Variant', key: 'name', align: 'left' },
                { label: 'Qty', key: 'amount', align: 'right' },
                { label: 'Cost/Unit', key: null, align: 'right' }, // Not sortable for now or mapped to costPerUnit if needed
                { label: 'Price', key: null, align: 'right' },
                { label: 'Profit/Unit', key: 'profitPerUnit', align: 'right' },
                { label: 'Total Profit', key: 'profitPerBatch', align: 'right' },
                { label: 'Margin', key: 'profitMarginPercent', align: 'right' },
              ].map((col, idx) => (
                <th
                  key={idx}
                  className={`p-md text-xs font-bold text-ink-500 uppercase tracking-wider cursor-pointer hover:bg-surface-hover transition-colors ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  onClick={() => col.key && handleSort(col.key as SortField)}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {col.label}
                    {col.key && <SortIcon field={col.key as SortField} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-bg-main divide-y divide-border-subtle">
            {sortedData.map((item) => {
              const isBest = item.id === bestPerformer?.id;
              return (
                <tr 
                  key={item.id} 
                  className={`hover:bg-surface-hover/50 transition-colors ${isBest ? 'bg-moss/5' : ''}`}
                >
                  <td className="p-md font-medium text-ink-900 relative">
                    {isBest && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-moss rounded-r-sm" title="Top Performer" />
                    )}
                    {item.name}
                  </td>
                  <td className="p-md text-right text-ink-700">
                    {item.amount} <span className="text-xs text-ink-500">{item.unit}</span>
                  </td>
                  <td className="p-md text-right text-ink-700 font-mono text-sm">
                    {formatCurrency(item.costPerUnit, currencySymbol)}
                  </td>
                  <td className="p-md text-right text-ink-900 font-mono text-sm font-medium">
                    {formatCurrency(item.price, currencySymbol)}
                  </td>
                  <td className="p-md text-right text-moss font-mono text-sm">
                    {formatCurrency(item.profitPerUnit, currencySymbol)}
                  </td>
                  <td className="p-md text-right text-moss font-bold font-mono text-sm">
                    {formatCurrency(item.profitPerBatch, currencySymbol)}
                  </td>
                  <td className={`p-md text-right font-medium text-sm ${item.profitMarginPercent < 20 ? 'text-rust' : 'text-moss'}`}>
                    {formatPercent(item.profitMarginPercent)}
                  </td>
                </tr>
              );
            })}
            {/* Totals Row */}
            <tr className="bg-surface font-medium border-t-2 border-border-base">
              <td className="p-md text-ink-900 font-serif italic">Totals / Averages</td>
              <td className="p-md text-right text-ink-900">{totalQuantity}</td>
              <td className="p-md text-right text-ink-500">-</td>
              <td className="p-md text-right text-ink-500">-</td>
              <td className="p-md text-right text-ink-500">-</td>
              <td className="p-md text-right text-moss font-bold text-base">
                {formatCurrency(totalBatchProfit, currencySymbol)}
              </td>
              <td className="p-md text-right text-ink-900">
                {formatPercent(averageMargin)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Insights Section */}
      <Card className="p-lg bg-surface/50 border border-border-subtle" texture>
        <div className="flex items-start gap-md">
           <div className="p-2 bg-clay/10 rounded-full text-clay mt-1">
             <TrendingUp className="w-5 h-5" />
           </div>
           <div>
             <h4 className="font-serif text-lg font-medium text-ink-900 mb-xs">Insights</h4>
             <p className="text-ink-700 leading-relaxed text-sm">
               Your <strong>{bestPerformer?.name}</strong> variant is the strongest contributor, generating{' '}
               <span className="font-medium text-ink-900">{formatCurrency(bestPerformer?.profitPerBatch || 0, currencySymbol)}</span>{' '}
               in total profit.
               {sortedData.length > 1 && (
                 <>
                   {' '}Consider promoting this option or checking if lower-margin variants (like{' '}
                   <span className="italic">{sortedData[sortedData.length - 1].name}</span>)
                   can be optimized.
                 </>
               )}
             </p>
           </div>
        </div>
      </Card>
    </div>
  );
};
