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
