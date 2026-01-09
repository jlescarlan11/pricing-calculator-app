# Detailed Project Brief: Pricing Calculator App (Phases 1-3)

## 1. Executive Summary
The Pricing Calculator App is a specialized web platform designed for small food businesses in the Philippines to master their profitability. It transforms complex cost accounting into a calm, guided experience. The application has evolved through three distinct phases:
- **Phase 1: Core Foundation** (Accurate cost engine and Japanese-inspired UI).
- **Phase 2: Data Ecosystem** (Cloud sync, variants, and portability).
- **Phase 3: Market Intelligence** (AI analysis, historical tracking, and competitor benchmarking).

---

## 2. Phase 1: Core Foundation (The Engine & Aesthetic)

### 2.1 The "Ma" Design System
- **Philosophy**: Adheres to Japanese aesthetics (*Ma*, *Wabi-sabi*, *Kanso*).
- **Visuals**: Uses a muted "Wabi-sabi" palette (Clay, Moss, Sakura, Rust) on an off-white (*FAFAF9*) background with a global SVG paper texture overlay.
- **Typography**: Crimson Text (serif) for headings and Inter (sans-serif) for UI/body text.
- **Components**: Atomic UI system (Cards, Inputs, Modals, Badges) with refined spacing (8px base scale).

### 2.2 Core Calculation Logic
- **Ingredient Costing**: Supports simple (total cost) and advanced (purchase price/quantity vs. recipe quantity) modes.
- **Labor & Overhead**: Precise hourly labor rates and fixed or percentage-based overhead allocation.
- **Pricing Strategies**:
    - **Markup %**: Cost * (1 + Markup).
    - **Profit Margin %**: Cost / (1 - Margin).
- **Sticky Summary**: A real-time preview of total cost and recommended price that follows the user as they input data.

### 2.3 Educational Integration
- **Contextual Help**: Tooltip system powered by a dedicated library of business definitions.
- **Pricing Guide**: Modals and standalone pages explaining the "Why" behind different pricing strategies.

---

## 3. Phase 2: Persistence & Multi-Product Support

### 3.1 Advanced Variant Engine
- **Implicit Base Model**: The primary product acts as a "Base" reference.
- **Extensions**: Users can add variants (e.g., different sizes, flavors) which inherit allocated base costs while allowing specific overrides for ingredients, labor, and overhead.
- **Proportional Allocation**: Automatically calculates yield-based cost distribution across variants.

### 3.2 Cloud Synchronization & Auth
- **Supabase Integration**: Secure authentication (Email/Password) and PostgreSQL persistence.
- **Preset Management**: Save, load, and manage "Saved Products" with searchable/filterable lists.
- **Offline-First Sync**: Local storage persistence with an automated queue-based sync mechanism for reliability during poor connectivity.

### 3.3 Data Portability
- **Export/Import**: Full JSON backup and restore with schema validation and versioning.
- **Print & Share**: Specialized stylesheets for physical records and "Copy to Clipboard" for pricing summaries.
- **Migration**: Automated logic to migrate guest-mode (local) presets to a user account upon login.

---

## 4. Phase 3: Advanced Insights & Market Intelligence

### 4.1 AI Pricing Assistant (Phase 3.1b)
- **Technical Integration**: Supabase Edge Function proxying to **Gemini 1.5 Flash**.
- **Capabilities**: Analyzes cost breakdown (Ingredients vs. Labor vs. Overhead) to provide 3 concise, actionable recommendations.
- **Fallback**: Rules-based deterministic analysis engine for offline or rate-limited scenarios.
- **Controls**: Strict 5-request/day/user rate limiting and exponential backoff.

### 4.2 Historical Price Tracker (Milestones)
- **Pull-Based Milestones**: Users manually "Pin" versions to create business milestones (e.g., "Monthly Review").
- **Visualization**: Recharts-powered **Price Trend Chart** showing the evolution of Unit Cost vs. Suggested Price.
- **Snapshot System**: Deep-cloning of presets into immutable snapshots for delta analysis and history comparison.

### 4.3 Competitive Benchmarking (Market Spectrum)
- **Competitor Tracking**: Dedicated table for up to 5 competitors per product.
- **Staleness Detection**: Visual warnings for data older than 30 days.
- **Market Positioning**: A "Spectrum" visualization showing where the current price sits (Budget, Mid-range, Premium) relative to the market.

---

## 5. Technical Implementation Details

| Layer | Technology | Key Implementation |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Strict type safety, functional hooks. |
| **State** | Custom Hooks | `useCalculatorState` for complex nested state. |
| **Styling** | Tailwind CSS 4 | CSS variables-based theme with custom utility extensions. |
| **Backend** | Supabase | Auth, PostgreSQL, Edge Functions (TypeScript/Deno). |
| **Database** | PostgreSQL | Relational schema with foreign keys for Snapshots and Competitors. |
| **Charts** | Recharts | Composable SVG charts for historical trends. |
| **Testing** | Vitest + RTL | Comprehensive unit, integration, and regression tests (300+). |

---

## 6. Critical User Flows

1. **The Calculation Flow**: Entry -> Input Costs -> Live Preview -> Explicit Calculate -> Committed Results.
2. **The Intelligence Flow**: Save Product -> View Results -> Open Market Benchmarking -> Run AI Analysis.
3. **The History Flow**: Edit Product -> Save Changes -> Pin Milestone -> View Trend Chart.
4. **The Onboarding Flow**: Auth -> Dashboard -> Load Sample Cookie Demo -> Guided Tour via Tooltips.

---

## 7. Quality & Standards
- **Build**: Production-ready Vite build with strict TS checking.
- **Performance**: Debounced auto-saves (1000ms) and memoized calculations.
- **Accessibility**: ARIA labels, semantic HTML, and keyboard-friendly modals.
- **Validation**: Strict Zod-like validation for all inputs and imported JSON.