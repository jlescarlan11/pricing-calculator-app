import { PROFIT_MARGIN_THRESHOLDS } from '../constants/app';

export type RiskLevel = 'high' | 'medium' | 'low';

/**
 * Deterministically evaluates pricing risk based on profit margin thresholds.
 *
 * @param margin The profit margin percentage (e.g., 20 for 20%).
 * @returns 'high', 'medium', or 'low' risk level.
 */
export const calculateRiskScore = (margin: number): RiskLevel => {
  if (margin < PROFIT_MARGIN_THRESHOLDS.LOW) {
    return 'high';
  }
  if (margin <= PROFIT_MARGIN_THRESHOLDS.GOOD) {
    return 'medium';
  }
  return 'low';
};

/**
 * Generates rule-based recommendations derived from the calculated risk score and margin values.
 *
 * @param margin The profit margin percentage.
 * @param riskScore The calculated risk level.
 * @returns An array of recommendation strings.
 */
export const generateStaticRecommendations = (
  margin: number,
  riskScore: RiskLevel
): string[] => {
  const formattedMargin = margin.toFixed(1) + '%';
  switch (riskScore) {
    case 'high':
      return [
        `At ${formattedMargin}, consider raising your selling price to improve safety margins.`,
        'Review ingredient costs; can you find bulk suppliers?',
        'Check if overhead costs are allocated correctly across products.',
      ];
    case 'medium':
      return [
        `Your margin of ${formattedMargin} is healthy but could be optimized.`,
        'Explore slight price adjustments for premium positioning.',
        'Look for small efficiencies in your production process.',
      ];
    case 'low':
      return [
        `Excellent margin (${formattedMargin})! You have room for promotional discounts.`,
        'Consider reinvesting profits into marketing or new equipment.',
        'Explore volume discounts for wholesale customers.',
      ];
    default:
      return [];
  }
};
