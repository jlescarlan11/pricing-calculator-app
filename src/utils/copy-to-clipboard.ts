import { formatCurrency, formatPercent } from './formatters';
import { getPrintDate } from './print';
import type { CalculationInput, CalculationResult } from '../types/calculator';

/**
 * Formats calculation results into a clear, plain-text summary.
 * 
 * @param input - The original calculation inputs
 * @param result - The calculated results
 * @returns A formatted multi-line string summary
 */
export const formatCalculationSummary = (
  input: CalculationInput,
  result: CalculationResult
): string => {
  const { productName, batchSize, businessName } = input;
  const {
    costPerUnit,
    recommendedPrice,
    profitPerUnit,
    profitMarginPercent,
    profitPerBatch,
  } = result;

  const nameLabel = productName || 'Unnamed Product';
  const header = businessName 
    ? `${businessName}\nPRICING SUMMARY: ${nameLabel}`
    : `PRICING SUMMARY: ${nameLabel}`;

  return [
    header,
    '----------------------------------------',
    `Batch Size: ${batchSize} unit${batchSize === 1 ? '' : 's'}`,
    `Cost per Unit: ${formatCurrency(costPerUnit)}`,
    `Recommended Price: ${formatCurrency(recommendedPrice)}`,
    `Profit per Unit: ${formatCurrency(profitPerUnit)} (${formatPercent(profitMarginPercent)})`,
    `Total Batch Profit: ${formatCurrency(profitPerBatch)}`,
    '----------------------------------------',
    `Generated on ${getPrintDate()}`,
  ].join('\n').trim();
};

/**
 * Copies text to the clipboard with a fallback for browsers that do not support 
 * the standard Clipboard API.
 * 
 * @param text - The string to copy
 * @returns A promise that resolves to true if successful, false otherwise
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try using the modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Modern Clipboard API failed, falling back...', err);
    }
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Ensure the textarea is not visible or disruptive
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', ''); // Prevent keyboard from popping up on mobile
    
    document.body.appendChild(textArea);
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
};
