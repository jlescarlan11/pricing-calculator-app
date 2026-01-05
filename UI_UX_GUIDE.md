# UI/UX Guide: PriceCraft (Pricing Calculator App)

This document serves as a baseline reference for the current User Interface and User Experience of the PriceCraft application as of January 2026.

---

## 1. Design Philosophy & System

PriceCraft follows a **Japanese-inspired aesthetic**, focusing on simplicity, intentionality, and breathing room.

### Core Principles
- **Ma (Negative Space)**: Minimalist layouts that avoid clutter and reduce cognitive load for users dealing with complex calculations.
- **Kanso (Simplicity)**: Focus on essential elements. Features are added only if they provide clear value.
- **Wabi-sabi (Imperfect Beauty)**: Subtle textures, organic shapes, and a "human" touch to make the financial tool feel less rigid.

### Visual Tokens
- **Typography**: 
    - **Headings**: `Crimson Text` (Serif) – providing an artisanal, established feel.
    - **Body/UI**: `Inter` (Sans-serif) – optimized for readability and data entry.
- **Color Palette**:
    - `bg-main` (#FAFAF9): Off-white background.
    - `surface` (#F8F7F5): Component backgrounds.
    - `clay` (#A67B5B): Primary accent for buttons and highlights.
    - `moss` (#7A8B73): Success states and healthy margins.
    - `rust` (#B85C38): Error states and critical actions.
- **Atmosphere**: A subtle SVG noise filter (2.5% opacity) is overlaid globally to create a paper/linen texture effect.

---

## 2. Global UI Components

### Header
- **Layout**: Sticky top navigation.
- **Logo**: Calculator icon with "PriceCraft" and "Mindful Pricing" tagline.
- **Navigation**: Desktop links for Calculator, How it works, Pricing Tips, and Account/Sign In.
- **Mobile**: Hamburger menu containing all navigation links and version info.

### App Layout
- **Container**: Max-width of `6xl` (1152px), centered with responsive padding.
- **Vertical Rhythm**: Uses a consistent 8px base scale (e.g., `space-y-xl` or `48px` section gaps).
- **Background Texture**: Persistent linen texture toggle in the footer.

---

## 3. Page & Component Audit

### Calculator Page (Main Workflow)
The heart of the application, designed for iterative pricing.

#### 1. Calculator Form (Left/Top)
- **Product Info**: Simple name and batch size input. Batch size acts as the divisor for all cost calculations.
- **Ingredients Section**: 
    - Dynamic list of items (Name, Amount, Cost).
    - "Add Ingredient" button features a dashed ("chopped") border.
    - Automatic calculation of per-unit cost for each line item.
- **Labor & Overhead**:
    - **Labor**: Direct cost input with optional hourly rate helper.
    - **Overhead**: Direct input with an "Overhead Calculator" helper modal that breaks down monthly fixed costs and packaging.
- **Enable Variants Toggle**: Reveals the Variants workflow.
- **Pricing Strategy**: 
    - Toggle between **Markup** (cost-plus) and **Margin** (percentage of price).
    - Real-time "Recommended Price" preview within the strategy card.

#### 2. Variants Workflow (Conditional)
- **Variant Blocks**: When variants are enabled, users add specific blocks for product variations.
- **Resource Allocation**: Variants "take" units from the base batch size.
- **Specific Costs**: Each variant can have its own additional ingredients, labor, and overhead that apply only to that variation.
- **Independent Strategy**: Each variant can have a unique pricing strategy and current selling price.

#### 3. Results Display (Right/Bottom)
- **Hierarchy**: 
    1. **Recommended Selling Price**: Large, prominent display with a color-coded "Margin Health" badge (Healthy, Modest, Tight).
    2. **Cost Analysis**: Categorical breakdown (Ingredients, Labor, Overhead).
    3. **Price Comparison**: (Only if Current Price is entered) Compares recommended vs. current price, highlighting opportunity cost or profit gaps.
    4. **Variant Performance**: (If variants enabled) A table comparing performance across all product versions.
- **Actions**: Floating buttons or top-level actions for "Save Preset", "Share", and "Print".

---

### Saved Products (Presets)
- **Access**: Triggered via a Floating Action Button (FAB) or Header link.
- **Interface**: A modal containing the `PresetsList`.
- **Functionality**:
    - **Search/Filter**: Real-time search by product name.
    - **View Modes**: Toggle between Grid (detailed cards) and List (compact rows).
    - **Actions**: Load into calculator, Edit name, or Delete.

---

### Account & Data Management
- **Profile**: Basic account info display.
- **Data Portability**: 
    - **Export**: Download all recipes/presets as a JSON file.
    - **Import**: Upload JSON files with "Merge" or "Replace" strategies.
- **Danger Zone**: Clearly separated section for account deletion or bulk data wiping, using the `rust` (red) accent.

---

### Help & Educational Pages
- **How It Works**: Long-form educational content explaining the difference between Markup and Margin.
- **Pricing Tips (FAQ)**: Accordion-style interface for common business questions.

---

## 4. Interaction Patterns

### State Feedback
- **Validation**: Inline error messages for negative numbers or missing required fields.
- **Toasts**: Minimalist banners at top-center for success ("✓ Preset saved").
- **Loading**: Subtle spinners for async actions (like fetching cloud presets).
- **Empty States**: Encouraging "A clean slate" messages for new users.

### Modals & Overlays
- **Standardized Widths**: `max-w-md` for small forms, `max-w-2xl` for educational guides.
- **Animations**: Uses `animate-in`, `fade-in`, and `zoom-in-95` for smooth transitions.
- **Scroll Lock**: Body scroll is disabled when modals are active.

### Tooltips
- **Implementation**: Portal-based to avoid clipping in overflow containers.
- **Trigger**: Hover/Focus on `HelpIcon` components.

---

## 5. Responsive Behavior

- **Mobile (< 768px)**: 
    - Single column layout (Form on top, Results below).
    - Sidebar navigation becomes a top-down mobile menu.
    - Reduced internal padding (16px to 24px).
- **Desktop (>= 768px)**: 
    - Two-column layout in the calculator (Form/Results side-by-side or stacked with optimized spacing).
    - Grid views for presets expand to 2-3 columns.
