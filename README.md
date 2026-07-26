# Tic. - Sovereign Macroeconomic Terminal

## Overview

Tic is a high-performance, web-based macroeconomic data terminal designed to provide real-time institutional-grade analytics across 25+ sovereign economies. The platform aggregates, normalizes, and visualizes disparate financial datasets—including benchmark equities, foreign exchange rates, inflation metrics, unemployment figures, and central bank policy rates—into a unified, low-latency interface.

The system architecture prioritizes computational efficiency, responsive fluid UI topologies, and robust concurrent data ingestion.

## Core Architecture & Tech Stack

### Frontend Application Layer

* **Framework:** Next.js (App Router, Turbopack)
* **Language:** TypeScript (Strict typing for predictable data mutation)
* **State Management:** React Hooks (`useState`, `useEffect`, `use`) coupled with `<Suspense>` boundaries for optimized hydration and perceived performance.
* **Styling:** Tailwind CSS (Utility-first, fully responsive breakpoints, dark/light mode context)
* **Animation:** Framer Motion (Hardware-accelerated DOM transitions)
* **Data Visualization:** Recharts (SVG-based charting optimized for React reconciliation)
* **Iconography:** Lucide React

### Backend & Middleware Layer

* **Runtime:** Node.js / Next.js Serverless API Routes
* **LLM Inference:** Groq API leveraging the Llama 3 model for zero-latency macroeconomic NLP tasks.
* **Data Ingestion:** RESTful integration with Yahoo Finance v8 (Time-Series) and v1 (News/Catalyst) endpoints.

## Algorithmic Implementations & Methods

### 1. Pearson Correlation Engine (ML Subsystem)

The platform features a client-side computational engine that evaluates the linear relationship between two independent discrete time-series datasets. The engine computes the Pearson Correlation Coefficient ($r$) using an optimized $O(N)$ single-pass algorithm to prevent main-thread blocking during matrix evaluation.

The calculation resolves covariance divided by the product of the standard deviations:
`r = [ Σ(xy) - (ΣxΣy)/N ] / sqrt( [Σx² - (Σx)²/N] * [Σy² - (Σy)²/N] )`

This structural analysis allows the system to deterministically classify asset co-movement as strong positive correlation, inverse hedging behavior, or statistical noise.

### 2. Dynamic Volatility Detection Engine

The dashboard employs an automated sorting algorithm that iterates over the ingested cross-asset matrix on initial load. By computing the absolute percentage delta `Math.abs((current - previous) / previous)`, the engine isolates the asset exhibiting the highest intraday variance and dynamically elevates it to the primary featured UI component.

### 3. Cross-Currency FX Interpolation

To solve the computational overhead of requesting currency-adjusted arrays from the server, the application utilizes a client-side scalar multiplication method. A base FX state dictionary is maintained in memory. When a user requests a currency pivot, the engine applies the conversion ratio `(Target FX Rate / Native FX Rate)` across the entire time-series array in real-time, executing localized repaints without triggering network round-trips.

### 4. Concurrent Network Batching

Legacy sequential data fetching is bypassed in favor of a highly parallelized `Promise.all` ingestion pipeline. The server initiates up to 80 non-blocking asynchronous HTTP requests to external APIs simultaneously. This network topology reduces a potential 12-second waterfall bottleneck into a bounded ~1.5-second resolution, returning a flattened, normalized JSON array to the client.

## Data Sources

* **Market Data:** Yahoo Finance API (Equities, Foreign Exchange)
* **Macroeconomic Targets:** IMF Projections (2026 Nominal GDP & GDP Per Capita estimations)
* **News Catalysts:** Yahoo Finance Search Index (Real-time global financial news streams)
* **Contextual Intelligence:** Groq (Llama 3) for real-time natural language synthesis of macroeconomic variables.

## Local Development & Deployment

### Prerequisites

* Node.js (v18.17.0 or higher)
* npm, yarn, or pnpm

### Environment Configuration

Create a `.env.local` file in the root directory and supply the required inference keys:

```env
GROQ_API_KEY=your_groq_api_key_here

```

Use it here: "https://tic-one-theta.vercel.app"

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Initialize the development server
npm run dev

```

The application will boot on `http://localhost:3000`.

### Production Build

To compile the application for edge deployment (e.g., Vercel, AWS Amplify):

```bash
npm run build
npm run start

```

The build process enforces strict TypeScript compilation and optimizes server-side rendering routes for deployment.