import React from 'react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { MESSAGES } from '../../constants/app';

interface ProductInfoProps {
  productName: string;
  batchSize: number;
  onChange: (field: 'productName' | 'batchSize', value: string | number) => void;
  errors?: {
    productName?: string;
    batchSize?: string;
  };
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  productName,
  batchSize,
  onChange,
  errors = {},
}) => {
  return (
    <Card title="Product Details" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
