import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { formatCalculationSummary, copyToClipboard } from './copy-to-clipboard';
import type { CalculationInput, CalculationResult } from '../types/calculator';

describe('copy-to-clipboard utility', () => {
  const mockInput: CalculationInput = {
    productName: 'Test Cookies',
    batchSize: 12,
    ingredients: [],
    laborCost: 100,
    overhead: 50,
    businessName: 'My Bakery',
  };

  const mockResult: CalculationResult = {
    totalCost: 150,
    costPerUnit: 12.5,
    breakEvenPrice: 12.5,
    recommendedPrice: 25,
    profitPerBatch: 150,
    profitPerUnit: 12.5,
    profitMarginPercent: 50,
    breakdown: {
      ingredients: 0,
      labor: 100,
      overhead: 50,
    },
  };

  describe('formatCalculationSummary', () => {
    it('should format summary correctly with business name', () => {
      const summary = formatCalculationSummary(mockInput, mockResult);
      expect(summary).toContain('My Bakery');
      expect(summary).toContain('PRICING SUMMARY: Test Cookies');
      expect(summary).toContain('Batch Size: 12 units');
      expect(summary).toContain('Cost per Unit: ₱12.50');
      expect(summary).toContain('Recommended Price: ₱25.00');
      expect(summary).toContain('Profit per Unit: ₱12.50 (50.00%)');
      expect(summary).toContain('Total Batch Profit: ₱150.00');
    });

    it('should format summary correctly without business name', () => {
      const inputWithoutBusiness = { ...mockInput, businessName: undefined };
      const summary = formatCalculationSummary(inputWithoutBusiness, mockResult);
      expect(summary).not.toContain('My Bakery');
      expect(summary).toContain('PRICING SUMMARY: Test Cookies');
    });

    it('should handle singular units correctly', () => {
      const inputSingle = { ...mockInput, batchSize: 1 };
      const summary = formatCalculationSummary(inputSingle, mockResult);
      expect(summary).toContain('Batch Size: 1 unit');
      expect(summary).not.toContain('Batch Size: 1 units');
    });
  });

  describe('copyToClipboard', () => {
    // Keep reference to original implementations
    const originalClipboard = navigator.clipboard;
    const originalExecCommand = document.execCommand;

    beforeEach(() => {
      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        configurable: true,
        writable: true,
      });

      // Mock execCommand
      document.execCommand = vi.fn().mockReturnValue(true);

      // Mock window.isSecureContext
      vi.stubGlobal('isSecureContext', true);
    });

    afterEach(() => {
      // Restore original implementations
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
        writable: true,
      });
      document.execCommand = originalExecCommand;
      vi.unstubAllGlobals();
    });

    it('should use navigator.clipboard when available and in secure context', async () => {
      const success = await copyToClipboard('test text');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
      expect(success).toBe(true);
    });

    it('should fall back to execCommand when clipboard API fails', async () => {
      (navigator.clipboard.writeText as Mock).mockRejectedValue(new Error('Failed'));
      const success = await copyToClipboard('test text');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(success).toBe(true);
    });

    it('should fall back to execCommand when clipboard API is not available', async () => {
      // Clear the mock and the original
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const success = await copyToClipboard('test text');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(success).toBe(true);
    });
  });
});
