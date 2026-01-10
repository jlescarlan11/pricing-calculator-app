# Pricing Strategy Enhancements: Kanban Roadmap

This roadmap focuses on three high-impact enhancements to the pricing strategy workflow. These features bridge the gap between abstract financial theory and practical business operations, directly addressing the user's primary challenge: "setting the right margin."

## Rationale
1.  **Reverse Pricing (Profit Goal Mode):** Solves the "uncertainty" problem. Users often know their desired profit (e.g., ₱500/batch) but struggle to translate that into a margin percentage.
2.  **Contextual “Real-Money” Visualization:** Fixes the "abstraction" problem. Replacing static ₱100 examples with the user's actual `costPerUnit` makes the impact of every slider movement immediately relatable.
3.  **Visual “Health Zones” (Color-Coded Slider):** Addresses the "risk" problem. Provides intuitive, non-verbal guardrails to help users stay within safe profit thresholds.

---

## 📋 To Do

### Task 1: [Logic] Implement Reverse Pricing Mathematics
**Task:** Update calculation utilities to support deriving margin/markup from a target profit value, and vice-versa.
- [ ] **Subtask 1.1:** Add `calculateMarginFromProfit(cost, targetProfit)` to `src/utils/calculations.ts`.
    - *Formula:* `Margin = (Target Profit / (Cost + Target Profit)) * 100`. Handle `Cost + Target Profit === 0`.
- [ ] **Subtask 1.2:** Add `calculateMarkupFromProfit(cost, targetProfit)` to `src/utils/calculations.ts`.
    - *Formula:* `Markup = (Target Profit / Cost) * 100`. Handle `Cost === 0` (return 0 or a safe max).
- [ ] **Subtask 1.3:** Add `calculateProfitFromPercentage(cost, strategy, value)` to `src/utils/calculations.ts`.
    - *Logic:* `price = calculateRecommendedPrice(cost, strategy, value); return price - cost;`
- [ ] **Subtask 1.4:** Add unit tests in `src/utils/calculations.test.ts` for all three functions, covering zero/negative values and boundary conditions.

### Task 2: [Types] Extend Pricing Strategy Schema
**Task:** Update types to support a "Profit Goal" input mode.
- [ ] **Subtask 2.1:** In `src/types/calculator.ts`, add `inputMode: 'percentage' | 'profit'` to `PricingConfig`.
- [ ] **Subtask 2.2:** Update `PricingStrategyProps` in `src/components/calculator/PricingStrategy.tsx` to include `inputMode?: 'percentage' | 'profit'` and `onInputModeChange?: (mode: 'percentage' | 'profit') => void`.

### Task 3: [UI] Implement "Profit Goal" Input Toggle
**Task:** Add the UI toggle and profit-based input field to the Pricing Strategy card.
- [ ] **Subtask 3.1:** In `src/components/calculator/PricingStrategy.tsx`, add a segmented control (using existing button styles) to switch between "Percentage" and "Profit Goal".
- [ ] **Subtask 3.2:** Implement the profit input field:
    - *Value:* Derive from `calculateProfitFromPercentage(costPerUnit, strategy, value)`.
    - *OnChange:* Call `calculateMarginFromProfit` (or Markup) to get the new percentage, then trigger existing `onChange(strategy, newPercentage)`.
- [ ] **Subtask 3.3:** Ensure the slider remains visible and functional in both modes, as it always operates on the underlying percentage value.

### Task 4: [UI] Contextualize Real-Money Visualization
**Task:** Replace static ₱100 example with live user data.
- [ ] **Subtask 4.1:** Locate `exampleCost` in `src/components/calculator/PricingStrategy.tsx`.
- [ ] **Subtask 4.2:** Replace `const exampleCost = 100;` with `const displayCost = costPerUnit > 0 ? costPerUnit : 100;`.
- [ ] **Subtask 4.3:** Update the helper text to say "With your cost of ₱X..." if `costPerUnit > 0`, otherwise keep the "Example: If your cost is ₱100..." phrasing.

### Task 5: [UI] Color-Coded "Health Zone" Slider
**Task:** Apply dynamic styling to the range slider for safety feedback.
- [ ] **Subtask 5.1:** Create/Use a helper that converts `value` to a margin percentage (if strategy is markup) before comparing against `PROFIT_MARGIN_THRESHOLDS`.
- [ ] **Subtask 5.2:** Apply a CSS `background: linear-gradient(...)` to the range slider track.
    - *Stops:* Rust (#B85C38) at 0-15%, Sakura (#E8C5C0) at 15-25%, Moss (#7A8B73) at 25%+.
    - *Note:* Use a `style` attribute on the input to ensure the gradient dynamically tracks the current strategy's "safe" zones.
- [ ] **Subtask 5.3:** Apply the same color logic to the percentage/profit display text using a new `getHealthColor(margin)` utility.

---

## ⏳ In Progress
*(No tasks currently in progress)*

---

## ✅ Done
*(No tasks completed yet)*

---

## 🧪 Verification Plan
- **Logic:** Run `npm test` to verify new math utilities and ensure `performFullCalculation` remains stable.
- **UI/UX:** Verify "Profit Goal" mode correctly updates the recommended price in both single and variant views.
- **Persistence:** Ensure presets saved in "Profit Goal" mode restore correctly from storage.
