import type { Variant } from '../types/calculator';

/**
 * Calculates the maximum allowable batch size for a specific variant.
 *
 * Formula: Max(variant_i) = (Total_Base_Units - Sum_of_all_Batches) + Batch(variant_i)
 *
 * @param variantId - The ID of the variant being edited.
 * @param currentBatchSize - The current batch size of the variant being edited.
 * @param totalBaseUnits - The total batch size of the base product.
 * @param allVariants - List of all variants.
 * @returns The maximum allowable batch size for this variant.
 */
export const calculateMaxVariantBatch = (
  _variantId: string,
  currentBatchSize: number,
  totalBaseUnits: number,
  allVariants: Variant[]
): number => {
  const sumOfAllBatches = allVariants.reduce((sum, v) => sum + v.batchSize, 0);
  // remainingBaseUnits (global) = totalBaseUnits - sumOfAllBatches
  // But for this specific variant, it can "reclaim" its own contribution to the sum.
  // So Max = remainingBaseUnits + currentBatchSize
  //      = (totalBaseUnits - sumOfAllBatches) + currentBatchSize

  // Note: If the current state is already invalid (sum > total), remainingGlobal is 0.
  // In that case, we should strictly limit to what is possible.
  // If the variant is *part* of the sum causing the overflow, we still want to allow it to reduce.
  // The formula (Total - Sum) + Own works:
  // Example: Total=10, V1=6, V2=5. Sum=11. Overflow!
  // Max(V1) = (10 - 11) + 6 = -1 + 6 = 5.
  // So V1 can be at most 5. Correct.

  return Math.max(0, totalBaseUnits - sumOfAllBatches + currentBatchSize);
};

/**
 * Validates a variant's batch size against the constraint.
 */
export const validateVariantBatchAllocation = (
  variantId: string,
  newBatchSize: number,
  totalBaseUnits: number,
  allVariants: Variant[]
): { isValid: boolean; maxAllowed: number; message?: string } => {
  // Find current batch size for this variant from the list to calculate limit correctly
  const currentVariant = allVariants.find((v) => v.id === variantId);
  const currentBatchSize = currentVariant ? currentVariant.batchSize : 0; // 0 if new or not found (though usually we validate existing)

  const maxAllowed = calculateMaxVariantBatch(
    variantId,
    currentBatchSize,
    totalBaseUnits,
    allVariants
  );

  if (newBatchSize > maxAllowed) {
    return {
      isValid: false,
      maxAllowed,
      message: `Batch size cannot exceed ${maxAllowed} (remaining base units).`,
    };
  }

  if (newBatchSize < 0) {
    return {
      isValid: false,
      maxAllowed,
      message: 'Batch size cannot be negative.',
    };
  }

  return { isValid: true, maxAllowed };
};
