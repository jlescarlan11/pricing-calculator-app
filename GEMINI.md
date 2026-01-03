# Gemini Project Context: Pricing Calculator App

## 1. Project Overview

A web-based pricing calculator designed for small food businesses in the Philippines to determine profitable selling prices.

- **Core Goal**: Calculate accurate product costs (ingredients, labor, overhead) and recommend selling prices based on Markup or Profit Margin strategies.
- **Target Audience**: Small food entrepreneurs (e.g., artisan bakers, hot sauce makers).
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS 4.
- **Architecture**: Client-side SPA, in-memory state management (no backend for MVP).

## 2. Project Structure & Conventions

### Directory Structure

- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/utils/`: Pure functions for calculations and logic.
- `src/types/`: Shared TypeScript interfaces and type definitions.
- `src/assets/`: Static assets (images, icons).

### Naming Conventions

- **Files**: `kebab-case` (e.g., `calculate-cost.ts`, `validation-utils.ts`).
- **React Components**: `PascalCase` (e.g., `CostInputForm.tsx`, `ResultsDisplay.tsx`).
- **Functions & Variables**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.
- **Types & Interfaces**: `PascalCase`.

### Import Order

1. **External Libraries**: `react`, `lucide-react`, etc.
2. **Internal Core/Shared**: `../hooks/...`, `../utils/...`, `../types/...`.
3. **Internal Components**: `../components/...`.
4. **Relative Imports**: `./SubComponent`.
5. **Assets/Styles**: `./styles.css`, `../assets/...`.

## 3. Coding Standards

### TypeScript

- **Strict Mode**: Must be enabled. Avoid `any`; use specific types or Generics.
- **Typing**: Explicitly type component props and function return values.
- **Null Safety**: Handle `null` and `undefined` explicitly.

### React

- **Paradigm**: Functional components with Hooks only.
- **State Management**: Use `useState` for local state and `useReducer` (or Context if needed) for complex form state.
- **Logic Separation**: Extract complex business logic (calculations) into `src/utils` to make them testable and pure.

### Styling (Tailwind CSS)

- Use utility classes directly in JSX/TSX.
- Follow **Mobile-First** design principles.
- Maintain consistent spacing and color palette as defined in the design system/Tailwind config.

## 4. Feature Requirements (MVP)

### Core Modules

1.  **Cost Input Form**:
    - Ingredients (dynamic list), Labor cost, Overhead cost, Batch size.
    - Real-time validation (positive numbers, required fields).
2.  **Pricing Strategy**:
    - Toggle between **Markup %** and **Profit Margin %**.
    - Visual indicators for margin health (Red < 15%, Green > 25%).
3.  **Results Display**:
    - Cost per unit, Break-even price, Recommended selling price, Profit per batch.
4.  **Persistence**:
    - "My Saved Products" using React state (Session-based, resets on refresh).
    - Save/Load/Update functionality for presets.

## 5. Development Guidelines

- **Verify**: Ensure build passes (`npm run build`) and linting is clean (`npm run lint`) before marking tasks complete.
- **Comments**: Comment _why_ complex logic exists, not _what_ it does.
- **idiomatic Code**: Follow existing patterns in the codebase.

## 6. Progress Tracking

### Hooks
- [x] **usePresets**: Custom hook for managing an array of saved calculation presets in sessionStorage. Supports adding, updating, deleting, and retrieving presets with automatic ID generation and timestamping. (Added 2026-01-03)
  - File: `src/hooks/use-presets.ts`
  - Tests: `src/hooks/use-presets.test.ts`
  - Exported from `src/hooks/index.ts`

### Constants
- [x] **TOOLTIPS**: A library of concise, user-friendly tooltip descriptions for all calculator input fields. (Added 2026-01-03)
  - File: `src/constants/tooltips.ts`
  - Exported from `src/constants/index.ts`

### Components
- [x] **HelpIcon**: Reusable component that displays a question mark icon with support for tooltips (on hover) and modals (on click). Fully accessible with keyboard support and consistent styling. (Added 2026-01-03)
  - File: `src/components/help/HelpIcon.tsx`
  - Tests: `src/components/help/HelpIcon.test.tsx`
  - Exported from `src/components/help/index.ts`
- [x] **Badge**: Reusable status indicator with success, warning, error, and info variants. (Added 2026-01-03)
  - File: `src/components/shared/Badge.tsx`
  - Tests: `src/components/shared/Badge.test.tsx`
  - Exported from `src/components/shared/index.ts`
- [x] **IngredientRow**: Form row for ingredient input (Name, Amount, Cost) with validation, auto-focus, and delete confirmation. (Added 2026-01-03)
  - File: `src/components/calculator/IngredientRow.tsx`
  - Tests: `src/components/calculator/IngredientRow.test.tsx`
  - Exported from `src/components/calculator/index.ts`
- [x] **OverheadCost**: Component for overhead cost input with an expandable helper for detailed breakdown (Rent, Utilities, Packaging, Marketing). (Added 2026-01-03)
  - File: `src/components/calculator/OverheadCost.tsx`
  - Exported from `src/components/calculator/index.ts`
- [x] **PricingStrategy**: Component for choosing between Markup and Margin strategies with real-time visual examples, percentage slider/input, and a help modal. (Added 2026-01-03)
  - File: `src/components/calculator/PricingStrategy.tsx`
  - Tests: `src/components/calculator/PricingStrategy.test.tsx`
  - Exported from `src/components/calculator/index.ts`
- [x] **CalculatorForm**: Orchestrator component that manages full state for product info, ingredients, labor, and overhead. Features debounced auto-save to session storage, real-time preview, and explicit calculation with validation. (Added 2026-01-03)
  - File: `src/components/calculator/CalculatorForm.tsx`
  - Tests: `src/components/calculator/CalculatorForm.test.tsx`
  - Exported from `src/components/calculator/index.ts`
- [x] **ResultsDisplay**: Composed results container that displays recommendations, cost breakdown, and price comparison. Includes a "No calculation" placeholder, print/copy functionality, and smooth entry animations. (Added 2026-01-03)
  - File: `src/components/results/ResultsDisplay.tsx`
  - Tests: `src/components/results/ResultsDisplay.test.tsx`
  - Exported from `src/components/results/index.ts`
- [x] **CostBreakdown**: Updated to show both batch total and per-unit costs with a visual breakdown bar and detailed legend. (Updated 2026-01-03)
  - File: `src/components/results/CostBreakdown.tsx`
  - Tests: `src/components/results/CostBreakdown.test.tsx`
- [x] **PriceComparison**: Component that compares the current selling price with the recommended price, displaying opportunity cost and profit at current price. (Added 2026-01-03)
  - File: `src/components/results/PriceComparison.tsx`
  - Tests: `src/components/results/PriceComparison.test.tsx`
  - Exported from `src/components/results/index.ts`
- [x] **PresetsList**: Component that displays a searchable, filterable list of saved presets with grid/list view toggles. Sorts by newest first and integrates with usePresets. (Added 2026-01-03)
  - File: `src/components/presets/PresetsList.tsx`
  - Tests: `src/components/presets/PresetsList.test.tsx`
  - Exported from `src/components/presets/index.ts`
- [x] **ResultsDisplay**: Orchestrator component for displaying all calculation results, including recommendations, cost breakdown, and price comparison. (Added 2026-01-03)
  - File: `src/components/results/ResultsDisplay.tsx`
  - Exported from `src/components/results/index.ts`
- [x] **ShareResults**: A component that provides a dropdown menu for sharing results. Features Copy summary, Print, and placeholders for Email/PDF export. (Added 2026-01-03)
  - File: `src/components/results/ShareResults.tsx`
  - Tests: `src/components/results/ShareResults.test.tsx`
  - Exported from `src/components/results/index.ts`
- [x] **SavePresetButton**: A button component with tooltip and disabled state that triggers the SavePresetModal. Integrated into both the calculator form and results display for better UX. (Added 2026-01-03)
  - File: `src/components/presets/SavePresetButton.tsx`
  - Tests: `src/components/presets/SavePresetButton.test.tsx`
  - Exported from `src/components/presets/index.ts`
- [x] **CostBreakdown**: Component that displays total cost per unit with a categorical breakdown (Ingredients, Labor, Overhead) using percentages and a visual bar chart. (Added 2026-01-03)
  - File: `src/components/results/CostBreakdown.tsx`
  - Tests: `src/components/results/CostBreakdown.test.tsx`
  - Exported from `src/components/results/index.ts`
- [x] **FAQ**: FAQ component with an accordion layout for common questions, search functionality, and accessibility features. (Added 2026-01-03)
  - File: `src/components/help/FAQ.tsx`
  - Tests: `src/components/help/FAQ.test.tsx`
  - Exported from `src/components/help/index.ts`
- [x] **OverheadCalculator**: Guided helper component for calculating overhead costs based on monthly expenses and packaging requirements. (Added 2026-01-03)
  - File: `src/components/help/OverheadCalculator.tsx`
  - Tests: `src/components/help/OverheadCalculator.test.tsx`
  - Exported from `src/components/help/index.ts`
- [x] **SavePresetModal**: Modal dialog for saving calculations as presets with name validation, data preview, and success feedback. (Added 2026-01-03)
  - File: `src/components/presets/SavePresetModal.tsx`
  - Tests: `src/components/presets/SavePresetModal.test.tsx`
  - Exported from `src/components/presets/index.ts`
- [x] **PricingExplainerModal**: Tabbed educational modal explaining Markup and Margin strategies with visual examples, pros/cons, and a comparison table. (Added 2026-01-03)
  - File: `src/components/help/PricingExplainerModal.tsx`
  - Tests: `src/components/help/PricingExplainerModal.test.tsx`
  - Exported from `src/components/help/index.ts`

## 7. Build Fixes & Configuration (Added 2026-01-03)

- **Vite/Vitest Config**: Changed `vite.config.ts` to import `defineConfig` from `vitest/config` instead of `vite`. This ensures proper typing for the `test` configuration object.
- **Tooltip Component**:
  - Replaced `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` to avoid namespace issues in browser environments.
  - Cast props in `React.cloneElement` to `any` (e.g., `{ 'aria-describedby': tooltipId } as any`) to resolve strict type checking errors with `aria-describedby` on generic `ReactElement`.
- **Modal Component Test**:
  - Fixed a timeout issue in `Modal.test.tsx` ("restores body scroll when closed") by removing `waitFor` (which conflicts with `vi.useFakeTimers` in this context) and using direct assertions after manually advancing timers with `vi.advanceTimersByTime`.
