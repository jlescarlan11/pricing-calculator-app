# Project Brief: Pricing Calculator App for Food Products

**Version 2.0 - MVP Focus**

## 1. Project Overview

Build a web-based calculator that helps small food businesses in the Philippines determine profitable selling prices for their products. Users enter their ingredient costs, labor, overhead, and batch size, then receive clear calculations showing cost per unit, break-even price, and recommended selling prices based on their chosen markup or profit margin strategy.

**Core Problem:** Small food entrepreneurs often underprice their products because they don't accurately account for all costs or understand pricing strategies, leading to unsustainable businesses despite high sales volume.

## 2. Project Goals

- Provide a simple, accurate tool for calculating true product costs and profitable selling prices
- Help users understand the difference between markup and profit margin pricing
- Enable quick repricing when ingredient costs change
- Build a foundation that can be enhanced based on real user feedback

**Out of Scope for MVP:** Market trend analysis, AI recommendations, weather integration, community features, gamification, supplier negotiation tools, sales forecasting.

## 3. Target Users

### Primary User: Maria, Artisan Baker

- Makes 3-5 different baked goods in batches of 20-50 units
- Buys ingredients weekly from local suppliers
- Prices change when flour, butter, or eggs spike
- Needs to know if she can stay profitable at current prices
- Sells through social media and local stores

### Secondary User: Juan, Hot Sauce Maker

- Produces hot sauce in large batches (100+ bottles)
- Ingredient costs are relatively stable
- Struggles to calculate overhead allocation per bottle
- Wants to understand if wholesale vs. retail pricing makes sense

### User Needs

- Calculate accurate cost per unit quickly (under 2 minutes)
- Save calculations for multiple products without re-entering data
- Recalculate easily when one or two costs change
- Understand what price they need to charge to make money
- Print or share calculations with partners/investors

## 4. Core Features

### 4.1 Cost Input Form

**Purpose:** Capture all costs that go into making a batch of products

**Inputs:**

- **Product Name** (text field) - "Chocolate Chip Cookies"
- **Batch Size** (number) - How many units this calculation produces
- **Ingredient Costs** (repeatable line items)
  - Ingredient name: "All-purpose flour"
  - Amount needed: "2 kg"
  - Cost: "₱120"
  - Add/remove ingredient rows dynamically
- **Labor Cost per Batch** (number in ₱)
  - Helper text: "Your time + helpers' wages for making this batch"
  - Example: "4 hours × ₱100/hour = ₱400"
- **Overhead per Batch** (number in ₱)
  - Helper text: "Electricity, rent, packaging, marketing share for this batch"
  - Toggle to show/hide overhead breakdown helper:
    - Monthly rent: ÷ batches per month
    - Monthly utilities: ÷ batches per month
    - Packaging cost per unit × batch size
- **Current Selling Price** (optional) - To compare against recommended prices

**Validation:**

- All number fields must be positive
- Batch size must be at least 1
- At least one ingredient required
- Warning if profit margin falls below 20%
- Warning if overhead is 0 (common mistake)

### 4.2 Pricing Strategy Selection

**Purpose:** Let users choose their preferred pricing approach

**Options:**

- **Markup Percentage**
  - User enters: 50% (means selling price is cost + 50% of cost)
  - Example shown: "Cost ₱100 → Sell at ₱150"
  - Input range: 10% to 500%, default 50%
- **Profit Margin Percentage**
  - User enters: 30% (means profit is 30% of selling price)
  - Example shown: "To keep ₱30 of every ₱100 sale"
  - Input range: 5% to 80%, default 30%

**Toggle between methods** with clear explanation of difference:

- "Markup: How much to ADD to your cost"
- "Margin: What PERCENTAGE of the sale you keep as profit"

### 4.3 Results Display

**Purpose:** Show clear, actionable pricing information

**Calculations Shown:**

- **Total Cost per Unit:** ₱85.50
  - Breakdown: Ingredients ₱45, Labor ₱25, Overhead ₱15.50
- **Break-Even Price:** ₱85.50 (sell at this price = zero profit)
- **Recommended Selling Price:** ₱128.25 (based on chosen markup/margin)
- **Profit per Unit:** ₱42.75
- **Total Profit per Batch:** ₱2,137.50 (profit per unit × batch size)

**Visual Indicator:**

- Color-coded profit margin health:
  - Red: Below 15% margin ("Very tight margins - risky")
  - Yellow: 15-25% margin ("Modest but workable")
  - Green: Above 25% margin ("Healthy profit margin")

**Comparison (if current price was entered):**

- "You're currently selling at ₱120"
- "This gives you ₱34.50 profit per unit (28.8% margin)"
- "You're leaving ₱8.25 per unit on the table" OR "You're priced competitively"

### 4.4 Save & Load Presets

**Purpose:** Avoid re-entering data for regular products

**Features:**

- **Save Calculation** button
  - Saves all inputs (ingredients, costs, batch size, pricing strategy)
  - User provides a preset name: "Chocolate Cookies - Standard Recipe"
  - Stored locally in the browser using in-memory state (React)
