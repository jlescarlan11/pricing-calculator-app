import type React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../shared/Card';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { performFullCalculation } from '../../utils/calculations';
import type { Preset } from '../../types';

interface PriceTrendChartProps {
  snapshots: Preset[];
  className?: string;
}

/**
 * PriceTrendChart component visualizes the history of product costs and suggested prices.
 * It uses snapshots of calculation data to show trends over time.
 */
export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ snapshots, className = '' }) => {
  // Process snapshots into chart data
  const chartData = [...snapshots]
    .sort(
      (a, b) =>
        new Date(a.snapshotMetadata?.snapshotDate || a.createdAt).getTime() -
        new Date(b.snapshotMetadata?.snapshotDate || b.createdAt).getTime()
    )
    .map((s) => {
      const result = performFullCalculation(s.baseRecipe, s.pricingConfig);
      return {
        date: s.snapshotMetadata?.snapshotDate || s.createdAt,
        formattedDate: formatDate(s.snapshotMetadata?.snapshotDate || s.createdAt),
        // We use costPerUnit for "totalCost" in the chart to keep it on the same scale as suggestedPrice.
        // In the context of pricing trends, users often refer to the per-unit cost as their "total cost".
        totalCost: result.costPerUnit,
        suggestedPrice: result.recommendedPrice,
      };
    });

  const hasSnapshots = snapshots.length > 0;

  return (
    <Card title="Price & Cost Trends" className={className}>
      <div className="h-[320px] w-full mt-lg relative">
        {!hasSnapshots ? (
          <div className="flex flex-col items-center justify-center h-full bg-surface/30 rounded-xl border border-dashed border-border-base px-xl text-center">
            <div className="w-12 h-12 bg-bg-main rounded-round flex items-center justify-center mb-md border border-border-subtle">
              <span className="text-2xl" role="img" aria-label="Chart">
                📊
              </span>
            </div>
            <p className="text-ink-500 text-sm font-medium leading-relaxed max-w-[200px]">
              Pin milestones to visualize your price and cost history over time.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E4E1" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#8B8680"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#8B8680"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F8F7F5',
                  border: '1px solid #D4D2CF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(58, 54, 50, 0.08)',
                  padding: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
                itemStyle={{
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '2px 0',
                }}
                labelStyle={{
                  fontSize: '11px',
                  color: '#8B8680',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                  fontWeight: 700,
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={40}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingBottom: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  color: '#3A3632',
                }}
              />
              <Line
                type="monotone"
                dataKey="totalCost"
                name="Cost / Unit"
                stroke="#B85C38" // rust
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#B85C38', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#B85C38', strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="suggestedPrice"
                name="Suggested Price"
                stroke="#7A8B73" // moss
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7A8B73', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#7A8B73', strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
