import type { CalculationInput, CalculationResult, PricingConfig } from '../types/calculator';
import { formatDate } from './formatters';

/**
 * Utility to trigger the browser's print dialog.
 * Can be extended to perform pre-print logic.
 */
export const triggerPrint = (): void => {
  window.print();
};

/**
 * Returns a title for the print document based on product and business names.
 */
export const getPrintTitle = (input: CalculationInput): string => {
  const parts = [];
  if (input.businessName) parts.push(input.businessName);
  parts.push(input.productName || 'Product Calculation');
  return parts.join(' - ');
};

/**
 * Formats the calculation date for the print footer/header.
 */
export const getPrintDate = (): string => {
  return formatDate(new Date());
};

/**
 * Prepares a summary object specifically for printing if a separate
 * layout or formatting is needed beyond CSS media queries.
 */
export const preparePrintSummary = (
  input: CalculationInput,
  results: CalculationResult,
  config: PricingConfig
) => {
  return {
    title: getPrintTitle(input),
    date: getPrintDate(),
    strategy: config.strategy === 'markup' ? 'Markup' : 'Profit Margin',
    strategyValue: `${config.value}%`,
    batchSize: input.batchSize,
    costPerUnit: results.costPerUnit,
    recommendedPrice: results.recommendedPrice,
    profitPerUnit: results.profitPerUnit,
    margin: results.profitMarginPercent,
  };
};
