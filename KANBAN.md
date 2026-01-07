# **Phase 3 Kanban: Advanced Analytics & AI Assistant**

## **Task 1: Unified Data Foundation (Phase 3.0)**

*Implementation of the relational schema to support versioning and benchmarking.*

### **1.1 Database Schema Migration**

* \[ \] **Presets Table Extension**: Create a Supabase migration to add metadata fields.  
  * Subtask: Add snapshot\_date (TIMESTAMPTZ).  
  * Subtask: Add is\_tracked\_version (BOOLEAN, default false).  
  * Subtask: Add version\_number (INTEGER).  
  * Subtask: Add parent\_preset\_id (UUID, self-referencing foreign key to presets.id with ON DELETE CASCADE).  
* \[ \] **Competitors Table Creation**: Create a new table for market benchmarking.  
  * Subtask: Define fields: id, preset\_id (FK), competitor\_name, competitor\_price, notes, created\_at, updated\_at.  
  * Subtask: Implement a PostgreSQL Trigger or Constraint to enforce a maximum of 5 competitors per preset\_id.

### **1.2 Type Definitions & Service Layer**

* \[ \] **Type Updates**: Update src/types/calculator.ts and index.ts.  
  * Subtask: Add SnapshotMetadata and Competitor interfaces.  
  * Subtask: Update Preset type to include optional versioning and competitor fields.  
* \[ \] **Preset Service Enhancements**: Update src/services/presetService.ts.  
  * Subtask: Implement createSnapshot(presetId: string): Deep clones the current preset row, sets is\_tracked\_version to true, and links via parent\_preset\_id.  
  * Subtask: Implement getSnapshots(parentPresetId: string): Fetches all related snapshots ordered by version\_number.  
  * Subtask: Implement getCompetitors(presetId: string) and upsertCompetitor.

## **Task 2: AI Pricing Assistant (Phase 3.1)**

*Staged deployment starting with a rules-based engine.*

### **2.1 Rules-Based MVP (Phase 3.1a)**

* \[ \] **Logic Engine**: Create src/utils/aiAnalysis.ts.  
  * Subtask: Implement calculateRiskScore(margin: number): Returns 0-100 score.  
  * Subtask: Implement generateStaticRecommendations(state: CalculatorState): Returns template tips based on cost ratios.  
* \[ \] **UI Implementation**: Create src/components/results/AnalyzePriceCard.tsx.  
  * Subtask: Build card with "Analyze My Pricing" button using existing Button component.  
  * Subtask: Display riskScore via a circular progress or gauge UI.  
  * Subtask: Render recommendations as a list of Badge and text pairs.

### **2.2 LLM Integration (Phase 3.1b)**

* \[ \] **Supabase Edge Function**: Scaffolding for supabase/functions/analyze-pricing.  
  * Subtask: Define request payload handler following the JSON contract.  
  * Subtask: Implement Gemini API call with exponential backoff (matching project error handling patterns).  
* \[ \] **Frontend Integration**:  
  * Subtask: Add toggle logic to switch from rules-based to API-based analysis.  
  * Subtask: Implement local storage or DB-based usage counter to enforce the 5/day rate limit.  
  * Subtask: Add loading states and "Daily Credits" UI to the AnalyzePriceCard.

## **Task 3: Historical Price Tracker (Phase 3.2)**

*Pull-based model for intentional business milestones.*

### **3.1 History Management UI**

* \[ \] **Price History Section**: Create src/components/calculator/PriceHistory.tsx.  
  * Subtask: Implement "Save Historical Snapshot" button with confirmation toast.  
  * Subtask: Build a list view of previous snapshots showing date and total price.  
* \[ \] **Integration**: Add the PriceHistory component to CalculatorPage.tsx beneath the main form.

### **3.2 Trend Visualization**

* \[ \] **PriceTrendChart Component**: Create src/components/results/PriceTrendChart.tsx.  
  * Subtask: Integrate recharts for a responsive Line Chart.  
  * Subtask: Map snapshot data to X-axis (date) and Y-axis (total cost & suggested price).  
* \[ \] **Empty State Handling**:  
  * Subtask: Design and implement the placeholder view for presets with 0 snapshots.  
  * Subtask: Add "Record your first milestone" call-to-action.

## **Task 4: Competitive Benchmarker (Phase 3.3)**

*Lightweight manual research tool.*

### **4.1 Benchmarking Workflow**

* \[ \] **Competitor Modal**: Create src/components/results/CompetitorModal.tsx.  
  * Subtask: Use the shared Modal component to host a simple CRUD form (Name, Price, Notes).  
  * Subtask: Implement "Updated At" display for staleness detection.  
* \[ \] **Positioning Logic**: Update src/utils/calculations.ts.  
  * Subtask: Implement calculateMarketPosition(userPrice: number, competitors: Competitor\[\]).

### **4.2 Analytics Display**

* \[ \] **Positioning Spectrum UI**: Add to ResultsDisplay.tsx.  
  * Subtask: Create a visual horizontal bar (Budget | Mid | Premium).  
  * Subtask: Render user's position indicator based on the calculated percentile.  
* \[ \] **Contextual Support**:  
  * Subtask: Update FAQ.tsx with research tips.  
  * Subtask: Implement "Data Stale" warning (amber icon) if updated\_at \> 30 days.

## **Task 5: Testing & Quality Assurance**

* \[ \] **Unit Tests**:  
  * Subtask: aiAnalysis.test.ts for risk score logic.  
  * Subtask: presetService.test.ts for versioning/snapshot relationships.  
* \[ \] **Integration Tests**:  
  * Subtask: HistoryFlow.integration.test.tsx verifying snapshot creation updates the Recharts chart.  
* \[ \] **Edge Case Audit**:  
  * Subtask: Verify variant scaling correctly propagates to snapshots.  
  * Subtask: Test rate limit persistence across page refreshes.