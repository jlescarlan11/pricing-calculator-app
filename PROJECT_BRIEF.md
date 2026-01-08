# **Project Brief: Pricing Calculator App (Phase 1 & 2\)**

## **1\. Executive Summary**

The Pricing Calculator App is a specialized tool designed for small business owners (e.g., home bakers, crafters) to accurately calculate product costs and determine optimal selling prices. The application has completed Phase 1 (Core Functionality) and Phase 2 (Persistence & Multi-product Support), resulting in a fully functional web-based platform with cloud synchronization.

## **2\. Implemented Features: Phase 1 (Core Logic & UI)**

### **2.1 Componentized Calculator Engine**

The core logic resides in src/utils/calculations.ts and src/hooks/useCalculatorState.ts, providing real-time pricing updates.

- **Ingredient Management**: Users can add, edit, and remove ingredients. Each ingredient includes name, purchase quantity/unit, purchase price, and amount used in the recipe.
- **Labor Costing**: Calculation of labor costs based on an hourly rate and time spent (hours/minutes).
- **Overhead Costs**: Support for both fixed amount and percentage-based overhead calculations.
- **Pricing Strategies**: Two primary strategies implemented:
  - **Markup Percentage**: Price \= Total Cost \* (1 \+ Markup %).
  - **Profit Margin**: Price \= Total Cost / (1 \- Margin %).
- **Real-time Results**: A "Sticky Summary" (StickySummary.tsx) provides immediate feedback on total cost and suggested price as inputs change.

### **2.2 Results & Analytics**

- **Cost Breakdown**: A visual and tabular breakdown of costs (CostBreakdown.tsx) showing percentages for ingredients, labor, and overhead.
- **Price Comparison**: Compares the "Suggested Price" vs. the "Current Selling Price" to show projected profit/loss per unit.
- **Pricing Recommendations**: Dynamic logic that provides "High," "Balanced," or "Low" pricing tiers based on user input.

### **2.3 Shared UI Framework**

- **Atomic Design**: Reusable components found in src/components/shared/ (Button, Input, Card, Modal, Switch, Tooltip, Badge).
- **Information Support**: Tooltip integration using src/constants/tooltips.ts to explain business terminology (e.g., Margin vs. Markup).
- **Error Handling**: Global Error Boundary and localized form validation (src/utils/validation.ts).

## **3\. Implemented Features: Phase 2 (Advanced Data & UX)**

### **3.1 Multi-Product & Variant System**

The application supports complex product structures via src/components/calculator/VariantBlock.tsx.

- **Product Variants**: Ability to define different sizes or versions of a single product (e.g., "Small Cake" vs. "Large Cake").
- **Yield-Based Scaling**: Variants scale the base recipe costs based on their specific yield/output.
- **Comparative Results**: A "Variant Results Table" compares all versions side-by-side to assist in product line decisions.

### **3.2 Persistence & User Accounts**

Integration with **Supabase** for backend services (src/lib/supabase.ts).

- **Authentication**: Full auth flow including Email/Password signup/login and "Forgot Password" functionality.
- **Cloud Presets**: A Preset Service (src/services/presetService.ts) allows users to save, load, and delete product calculations.
- **State Migration**: A migration utility (src/utils/migration.ts) ensures local data is safely handled during version updates.

### **3.3 Data Portability & Export**

- **JSON Export/Import**: Users can export their entire product database or individual presets as JSON files.
- **Printing**: A specialized print utility (src/utils/print.ts) formats results for physical documentation or PDF saving.
- **Clipboard Integration**: Ability to copy price summaries and cost breakdowns directly to the clipboard.

### **3.4 Help & Education**

- **FAQ System**: An accordion-style FAQ page (src/pages/FAQPage.tsx) covering common pricing questions.
- **Overhead Calculator Tool**: An interactive helper within the UI to assist users in determining their monthly overhead costs.

## **4\. Technical Architecture**

| Layer                | Implementation                                                    |
| :------------------- | :---------------------------------------------------------------- |
| **Framework**        | React 18 with TypeScript                                          |
| **Styling**          | Tailwind CSS (Utility-first)                                      |
| **State Management** | Custom Hooks (useCalculatorState) and React Context (AuthContext) |
| **Backend/Auth**     | Supabase (PostgreSQL \+ GoTrue)                                   |
| **Icons**            | Lucide React                                                      |
| **Storage**          | Session Storage (temporary) \+ Supabase (persistent)              |
| **Testing**          | Vitest \+ React Testing Library (Unit and Integration tests)      |

## **5\. Current User Flows**

1. **Onboarding**: User lands on AuthPage \-\> Signs up \-\> Guided to Calculator.
2. **Calculation**: User enters Product Info \-\> Adds Ingredients \-\> Defines Labor/Overhead \-\> Selects Strategy.
3. **Variant Creation**: User clicks "Add Variant" \-\> Enters Variant Name/Yield \-\> Views comparative table.
4. **Saving**: User clicks "Save Preset" \-\> Document is uploaded to Supabase presets table.
5. **Review**: User visits "Account" to manage saved presets, export data, or change security settings.

