# Project Brief: Pricing Calculator Phase 2

**Cloud Sync & Product Variants - User-Validated MVP**

## 1. Phase 2 Overview

Build the THREE features users ranked as their top pain points: (1) permanent data storage that doesn't get lost, (2) access from any device, and (3) ability to price multiple product variants from shared ingredients. Phase 2 transforms the calculator from a single-session tool into a reliable multi-device business application.

**User Validation:** Surveyed Phase 1 active users asking them to rank pain points. Top 3 results:

1. **#1 Priority (78% rated as "critical"):** Losing data when browser clears
2. **#2 Priority (71% rated as "critical"):** Can't access from multiple devices
3. **#3 Priority (64% rated as "critical"):** Can't price product variants/flavors

**Phase 2 Commitment:** Ship ONLY these three features. Everything else deferred to Phase 3+.

## 2. What We're Solving (With Real User Quotes)

### Problem #1 & #2: Data Loss + Cross-Device Access

**User Quote (Maria, Baker):**

> "I spent 20 minutes entering all my recipes, then cleared my browser cache the next day. Everything gone. I almost cried. I need this to STAY SAVED and work on my phone when I'm shopping and my laptop when I'm at home."

**Current State:**

- Session-only storage means data disappears on browser refresh
- Desktop presets and mobile presets are completely separate
- No way to access work across devices
- Users can't trust the app with critical business data

**What Success Looks Like:**

- User saves a preset on laptop Monday morning
- Opens app on phone Tuesday at the market, preset is there
- Updates ingredient cost on phone
- Returns to laptop Wednesday, sees the update
- Data never disappears unless user explicitly deletes it

---

### Problem #3: Product Variants from Shared Base

**User Quote (Juan, Hot Sauce Maker):**

> "I make one big batch of hot sauce base - 200 bottles. Then I split it: 100 bottles mild (₱80), 75 bottles spicy with extra peppers (₱100), and 25 bottles extra hot with premium chilies (₱150). Right now I have to make THREE separate calculations and manually divide the base costs. It's confusing and I make mistakes."

**Current State:**

- One preset = one product with one price
- Users with variants create multiple presets and manually split shared costs
- Error-prone, time-consuming, confusing
- Can't see which variant is most profitable at a glance

**Real Use Cases:**

1. **Recipe variations** - Same base, different add-ins (plain cookies, chocolate chip, double chocolate)
2. **Size variations** - Same recipe, different portions (small/medium/large cupcakes)
3. **Flavor variations** - Base + different flavorings (vanilla, ube, chocolate bread)
4. **Quality tiers** - Base + premium ingredients (regular vs premium hot sauce)

**What Success Looks Like:**

- User creates "Pandesal Base Recipe" with shared costs (flour, yeast, labor, overhead)
- Adds 3 variants: Plain (60 units), With Cheese (+₱180, 30 units), Premium (+₱300, 10 units)
- App automatically allocates base costs across variants
- Shows individual pricing and profit for each variant
- Clear profitability comparison across all variants

## 3. Phase 2 Feature Specifications

### Feature 1: Cloud-Based Data Storage & Sync

**Core Functionality:**

- Backend database stores all user presets permanently
- Real-time sync across all devices and browsers
- Offline-first: works without internet, syncs when connected
- localStorage as local cache for speed

**User Account System:**

- Simple email + password authentication
- Optional social login (Google) for convenience
- "Sign Up" and "Login" flow
- Password reset via email
- Account settings page

**Data Architecture:**

```
User Account
├── Email (unique identifier)
├── Password (hashed)
├── Created date
└── Presets (array)
    └── Preset Object
        ├── id (UUID)
        ├── name ("Ube Pandesal - Standard")
        ├── createdAt (timestamp)
        ├── updatedAt (timestamp)
        ├── lastSyncedAt (timestamp)
        ├── baseRecipe (object)
        │   ├── batchSize
        │   ├── ingredients[]
        │   ├── laborCost
        │   └── overheadCost
        └── variants[] (see Feature 3)
```

**Sync Behavior:**

- **On save:** Immediately save to local storage + sync to cloud in background
- **On load:** Check cloud for updates, merge with local if needed
- **On conflict:** Most recent update wins (show timestamp to user)
- **On offline:** Queue changes, sync when connection restored
- **Sync indicator:** Show "Synced" / "Syncing..." / "Offline" status

**Technical Implementation:**

- **Backend:** Supabase or Firebase (managed backend, handles auth + database)
- **Database:** PostgreSQL (Supabase) or Firestore (Firebase)
- **Authentication:** Built-in auth system from chosen platform
- **API:** REST or real-time subscriptions
- **Cost:** Free tier supports 50,000 users (Supabase) or 100K users (Firebase)

**Security:**

- Row-level security: users can only access their own presets
- HTTPS for all connections
- Password hashing (bcrypt/scrypt)
- Session management with secure tokens

**User Experience:**

**First-time user:**

1. Opens app, sees "Sign up to save your work forever"
2. Enters email + password (or "Continue with Google")
3. Immediately starts working, data auto-saves

**Returning user on new device:**

1. Opens app on new phone
2. Logs in with email + password
3. All presets load automatically
4. "Welcome back! 12 presets synced"

**Offline user:**

1. Opens app without internet
2. Sees "Offline - changes will sync when connected"
3. Can still view/edit/calculate
4. Changes queued for sync
5. When online: "Syncing 3 changes..." → "All synced ✓"

**Migration from Phase 1:**

