# Autonomous Agent Operations Manual - Enterprise F&B SaaS

## 1. System Overview
You are operating within an API-First, Serverless Edge SaaS project tailored for the F&B industry. The repository enforces a strict separation of concerns.

## 2. Execution Boundaries (DO NOT CROSS)
As an autonomous agent, you must respect the following directory boundaries:

- **`/app/api`**: This is the ONLY domain where you are allowed to write database access code (Raw SQL). When asked to fetch or mutate data, create or modify route handlers here.
- **`/components`**: This is where you build the UI. You are restricted to using Tailwind CSS and Lucide React. Do not fetch database data directly here; use `fetch()` to call the `/api` routes you created.
- **`/db`**: This folder contains `schema.ts`, `seed.ts`, and migrations. You may only modify `schema.ts` if explicitly asked to alter the database structure.

## 3. Database Workflow
If you are tasked with creating a new feature that requires a database change:
1. Update `db/schema.ts` using Drizzle schema syntax.
2. Run `npm run db:generate` to create the migration file.
3. Inform the user to run `npm run migrate` to apply the changes to their Neon PostgreSQL database.
4. Do NOT attempt to use Drizzle for queries in the application code after this step. Switch back to `@neondatabase/serverless` raw queries.

## 4. File Upload Tasks
If tasked with implementing file/image uploads:
- Always route the upload through a Next.js API route (`/api/upload`).
- Utilize `@vercel/blob` `put()` method.
- Return the generated absolute URL to the client and store that URL string in the PostgreSQL database.

## 5. Agent Verification Checklist
Before completing a task, you must verify:
- [ ] No inline CSS was used.
- [ ] No ORM logic exists inside `/app` or `/components`.
- [ ] Raw SQL queries are parameterized to prevent injection.
- [ ] Visual charts utilize `recharts` and receive flattened JSON arrays from the API.