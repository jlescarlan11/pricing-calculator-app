# Proposal: The "Position-Aware Intelligence" Loop (Final Revision)

## 1. Objective
To transform the Pricing Calculator App from a collection of isolated tools into a unified, high-integrity business intelligence system. This plan bridges the gap between internal cost data (**Phase 1**), market positioning (**Phase 3.3**), and AI-driven insights (**Phase 3.1**) while ensuring that complex variant overrides and data persistence patterns are handled with strategic precision.

## 2. Proposed Improvement: Unified Intelligence Integration
This proposal creates a cohesive, context-aware workflow where market data informs AI, and AI insights drive the calculation engine through a structured, user-validated "Review State" that protects data integrity and respects variant-specific cost profiles.

### A. Intelligence Enrichment & Technical Reliability (Shared State)
The **AI Pricing Assistant** adjusts its analysis based on data availability and freshness to maintain user trust.
- **Conditional & Freshness-Aware Prompting**: 
    - **Market-Aware State**: If $\ge 2$ competitors exist, the prompt injects **Market Position Results**. Competitor data is only injected if it is not stale (within 30 days). If stale data must be used, the AI is instructed to include a "Data Age Warning" in its recommendations.
    - **Cost-Only State**: If $< 2$ competitors exist, the prompt focuses exclusively on internal cost-efficiency.
- **Structured Technical Contract**: 
    - The Supabase Edge Function returns a structured JSON field: `suggestedMarginValue` (a numeric value) for accurate delta calculations.
- **UI Feedback**: 
    - Missing market data triggers a **"Partial Analysis"** badge.
    - The Delta Summary displays a **"Market Data Age"** indicator (e.g., *"Based on market data from 12 days ago"*) to provide essential context.

### B. The "Review Bridge": Targeting & Experimental Control (UX Alignment)
The "Apply Strategy" interaction is refined to handle multi-variant complexities and prevent "Experimental Sync Risk."

#### 1. Variant-Aware Delta Recalculation
To prevent the "AI Insight Blindness" to variant overrides, the bridge logic enforces strict cost-profile matching:
- **Variant-Specific Logic**: If a "Specific Variant" is selected as the target, the Delta Summary **must not** use the Base product's cost as the reference. The engine explicitly triggers a re-calculation using that specific variant's total cost (**Base Allocation + Specific Overrides**).
- **Contextual UI Labels**: The Delta Summary will display a **"Variant Context"** label (e.g., *"Applying to 'Premium Gift Box' (Higher labor cost detected)"*) to ensure the user understands the price change is tailored to that variant's unique profile.

#### 2. "Soft-Apply" State & Differentiated Persistence
To resolve the risk of auto-saving unverified AI experiments while protecting high-value manual work:
- **De-coupled Persistence Logic**: Clicking "Apply Strategy" triggers a **"Soft-Apply" state**. This state blocks the **Cloud Sync/Database Update** for the preset but **does not block manual field persistence**.
- **Local Draft Integrity**: Manual edits to input fields (e.g., correcting an ingredient cost or updating a name) must continue to trigger the `sessionStorage` auto-save (`saveToDraft`). This ensures manual work is never lost to a crash or refresh during an AI experiment.
- **Volatile AI Values**: Only the `recommendedPrice` and `pricingStrategy` values derived from the AI are held in the volatile "Preview" memory.
- **Commitment Logic**: Changes are only persisted to the cloud/database once the user explicitly clicks **"Confirm & Save"** or **"Pin Milestone"**.
- **Visual Warning Cue**: While in this experimental state, the **Sticky Summary** uses a subtle **Sakura (warning) border** and a **"Preview Mode" badge**.

#### 3. Grouped Impact & Granularity (Kanso with Precision)
To balance simplicity with the need for commercial transparency:
- **Simplified View**: If $> 3$ variants are affected, the Delta Summary shows the average price change and highlights the "Most Impacted Variant."
- **Editable Impact Grid**: Supplement the summary with a **"View All Impacts"** toggle that expands into a functional editor.
    - **Psychological Rounding**: The `New Recommended Price` column is directly editable. This allows users to perform "Psychological Rounding" (e.g., nudging PHP 51.20 to PHP 49.00) for specific variants within the bridge.
    - **Granular Transparency**: Displays `Current Price` vs. `New Recommended Price` and specific `% change` for every variant, ensuring the menu is retail-ready before commitment.
- **Manual Tweak**: Users can manually adjust the suggested value (e.g., *"AI suggests 25%. [ - | 25 | + ] %"*).
- **Explicit Discard Context**: The Sticky Summary features a **"Discard AI Preview"** action. This specifically clears only the volatile AI-suggested values (prices/strategies) while explicitly preserving the `sessionStorage` draft of manual ingredient or labor updates.
- **Feedback**: A toast notification confirms: *"AI pricing discarded. Your manual cost updates were kept."*

---

## 3. Rationale & User Value

### Why this works:
1. **Financial Accuracy**: By recalculating based on variant-specific overrides rather than just the Base product, the app prevents unintentional losses on complex variants.
2. **Data Integrity**: Differentiated persistence ensures that manual corrections are saved immediately while "what-if" AI scenarios remain safely experimental.
3. **Strategic Control**: The **Editable Impact Grid** prevents users from committing to changes that might make specific high-volume variants uncompetitive, allowing for instant fine-tuning.

---

## 4. Leveraging Existing Features

| Existing Feature | Role in the Unified Loop |
| :--- | :--- |
| **Advanced Variant Engine (3.1)** | Provides the target structure for variant-aware cost recalculations. |
| **AI Pricing Assistant (4.1)** | Orchestrates advice via the updated structured JSON contract. |
| **Competitor Modal (4.3)** | Provides the timestamps required for "Freshness-Aware" prompting. |
| **Sticky Summary (2.2)** | Hosts the "Soft-Apply" visual cues and the **"Discard AI Preview"** action. |
| **Historical Price Tracker (4.2)** | Records these validated shifts as "Milestones" for trend analysis. |

## 5. Summary of Impact
This improvement creates a **Targeted and Safe Intelligence Flow**:
**Enter Costs** → **Benchmark Market** → **AI Returns Advice** → **User Selects Target** → **Recalculate (Variant-Aware)** → **Review Grouped Delta (Soft-Apply/Preview)** → **Edit (Psychological Rounding in Grid)** → **Confirm/Commit** → **Auto-Sync & Pin Milestone**.