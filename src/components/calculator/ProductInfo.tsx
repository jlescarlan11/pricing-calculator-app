import React from 'react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { MESSAGES } from '../../constants/app';

interface ProductInfoProps {
  businessName?: string;
  productName: string;
  batchSize: number;
  onChange: (field: 'productName' | 'batchSize' | 'businessName', value: string | number) => void;
  errors?: {
    productName?: string;
    batchSize?: string;
    businessName?: string;
  };
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  businessName = '',
  productName,
  batchSize,
  onChange,
  errors = {},
}) => {
  return (
    <Card title="Product Details" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </Card>
  );
};
