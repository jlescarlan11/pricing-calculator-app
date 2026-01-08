# **Phase 3 Kanban: Advanced Analytics & AI Assistant**

## **Task 1: Unified Data Foundation (Phase 3.0) \[BLOCKING: Tasks 3, 4\]**

_Implementation of the relational schema to support versioning and benchmarking._

### **1.1 Database Schema Migration \[CRITICAL PATH\]**

- \[x\] **Migration Strategy**: Create three separate migration files in order:
  - File 1: migrations/20250107120000_extend_presets_versioning.sql (All presets metadata extensions).
  - File 2: migrations/20250107120100_create_competitors_table.sql (Competitors table with CHECK constraint).
  - File 3: migrations/20250107120200_create_analytics_table.sql (Analytics tracking table with referential integrity).
- \[x\] **Rollback Procedure**: Document reversal steps in migrations/README.md (Order: Analytics → Competitors → Presets).
- \[x\] **Presets Table Extension**: Implement metadata fields: snapshot_date (TIMESTAMPTZ), is_tracked_version (BOOLEAN), version_number (INTEGER), parent_preset_id (UUID, self-referencing FK).
- \[x\] **Competitors Table Creation**: Define id, preset_id (FK), competitor_name, competitor_price, notes, created_at, updated_at.
- \[x\] **Analytics Table Creation**: Define schema with ON DELETE CASCADE.
  - Subtask: user_id (FK to auth.users ON DELETE CASCADE).
  - Subtask: preset_id (FK to presets ON DELETE CASCADE).
  - Subtask: Add index on (user_id, clicked_at) and (clicked_at DESC) for optimized threshold queries.

### **1.2 Type Definitions & Service Layer \[REQUIRED BY: Task 3.1, Task 4.1\]**

- \[x\] **Type Updates**: Update src/types/calculator.ts and src/types/index.ts.
  - Subtask: Add SnapshotMetadata and Competitor interfaces.
  - Subtask: **Discriminated Unions**: Add ActivePreset and Snapshot types to prevent creating snapshots of existing snapshots.
- \[x\] **Preset Service Enhancements**: Update src/services/presetService.ts.
  - Subtask: **Pull-Model Snapshotting**: Implement manual createSnapshot(presetId: string). Remove any auto-snapshot logic to maintain intentional tracking.
  - Subtask: **Validation**: Ensure presetId exists and base preset is already saved before creating snapshot.
  - Subtask: Implement createSnapshot logic: Deep clone, set is_tracked_version \= true, link via parent_preset_id, assign new_version \= (max_version ?? 0\) \+ 1\.
  - Subtask: Implement getSnapshots(parentPresetId: string) and getCompetitors(presetId: string).
- \[x\] **Foundation Validation**: Create tests/integration/foundationValidation.test.ts.
  - Subtask: Verify snapshot creation, retrieval via parent_preset_id, and version auto-increment logic.
- \[x\] **Simplified Comparison Logic**: Implement compareTotals utility \[CONSUMED BY: Task 3.1\].
  - Subtask: Create src/utils/presetComparison.ts.
  - Subtask: Implement logic to calculate deltas for totalCost, suggestedPrice, and profitMargin only.

## **Task 2: AI Pricing Assistant (Phase 3.1)**

_Staged deployment starting with a cost-controlled rules-based engine._

### **2.1 Rules-Based MVP (Phase 3.1a)**

- [x] **Logic Engine**: Create src/utils/aiAnalysis.ts.
  - [x] Subtask: Implement calculateRiskScore(margin: number) and generateStaticRecommendations.
- [x] **Analytics Foundation**: Implement usage tracking for metric-based decisions.
  - [x] Subtask: [DEPENDS ON: Task 1.1 analytics table migration].
  - [x] Subtask: Implement trackAnalysisClick(userId, presetId) in src/services/analyticsService.ts.
  - [x] Subtask: **Privacy Compliance**: Add disclosure: "We collect usage data to improve the tool. Data is automatically deleted if the product or account is removed."
- [x] **UI Implementation**: Create src/components/results/AnalyzePriceCard.tsx.
  - [x] Subtask: Build card with "Analyze My Pricing" button.
  - [x] Subtask: **Integration**: Place AnalyzePriceCard in src/components/results/ResultsDisplay.tsx, positioned exactly above CostBreakdown.
- [x] **Simplified LLM Gate**: Replace complex evaluation with a simple threshold check.
  - [x] Subtask: Create src/utils/featureFlags.ts with shouldEnableLLM().
  - [x] Subtask: Logic: Enable if ≥25 unique users clicked "Analyze" in the last 42 days (6 weeks).

### **2.2 LLM Integration (Phase 3.1b) \[CONDITIONAL DEPLOYMENT\]**

**NOTE**: Phase 3.1b execution is **DEFERRED** until engagement targets are met via the simplified feature flag.

