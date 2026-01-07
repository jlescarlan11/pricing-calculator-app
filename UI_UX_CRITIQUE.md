# **UI/UX Analysis: PriceCraft**

PriceCraft is a robust tool with a clean, functional aesthetic. However, for a calculator-heavy application, the "friction to value" ratio is a key area where the experience can be elevated.

## **🟢 Core Strengths**

- **Logical Grouping:** The separation of "Ingredient Cost," "Labor," and "Overhead" follows the mental model of a business owner perfectly.
- **Immediate Feedback:** Real-time updates to calculations provide a satisfying sense of control.
- **Clean Visual Language:** The use of whitespace and a consistent color palette (likely based on Tailwind defaults) makes the complex data sets readable.

## **🚩 Pain Point 1: The "Wall of Inputs" (Cognitive Load)**

On both desktop and mobile, the user is greeted with a long vertical list of empty input fields. For a new user, this creates **decision paralysis**.

- **Analysis:** The CalculatorForm.tsx renders all sections simultaneously. While this is good for power users, it makes the initial entry feel like "doing taxes" rather than "crafting a price."
- **Mobile Impact:** On mobile, users must scroll significantly to see the results. The ResultsDisplay is often "below the fold," meaning the user changes a number and has to scroll down to see if it even moved the needle.

### **🛠️ Where to Improve:**

- **Progressive Disclosure:** Implement a "Stepper" UI or accordion-style sections. Let users focus on _Ingredients_ first, then _Labor_, then _Overhead_.
- **Floating Results Bar:** Create a sticky "Summary" bar (or a FAB \- Floating Action Button) on mobile that shows the current Total Cost and Suggested Price at all times. This prevents the "scroll-to-see-result" loop.
- **Default/Ghost States:** Instead of empty fields, use "Ghost" values or a "Load Sample" button (which you have, but it should be more prominent) to show what a completed form looks like immediately.

## **🚩 Pain Point 2: Unit Conversion & Input Precision**

The IngredientRow.tsx requires users to do mental math for units (e.g., buying in kilograms but using in grams).

- **Analysis:** If a user buys 1kg of flour for $5 but uses 250g, they have to calculate the "Price per unit" manually or enter it as 0.25 of a unit. This is the \#1 place where pricing errors happen.
- **Mobile Impact:** Precision typing on mobile keyboards (switching between numeric and alpha for units) is slow. The current layout uses several columns that get cramped on narrow screens, leading to mis-taps.

### **🛠️ Where to Improve:**

- **Unit Intelligence:** Add a "Purchase Unit" vs "Recipe Unit" toggle.
  - _Buy: 1 \[kg\] for \[$5\]_
  - _Use: 250 \[g\]_ \- _Result: Automatically calculates cost ($1.25)._
- **Mobile-First Rows:** On screens smaller than 640px, move the IngredientRow from a horizontal table layout to a **Card layout**. Stack the "Cost" and "Quantity" fields so they have full-width tap targets.
- **Input Types:** Ensure all numeric inputs use inputmode="decimal" to force the correct keyboard on iOS/Android.

## **💡 Quick Wins (UI Polish)**

1. **Visual Hierarchy in Results:** In ResultsDisplay.tsx, the "Suggested Price" should be 2x larger than the costs. It is the "Hero" number the user came for.
2. **Color Semantics:** Use a "Profit Margin" color scale. If a user's price is below cost, the margin should turn bright red. If it’s healthy, a solid brand green.
3. **Haptic Feedback:** (Mobile specific) Add a slight haptic vibration when a row is deleted or a preset is saved to give the web app a native feel.

## **Summary of Action Plan**

1. **Mobile:** Implement a sticky summary footer so results are always visible.
2. **UX:** Add unit conversion logic to IngredientRow to remove mental math for the user.
