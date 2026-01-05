# Pricing Calculator App

A calm, intentional tool designed for small food businesses to calculate profitable selling prices.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Project Overview

This application helps artisan food entrepreneurs (bakers, makers, chefs) accurately calculate product costs and set profitable selling prices. It transforms a stressful, spreadsheet-heavy process into a simple, visual experience.

**Design Philosophy:**
The interface is built on Japanese aesthetic principles:

- **Ma (間)**: Negative space to reduce cognitive load.
- **Wabi-sabi (詫び寂び)**: Natural textures and organic interactions.
- **Kanso (簡素)**: Simplicity and elimination of clutter.

## ✨ Key Features (Phase 2)

### 🔄 Cloud Sync & Offline Support

- **Work Anywhere**: Seamlessly switch between laptop (at home) and phone (at the market).
- **Always Safe**: Data is automatically saved to the cloud.
- **Offline-First**: Continue working without internet; changes sync automatically when connection is restored.

### 🍱 Product Variants System

- **Unified Logic**: Create one "Base Recipe" (e.g., Cookie Dough) and price multiple variations (Plain, Chocolate Chip, Premium) from it.
- **Smart Allocation**: Automatically distributes shared costs (labor, overhead, base ingredients) across all variants proportional to their batch size.
- **Live Comparison**: Compare profit margins of all variants side-by-side to identify your best sellers.

### 🛡️ Data Portability & Security

- **Secure Accounts**: Email/Password authentication with Row-Level Security (RLS).
- **Export/Import**: Full JSON export for backups or platform migration.
- **Migration Assistant**: Automatically migrates guest data to your account when you sign up.

### 📊 Core Calculator

- **Cost Breakdown**: detailed visualization of Ingredients, Labor, and Overhead costs.
- **Pricing Strategies**: Toggle between "Markup %" and "Profit Margin %" logic.
- **Health Indicators**: Visual cues for low (<20%) or healthy (>50%) profit margins.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4 (Custom Design Tokens)
- **State Management**: React Context + Hooks
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Testing**: Vitest, React Testing Library
- **Icons**: Lucide React
- **Fonts**: Crimson Text (Serif headers), Inter (Sans-serif UI)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd pricing-calculator-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

    _(Note: Without these keys, the app will run in "Guest Mode" with local storage only, and sync features will be disabled.)_

4.  **Start the development server:**

    ```bash
    npm run dev
    ```

5.  **Open in browser:**
    Visit `http://localhost:5173`.

## 🧪 Running Tests

The project maintains a high standard of code quality with 300+ unit and integration tests.

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Check coverage
npm run coverage
```

## 📂 Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── account/     # Account management & Danger Zone
│   ├── calculator/  # Core calculation forms & logic
│   ├── results/     # Visualization & Breakdown
│   └── shared/      # Design system primitives (Button, Card, etc.)
├── context/         # Auth & Global State
├── hooks/           # Custom React Hooks (usePresets, etc.)
├── lib/             # Third-party configurations (Supabase)
├── services/        # API & Data persistence layers
├── types/           # TypeScript definitions
└── utils/           # Pure business logic & calculations
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