- **My Saved Products** section
  - List of saved presets with name and last modified date
  - Click to load all values back into the form
  - Edit and re-save to update
  - Delete option for each preset
- **Quick Update** feature
  - When loading a preset, user can adjust just the changed costs
  - Example: Load "Chocolate Cookies", change flour cost from ₱120 to ₱135, recalculate

**Data Storage:**

- Use React state (useState/useReducer) for session data
- Note to user: "Your presets are saved in this browser only. Clearing browser data will remove them."

### 4.5 Export/Share

**Purpose:** Use calculations outside the app

**Options:**

- **Print** - Clean printable format with business name field
- **Copy Summary** - Formatted text for pasting into messages/emails
  ```
  Product: Chocolate Chip Cookies (Batch of 50)
  Cost per unit: ₱85.50
  Recommended price: ₱128.25
  Profit per unit: ₱42.75 (33.3% margin)
  Total batch profit: ₱2,137.50
  ```

### 4.6 Help & Guidance

**Purpose:** Reduce confusion and build user confidence

**Features:**

- **Tooltips** on every input field with examples
- **"How to calculate overhead"** expandable guide:
  - Rent allocation method
  - Utilities estimation
  - Packaging costs
  - Marketing/advertising share
- **"Markup vs Margin Explained"** page with examples
- **Sample Calculation** - Pre-filled example user can explore
- **FAQ Section:**
  - "What's a good profit margin for food products?"
  - "How often should I recalculate my prices?"
  - "Should I include my time as a cost?"
  - "What if my overhead changes every month?"

## 5. Technical Specifications

### Platform

- Web application (responsive design for mobile and desktop)
- React-based single-page application
- No backend required for MVP (all calculations client-side)
- Hosted on static hosting (Netlify, Vercel, or similar)

### Data Storage

- React state management (useState/useReducer)
- No localStorage or sessionStorage (not supported in Claude artifacts)
- Session-only data persistence (resets on page refresh)
- Future: Consider simple backend for cross-device sync in v2.0

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Mobile responsive (works on phones 375px width and up)

### Calculations

- All calculations performed client-side in JavaScript
- Formulas:
  - Total Cost = Sum of all ingredients + Labor + Overhead
  - Cost per Unit = Total Cost ÷ Batch Size
  - Markup Price = Cost per Unit × (1 + Markup %)
  - Margin Price = Cost per Unit ÷ (1 - Margin %)
  - Profit per Unit = Selling Price - Cost per Unit
  - Profit Margin % = (Profit per Unit ÷ Selling Price) × 100

## 6. User Flows

### Primary Flow: First-Time User Calculates Price

1. User arrives at app homepage with brief explanation
2. User sees sample calculation or empty form
3. User enters product name: "Ube Pandesal"
4. User adds ingredients:
   - Ube extract: ₱80
   - Flour: ₱150
   - Sugar: ₱45
   - Yeast: ₱30
   - (etc.)
5. User enters labor cost: ₱400 (8 hours × ₱50/hour)
6. User enters overhead: ₱200 (estimated from helper guide)
7. User enters batch size: 80 pieces
8. User sees immediate calculations update
9. User selects pricing strategy: 40% markup
10. User reviews recommended price: ₱15.75 per piece
11. User decides to save this calculation for future use
12. User names preset: "Ube Pandesal - Regular Batch"

### Secondary Flow: Returning User Updates Price

1. User returns to app
2. User clicks "My Saved Products"
3. User selects "Ube Pandesal - Regular Batch"
4. All previous inputs load into form
5. User notices flour price increased
6. User changes flour from ₱150 to ₱175
7. User sees new recommended price: ₱16.05 per piece
8. User decides whether to increase selling price
9. User re-saves preset (overwrites old version)

### Tertiary Flow: Comparing Current Price

1. User loads or enters a calculation
2. User adds their current selling price: ₱15.00
3. App shows: "At ₱15.00, you're making ₱3.85 profit (25.7% margin)"
4. App compares: "Recommended price for 40% markup: ₱16.10"
5. User decides to keep current price or adjust

## 7. Design Principles

- **Clarity over cleverness** - Every label and instruction should be immediately understandable
- **Progressive disclosure** - Show basic options first, advanced features behind toggles
- **Forgiving inputs** - Accept various formats (₱100, 100, P100 all work)
- **Immediate feedback** - Calculations update as user types
- **Mobile-first** - Most users will check prices on their phones
- **No jargon** - Write for someone with no business education

## 8. Revised Timeline

### Week 1: Requirements & Design

- Finalize all calculations and formulas
- Create detailed wireframes for all screens
- Get feedback from 2-3 potential users on wireframes
- List all input validations and error messages

### Week 2: Core Calculator Development

- Build input form component with validation
- Implement calculation engine with all formulas
- Create results display component
- Test calculations against manual spreadsheet calculations

### Week 3: Presets & Polish

- Build save/load preset functionality
- Implement export/print features
- Add all tooltips and help content
- Responsive design adjustments