## **6\. Project Scope Constraints (As per Codebase)**

- **Currency**: Fixed to local currency formatters (src/utils/formatters.ts).
- **Unit System**: Manual entry for units; no automated unit conversion (e.g., grams to pounds) is currently implemented in the core calculation logic.
- **Multiplayer**: Current implementation is single-user focused with cloud sync; no collaborative "Shared Project" features found.

## **7\. Phase 3: Future Roadmap (Finalized Strategy)**

To ensure technical feasibility and immediate user impact, Phase 3 focuses on a consolidated data foundation and user-driven historical insights designed for long-term adoption.

### **7.0 Phase 3.0: Unified Data Foundation (Pre-requisite)**

This phase establishes a single, extensible source of truth for all historical and analytical features, ensuring relational integrity and clear data ownership:

- **Extended Preset Metadata**: The existing presets table is extended with versioning metadata to support snapshotting:
  - snapshot_date (timestamp, nullable)
  - is_tracked_version (boolean, default false)
  - version_number (integer, nullable)
  - parent_preset_id (foreign key to presets.id, nullable) — Explicitly links historical snapshots to the active "working" preset, preserving the relationship even if product names change.
- **Single Data Model**: Historical data is preserved by creating a copy of the preset row where is_tracked_version \= true and parent_preset_id is set to the source ID. This prevents orphaned records and allows reliable trend queries.
- **Competitor Tracking Schema**: A dedicated competitors table is established to support the benchmarking feature (7.3):
  - id (primary key), preset_id (foreign key to presets.id, NOT NULL)
  - competitor_name (text), competitor_price (numeric), notes (text)
  - created_at, updated_at (timestamps for staleness detection)
  - **Constraint**: Maximum 5 competitors per preset_id to maintain a lightweight UX.

### **7.1 AI Pricing Assistant (Feasibility-First Strategy)**

- **Phase 3.1a \- Rules-Based MVP**: Implement the initial assistant using deterministic logic (e.g., Margin \< 20% \= High Risk) and template-based recommendations. This validates user demand and UI/UX patterns with zero API costs.
- **Phase 3.1b \- Conditional LLM Integration**: Transition to Gemini (via Supabase Edge Functions) only if usage metrics justify the cost.
  - **Input Contract**: Structured JSON containing ingredients, labor, overhead, and strategy.
  - **Output Contract**: Standardized JSON including riskScore and an array of actionable recommendations.
- **Economic Controls**: Implement strict rate limiting (e.g., 5 AI requests/user/day) and clear UI feedback on remaining daily analysis credits to manage operational expenses.

### **7.2 Historical Price Tracker (Pull-Based Milestone Model)**

- **Feature**: Visualization of cost and profit trends over time via explicit, intentional business milestones.
- **UX Flow (Pull Model)**:
  - **Intentional Tracking**: Remove all checkbox/toggle interrupts from the standard "Save Preset" workflow to eliminate decision fatigue.
  - **Dedicated History View**: Add a "Price History" section within the preset detail view for comparing current versions against previous milestones.
  - **Explicit Action**: A prominent "Save Historical Snapshot" button allows users to manually pin a version for analysis at meaningful business points (e.g., a monthly price review).
- **Empty State Handling**: If zero snapshots exist, show a placeholder chart with the message: "No snapshots yet. Create one to track cost trends over time. We recommend pinning a snapshot monthly to visualize profit health."
- **Visualization**: Recharts-powered line chart showing the evolution of Total Cost vs. Selling Price across the user’s explicitly tracked milestones (queried via parent_preset_id).

### **7.3 Competitive Pricing Benchmarker (Lightweight MVP)**

- **Scope & Maintenance**: Shift focus from high-volume data entry to a low-friction validation tool.
  - **Reduced Burden**: Recommend tracking only **1-3 key competitors** per product (capped at 5\) to minimize research friction.
  - **Staleness Detection**: Display the "age" of data (via updated_at) next to each entry to prompt periodic review.
- **Entry Workflow**: A "Track Competitors" button within the Price Comparison section opens a modal to manage the competitors table records for that preset.
- **Simplified Comparison Logic**:
  - **Positioning**: Instead of complex percentiles, show relative positioning: "Your price ($30) is higher than 2 of 3 tracked competitors."
  - **Spectrum Labels**: 0-33% (Budget), 34-66% (Mid-Range), 67-100% (Premium).
  - **Minimum Threshold**: Requires at least 2 competitors to generate the spectrum visualization.
- **Placement & Support**: Integrated as an optional, collapsible analysis card. Detailed guidance on "How to Research Competitors Efficiently" will be added to the FAQ (3.4) to assist users with external data gathering.
