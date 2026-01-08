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
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ snapshots }) => {
  const chartData = [...snapshots]
    .sort(
      (a, b) =>
        new Date(a.snapshotMetadata!.snapshotDate).getTime() -
        new Date(b.snapshotMetadata!.snapshotDate).getTime()
    )
    .map((s) => {
      const result = performFullCalculation(s.baseRecipe, s.pricingConfig);
      return {
        date: formatDate(s.snapshotMetadata!.snapshotDate),
        totalCost: result.totalCost,
        suggestedPrice: result.recommendedPrice,
      };
    });

  return (
    <Card title="Price & Cost Trends">
      <div className="h-[300px] w-full mt-lg">
        {snapshots.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-surface/30 rounded-lg border border-dashed border-border-base text-ink-500">
            📊 Pin milestones to visualize your price and cost history over time.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E4E1" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#6B6761" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#6B6761" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F8F7F5',
                  border: '1px solid #D4D2CF',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                }}
                formatter={(value: number | undefined) => [
                  value !== undefined ? formatCurrency(value) : '₱0.00',
                  '',
                ]}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: '20px',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <Line
                type="monotone"
                dataKey="totalCost"
                name="Total Cost"
                stroke="#B85C38"
                strokeWidth={2}
                dot={{ r: 4, fill: '#B85C38', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="suggestedPrice"
                name="Suggested Price"
                stroke="#7A8B73"
                strokeWidth={2}
                dot={{ r: 4, fill: '#7A8B73', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
