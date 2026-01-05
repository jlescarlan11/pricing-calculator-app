import type { CalculationInput, PricingConfig } from '../types/calculator';

export const COOKIE_SAMPLE: { input: CalculationInput; config: PricingConfig } = {
  input: {
    productName: 'Chocolate Chip Cookies',
    batchSize: 50,
    ingredients: [
      { id: '1', name: 'All-Purpose Flour', amount: 500, cost: 45 },
      { id: '2', name: 'Brown Sugar', amount: 200, cost: 35 },
      { id: '3', name: 'White Sugar', amount: 150, cost: 25 },
      { id: '4', name: 'Butter (Unsalted)', amount: 225, cost: 120 },
      { id: '5', name: 'Chocolate Chips (Semi-sweet)', amount: 300, cost: 180 },
      { id: '6', name: 'Eggs (Large)', amount: 2, cost: 18 },
      { id: '7', name: 'Vanilla Extract & Baking Soda', amount: 1, cost: 10 },
    ],
    laborCost: 150, // 2 hours of work
    overhead: 50, // Electricity and packaging
    currentSellingPrice: 15,
  },
  config: {
    strategy: 'margin',
    value: 30, // 30% profit margin
  },
};