### Week 4: User Testing

- Recruit 5-8 small food business owners
- Watch them use the app (record sessions if possible)
- Collect specific feedback: What's confusing? What's missing?
- Identify top 3-5 issues to fix

### Week 5: Refinement & Launch

- Fix critical issues from user testing
- Write launch announcement
- Create simple landing page explaining the tool
- Soft launch to user testing group
- Public launch to wider audience

**Post-Launch:** Collect usage data and user feedback for 4-6 weeks before planning v2.0 features.

## 9. Known Limitations & Future Considerations

### MVP Limitations

- Data doesn't persist across devices (single browser only)
- No historical cost tracking (can't see how costs changed over time)
- No bulk ingredient price comparisons
- No tax calculations
- No multi-currency support
- No collaboration features (sharing with business partners)

### Potential V2.0 Features (Prioritize Based on User Feedback)

- **Account system** - Save calculations across devices
- **Cost history tracking** - Graph ingredient price changes over time
- **Recipe scaling** - Calculate costs for different batch sizes
- **Wholesale vs retail pricing** - Different price tiers
- **Multi-product view** - See all product margins at once
- **Supplier comparison** - Track prices from different suppliers
- **Tax calculator** - Include VAT or other taxes in pricing
- **Mobile app** - Native iOS/Android versions
- **PDF reports** - Professional-looking cost breakdowns

### Features Explicitly NOT Planned

- Market price recommendations (requires external data, legally risky)
- Automated price adjustments (users should make these decisions)
- Community price sharing (privacy and collusion concerns)
- Supplier marketplace (different business model)
- Inventory management (scope creep into different tool)

## 10. Success Metrics

### Adoption Metrics (Month 1-3)

- **Target:** 100 total users try the calculator
- **Target:** 40% of users complete at least one calculation
- **Target:** 25% of users save at least one preset
- **Target:** 15% of users return within 30 days

### Usage Metrics (Month 2-4)

- **Target:** Average of 5 calculations per active user per month
- **Target:** 60% of returning users load a saved preset
- **Target:** Average time to complete first calculation: under 5 minutes

### Quality Metrics (Ongoing)

- **Target:** User rating of 4.0+ stars (if app stores) or equivalent feedback
- **Target:** Less than 10% of users report calculation errors
- **Target:** At least 3 pieces of positive written feedback mentioning "helped me price correctly" or similar

### Business Impact (Qualitative - Month 3+)

- Collect user stories: "I discovered I was underpricing by ₱X per unit"
- Testimonials: "This gave me confidence to raise my prices"
- Referrals: "I told 3 other food business owners about this tool"

### Leading Indicator Metrics (Week 1-4)

- Average time spent in app per session (target: 3-8 minutes)
- Form completion rate (target: 70%+ who start, finish)
- Help section usage (high = confusing interface, need to improve)

## 11. Risk Management

| Risk                                                   | Impact | Mitigation Strategy                                                                                  |
| ------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| Users find overhead calculation too confusing          | High   | Provide detailed examples, video tutorial, default values based on business type                     |
| Users don't trust the calculations                     | High   | Show formula transparency, allow manual verification, provide sample calculations with known results |
| Users abandon because data doesn't save across devices | Medium | Clear messaging about browser-only storage, plan account system for v2.0 if validated                |
| Low adoption/discovery                                 | Medium | Partner with food business Facebook groups, offer free pricing workshops, create YouTube tutorials   |
| Calculations have bugs/errors                          | High   | Extensive testing with real business owners, test against manual calculations, bug reporting feature |
| Users need features not in MVP                         | Medium | Collect feature requests systematically, prioritize v2.0 based on frequency and business value       |
| Competitors launch similar tool                        | Low    | Focus on Filipino market specificity, quality of help content, user experience                       |

## 12. Launch Strategy

### Pre-Launch (Week 4)

- Create social media presence (Facebook page for Filipino food entrepreneurs)
- Join relevant Facebook groups (home-based food business, baking communities)
- Prepare launch materials (demo video, screenshots, sample calculations)
- Recruit 10-15 beta testers

### Launch (Week 5)

- Announce in food business Facebook groups
- Post in entrepreneur communities
- Share in local business development organizations
- Email to small business support groups (DTI, DOST-SETUP, etc.)

### Post-Launch (Week 6-12)

- Weekly check-ins with active users
- Monthly feature request survey
- Share user success stories
- Create tutorial content based on common questions

## 13. Definition of Success

**This MVP will be considered successful if:**

1. **Validation:** At least 50 food business owners use it for real pricing decisions within 3 months
2. **Utility:** 60%+ of users report it helped them price more accurately or confidently
3. **Retention:** 30%+ of users return to recalculate when costs change
4. **Clarity:** Less than 20% of users contact support/help for basic features
5. **Foundation:** Clear user feedback provides direction for v2.0 features

**Decision Point (Month 4):** Based on these metrics, decide whether to:

- Continue development with v2.0 features
- Pivot based on unexpected user needs
- Sunset if no product-market fit found