- Detect if user has Phase 1 session data on first Phase 2 visit
- Prompt: "We found 5 presets from old version. Create account to save them?"
- One-click migration to new account

---

### Feature 2: Export/Import & Backup System

**Purpose:** Safety net for users who want offline backups or to switch platforms

**Export Functionality:**

- "Export All Data" button in account settings
- Downloads `pricing-calculator-backup-[date].json`
- Includes all presets with full detail
- Human-readable JSON format

**Import Functionality:**

- "Import Data" button accepts JSON file
- Validates structure before importing
- Options on import:
  - [ ] Merge with existing data (keep both)
  - [ ] Replace all data (delete existing, import new)
- Shows preview before confirming

**Auto-Backup (Nice-to-Have):**

- Weekly email with backup file attached
- User can enable/disable in settings
- "Your weekly backup is ready" notification

**Use Cases:**

- **Backup before major changes:** User about to delete many presets, exports first
- **Platform migration:** User wants to move to different tool, exports data
- **Data audit:** User wants to see all their data in one place
- **Sharing with partner:** User exports specific presets to share with business partner

---

### Feature 3: Product Variants System

**Core Concept:** One "base recipe" produces multiple "variants" with shared and unique costs

**Data Model:**

```
Preset with Variants
├── Base Recipe
│   ├── name: "Pandesal Base"
│   ├── totalBatchSize: 100 units
│   ├── sharedIngredients[]
│   │   ├── Flour (2kg, ₱150)
│   │   ├── Yeast (100g, ₱30)
│   │   └── Sugar (1kg, ₱60)
│   ├── sharedLaborCost: ₱400
│   └── sharedOverheadCost: ₱200
│
└── Variants[]
    ├── Variant 1: Plain
    │   ├── quantity: 60 units
    │   ├── additionalIngredients: [] (none)
    │   ├── additionalLabor: ₱0
    │   ├── pricingStrategy: "markup"
    │   ├── pricingValue: 40%
    │   └── calculatedPrice: ₱__
    │
    ├── Variant 2: With Cheese
    │   ├── quantity: 30 units
    │   ├── additionalIngredients[]
    │   │   └── Cheese (500g, ₱180)
    │   ├── additionalLabor: ₱50 (extra time)
    │   ├── pricingStrategy: "markup"
    │   ├── pricingValue: 50%
    │   └── calculatedPrice: ₱__
    │
    └── Variant 3: Premium Ube Halaya
        ├── quantity: 10 units
        ├── additionalIngredients[]
        │   └── Ube Halaya (300g, ₱150)
        ├── additionalLabor: ₱100 (hand-filling)
        ├── pricingStrategy: "markup"
        ├── pricingValue: 60%
        └── calculatedPrice: ₱__
```

**Cost Allocation Logic:**

**Step 1: Calculate Total Base Cost**

```
Shared Ingredients: ₱240 (flour + yeast + sugar)
Shared Labor: ₱400
Shared Overhead: ₱200
────────────────────
Total Base Cost: ₱840
```

**Step 2: Allocate Base Cost to Each Variant (Proportional by Quantity)**

```
Total Units: 100 (60 plain + 30 cheese + 10 premium)

Plain (60 units):
  Base cost share = ₱840 × (60/100) = ₱504
  Cost per unit = ₱504 / 60 = ₱8.40

Cheese (30 units):
  Base cost share = ₱840 × (30/100) = ₱252
  Cost per unit = ₱252 / 30 = ₱8.40

Premium (10 units):
  Base cost share = ₱840 × (10/100) = ₱84
  Cost per unit = ₱84 / 10 = ₱8.40
```

**Step 3: Add Variant-Specific Costs**

```
Plain:
  Base: ₱8.40/unit
  Additional: ₱0
  ────────────
  Total cost: ₱8.40/unit

Cheese:
  Base: ₱8.40/unit
  Additional: ₱180 cheese ÷ 30 = ₱6.00
  Additional: ₱50 labor ÷ 30 = ₱1.67
  ────────────
  Total cost: ₱16.07/unit

Premium:
  Base: ₱8.40/unit
  Additional: ₱150 halaya ÷ 10 = ₱15.00
  Additional: ₱100 labor ÷ 10 = ₱10.00
  ────────────
  Total cost: ₱33.40/unit
```

**Step 4: Calculate Selling Price Based on Strategy**

```
Plain (40% markup):
  Cost: ₱8.40
  Price: ₱8.40 × 1.40 = ₱11.76
  Profit: ₱3.36/unit

Cheese (50% markup):
  Cost: ₱16.07
  Price: ₱16.07 × 1.50 = ₱24.11
  Profit: ₱8.04/unit

Premium (60% markup):
  Cost: ₱33.40
  Price: ₱33.40 × 1.60 = ₱53.44
  Profit: ₱20.04/unit
```

**User Interface:**

**Creating Variants:**

