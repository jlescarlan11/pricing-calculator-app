/**
 * Utility for comparing pricing presets and calculating differences.
 */

export interface ComparisonInput {
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
}

export interface ComparisonDeltas {
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
}

/**
 * Calculates the differences (deltas) between two sets of pricing totals.
 * Returns current - previous for each field.
 *
 * @param current - The newer pricing totals
 * @param previous - The older pricing totals to compare against
 * @returns An object containing the deltas for each key field
 */
export const compareTotals = (
  current: ComparisonInput,
  previous: ComparisonInput
): ComparisonDeltas => {
  return {
    totalCost: current.totalCost - previous.totalCost,
    suggestedPrice: current.suggestedPrice - previous.suggestedPrice,
    profitMargin: current.profitMargin - previous.profitMargin,
  };
};
