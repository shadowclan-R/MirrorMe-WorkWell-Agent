# MirrorMe WorkWell Copilot Guide

## Big picture
- MirrorMe WorkWell is a Next.js 16 + React 19 app under `web-app/` that captures employee wellbeing check-ins and stores analytics in Supabase.
- User flow: `CheckInForm` collects mood text, calls `/api/analyze-sentiment` then `/api/check-in`, which writes to Supabase and returns risk + recommendation.
- IBM watsonx Orchestrate integrates through `agent-skills/openapi.yaml`, so any breaking change to routes must keep request/response shapes in sync with that spec.

## Frontend patterns
- App Router is used; top-level layout in `app/layout.tsx` and single page `app/page.tsx`.
- Interactive components live in `components/` and must be marked `'use client'`; they rely on Tailwind CSS v4 utilities imported via `app/globals.css`.
- Keep UI state transitions simple: `CheckInForm` shows either the form or the animated result panel (`framer-motion`), so reuse this pattern for new flows.
- `@/*` paths resolve from `web-app/` per `tsconfig.json`; prefer these imports over relative paths.

## API + services
- API handlers live under `app/api/**/route.ts` and always respond via `NextResponse.json(...)`.
- `/api/analyze-sentiment` is currently a mocked Hugging Face call; replace the TODO with a real fetch but keep the `{ sentiment, score, emotion }` contract.
- `/api/check-in` persists check-ins to Supabase, derives `riskLevel` with simple mood/sentiment rules, and inserts complementary analysis rows—extend the rule set here instead of branching in the client.
- `/api/hr/summary` aggregates risk stats for today and the past 7 days by joining `analysis_logs` → `daily_checkins` → `employees`; match that join pattern when adding analytics endpoints.

## Supabase + data
- Server-side Supabase access is centralized in `lib/supabaseServer.ts`, which requires both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; the module throws on missing envs, so set them before running any tests.
- Schema files live in `db/schema.sql` and `db/seed.sql`; apply them through Supabase SQL editor or `psql` when bootstrapping local data.
- The service role key enables row inserts—never expose it to client components and keep `.env.local` out of version control even though a sample exists in the repo.

## Developer workflows
- Install deps in `web-app/`, then use `npm run dev` for local preview, `npm run lint` (Next core-web-vitals rules) before committing, and `npm run build` to sanity-check production output.
- Supabase must be reachable for API routes; without it, `/api/check-in` and `/api/hr/summary` will fail—mock those calls in tests instead of hitting the real DB.
- When adding routes consumed by IBM Orchestrate, update `agent-skills/openapi.yaml` first to keep contract drift visible.

## Conventions & tips
- Stick to strict TypeScript and keep server handlers typed with explicit narrow unions like the `RiskLevel` alias in `hr/summary`.
- Reuse the two-step sentiment+check-in pipeline so orchestration flows stay predictable; e.g., new channels should post to `/api/check-in` with `channel` overridden rather than creating parallel tables.
- Capture all AI-generated logic in Supabase `analysis_logs` to maintain auditability—extend that table instead of storing insights on `daily_checkins`.
- Logging is intentionally minimal; prefer `console.error` for operational failures and surface user-friendly messages to the client.

## Engineering principles & SOLID Guardrails
This project enforces strict engineering standards to ensure scalability and maintainability, especially as the UI evolves.

### Core Mindset
- **DRY (Don't Repeat Yourself):** Centralize logic. If you copy-paste code (e.g., Supabase inserts, risk calculation), refactor it into a shared helper or hook immediately.
- **Clean Cuts & Separation of Concerns:**
  - **UI Components (e.g., Forms):** strictly for rendering and user interaction. NO business logic or direct DB calls here.
  - **API Routes/Services:** handle all business logic, validation, and data persistence.
  - **Decoupling:** The backend should not know or care about the specific UI component calling it.

### SOLID Principles
- **Single Responsibility Principle (SRP):** Each module/class/function should have one reason to change.
  - *Example:* `CheckInForm` handles input collection only. `api/check-in` handles data saving. `analyze-sentiment` handles AI processing.
- **Open/Closed Principle (OCP):** Software entities should be open for extension, but closed for modification.
  - *Strategy:* Extend functionality via configuration, plugins, or new route handlers rather than rewriting existing, tested core logic.
- **Liskov Substitution Principle (LSP):** Subtypes must be substitutable for their base types.
  - *Application:* Ensure any mock services (like a mock sentiment analyzer) return the exact same contract/shape as the real implementation so they can be swapped seamlessly.
- **Interface Segregation Principle (ISP):** Clients should not be forced to depend on interfaces they do not use.
  - *Practice:* Expose lean, specific return types from API endpoints. Don't return a massive "User" object if the client only needs "RiskLevel".
- **Dependency Inversion Principle (DIP):** High-level modules should not depend on low-level modules. Both should depend on abstractions.
  - *Implementation:* Inject dependencies (like Supabase clients or configuration) rather than hardcoding them deep in the logic. Use `supabaseServer.ts` as an abstraction layer.