```
┌─────────────────────────────────────────┐
│ Preset Type:                            │
│ ○ Single Product (like Phase 1)        │
│ ● Multiple Variants from shared base   │
└─────────────────────────────────────────┘

─── BASE RECIPE ───
Product Name: Pandesal Base
Total Batch Size: 100 units

Shared Ingredients:
  [+] Flour - 2kg - ₱150
  [+] Yeast - 100g - ₱30
  [Add Ingredient]

Shared Labor: ₱400
Shared Overhead: ₱200

─── VARIANTS ───

Variant 1: Plain Pandesal
  Quantity: 60 units (60% of batch)

  Additional Ingredients: None
  [Add Ingredient]

  Additional Labor: ₱0

  Pricing: [Markup ▼] 40%

  [Calculate] → Shows: Cost ₱8.40, Price ₱11.76

─────

Variant 2: Cheese Pandesal
  Quantity: 30 units (30% of batch)

  Additional Ingredients:
    [+] Cheese - 500g - ₱180
  [Add Ingredient]

  Additional Labor: ₱50

  Pricing: [Markup ▼] 50%

  [Calculate] → Shows: Cost ₱16.07, Price ₱24.11

[+ Add Another Variant]
```

**Variants Comparison View:**

```
┌──────────────────────────────────────────────────┐
│ Pandesal Base - 100 units total                 │
│ Base Cost: ₱840 (allocated proportionally)      │
├──────────────────────────────────────────────────┤
│ Variant      Qty  Cost/Unit  Price  Profit  ROI │
├──────────────────────────────────────────────────┤
│ Plain         60    ₱8.40  ₱11.76  ₱3.36   40%  │
│ Cheese        30   ₱16.07  ₱24.11  ₱8.04   50%  │
│ Premium       10   ₱33.40  ₱53.44 ₱20.04   60%  │
├──────────────────────────────────────────────────┤
│ Total Profit per Batch:                  ₱643.80│
└──────────────────────────────────────────────────┘

💡 Insight: Premium variant has highest profit per unit
   but Plain variant contributes most to total profit
```

**Key UX Decisions:**

**1. Quantity Validation:**

- Sum of variant quantities must equal base batch size
- Show running total: "70 of 100 units allocated"
- Warning if doesn't add up: "You have 10 units unallocated"

**2. Cost Allocation Method:**

- Default: Proportional by quantity (simplest, most common)
- Advanced (Phase 3): Custom allocation weights

**3. Pricing Flexibility:**

- Each variant can have own pricing strategy
- Each variant can have own markup/margin percentage
- Encourages appropriate pricing (premium products = higher margins)

**4. Backwards Compatibility:**

- Single-product presets from Phase 1 still work
- New "Preset Type" selection on create
- Can convert single → variants or variants → single

**Edge Cases to Handle:**

**Case 1: Uneven Split**

- Base batch: 100 units
- Variants: 55 + 35 + 12 = 102 units (over by 2)
- Solution: Show error "Total exceeds batch size by 2 units"

**Case 2: Decimal Quantities**

- User enters 33.33 units
- Solution: Allow decimals, round in calculations

**Case 3: Zero Quantity Variant**

- User sets variant to 0 units
- Solution: Auto-hide from calculations, show in list as "inactive"

**Case 4: Very Complex Recipes**

- 10+ variants in one base
- Solution: Scrollable list, collapsible sections, summary view

**Case 5: Shared vs Unshared Labor**

- Making dough: shared labor
- Filling pastries: variant-specific labor
- Solution: Clear labels "Shared Labor" vs "Additional Labor per Variant"

## 4. What's Explicitly NOT in Phase 2

**Deferred to Phase 3:**

- Batch scaling (different batch sizes)
- Tax calculator
- PDF export
- Cost history tracking
- Supplier comparison
- Recipe scaling
- Multi-currency
- Ingredient database
- Barcode scanning
- Inventory management

**Why Defer:** Users ranked these as lower priority. Ship the top 3 pain points first, validate adoption, then add more features.

## 5. Technical Architecture

### Stack Selection

**Backend: Supabase** (Recommended)

- Free tier: 500MB database, 50K monthly active users
- Built-in authentication (email, social logins)
- PostgreSQL database (reliable, scalable)
- Row-level security (data isolation)
- Real-time subscriptions (optional)
- Generous free tier for MVP phase

**Frontend: React** (Existing)

- Continue with Phase 1 React app
- Add authentication UI components
- Add variants UI components
- Keep existing calculation engine

**Storage Strategy:**

- **Primary:** Supabase PostgreSQL database (cloud)
- **Cache:** localStorage (offline access, speed)
- **Sync:** On save, on load, on connection restore
- **Conflict resolution:** Last-write-wins with timestamp

### Database Schema

**users table:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

**presets table:**

```sql
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  preset_type TEXT DEFAULT 'single', -- 'single' or 'variants'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP DEFAULT NOW(),

  -- Base recipe (always present)
  batch_size INTEGER NOT NULL,
  ingredients JSONB NOT NULL, -- [{name, amount, cost}]
  labor_cost NUMERIC(10,2) NOT NULL,
  overhead_cost NUMERIC(10,2) NOT NULL,

  -- Single product fields (null if variants)
  pricing_strategy TEXT, -- 'markup' or 'margin'
  pricing_value NUMERIC(5,2), -- percentage
  current_selling_price NUMERIC(10,2),

  -- Variants (empty array if single product)
  variants JSONB DEFAULT '[]', -- [{name, quantity, additionalIngredients, additionalLabor, pricingStrategy, pricingValue}]

  CONSTRAINT presets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Row-level security
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own presets"
  ON presets FOR ALL
  USING (auth.uid() = user_id);
```

### API Endpoints (Supabase Auto-Generated)

**Authentication:**

- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/reset-password` - Password reset

**Presets:**

- `GET /presets` - List all user's presets
- `GET /presets/:id` - Get single preset
- `POST /presets` - Create new preset
- `PATCH /presets/:id` - Update preset
- `DELETE /presets/:id` - Delete preset

### Sync Logic

**On App Load:**

```javascript
async function initializeApp() {
  // Check if user is logged in
  const session = await supabase.auth.getSession();

  if (session) {
    // Load presets from cloud
    const { data: cloudPresets } = await supabase
      .from('presets')
      .select('*')
      .order('updated_at', { ascending: false });

    // Load local cache
    const localPresets = loadFromLocalStorage();

    // Merge (cloud is source of truth)
    const mergedPresets = mergePresets(cloudPresets, localPresets);

    // Update local cache
    saveToLocalStorage(mergedPresets);

    // Render UI
    renderPresets(mergedPresets);
  } else {
    // Show login screen
    renderLoginScreen();
  }
}
```

**On Save Preset:**

```javascript
async function savePreset(preset) {
  // Save locally first (instant feedback)
  saveToLocalStorage(preset);
  updateUI(preset);

  // Show "Saving..." indicator
  showSyncStatus('saving');

  try {
    // Sync to cloud
    const { data, error } = await supabase.from('presets').upsert({
      ...preset,
      updated_at: new Date(),
      last_synced_at: new Date(),
    });

    if (error) throw error;

    // Show "Synced ✓"
    showSyncStatus('synced');
  } catch (error) {
    // Show "Offline - will sync later"
    showSyncStatus('offline');
    queueForLaterSync(preset);
  }
}
```

**On Connection Restore:**

```javascript
window.addEventListener('online', async () => {
  const queuedChanges = getQueuedChanges();

  if (queuedChanges.length > 0) {
    showSyncStatus('syncing');

    for (const change of queuedChanges) {
      await syncToCloud(change);
    }

    clearQueue();
    showSyncStatus('synced');
  }
});
```

## 6. User Flows

### Flow 1: First-Time User Signs Up

1. Opens app at pricing-calculator.app
2. Sees landing page: "Save your pricing forever. Access from any device."
3. Clicks "Get Started Free"
4. **Sign Up Screen:**
   - Email: maria@example.com
   - Password: ••••••••
   - [Sign Up] or [Continue with Google]
5. Creates account
6. Immediately sees empty presets list
7. Clicks "Create First Preset"
8. Chooses "Multiple Variants" (tooltip explains)
9. Enters base recipe + 3 variants
10. Clicks Save
11. Sees "Saved & Synced ✓" confirmation

### Flow 2: Existing User Logs In on New Device

1. Opens app on phone (previously used on laptop)
2. Sees login screen
3. Enters email + password
4. Logs in
5. Sees "Loading your presets..." (1-2 seconds)
6. All 8 presets from laptop appear
7. "Welcome back! 8 presets synced from cloud"
8. Opens a preset, sees full details
9. Updates one ingredient cost
10. Saves (auto-syncs to cloud)
11. Later opens laptop, sees the update

### Flow 3: User Creates Multi-Variant Recipe

1. Logs in, clicks "New Preset"
2. **Preset Type Selection:**
   - ○ Single Product
   - ● Multiple Variants (selected)
3. **Base Recipe Section:**
   - Name: "Ube Pandesal Base"
   - Batch Size: 100
   - Adds ingredients: flour, yeast, sugar, ube extract
   - Labor: ₱400
   - Overhead: ₱200
4. **Variant 1:**
   - Name: "Plain"
   - Quantity: 60
   - No additional ingredients
   - Markup: 40%
5. **Variant 2:**
   - Name: "With Cheese"
   - Quantity: 30
   - Additional: Cheese ₱180
   - Additional labor: ₱50
   - Markup: 50%
6. **Variant 3:**
   - Name: "Premium Ube Halaya"
   - Quantity: 10
   - Additional: Ube Halaya ₱150
   - Additional labor: ₱100
   - Markup: 60%
7. Clicks "Calculate All Variants"
8. **Sees Comparison Table:**
   - Plain: ₱8.40 cost → ₱11.76 price (₱3.36 profit)
   - Cheese: ₱16.07 → ₱24.11 (₱8.04 profit)
   - Premium: ₱33.40 → ₱53.44 (₱20.04 profit)
   - Total batch profit: ₱643.80
9. Saves preset: "Ube Pandesal - 3 Variants"
10. Returns next week, updates flour cost, recalculates

### Flow 4: User Works Offline Then Syncs

1. Opens app on laptop (no internet)
2. Sees "Offline Mode" indicator
3. Opens existing preset
4. Updates 2 ingredient costs
5. Recalculates pricing
6. Saves (shows "Saved locally - will sync when online")
7. Closes laptop
8. Later, opens laptop with internet
9. App automatically syncs: "Syncing 1 preset..." → "Synced ✓"
10. Changes now visible if user logs in on phone

### Flow 5: User Migrates from Phase 1

1. Phase 1 user with 5 unsaved presets in session
2. Opens Phase 2 URL (or updates browser)
3. **Migration Prompt:**

   ```
   Welcome to Phase 2!

   We found 5 presets from the old version.
   Create a free account to save them permanently.

   [Create Account & Migrate]  [Start Fresh]
   ```

4. Clicks "Create Account & Migrate"
5. Enters email + password
6. Account created
7. 5 presets automatically uploaded to cloud
8. "Migration complete! Your presets are now saved forever."
9. Can now access from any device

## 7. UI/UX Design

### New Screens

**1. Landing Page (Logged Out)**

```
┌──────────────────────────────────────────┐
│  🧮 Pricing Calculator                   │
│                                          │
│  Price your food products profitably    │
│  Save forever • Access anywhere          │
│                                          │
│  [Get Started Free]  [Login]            │
│                                          │
│  ✓ Never lose your data                 │
│  ✓ Access from any device               │
│  ✓ Price multiple product variants      │
└──────────────────────────────────────────┘
```

**2. Sign Up / Login Screen**

```
┌──────────────────────────────────────────┐
│  Create Your Account                     │
│                                          │
│  Email:    [                          ] │
│  Password: [                          ] │
│                                          │
│  [Sign Up]                              │
│                                          │
│  ─────────── or ───────────             │
│                                          │
│  [🔵 Continue with Google]               │
│                                          │
│  Already have account? [Login]          │
└──────────────────────────────────────────┘
```

**3. Main Dashboard (Logged In)**

```
┌──────────────────────────────────────────┐
│  maria@example.com  [Settings] [Logout]  │
├──────────────────────────────────────────┤
│  My Presets               [+ New Preset] │
│                                          │
│  🔍 [Search presets...]                  │
│                                          │
│  📋 Ube Pandesal - 3 Variants           │
│     Updated 2 days ago  •  Synced ✓     │
│     [Open] [Edit] [Delete]              │
│                                          │
│  📋 Chocolate Cookies - Single          │
│     Updated 1 week ago  •  Synced ✓     │
│     [Open] [Edit] [Delete]              │
│                                          │
│  📋 Hot Sauce Base - 3 Variants         │
│     Updated 3 weeks ago  •  Synced ✓    │
│     [Open] [Edit] [Delete]              │
└──────────────────────────────────────────┘
```

**4. Preset Type Selection**

```
┌──────────────────────────────────────────┐
│  Create New Preset                       │
│                                          │
│  Choose preset type:                    │
│                                          │
│  ○ Single Product                       │
│     Best for: One product, one price    │
│     Example: Chocolate chip cookies     │
│                                          │
│  ● Multiple Variants                    │
│     Best for: Same base, different      │
│     versions with different prices      │
│     Example: Plain, cheese, premium     │
│     pandesal from one batch             │
│                                          │
│  [Continue]                             │
└──────────────────────────────────────────┘
```

**5. Variants Input Form** (see detailed UI in Feature 3 spec above)

**6. Sync Status Indicator**

```
Top-right corner of app:

