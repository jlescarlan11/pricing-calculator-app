# Kanban: Phase 2 Implementation

This Kanban board tracks the implementation of Phase 2 features: Cloud Sync, Export/Import, and Product Variants.

**Current Date:** 2026-01-05
**Reference:** `FLOW.md`, `phase2_project_brief.md`

## 1. Infrastructure & Authentication
*Goal: Secure user identity and database connection.*

- [ ] **Setup Supabase Client**
    - [ ] Create `src/lib/supabase.ts` to initialize the Supabase client.
    - [ ] Define environment variables `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
    - [ ] Create a utility to check connection status.
- [ ] **Implement Auth Context**
    - [ ] Create `src/context/AuthContext.tsx` to wrap the app.
    - [ ] Implement `AuthProvider` to expose `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`.
    - [ ] **Constraint**: Restrict `signIn`/`signUp` to Email + Password ONLY (No OAuth, Magic Links, or MFA).
    - [ ] Handle session persistence and auto-refresh using Supabase defaults.
- [ ] **Create Auth UI Screens**
    - [ ] Create `src/pages/AuthPage.tsx` (Login/Signup toggle).
    - [ ] Implement `SignUpForm` component (Email, Password, Confirm Password).
    - [ ] Implement `LoginForm` component (Email, Password).
    - [ ] Add explicit error handling for auth failures (e.g., "User already exists", "Invalid password").
    - [ ] Add "Forgot Password" flow (Trigger password reset email).
- [ ] **Route Protection**
    - [ ] Create `src/components/auth/ProtectedRoute.tsx`.
    - [ ] Update `App.tsx` to protect `/account` and optionally sync routes.
    - [ ] Ensure public routes (`/`, `/help`, `/faq`) remain accessible without auth.

## 2. Data Layer & Sync
*Goal: Persistent storage with offline-first capabilities.*

- [ ] **Define Database Schema (Supabase)**
    - [ ] Create `users` table (managed by Supabase Auth, but verify public profile needs if any).
    - [ ] Create `presets` table:
        - `id` (UUID, PK)
        - `user_id` (UUID, FK)
        - `name` (Text)
        - `preset_type` (Text: 'single' | 'variants')
        - `base_recipe` (JSONB: Batch, Ingredients, Labor, Overhead)
        - `variants` (JSONB: Array of variant objects)
        - `pricing_config` (JSONB: Strategy, Value - for single mode)
        - `updated_at`, `created_at`, `last_synced_at` (Timestamps)
    - [ ] Enable Row Level Security (RLS) to ensure users only see their own presets.
- [ ] **Implement Sync Service**
    - [ ] Create `src/services/presetService.ts`.
    - [ ] Implement `fetchPresets`: Merge Cloud + Local Storage (Last-write-wins based on `updated_at`).
    - [ ] Implement `savePreset`: Save to Local Storage -> Try Cloud Sync.
    - [ ] Implement `deletePreset`: Delete Local -> Delete Cloud.
    - [ ] **Constraint**: If offline, queue operation in Local Storage and retry on `online` event.
- [ ] **Update `usePresets` Hook**
    - [ ] Refactor `src/hooks/use-presets.ts` to use `AuthContext` and `presetService`.
    - [ ] Add `syncStatus` state ('synced' | 'syncing' | 'offline' | 'error').
    - [ ] Ensure optimistic UI updates (UI updates immediately, sync happens in background).
    - [ ] Test sync scenarios: Online, Offline, Offline->Online.

## 3. Variants Engine (Core Logic)
*Goal: Unified calculation logic for Single and Variant modes.*

- [ ] **Update Data Models**
    - [ ] Modify `src/types/calculator.ts`:
        - [ ] Add `Variant` interface:
            - `id`, `name`, `batchSize`
            - `ingredients`: `Ingredient[]` (Additional)
            - `laborCost`: number (Additional)
            - `overhead`: number (Additional)
            - `pricing`: `PricingConfig` (Specific to variant)
            - `currentSellingPrice`: number (Optional)
        - [ ] Update `CalculationInput` to include `hasVariants: boolean` and `variants: Variant[]`.
- [ ] **Implement Allocation Logic**
    - [ ] Create `src/utils/variantCalculations.ts`.
    - [ ] Implement `calculateProportionalCosts(baseTotal, baseBatchSize, variantBatchSize)`:
        - Formula: `(BaseTotal / BaseBatchSize) * VariantBatchSize`.
    - [ ] Implement `performVariantCalculation`:
        - Step 1: Calculate Total Base Costs (Shared Ingredients + Labor + Overhead).
        - Step 2: For each variant, allocate proportional base cost.
        - Step 3: Add variant-specific costs (Ingredients + Labor + Overhead).
        - Step 4: Calculate metrics (Unit Cost, Recommended Price, Profit).
        - Step 5: Return array of results corresponding to variants.
- [ ] **Unit Tests for Logic**
    - [ ] Test `calculateProportionalCosts` with standard and edge cases (0 batch size).
    - [ ] Test `performVariantCalculation` with:
        - [ ] 3 variants summing exactly to base batch.
        - [ ] Variants summing to less than base batch (partial allocation).
        - [ ] **Constraint**: Ensure sum of variant batches never exceeds base batch (validation logic, but test calculation handles inputs safely).

## 4. Variants UI Implementation
*Goal: Seamless UX for switching between Single and Variant modes.*

- [ ] **Refactor `CalculatorForm` State**
    - [ ] Update `useCalculatorState.ts` to handle `hasVariants` toggle.
    - [ ] Add actions: `addVariant`, `removeVariant`, `updateVariant`.
    - [ ] **Validation**: Add rule `sum(variants.batchSize) <= base.batchSize`.
    - [ ] **Validation**: Ensure `base.batchSize` cannot be < 0.
- [ ] **Unified Form Layout**
    - [ ] Update `CalculatorForm.tsx`:
        - [ ] Keep Sections 1 (Product Info), 2 (Ingredients), 3 (Labor/Overhead) as "Base Recipe".
        - [ ] **Insert Toggle**: "Has Variants?" checkbox/switch after Ingredients/Overhead.
    - [ ] **Conditional Rendering**:
        - [ ] **If `!hasVariants`**: Render Pricing Strategy & Current Price (Standard Mode).
        - [ ] **If `hasVariants`**:
            - [ ] Render "Base Variant (Read Only)" block: Shows Name & Remaining Batch Size.
            - [ ] Render "Variants List":
                - [ ] `VariantBlock` component for each variant.
                - [ ] Fields: Name, Batch Size (max = remaining), Ingredients (dynamic), Labor, Overhead, Pricing Strategy.
            - [ ] "Add Variant" button (Disabled if remaining batch size is 0).
- [ ] **Update `ResultsDisplay`**
    - [ ] Detect if result is Single or Variant array.
    - [ ] **Single Mode**: Keep existing display (Recs, Breakdown, Comparison).
    - [ ] **Variant Mode**:
        - [ ] Create `VariantResultsTable`:
            - Columns: Variant Name, Cost/Unit, Rec. Price, Profit/Unit, Margin %.
            - Highlight "Best Margin" and "Best Profit/Unit".
        - [ ] Show "Total Batch Profit" summary.
- [ ] **UI Tests**
    - [ ] Test toggling "Has Variants" (preserves data where possible).
    - [ ] Test adding variants until batch size is full.
    - [ ] Test removing a variant restores available batch size.

## 5. Export/Import & Backup
*Goal: Data portability and safety.*

- [ ] **Export Functionality**
    - [ ] Create `src/utils/export.ts`.
    - [ ] Implement `generateBackupJSON(presets)`: Returns structured JSON string.
    - [ ] Create `ExportButton` component in `AccountPage`.
- [ ] **Import Functionality**
    - [ ] Create `src/utils/import.ts`.
    - [ ] Implement `validateBackupJSON(json)`: Schema check.
    - [ ] Implement `ImportButton` component:
        - [ ] File picker (.json).
        - [ ] Strategy Modal: "Merge" (Keep existing + New) or "Replace" (Wipe + New).
        - [ ] Execute import via `presetService`.
- [ ] **Account Settings Page**
    - [ ] Create `src/pages/AccountPage.tsx`.
    - [ ] Sections:
        - Profile (Email, Password Change).
        - Data Management (Export, Import).
        - Danger Zone (Delete All Data).

## 6. Polish & Migration
*Goal: Production-ready quality.*

- [ ] **Migration Strategy**
    - [ ] Create `src/utils/migration.ts`.
    - [ ] On Phase 2 first load: Check `localStorage` for Phase 1 presets.
    - [ ] If found and user logs in: Prompt to "Migrate to Cloud".
    - [ ] Execute upload to Supabase and clear legacy storage keys (or mark as migrated).
- [ ] **Design System Consistency**
    - [ ] Ensure new components (Auth, Variant Blocks) use `Crimson Text` (headers) and `Inter` (body).
    - [ ] Verify Mobile Responsiveness for nested Variant blocks.
    - [ ] Apply "Ma" (negative space) principles to the dense Variant UI.
- [ ] **Final Verification**
    - [ ] Run full test suite: `npm test`.
    - [ ] Build check: `npm run build`.
    - [ ] Manual QA of full "Variant Flow" from Brief (Base -> 3 Variants -> Calculate -> Save -> Sync).
