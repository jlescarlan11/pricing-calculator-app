# Kanban: Phase 2 Implementation

This Kanban board tracks the implementation of Phase 2 features: Cloud Sync, Export/Import, and Product Variants.

**Current Date:** 2026-01-05
**Reference:** `FLOW.md`, `phase2_project_brief.md`

## 1. Infrastructure & Authentication

_Goal: Secure user identity and database connection._

- [x] **Setup Supabase Client**
  - [x] Create `src/lib/supabase.ts` to initialize the Supabase client.
  - [x] Define environment variables `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - [x] Create a utility to check connection status.
- [x] **Implement Auth Context**
  - [x] Create `src/context/AuthContext.tsx` to wrap the app.
  - [x] Implement `AuthProvider` to expose `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`.
  - [x] **Constraint**: Restrict `signIn`/`signUp` to Email + Password ONLY (No OAuth, Magic Links, or MFA).
  - [x] Handle session persistence and auto-refresh using Supabase defaults.
- [x] **Create Auth UI Screens**
  - [x] Create `src/pages/AuthPage.tsx` (Login/Signup toggle).
  - [x] Implement `SignUpForm` component (Email, Password, Confirm Password).
  - [x] Implement `LoginForm` component (Email, Password).
  - [x] Add explicit error handling for auth failures (e.g., "User already exists", "Invalid password").
  - [x] Add "Forgot Password" flow (Trigger password reset email).
- [x] **Route Protection**
  - [x] Create `src/components/auth/ProtectedRoute.tsx`.
  - [x] Update `App.tsx` to protect `/account` and optionally sync routes.
  - [x] Ensure public routes (`/`, `/help`, `/faq`) remain accessible without auth.

## 2. Data Layer & Sync

_Goal: Persistent storage with offline-first capabilities._

- [x] **Define Database Schema (Supabase)**
  - [x] Create `users` table (managed by Supabase Auth, but verify public profile needs if any).
  - [x] Create `presets` table:
    - `id` (UUID, PK)
    - `user_id` (UUID, FK)
    - `name` (Text)
    - `preset_type` (Text: 'single' | 'variants')
    - `base_recipe` (JSONB: Batch, Ingredients, Labor, Overhead)
    - `variants` (JSONB: Array of variant objects)
    - `pricing_config` (JSONB: Strategy, Value - for single mode)
    - `updated_at`, `created_at`, `last_synced_at` (Timestamps)
  - [x] Enable Row Level Security (RLS) to ensure users only see their own presets.
- [x] **Implement Sync Service**
  - [x] Create `src/services/presetService.ts`.
  - [x] Implement `fetchPresets`: Merge Cloud + Local Storage (Last-write-wins based on `updated_at`).
  - [x] Implement `savePreset`: Save to Local Storage -> Try Cloud Sync.
  - [x] Implement `deletePreset`: Delete Local -> Delete Cloud.
  - [x] **Constraint**: If offline, queue operation in Local Storage and retry on `online` event.
- [x] **Update `usePresets` Hook**
  - [x] Refactor `src/hooks/use-presets.ts` to use `AuthContext` and `presetService`.
  - [x] Add `syncStatus` state ('synced' | 'syncing' | 'offline' | 'error').
  - [x] Ensure optimistic UI updates (UI updates immediately, sync happens in background).
  - [x] Test sync scenarios: Online, Offline, Offline->Online.

## 3. Variants Engine (Core Logic)

_Goal: Unified calculation logic for Single and Variant modes._

- [x] **Update Data Models**
  - [x] Modify `src/types/calculator.ts`:
    - [x] Add `Variant` interface:
      - `id`, `name`, `batchSize`
      - `ingredients`: `Ingredient[]` (Additional)
      - `laborCost`: number (Additional)
      - `overhead`: number (Additional)
      - `pricing`: `PricingConfig` (Specific to variant)
      - `currentSellingPrice`: number (Optional)
    - [x] Update `CalculationInput` to include `hasVariants: boolean` and `variants: Variant[]`.
- [x] **Implement Allocation Logic**
  - [x] Create `src/utils/variantCalculations.ts`.
  - [x] Implement `calculateProportionalCosts(baseTotal, baseBatchSize, variantBatchSize)`:
    - Formula: `(BaseTotal / BaseBatchSize) * VariantBatchSize`.
  - [x] Implement `performVariantCalculation`:
    - Step 1: Calculate Total Base Costs (Shared Ingredients + Labor + Overhead).
    - Step 2: For each variant, allocate proportional base cost.
    - Step 3: Add variant-specific costs (Ingredients + Labor + Overhead).
    - Step 4: Calculate metrics (Unit Cost, Recommended Price, Profit).
    - Step 5: Return array of results corresponding to variants.
- [x] **Unit Tests for Logic**
  - [x] Test `calculateProportionalCosts` with standard and edge cases (0 batch size).
  - [x] Test `performVariantCalculation` with:
    - [x] 3 variants summing exactly to base batch.
    - [x] Variants summing to less than base batch (partial allocation).
    - [x] **Constraint**: Ensure sum of variant batches never exceeds base batch (validation logic, but test calculation handles inputs safely).

## 4. Variants UI Implementation

_Goal: Seamless UX for switching between Single and Variant modes._

- [x] **Refactor `CalculatorForm` State**
  - [x] Update `useCalculatorState.ts` to handle `hasVariants` toggle.
  - [x] Add actions: `addVariant`, `removeVariant`, `updateVariant`.
  - [x] **Validation**: Add rule `sum(variants.batchSize) <= base.batchSize`.
  - [x] **Validation**: Ensure `base.batchSize` cannot be < 0.
- [x] **Unified Form Layout**
  - [x] Update `CalculatorForm.tsx`:
    - [x] Keep Sections 1 (Product Info), 2 (Ingredients), 3 (Labor/Overhead) as "Base Recipe".
    - [x] **Insert Toggle**: "Has Variants?" checkbox/switch after Ingredients/Overhead.
  - [x] **Conditional Rendering**:
    - [x] **If `!hasVariants`**: Render Pricing Strategy & Current Price (Standard Mode).
    - [x] **If `hasVariants`**:
      - [x] Render "Base Variant (Read Only)" block: Shows Name & Remaining Batch Size.
      - [x] Render "Variants List":
        - [x] `VariantBlock` component for each variant.
        - [x] Fields: Name, Batch Size (max = remaining), Ingredients (dynamic), Labor, Overhead, Pricing Strategy.
      - [x] "Add Variant" button (Disabled if remaining batch size is 0).
- [x] **Update `ResultsDisplay`**
  - [x] Detect if result is Single or Variant array.
  - [x] **Single Mode**: Keep existing display (Recs, Breakdown, Comparison).
  - [x] **Variant Mode**:
    - [x] Create `VariantResultsTable`:
      - Columns: Variant Name, Cost/Unit, Rec. Price, Profit/Unit, Margin %.
      - Highlight "Best Margin" and "Best Profit/Unit".
    - [x] Show "Total Batch Profit" summary.
- [x] **UI Tests**
  - [x] Test toggling "Has Variants" (preserves data where possible).
  - [x] Test adding variants until batch size is full.
  - [x] Test removing a variant restores available batch size.

## 5. Export/Import & Backup

_Goal: Data portability and safety._

- [x] **Export Functionality**
  - [x] Create `src/utils/export.ts`.
  - [x] Implement `generateBackupJSON(presets)`: Returns structured JSON string.
  - [x] Create `ExportButton` component in `AccountPage`.
- [x] **Import Functionality**
  - [x] Create `src/utils/import.ts`.
  - [x] Implement `validateBackupJSON(json)`: Schema check.
  - [x] Implement `ImportButton` component:
    - [x] File picker (.json).
    - [x] Strategy Modal: "Merge" (Keep existing + New) or "Replace" (Wipe + New).
    - [x] Execute import via `presetService`.
- [x] **Account Settings Page**
  - [x] Create `src/pages/AccountPage.tsx`.
  - [x] Sections:
    - Profile (Email, Password Change).
    - Data Management (Export, Import).
    - Danger Zone (Delete All Data).

## 6. Polish & Migration

_Goal: Production-ready quality._

- [x] **Migration Strategy**
  - [x] Create `src/utils/migration.ts`.
  - [x] On Phase 2 first load: Check `localStorage` for Phase 1 presets.
  - [x] If found and user logs in: Prompt to "Migrate to Cloud".
  - [x] Execute upload to Supabase and clear legacy storage keys (or mark as migrated).
- [x] **Design System Consistency**
  - [x] Ensure new components (Auth, Variant Blocks) use `Crimson Text` (headers) and `Inter` (body).
  - [x] Verify Mobile Responsiveness for nested Variant blocks.
  - [x] Apply "Ma" (negative space) principles to the dense Variant UI.
- [x] **Final Verification**
  - [x] Run full test suite: `npm test`.
  - [x] Build check: `npm run build`.
  - [x] Manual QA of full "Variant Flow" from Brief (Base -> 3 Variants -> Calculate -> Save -> Sync).
