# Pricing Calculator App - Kanban Board

## Priority 1: Stable-Price Strategy Toggling
Goal: Prevent price jumps when switching between Markup and Margin strategies by recalculating the equivalent percentage.

### 1.1 Core Logic Implementation → Implement mathematical conversion functions →
- Subtask: Create `calculateEquivalentMarkup(marginPercent)` in `src/utils/calculations.ts`.
  - Formula: `markup = margin / (1 - margin/100)`.
- Subtask: Create `calculateEquivalentMargin(markupPercent)` in `src/utils/calculations.ts`.
  - Formula: `margin = markup / (1 + markup/100)`.
- Subtask: Add unit tests in `src/utils/calculations.test.ts` to verify conversion accuracy (e.g., 20% margin = 25% markup).

### 1.2 UI Integration → Update PricingStrategy component to handle conversions →
- Subtask: Modify `handleStrategyChange` in `src/components/calculator/PricingStrategy.tsx` to call conversion utilities instead of preserving the raw value.
- Subtask: Ensure the `onChange` callback is triggered with the newly calculated "stable price" value.
- Subtask: Update `PricingStrategy.test.tsx` to verify that switching strategies does not change the "Recommended Price" display.

## Priority 2: Yield/Wastage Factor in Costing
Goal: Account for production loss by allowing users to define a yield percentage, ensuring unit costs reflect sellable quantities.

### 2.1 Schema & Data Model Updates → Update types to support yield factor →
- Subtask: Add `yieldPercentage: number` to `CalculationInput` in `src/types/calculator.ts`.
- Subtask: Add `yieldPercentage: number` to `Variant` in `src/types/calculator.ts`.
- Subtask: Update `useCalculatorState.ts` to initialize `yieldPercentage: 100` for both base and new variants.

### 2.2 Calculation Engine Update → Incorporate yield in unit cost logic →
- Subtask: Modify `calculateCostPerUnit` in `src/utils/calculations.ts` to accept `yieldPercentage`.
  - Formula: `costPerUnit = totalCost / (batchSize * (yieldPercentage / 100))`.
- Subtask: Update `performFullCalculation` to pass yield values to `calculateCostPerUnit` for both base and variants.
- Subtask: Update unit tests in `calculations.test.ts` to verify cost increases as yield decreases.

### 2.3 UI Implementation → Add yield input to CalculatorForm →
- Subtask: Add a "Yield / Wastage" input field (0-100%) in `src/components/calculator/CalculatorForm.tsx` (Product Info section).
- Subtask: Update `VariantBlock.tsx` to include a yield override field if `hasVariants` is true.
- Subtask: Add an informative tooltip in `src/constants/tooltips.ts` explaining how yield affects unit cost.

## Priority 3: VAT/Sales Tax Support
Goal: Help businesses calculate final shelf prices by optionally including VAT/Sales Tax.

### 3.1 Type System Extension → Add tax configuration to PricingConfig →
- Subtask: Update `PricingConfig` in `src/types/calculator.ts` to include `taxRate: number` and `includeTax: boolean`.
- Subtask: Update `DEFAULT_CONFIG` in `src/hooks/useCalculatorState.ts` with tax defaults (`includeTax: false`, `taxRate: 12`).

### 3.2 Calculation Engine Extension → Update recommendations for tax →
- Subtask: Create `calculatePriceWithTax(price, taxRate)` in `src/utils/calculations.ts`.
- Subtask: Update `CalculationResult` and `VariantResult` types to include `recommendedPriceInclTax: number`.
- Subtask: Update `performFullCalculation` to populate tax-inclusive fields if `includeTax` is enabled.

### 3.3 UI Implementation → Add Tax controls and display →
- Subtask: Add a "Tax Settings" section to `CalculatorForm.tsx` (within Pricing Strategy card) to toggle tax and set the rate.
- Subtask: Update `PricingRecommendations.tsx` and `VariantResultsTable.tsx` to display the tax-inclusive price as the primary result.
- Subtask: Update `PriceComparison.tsx` to ensure it compares apples-to-apples (either both pre-tax or both post-tax) to avoid misleading profit data.
- Subtask: Update `ShareResults.tsx` and `print.ts` to include tax details in exported summaries.
