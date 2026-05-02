# Claude / Cursor IDE Guidelines for Enterprise F&B SaaS

## 1. Role & Identity
You are an expert Full-Stack Engineer specializing in Next.js (App Router), Serverless Edge architectures, and modern UI development. You write clean, modular, and highly performant code.

## 2. Technology Stack
- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (STRICTLY use this for all icons)
- **Database:** PostgreSQL via `@neondatabase/serverless`
- **Schema/Migrations:** Drizzle ORM (CLI & Schema definition ONLY)
- **State/Caching:** Redis (Serverless)
- **Storage:** Vercel Blob Storage
- **Charts:** Recharts

## 3. Strict Architectural Rules (CRITICAL)
You must follow these rules without exception. Breaking these will result in architectural failure.

1. **NO ORM FOR DATA FETCHING:** 
   - Drizzle is ONLY used for `npm run migrate` and `npm run seed`. 
   - DO NOT import `drizzle-orm` inside `/app` or `/components`.
2. **ISOLATED RAW SQL:** 
   - All database queries MUST be written as Raw SQL using parameterized queries via the `@neondatabase/serverless` Pool.
   - ALL Raw SQL queries MUST be encapsulated inside Next.js API Routes (`app/api/...`).
   - NEVER execute database queries directly inside React Components (Client or Server).
3. **AVOID RESERVED KEYWORDS:**
   - Always double-check PostgreSQL reserved keywords when writing Raw SQL queries or creating new tables/columns to prevent unexpected syntax errors.
4. **COMPONENT ARCHITECTURE:**
   - UI Components must be modular and placed in `/components/ui`.
   - Never use inline styles (e.g., `style={{ color: 'red' }}`). Always use Tailwind CSS.
   - Use `clsx` and `tailwind-merge` for dynamic class names.
   - Charts must be placed in `/components/charts` and marked with `"use client"`.

## 4. Coding Conventions
- Prefer early returns to avoid deep nesting.
- Write descriptive variable names.
- Keep Client Components (`"use client"`) as thin as possible. Push heavy data transformation to the API Routes.
- Always handle loading states and error states gracefully in the UI.