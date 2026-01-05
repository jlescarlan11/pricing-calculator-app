import { describe, it, expect } from 'vitest';
import { calculateMaxVariantBatch, validateVariantBatchAllocation } from './variantValidation';
import type { Variant } from '../types/calculator';

describe('Variant Batch Allocation Logic', () => {
  const mockVariants = [
    { id: 'v1', batchSize: 20 },
    { id: 'v2', batchSize: 30 },
  ] as Variant[];

  const TOTAL_BASE = 100;

  it('calculates max batch size correctly for an existing variant', () => {
    // Total used = 50. Remaining = 50.
    // Max for v1 = Remaining + v1.batch = 50 + 20 = 70.
    const maxV1 = calculateMaxVariantBatch('v1', 20, TOTAL_BASE, mockVariants);
    expect(maxV1).toBe(70);

    // Max for v2 = Remaining + v2.batch = 50 + 30 = 80.
    const maxV2 = calculateMaxVariantBatch('v2', 30, TOTAL_BASE, mockVariants);
    expect(maxV2).toBe(80);
  });

  it('calculates max batch size for a new variant (not in list)', () => {
    // Simulating checking max for a new variant creation scenario if needed, 
    // or if we passed a theoretical variant.
    // If variant is not in list, "currentBatchSize" passed to func is usually 0 if we are asking "how much can I add?"
    // But if we are validating a new variant being added, the formula expects "currentBatchSize" to be what is currently contributing to the sum.
    
    // Scenario: User wants to add a new variant. Current sum = 50. Max = 50.
    const maxNew = calculateMaxVariantBatch('new', 0, TOTAL_BASE, mockVariants);
    expect(maxNew).toBe(50);
  });

  it('handles overflow scenario correctly (correction mode)', () => {
    // Scenario: Total base reduced to 40, but variants sum to 50.
    // Max(v1) = (40 - 50) + 20 = -10 + 20 = 10.
    const maxV1 = calculateMaxVariantBatch('v1', 20, 40, mockVariants);
    expect(maxV1).toBe(10);
  });

  it('validates a valid allocation', () => {
    const result = validateVariantBatchAllocation('v1', 70, TOTAL_BASE, mockVariants);
    expect(result.isValid).toBe(true);
    expect(result.maxAllowed).toBe(70);
  });

  it('invalidates an allocation exceeding max', () => {
    const result = validateVariantBatchAllocation('v1', 71, TOTAL_BASE, mockVariants);
    expect(result.isValid).toBe(false);
    expect(result.maxAllowed).toBe(70);
    expect(result.message).toContain('cannot exceed 70');
  });
  
  it('invalidates negative allocation', () => {
      const result = validateVariantBatchAllocation('v1', -5, TOTAL_BASE, mockVariants);
      expect(result.isValid).toBe(false);
  });
});
