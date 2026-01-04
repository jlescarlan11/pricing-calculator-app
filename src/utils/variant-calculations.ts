import type { VariantInput } from '../types';

export const calculateVariantPrice = (variant: VariantInput): number => {
  return variant.pricingValue;
};
