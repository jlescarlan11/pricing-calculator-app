# Pricing Calculator App

A robust and flexible pricing calculator application built with React, TypeScript, and Vite.

## Project Overview

This application is designed to help users calculate pricing based on various parameters and presets. It features a modular architecture to support easy expansion and maintenance.

## Folder Structure

The project follows a feature-based and functional organization within the `src` directory:

- **`src/components/`**: Contains all React components.
  - **`calculator/`**: Core calculator logic and UI components.
  - **`presets/`**: Components for managing and selecting pricing presets.
  - **`results/`**: Components for displaying calculation results.
  - **`help/`**: Help and documentation components within the app.
  - **`shared/`**: Reusable UI components (buttons, inputs, etc.) used across the app.
- **`src/hooks/`**: Custom React hooks for state management and logic reuse.
- **`src/types/`**: TypeScript type definitions and interfaces.
- **`src/utils/`**: Helper functions and utility logic.
- **`src/constants/`**: Application-wide constants and configuration values.
- **`src/assets/`**: Static assets like images and icons.

## Setup Requirements

- **Node.js**: (Version 18 or higher recommended)
- **npm** or **yarn** or **pnpm**

## Environment Configuration

This project uses environment variables for configuration.

1.  **Create a local environment file:**
    Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
    (Or manually create `.env.local` in the root directory)

2.  **Configure variables:**
    Open `.env.local` and update the values:

    | Variable | Description | Required | Example |
    |----------|-------------|----------|---------|
    | `VITE_SUPABASE_URL` | Your Supabase project URL | Yes | `https://your-project.supabase.co` |
    | `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous API key | Yes | `eyJ...` |
    | `VITE_APP_VERSION` | Current application version | Yes | `2.0.0` |
    | `VITE_ENABLE_OFFLINE_MODE` | Enable offline capabilities | Yes | `true` |

    *Note: `.env.local` is git-ignored to protect your secrets.*

## How to Run Locally

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd pricing-calculator-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

4.  **Open in browser:**
    Open the URL shown in the terminal (usually `http://localhost:5173`) to view the application.

## Building for Production

To create a production-ready build:

```bash
npm run build
```