- \[ \] **Supabase Edge Function**: Scaffolding for supabase/functions/analyze-pricing.
  - Subtask: Define request payload handler and implement Gemini API call with exponential backoff.
- \[ \] **Frontend Integration & Rate Limiting**:
  - Subtask: Implement rate limit (5/day) using localStorage.
  - Subtask: **Rate Limit Enforcement**: Implement checkRateLimit() helper in AnalyzePriceCard.

## **Task 3: Historical Price Tracker (Phase 3.2) \[DEPENDS ON: Task 1.1, Task 1.2\]**

_Pull-based model for intentional business milestones._

### **3.1 History Management UI \[REQUIRES: getSnapshots(), createSnapshot()\]**

- \[ \] **Price History Section**: Create src/components/calculator/PriceHistory.tsx.
  - Subtask: **Empty State UX**: Show message: "📊 No price milestones tracked yet. Pin a version when you review costs monthly or adjust prices to see trends."
  - Subtask: **Action Button**: Implement "Pin Current Version" button (calls createSnapshot()). Disable if preset is unsaved.
  - Subtask: **Guidance**: Add InfoBanner for users with \< 3 snapshots: "💡 Tip: Pin a new version monthly to track profit trends over time."
  - Subtask: List view of previous snapshots showing snapshot_date and totalCost.
- \[ \] **Simple Delta Card (MVP)**: Create src/components/results/SnapshotComparisonCard.tsx.
  - Subtask: Show totals comparison: Total Cost delta, Suggested Price delta, and Margin % point change.
  - Subtask: **Integration**: Place below the snapshot list in PriceHistory, conditionally rendered when snapshots.length \> 0\.
- [x] **Page Integration**: Add the PriceHistory component to src/pages/CalculatorPage.tsx.
- Subtask: [x] **Conditional Rendering**: Only display PriceHistory when presetId exists.

### **3.2 Trend Visualization**

- \[ \] **PriceTrendChart Component**: Create src/components/results/PriceTrendChart.tsx.
  - Subtask: Integrate recharts Line Chart for totalCost & suggestedPrice over time.
  - Subtask: **Empty State Integration**: Render placeholder chart/message INSIDE the container when snapshots.length \=== 0\.

## **Task 4: Competitive Benchmarker (Phase 3.3) \[DEPENDS ON: Task 1.1, Task 1.2, Task 2.1 UI completion\]**

_Lightweight manual research tool._

### **4.1 Benchmarking Workflow \[REQUIRES: getCompetitors(), upsertCompetitor()\]**

- \[ \] **Competitor Modal**: Create src/components/results/CompetitorModal.tsx.
  - Subtask: Implement modal state management (isOpen, onClose) in ResultsDisplay.tsx.
  - Subtask: Shared Modal with CRUD form for 1-5 competitors.
  - Subtask: **Limit Enforcement**: Disable "Add Competitor" button when competitors.length \=== 5\.
  - Subtask: **Staleness Display**: Show updated_at age and amber warning if \> 30 days old.
- \[ \] **Entry Point**: Update src/components/results/ResultsDisplay.tsx.
  - Subtask: **UI Placement**: Place "Track Competitors" button directly below the price comparison card, before the CostBreakdown.
- \[ \] **Contextual Support**: Update FAQ.tsx with price research tips.
- \[ \] **Positioning Logic**: Update src/utils/calculations.ts.
  - Subtask: Implement calculateMarketPosition with early return { error: 'NEEDS_TWO_COMPETITORS' } if competitors.length \< 2\.

### **4.2 Analytics Display**

- \[ \] **Positioning Spectrum UI**: Add to ResultsDisplay.tsx.
  - Subtask: Create a visual horizontal bar (Budget | Mid | Premium) near the "Track Competitors" button.
- \[ \] **Conditional Rendering**: Show spectrum only if competitors.length \>= 2; else show "Track 2+ competitors" empty state card.

## **Task 5: Testing & Quality Assurance**

- \[ \] **Unit Tests**:
  - Subtask: aiAnalysis.test.ts, presetService.test.ts, and presetComparison.test.ts.
  - Subtask: analyticsService.test.ts to verify tracking logic and timestamp accuracy.
- \[ \] **Integration Tests**:
  - Subtask: HistoryFlow.integration.test.tsx verifying full flow from manual "Pin Version" to UI update.
  - Subtask: CompetitorValidation.test.tsx: Enforce 5-competitor max and handle DB errors.
  - Subtask: **Analytics Integrity**: Add SimpleGateCheck.test.ts case verifying analytics are purged when parent preset is deleted (referential integrity).
- \[ \] **Edge Case Audit**:
  - Subtask: Test AI rate limiting localStorage persistence.
  - Subtask: Test competitor positioning with 0, 1, 2, and 5 competitors.