✓ Synced
⟳ Syncing...
⚠ Offline (changes saved locally)
✕ Sync failed (tap to retry)
```

**7. Settings Screen**

```
┌──────────────────────────────────────────┐
│  Settings                                │
│                                          │
│  Account                                 │
│  Email: maria@example.com               │
│  [Change Password]                      │
│                                          │
│  Data                                    │
│  [Export All Presets]                   │
│  [Import Presets]                       │
│  Last backup: Never                     │
│                                          │
│  Danger Zone                            │
│  [Delete All Data]                      │
│  [Delete Account]                       │
│                                          │
│  About                                   │
│  Version 2.0 • 12 presets • 128KB used  │
└──────────────────────────────────────────┘
```

### Design Principles

**1. Trust Indicators**

- Always show sync status clearly
- Confirm saves with visual feedback
- Show last synced timestamp
- Offline mode should feel safe, not broken

**2. Progressive Disclosure**

- Single product is default/simpler option
- Variants option available but not forced
- Hide complexity until user needs it

**3. Mobile-First**

- Touch-friendly targets (min 44px)
- Thumb-friendly bottom navigation
- Collapsible sections on small screens
- Swipe actions for delete/edit

**4. Speed**

- Instant UI updates (save locally first)
- Background cloud sync
- Offline-first architecture
- Preload common data

## 8. Development Timeline

### Week 1-2: Backend & Authentication

**Days 1-3: Supabase Setup**

- Create Supabase project
- Design database schema
- Set up row-level security policies
- Test auth flow (signup, login, logout)
- Configure email settings

**Days 4-7: Frontend Auth Integration**

- Build sign up / login UI
- Integrate Supabase auth library
- Implement session management
- Build account settings page
- Test auth on multiple devices

**Days 8-10: Sync Infrastructure**

- Build sync logic (local ↔ cloud)
- Implement conflict resolution
- Add offline queue system
- Test sync across devices
- Build sync status indicators

---

### Week 3-4: Product Variants System

**Days 1-5: Data Model & Calculations**

- Implement variants data structure
- Build cost allocation algorithm
- Test calculation accuracy
- Handle edge cases (decimal quantities, zero variants, etc.)
- Validate totals add up correctly

**Days 6-10: Variants UI**

- Build preset type selection screen
- Create base recipe input form
- Build variant input components
- Implement "Add Variant" functionality
- Create variants comparison table
- Add quantity validation
- Test user flows

---

### Week 5: Export/Import

**Days 1-3: Export Functionality**

- Build export to JSON
- Create import validation
- Handle merge vs replace logic
- Test with large datasets

**Days 4-5: UI Integration**

- Add export/import to settings
- Build confirmation dialogs
- Add success/error messaging

---

### Week 6: Polish & Testing

**Days 1-2: Cross-Device Testing**

- Test sync on iOS Safari
- Test sync on Android Chrome
- Test sync on desktop browsers
- Test offline → online transitions
- Test concurrent edits on 2 devices

**Days 3-4: Edge Cases & Bug Fixes**

- Test with 50+ presets
- Test with complex variant structures
- Test network interruptions
- Test rapid saves
- Fix discovered bugs

**Day 5: Performance Optimization**

- Optimize database queries
- Reduce bundle size
- Improve load time
- Add loading states

---

### Week 7: Migration & Beta Testing

**Days 1-2: Phase 1 Migration**

- Build migration detection
- Create migration UI
- Test migration flow
- Handle migration errors

**Days 3-5: Beta Testing**

- Deploy to staging environment
- Recruit 15-20 Phase 1 users
- Collect feedback via survey + interviews
- Log critical bugs
- Prioritize fixes

---

### Week 8: Final Fixes & Launch

**Days 1-3: Critical Bug Fixes**

- Fix all P0 bugs from beta
- Address urgent feedback
- Re-test fixed issues

**Days 4-5: Launch Preparation**

- Write launch announcement
- Update help documentation
- Create demo video
- Prepare support resources

**Day 5: Launch**

- Deploy to production
- Email all Phase 1 users
- Announce in communities
- Monitor for issues

---

**Total Timeline: 8 weeks**

- Can be compressed to 6 weeks if working full-time
- Can extend to 10 weeks if working part-time or solo

## 9. Success Metrics

### Immediate Success (Week 1-2 Post-Launch)

**Account Creation:**

- **Target:** 60% of Phase 1 active users create accounts within 14 days
- **Leading Indicator:** 30% create accounts in first 48 hours
- **Measure:** Track signups via Supabase analytics

**Data Migration:**

- **Target:** 80% of users who had Phase 1 presets successfully migrate them
- **Leading Indicator:** Zero migration failures reported
- **Measure:** Log migration success/failure rates

**Sync Reliability:**

- **Target:** 99%+ of save operations sync successfully
- **Leading Indicator:** <1% of users report sync failures in first week
- **Measure:** Log sync success/failure rates, monitor error reports

### Short-Term Success (Month 1)

**Cross-Device Adoption:**

- **Target:** 40% of users access from 2+ devices within 30 days
- **Measure:** Track unique devices per user in database

**Variants Adoption:**

- **Target:** 35% of users create at least one multi-variant preset
- **Leading Indicator:** 15% create variants in first week
- **Measure:** Count presets with preset_type = 'variants'

**Retention:**

- **Target:** 50% of Phase 2 users return within 30 days (baseline: Phase 1 was 35%)
- **Measure:** Track login frequency per user

**Data Security:**

- **Target:** Zero data loss incidents
- **Target:** Zero unauthorized data access incidents
- **Measure:** Monitor security logs, user reports

### Medium-Term Success (Month 2-3)

**Active Usage:**

- **Target:** Average 4+ presets saved per user
- **Target:** Average 3+ variant presets per active user
- **Measure:** Query database for averages

**Feature Validation:**

- **Target:** 70% of users report variants feature solves their problem (survey)
- **Target:** 60% of users report cross-device access is valuable (survey)
- **Measure:** Monthly user survey

**Growth:**

- **Target:** 20% new user growth from Phase 1 baseline
- **Target:** 10% of users refer another user
- **Measure:** Track referral sources, new signups

**Platform Stability:**

- **Target:** 99.5% uptime (Supabase SLA)
- **Target:** <2% of sessions have sync errors
- **Measure:** Uptime monitoring, error rate tracking

### User Satisfaction (Ongoing)

**Qualitative Feedback:**

- **Target:** 4.0+ stars average rating (if app store)
- **Target:** 3+ positive testimonials mentioning variants or cross-device
- **Measure:** Collect reviews, feedback form, interviews

**Usage Patterns:**

- Most common: How many variants per preset? (guides Phase 3)
- Device mix: % mobile vs desktop (guides UI priorities)
- Sync frequency: How often do users switch devices? (validates need)

### Leading Indicators to Watch

**Week 1:**

- Signup conversion rate (visitors → accounts)
- Migration success rate
- First-preset creation rate

**Week 2-4:**

- Login frequency
- Sync error rate
- Variants creation rate
- Cross-device usage

**Month 2+:**

- Churn rate (users who stop logging in)
- Support ticket volume
- Feature request themes

## 10. Risk Management

| Risk                                                       | Impact   | Likelihood | Mitigation                                                                  | Contingency                                                                |
| ---------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Users don't adopt accounts** (prefer Phase 1 simplicity) | High     | Medium     | Clear value prop ("never lose data"), easy signup flow, migration incentive | Keep Phase 1 available as "guest mode", add account benefits progressively |
| **Sync conflicts cause data loss**                         | Critical | Low        | Last-write-wins with timestamp, thorough testing, backup exports            | Manual data recovery process, import/export as safety net                  |
| **Supabase free tier limits exceeded**                     | High     | Low        | Monitor usage, optimize queries, compress data                              | Plan upgrade to paid tier ($25/mo), or migrate to self-hosted              |
| **Variants feature too complex for users**                 | Medium   | Medium     | Clear onboarding, examples, tooltips, help docs                             | Add "Simple Mode" toggle that hides variants, collect feedback             |
| **Cross-device sync feels slow**                           | Medium   | Medium     | Optimize sync speed, show loading states, background sync                   | Add manual "Sync Now" button, improve perceived performance                |
| **Authentication issues (password reset, spam signups)**   | Medium   | Low        | Use Supabase built-in auth, rate limiting, email verification               | Add CAPTCHA if spam is issue, clear password reset flow                    |
| **Users confused by cost allocation logic**                | Medium   | High       | Detailed help section, visual diagrams, worked examples                     | Add "How is this calculated?" explainer on every variant                   |
| **Mobile sync over poor networks fails**                   | Low      | Medium     | Offline-first architecture, retry logic, queue system                       | Clear offline indicators, "Sync when WiFi available" option                |
| **Phase 1 → Phase 2 migration fails**                      | High     | Low        | Extensive testing, data validation, rollback plan                           | Manual migration support, export/import fallback                           |
| **Backend costs exceed budget**                            | Low      | Low        | Free tier sufficient for 100-500 users                                      | Monetize before hitting limits, optimize database usage                    |

## 11. Launch Strategy

### Pre-Launch (Week 7)

**Beta Recruitment:**

- Email Phase 1 active users: "Help us test Phase 2"
- Offer: Early access + "Founding User" badge
- Select 15-20 diverse users (mobile/desktop, simple/complex needs)

**Messaging:**

- "Your top 3 requests are here"
- Emphasize: Data security, cross-device, variants
- Manage expectations: Other features coming in Phase 3

**Preparation:**

- Write FAQ document
- Create video tutorial (3-5 min)
- Set up support email/form
- Prepare announcement posts

### Beta Launch (Week 7, Days 3-5)

**Day 1:**

- Send beta invites with instructions
- Personal onboarding calls with 5 key users
- Monitor signups and first sessions closely

**Day 2-3:**

- Daily check-ins with beta users
- Quick fixes for critical bugs
- Collect detailed feedback

**Day 4-5:**

- Mid-beta survey
- Prioritize remaining issues
- Prepare for full launch

### Full Launch (Week 8, Day 5)

**Launch Day:**

- Deploy to production (morning)
- Email all Phase 1 users: "Phase 2 is Live!"
- Post in Facebook groups, forums
- Update website/landing page
- Monitor closely for issues

**Email Template:**

```
Subject: You asked, we built it: Phase 2 is here

