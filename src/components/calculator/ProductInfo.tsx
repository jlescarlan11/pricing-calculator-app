import React from 'react';
import { Input } from '../shared/Input';
import { MESSAGES } from '../../constants/app';
import { TOOLTIPS } from '../../constants/tooltips';

interface ProductInfoProps {
  businessName?: string;
  productName: string;
  batchSize: number;
  yieldPercentage: number;
  onChange: (
    field: 'productName' | 'batchSize' | 'businessName' | 'yieldPercentage',
    value: string | number
  ) => void;
  errors?: {
    productName?: string;
    batchSize?: string;
    businessName?: string;
    yieldPercentage?: string;
  };
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  businessName = '',
  productName,
  batchSize,
  yieldPercentage,
  onChange,
  errors = {},
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-xl">
      <Input
        label="Business Name (Optional)"
        value={businessName}
        onChange={(e) => onChange('businessName', e.target.value)}
        placeholder="e.g. Maria's Bakery"
        error={errors.businessName}
        helperText="Your business name will appear on the printed report."
      />
      <Input
        label="Product Name"
        value={productName}
        onChange={(e) => onChange('productName', e.target.value)}
        placeholder="e.g. Signature Chocolate Chip Cookies"
        error={errors.productName}
        helperText="Enter a descriptive name for your product."
        required
      />
      <Input
        label="Batch Size"
        type="number"
        value={batchSize || ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange('batchSize', val === '' ? 0 : Number(val));
        }}
        placeholder="e.g. 12"
        error={errors.batchSize}
        helperText={MESSAGES.HELP_TEXT.BATCH_SIZE}
        required
        min={1}
      />
      {/* Yield / Wastage Input: Impacts effective unit cost by spreading total batch costs over sellable items */}
      <Input
        label="Yield %"
        type="number"
        value={yieldPercentage || ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange('yieldPercentage', val === '' ? 0 : Number(val));
        }}
        placeholder="100"
        error={errors.yieldPercentage}
        tooltip={TOOLTIPS.YIELD_PERCENTAGE}
        suffix="%"
        min={1}
        max={100}
      />
    </div>
  );
};
