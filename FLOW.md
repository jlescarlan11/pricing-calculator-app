# Application Flow: Pricing Calculator App

This document outlines the end-to-end flow of the Pricing Calculator App, from user entry to final results and data persistence.

## 1. Entry & Initialization
- **Routing**: The app uses `react-router-dom`. The primary entry point is the `/` route (`CalculatorPage`). Secondary routes include `/help` and `/faq`.
- **State Setup**: Upon loading `CalculatorPage`, the `useCalculatorState` hook initializes the application state.
    - **Draft Recovery**: It first attempts to recover a "draft" from `sessionStorage` to preserve progress across refreshes.
    - **Defaults**: If no draft exists, it initializes with a default empty product template (one empty ingredient row, markup strategy at 50%).

## 2. Data Input Phase (Calculator Form)
The user interacts with `CalculatorForm`, which is divided into five logical sections:
1.  **Product Info**: Basic metadata (Product Name, Batch Size, Business Name).
2.  **Ingredients**: A dynamic list of materials. Users can add/remove rows. Each row requires a name and a cost.
3.  **Labor & Overhead**: 
    - **Labor**: Flat cost for the time spent on the batch.
    - **Overhead**: Fixed costs (utilities, rent, packaging). Includes a helper component for calculating monthly overhead.
4.  **Pricing Strategy**:
    - Toggle between **Markup %** (Cost + Profit) and **Profit Margin %** (Price - Cost).
    - Real-time preview shows the calculated "Cost per Unit" based on current inputs.
5.  **Current Price (Optional)**: Input for the current selling price to perform an "Opportunity Cost" analysis.

## 3. Real-time Feedback & Validation
- **Debounced Auto-Save**: Every change is debounced (1s) and saved to `sessionStorage`.
- **Validation**: `useCalculatorState` performs continuous validation:
    - Minimum product name length (3 chars).
    - Batch size > 0.
    - All ingredient rows must be complete (name and cost > 0).
- **UI Indicators**: The "Calculate" button remains enabled, but the form displays a "Ready to calculate" status or specific guidance (e.g., "Add some ingredients") to help the user.

## 4. Calculation Engine
When the user clicks **Calculate**:
1.  **Validation Check**: A final blocking validation check ensures all data is correct.
2.  **Logic Execution**: The `performFullCalculation` utility (pure function) executes the following sequence:
    - **Sum Ingredients**: Total material cost.
    - **Total Batch Cost**: `Ingredients + Labor + Overhead`.
    - **Unit Cost**: `Total Batch Cost / Batch Size`.
    - **Recommended Price**: Applies the chosen Strategy (Markup or Margin) to the Unit Cost.
    - **Metrics**: Calculates Profit per Unit, Profit per Batch, and actual Profit Margin %.
3.  **State Update**: Results are stored in the `results` state, triggering the transition to the Results Display.

## 5. Results & Analysis (Results Display)
The results are displayed at the top of the page (High Hierarchy) with three priority sections:
1.  **Primary Recommendations**: Large display of the Recommended Selling Price and Profit per Batch.
2.  **Cost Breakdown**: A categorical breakdown (Ingredients vs. Labor vs. Overhead) using percentages and a visual bar chart.
3.  **Price Comparison**: If a "Current Price" was provided, it shows the gap between the current and recommended price, highlighting missed profit.

## 6. Persistence & Management (Presets)
- **Saving**: Users can save their current calculation as a "Preset" via the `SavePresetModal`.
- **Storage**: Presets are stored in `localStorage` via the `usePresets` hook.
- **Access**: A Floating Action Button (FAB) opens a modal list of saved products.
- **Loading/Editing**: Loading a preset replaces the current calculator state and scrolls the user to the results. Editing a preset loads the data and scrolls to the form.

## 7. Utility & Sharing
- **Sharing**: Users can copy a text summary of the results or print a professional "Product Pricing Report".
- **Reset**: Clears all current inputs and session drafts.
- **Theming**: A global toggle allows users to enable/disable the "Artisanal Paper Texture" for the UI background.