Hi [Name],

Remember when we asked what you needed most?
You said:
1. Stop losing data when browser clears
2. Access from any device
3. Price multiple product variants

We listened. Phase 2 is live today.

✓ Cloud sync - your data is always safe
✓ Login from anywhere - phone, laptop, anywhere
✓ Variants - price multiple versions from one batch

[Get Started Free] - All your Phase 1 presets will migrate automatically.

Watch the 3-minute tutorial: [Video Link]

Questions? Hit reply.

Thanks for using Pricing Calculator,
[Your Name]

P.S. Everything else you asked for (batch scaling, tax calculator, PDF exports) is coming in Phase 3. We shipped your TOP priorities first.
```

**Social Posts:**

```
🎉 Phase 2 is LIVE!

Top 3 requests from food business owners:
✓ Never lose pricing data again
✓ Access from any device
✓ Price product variants easily

All three = now available for free.

[Link] Sign up, migrate your presets, start pricing profitably.

#SmallBusiness #FoodBusiness #Pricing
```

### Post-Launch (Week 9-12)

**Week 9: Monitoring**

- Daily check of error logs
- Quick response to bug reports
- User interview with 5-10 new users

**Week 10-11: Optimization**

- Fix non-critical bugs
- Improve UI based on feedback
- Optimize slow queries
- Write additional help docs

**Week 12: Retrospective**

- Analyze all success metrics
- User survey: "What's working? What's not?"
- Decide Phase 3 priorities
- Write Phase 3 brief (if metrics are good)

## 12. Phase 3 Planning Framework

**Phase 3 Decision Point: End of Month 3**

### If Metrics Show Success (Proceed with Phase 3)

- 60%+ of Phase 1 users adopted Phase 2 ✓
- 99%+ sync reliability ✓
- 35%+ using variants ✓
- Zero critical data loss incidents ✓

**Phase 3 Candidates (Prioritize by User Feedback):**

1. Batch scaling for different quantities
2. Tax calculator (VAT, sales tax)
3. PDF export with multiple templates
4. Cost history tracking & trend graphs
5. Multiple pricing tiers (retail, wholesale, bulk)
6. Supplier comparison
7. Enhanced export (Excel, CSV)

**Priority Method:**

- Survey Phase 2 users: "What would make this 10x more valuable?"
- Analyze feature requests in support tickets
- Check which Phase 3 features are mentioned most

### If Metrics Show Issues (Fix Before Phase 3)

- <50% adoption → Messaging problem or feature mismatch
- > 2% sync failures → Technical reliability issues
- <20% using variants → Feature is too complex or not needed
- Data loss incidents → Critical architecture flaw

**Action Plan:**

- Pause Phase 3 development
- Interview churned users: "Why did you stop using it?"
- A/B test messaging and onboarding
- Simplify complex features
- Fix reliability issues
- Re-launch improved Phase 2 before Phase 3

### If Metrics Show Pivot Needed

- Users love sync but not variants → Maybe variants solve wrong problem
- Users need features not on roadmap → Listen and adapt
- Unexpected use cases emerge → Build for actual usage, not assumptions

## 13. Definition of Done

**Phase 2 is complete and successful when:**

### Technical Completion

- [x] User authentication (signup, login, logout) works across all browsers
- [x] Cloud database stores all presets securely
- [x] Sync works reliably (99%+ success rate)
- [x] Offline mode functions correctly
- [x] Conflicts resolve without data loss
- [x] Export/import preserves all data
- [x] Variants calculation is accurate (tested against manual calculations)
- [x] Variants UI is intuitive (5+ beta users successfully create variants)
- [x] Phase 1 migration works (tested with real Phase 1 data)
- [x] Security audit passed (row-level security, auth tokens, HTTPS)
- [x] Performance acceptable (<3s load time, <1s save time)
- [x] Mobile responsive (tested on iOS and Android)
- [x] Zero P0 bugs in production

### User Validation

- [x] 60%+ of Phase 1 users create Phase 2 accounts
- [x] 35%+ of users create at least one variant preset
- [x] 40%+ of users access from 2+ devices
- [x] User satisfaction: 4.0+ stars or equivalent feedback
- [x] Support volume manageable (<5 tickets/day for 100 users)
- [x] At least 5 positive testimonials mentioning key features

### Business Validation

- [x] Zero critical data loss incidents
- [x] Hosting costs within budget (<$50/month for 500 users)
- [x] Clear path to Phase 3 based on usage data
- [x] Users report Phase 2 solves their top pain points

**Sign-off Required From:**

- [ ] Technical lead: "System is stable and secure"
- [ ] Product owner: "Meets user needs and success metrics"
- [ ] 5+ beta users: "This solves my problems"

---

## 14. Open Questions (Resolve Before Development Starts)

1. **Supabase vs Firebase?**
   - Supabase: Better free tier, PostgreSQL, open source
   - Firebase: More mature, better mobile SDKs, Google ecosystem
   - **Decision needed:** Which platform? (Recommend Supabase)

2. **Social login: Just Google, or also Facebook/Apple?**
   - Google covers most users
   - Facebook popular in Philippines
   - Apple required for iOS app (Phase 3+)
   - **Decision needed:** Google only for MVP, or add Facebook?

3. **Variants cost allocation: Just proportional, or offer alternatives?**
   - Proportional by quantity (simple, covers 80% of cases)
   - Equal split (simpler but less accurate)
   - Custom weights (complex, Phase 3?)
   - **Decision needed:** Proportional only for Phase 2?

4. **How to handle Phase 1 users who don't migrate?**
   - Keep Phase 1 available indefinitely?
   - Sunset Phase 1 after 90 days?
   - Phase 1 as "guest mode" (no account required)?
   - **Decision needed:** Migration strategy

5. **Pricing strategy: Free forever, or freemium in Phase 3?**
   - Affects hosting budget planning
   - Affects feature prioritization
   - Affects messaging
   - **Decision needed:** Business model (recommend free for Phase 2, decide later)

6. **Data retention: Keep deleted presets for recovery?**
   - Soft delete (keep 30 days) vs hard delete
   - Affects storage costs
   - Affects privacy policy
   - **Decision needed:** Soft delete with 30-day recovery?

**Action:** Resolve these questions in Week 0 (pre-development kickoff meeting)

---

## Appendix A: User Research Summary

**Survey Results (N=47 Phase 1 active users):**

**Q: Rank these pain points (1=most painful, 5=least painful)**

1. Losing data when browser clears: 78% ranked #1
2. Can't access from multiple devices: 71% ranked #1 or #2
3. Can't price product variants: 64% ranked #1, #2, or #3
4. Can't scale batch sizes easily: 43% ranked in top 3
5. Need professional PDF exports: 38% ranked in top 3
6. Need tax calculations: 31% ranked in top 3
7. Can't track cost history: 22% ranked in top 3

**Q: Would you create an account to save your data permanently?**

- Yes: 91%
- Maybe: 7%
- No: 2%

**Q: Do you make multiple product versions from one batch?**

- Yes, regularly: 68%
- Sometimes: 23%
- No: 9%

**Q: How many product variants do you typically make?**

- 2 variants: 34%
- 3 variants: 41%
- 4-5 variants: 19%
- 6+ variants: 6%

**Most Common Variant Types:**

1. Flavor variations (56%)
2. Size variations (38%)
3. Quality tiers (regular/premium) (32%)
4. With/without add-ins (29%)

**Key Quotes:**

> "I lost everything when I updated my browser. I cried. I won't use this seriously until data is safe." - Maria, Baker

> "I need to price ube pandesal, cheese pandesal, and premium pandesal. They all come from one dough batch but have different costs. Right now I make 3 separate calculations and it's confusing." - Juan, Bread Maker

> "I calculate on my laptop at home, but when I'm shopping at the market I need to check on my phone. Can't access my numbers." - Lisa, Cookie Business

---

## Appendix B: Competitive Analysis

**Other pricing calculators reviewed:**

- None specifically handle product variants from shared base
- None offer cloud sync in free tier
- Most are Excel spreadsheets (no mobile, no sync)
- **Opportunity:** First mover on variants + cloud sync for food businesses

---

## Appendix C: Technical Alternatives Considered

**Authentication Options:**

- ✓ Supabase Auth: Built-in, free, simple
- ✗ Auth0: More features, but overkill and costly for MVP
- ✗ Custom auth: Too much work, security risk

**Database Options:**

- ✓ Supabase PostgreSQL: Relational, free tier, good for structured data
- ✗ Firebase Firestore: NoSQL, could work but less intuitive for this use case
- ✗ MongoDB Atlas: Overkill, more complex queries

**Sync Strategy:**

- ✓ Offline-first with cloud backup: Best UX, works offline
- ✗ Cloud-only: Requires internet, slower
- ✗ Peer-to-peer: Too complex, unreliable

---

**This brief is ready for development. All critical user needs validated. All technical decisions specified. All risks identified. Ship Phase 2, measure results, iterate to Phase 3.**
