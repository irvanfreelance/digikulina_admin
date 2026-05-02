# Technical Requirements Document (TRD)
**Project:** Enterprise F&B SaaS (Admin Panel, POS, & KDS)
**Document Version:** 1.2 (Reusable DB Setup & Modern Architecture)
**Architecture Paradigm:** API-First, Serverless Edge, Modern Component-Based UI
**Language:** English

---

## 1. Executive Summary
This document defines the architectural standards and technical guidelines for the Enterprise F&B SaaS platform. The system is designed to achieve ultra-low latency, high scalability, and a strict separation of concerns between the User Interface (UI) and the Data Access Layer. The database boilerplate is also architected to be highly reusable, allowing instant deployment across different environments or future F&B projects.

## 2. Technology Stack & Infrastructure Rules

| Layer | Selected Technology | Strict Usage Rules |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | Strict separation between Client Components (`"use client"`) and Server/API Routes. |
| **Styling & UI** | Tailwind CSS | Utility-first styling. UI components must be highly modular and reusable. |
| **Icons** | Lucide React | Sole icon library for the entire system (POS, Admin Dashboard, KDS). |
| **Database Driver** | Neon PostgreSQL | Use the `@neondatabase/serverless` driver for optimal HTTP/WebSocket connection pooling in Vercel Edge/Serverless environments. |
| **Migration & Seeding**| Drizzle | **STRICT RULE:** Drizzle is ONLY used for schema migrations and database seeders. **IT IS STRICTLY FORBIDDEN** to use Drizzle as an ORM within the Next.js application code. |
| **Data Fetching** | Raw SQL via API Routes | **STRICT RULE:** All Raw SQL queries MUST be encapsulated inside the `app/api/...` directory. UI Components are strictly prohibited from executing direct database queries. |
| **File Storage** | Vercel Blob Storage | Used for storing static media assets (e.g., product image uploads). |
| **Data Visualization** | Recharts | Used for rendering sales analytics and financial charts in the Admin Panel. |
| **Caching & Realtime** | Redis Serverless | (Upstash Redis) Utilized for caching static menu catalogs and syncing KDS status in real-time. |
| **Environment Mgt.** | Dotenv | Strict `.env` management across development, staging, and production environments. |
| **Deployment** | Vercel | Centralized CI/CD utilizing Vercel Serverless and Edge Functions. |

---

## 3. Database Management & Reusability (Migrate & Seed)

To ensure this project can be easily replicated and set up in new environments or for other F&B projects, schema management and initial data injection are fully controlled by specific npm scripts.

### 3.1. Package.json Scripts
The following scripts must be configured in `package.json` for setup automation:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "db:generate": "drizzle-kit generate",
  "migrate": "drizzle-kit migrate",
  "seed": "tsx db/seed.ts"
}

3.2. Reusable Setup Procedure
Whenever this project is cloned to a new repository, developers only need to perform these 3 steps to set up a fully populated database:

Configure the DATABASE_URL in the .env file.

Run npm run migrate (Executes the SQL schema to Neon Postgres).

Run npm run seed (Injects master data: branches, menus, users, and tables).

4. Project Architecture & Directory Structure
This project enforces an absolute separation between the UI, API, and database scripts.

📦 project-root
 ┣ 📂 app
 ┃ ┣ 📂 api               # STRICT RULE: The ONLY place for Raw SQL execution
 ┃ ┃ ┣ 📂 products
 ┃ ┃ ┃ ┗ 📜 route.ts      # Contains queries using @neondatabase/serverless
 ┃ ┃ ┣ 📂 orders
 ┃ ┃ ┃ ┗ 📜 route.ts
 ┃ ┃ ┗ 📂 upload
 ┃ ┃   ┗ 📜 route.ts      # Vercel Blob Storage handler
 ┃ ┣ 📂 (dashboard)       # Admin Panel, POS, and KDS UIs
 ┃ ┃ ┣ 📂 pos
 ┃ ┃ ┃ ┗ 📜 page.tsx      # Component fetches data via fetch('/api/...')
 ┃ ┃ ┗ 📂 kds
 ┃ ┃   ┗ 📜 page.tsx
 ┣ 📂 components
 ┃ ┣ 📂 ui                # Reusable dumb components (Button, Input, Table, Modal)
 ┃ ┣ 📂 pos               # POS-specific smart components
 ┃ ┗ 📂 charts            # Reusable Recharts components
 ┣ 📂 lib
 ┃ ┣ 📜 db.ts             # @neondatabase/serverless Pool initialization
 ┃ ┣ 📜 redis.ts          # Redis Serverless client initialization
 ┃ ┗ 📜 utils.ts          # Utility functions (Tailwind merge, formatters, etc.)
 ┣ 📂 db                  # STRICT RULE: Exclusive Drizzle working area (CLI Only)
 ┃ ┣ 📂 migrations        # Auto-generated .sql migration files
 ┃ ┣ 📜 schema.ts         # Drizzle schema definitions (ONLY for npm run migrate)
 ┃ ┗ 📜 seed.ts           # Data injection script (ONLY for npm run seed)
 ┣ 📜 .env                
 ┣ 📜 tailwind.config.ts
 ┗ 📜 next.config.mjs

 5. Implementation Guidelines
5.1. Raw SQL Data Fetching (Next API Router)
Queries must be executed using parameterized methods to prevent SQL Injection.
Standard Implementation Example in app/api/products/route.ts:

import { Pool } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, base_price, image_url FROM products WHERE category_id = $1',
      [3] // e.g., fetching 'Paket Hemat'
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
5.2. Image Uploading (Vercel Blob Storage)
Product photo uploads from the Admin Panel must be sent via FormData to the /api/upload endpoint. The endpoint utilizes the put() function from @vercel/blob, returning an absolute url which is then saved via raw SQL UPDATE to the products table.

5.3. Reusable UI Components
All UI elements must utilize Tailwind CSS.

Writing inline styles (e.g., style={{ color: 'red' }}) is strictly prohibited.

Base components like tables, buttons, and input forms must be abstracted into /components/ui and accept dynamic className props using a combination of clsx and tailwind-merge for predictable overrides.

5.4. Data Visualization (Recharts)
Charts and graphs must be located in /components/charts and marked with "use client". Aggregation computations (e.g., total daily revenue GROUP BY date) must be processed entirely via Raw SQL inside the API Route. The API should return a finalized JSON array to Recharts to ensure the client browser is not burdened with heavy data calculations.

5.5. Caching & Realtime (Redis)
Menu catalogs that rarely change should be cached using Redis Serverless to accelerate API response times. KDS operations (such as "Incoming Order" notifications) are optimized by manipulating lists in the Redis memory before being synchronized back to the primary PostgreSQL database.

6. Deployment Pipeline & Checks
Before pushing to the main branch to trigger a Vercel deployment, the following steps must be verified:

Ensure dotenv variables are correctly mirrored in Vercel's Environment Variables (DATABASE_URL, BLOB_READ_WRITE_TOKEN, REDIS_URL).

Verify that there are absolutely no drizzle-orm imports inside the /app or /components directories.

Run a local build test (npm run build) to verify that all Lucide UI components and Tailwind CSS classes compile optimally without breaking the layout.