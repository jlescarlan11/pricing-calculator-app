# UI/UX Improvement Kanban

## Phase 1: High-Impact UX Restructuring
*Focus: Reducing cognitive load and eliminating "scroll-to-see" friction.*

- [ ] **Implement Accordion/Stepper for Calculator Sections**
    - **Description:** Refactor `CalculatorForm.tsx` to group `ProductInfo`, `Ingredients`, `Costs` (Labor/Overhead), and `PricingStrategy` into collapsible accordion sections. Use a "Stepper" visual to guide progress. By default, open the first incomplete section.
    - **Files:** `src/components/calculator/CalculatorForm.tsx`
    - **Category:** UX Flow / Cognitive Load

- [ ] **Enable Live Results in Sticky Summary**
    - **Description:** Update `useCalculatorState` to expose a "live" calculation result (calculated on-the-fly from current inputs) independent of the committed `results` state. Pass this to `StickySummary` so the footer shows real-time `Total Cost` and `Suggested Price` even before the user clicks "Calculate".
    - **Files:** `src/hooks/useCalculatorState.ts`, `src/pages/CalculatorPage.tsx`, `src/components/results/StickySummary.tsx`
    - **Category:** UX Flow / Mobile

- [ ] **Redesign Sticky Summary (Mobile)**
    - **Description:** Update `StickySummary.tsx` to be a permanent fixture on mobile (not just when scrolled). Display "Total Cost" and "Suggested Price" side-by-side with a mini-progress bar for Profit Margin. Ensure it doesn't obscure the "Calculate" button if that remains the primary action.
    - **Files:** `src/components/results/StickySummary.tsx`
    - **Category:** Mobile / UX

## Phase 2: Core Functionality (Unit Logic)
*Focus: Removing mental math for users.*

- [ ] **Extend Ingredient Type for Unit Logic**
    - **Description:** Update the `Ingredient` interface to support optional "Purchase" details. Add fields: `purchaseQuantity`, `purchaseUnit`, `purchaseCost`, `recipeQuantity`, `recipeUnit`.
    - **Files:** `src/types/calculator.ts`
    - **Category:** Data Structure

- [ ] **Implement Smart Ingredient Input Row**
    - **Description:** Redesign `IngredientRow.tsx` to allow users to toggle between "Simple" (Cost only) and "Advanced" (Unit Conversion) modes. In Advanced mode, inputs should be: "Bought: [Qty] [Unit] for [$]", "Used: [Qty] [Unit]". Automatically calculate and update the underlying `cost` field.
    - **Files:** `src/components/calculator/IngredientRow.tsx`, `src/utils/calculations.ts` (helper for unit conversion)
    - **Category:** Feature / Logic

- [ ] **Mobile Card Layout for Ingredients**
    - **Description:** Update the CSS in `IngredientRow.tsx` to switch from a row-based layout to a distinct Card layout on screens `< 640px`. Stack inputs vertically (Name -> Purchase Details -> Recipe Details -> Cost) for larger tap targets.
    - **Files:** `src/components/calculator/IngredientRow.tsx`
    - **Category:** Mobile / Responsiveness

- [ ] **Enforce Decimal Input Mode**
    - **Description:** Audit all numeric `Input` components and ensure `inputmode="decimal"` is set to trigger the correct keyboard on mobile devices.
    - **Files:** `src/components/shared/Input.tsx`, `src/components/calculator/*.tsx`
    - **Category:** Accessibility / Mobile

## Phase 3: Visual Polish & Feedback
*Focus: Professional feel and clear data visualization.*

- [ ] **Refine Results Visual Hierarchy**
    - **Description:** In `ResultsDisplay.tsx`, increase the font size of "Recommended Price" (e.g., `text-5xl` or `text-6xl`) to make it the clear "Hero" element. Visually dim the cost breakdown slightly to emphasize the profit.
    - **Files:** `src/components/results/ResultsDisplay.tsx`, `src/components/results/PricingRecommendations.tsx`
    - **Category:** UI Polish

- [ ] **Implement Profit Margin Color Scale**
    - **Description:** Create a utility function `getMarginColor(margin: number)` that returns specific Tailwind colors: Red (<15%), Orange (15-25%), Green (>25%). Apply this consistently to all margin badges and progress bars in `ResultsDisplay` and `StickySummary`.
    - **Files:** `src/utils/formatters.ts` (or similar), `src/components/results/*`
    - **Category:** UI Consistency

- [ ] **Add Haptic Feedback (Mobile)**
    - **Description:** Add `navigator.vibrate(50)` calls to key interactions: Deleting an ingredient, saving a preset, and completing a calculation. Ensure to check for browser support first.
    - **Files:** `src/components/calculator/IngredientRow.tsx`, `src/components/presets/SavePresetButton.tsx`, `src/pages/CalculatorPage.tsx`
    - **Category:** UX / Native Feel

- [ ] **Add "Load Sample" Empty State**
    - **Description:** Make the "Load Sample" action more prominent in the empty state of the calculator form (when inputs are empty) to encourage exploration.
    - **Files:** `src/components/calculator/CalculatorForm.tsx`
    - **Category:** Onboarding
