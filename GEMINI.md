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

### Components
- [x] **Badge**: Reusable status indicator with success, warning, error, and info variants. (Added 2026-01-03)
  - File: `src/components/shared/Badge.tsx`
  - Tests: `src/components/shared/Badge.test.tsx`
  - Exported from `src/components/shared/index.ts`

## 7. Build Fixes & Configuration (Added 2026-01-03)

- **Vite/Vitest Config**: Changed `vite.config.ts` to import `defineConfig` from `vitest/config` instead of `vite`. This ensures proper typing for the `test` configuration object.
- **Tooltip Component**:
  - Replaced `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` to avoid namespace issues in browser environments.
  - Cast props in `React.cloneElement` to `any` (e.g., `{ 'aria-describedby': tooltipId } as any`) to resolve strict type checking errors with `aria-describedby` on generic `ReactElement`.
- **Modal Component Test**:
  - Fixed a timeout issue in `Modal.test.tsx` ("restores body scroll when closed") by removing `waitFor` (which conflicts with `vi.useFakeTimers` in this context) and using direct assertions after manually advancing timers with `vi.advanceTimersByTime`.
