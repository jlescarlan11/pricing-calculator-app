# Kanban: Unified Intelligence Integration

## Todo

### Grouped Impact & Granular Editing (Kanso with Precision)
- **Impact Summary Views**
  - [ ] Implement a simplified summary view for scenarios where > 3 variants are affected, highlighting the average price change and "Most Impacted Variant."
- **Editable Impact Grid**
  - [ ] Create a "View All Impacts" toggle that expands into a functional grid editor.
  - [ ] Make the `New Recommended Price` column directly editable in the grid to allow for "Psychological Rounding" (e.g., nudging PHP 51.20 to PHP 49.00).
  - [ ] Display `Current Price`, `New Recommended Price`, and `% change` for every variant within the expanded grid for commercial transparency.
- **Manual Suggestion Tweaks**
  - [ ] Add manual adjustment controls ([ - | 25 | + ] %) for the AI-suggested margin percentage (e.g., "AI suggests 25%").
- **Discard Interaction Workflow**
  - [ ] Add a "Discard AI Preview" action to the Sticky Summary.
  - [ ] Implement logic to clear volatile AI-suggested values while explicitly preserving `sessionStorage` manual updates.
  - [ ] Add a confirmation toast notification: "AI pricing discarded. Your manual cost updates were kept."

## In Progress

## Done

### Phase 3.3: Soft-Apply & Persistence Logic (Completed 2026-01-09)
- **"Soft-Apply" State & Persistence Control**
  - [x] Implement a "Soft-Apply" state triggered by the "Apply Strategy" interaction.
  - [x] Block Cloud Sync and Database Updates for presets while the "Soft-Apply" state is active.
  - [x] Ensure manual input field edits continue to trigger `sessionStorage` auto-save.
  - [x] Map AI-derived `recommendedPrice` and `pricingStrategy` to volatile "Preview" memory.
  - [x] Add explicit "Confirm" and "Discard" buttons to the Sticky Summary and Results Display.
  - [x] Implement logic to trigger permanent cloud/database persistence and milestone recording upon commitment.
  - [x] Apply a Sakura (warning) border and "Preview Mode" badge to the Sticky Summary when in Preview Mode.