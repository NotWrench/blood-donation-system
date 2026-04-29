# Blood donation system — modernization plan

## Goals

1. **Monorepo with Bun + Turborepo** — one toolchain (`bun`), shared tasks and caching (`turbo`), clear boundaries between apps and optional shared packages.
2. **Full TypeScript** — type-safe frontend and API; shared types or contracts between client and server where it pays off.
3. **UI refresh with shadcn/ui** — rebuild layout, navigation, and screens using shadcn components on Tailwind v4 (already in use); consistent spacing, typography, and accessibility.
4. **End-to-end working product** — donor / hospital / admin flows backed by Postgres; auth, CRUD, and dashboards usable in dev (Docker DB + documented env).

---

## Current baseline (starting point)

| Area | Today |
|------|--------|
| Frontend | Next.js App Router (`app/`), React 19, Tailwind CSS v4 |
| API | Express in `server/` (JavaScript), JWT + bcrypt + `pg` |
| DB | Postgres via `docker-compose.yml`, Drizzle deps at root (align schema/migrations with actual usage) |
| Roles | Donor, hospital, admin + dashboard routes |

---

## Target architecture

- **Workspace layout** (typical Turborepo + Bun):

  - `apps/web` — Next.js (existing app migrated here **or** root kept as web with workspace packages; pick one layout and stick to it).
  - `apps/server` — HTTP API (Express migrated to TypeScript, or incremental `.ts` with shared `tsconfig`).
  - Optional: `packages/config-typescript`, `packages/database` (Drizzle schema/migrations shared), `packages/shared` (types, validators).

- **Package manager**: Bun at repo root (`package.json` workspaces); lockfile via Bun.

- **Quality**: Keep Ultracite/Biome checks (`bun x ultracite fix` / `check`) in CI and before commits.

---

## Phases

### Phase 1 — Turborepo + Bun foundation

- Add root `turbo.json`, Bun workspaces, and scripts: `dev`, `build`, `lint`, `db:*` as needed.
- Move or alias existing `apps` so `turbo run build` succeeds for web + server.
- Document: Node/Bun version, `docker compose up` for Postgres, required `.env` keys for API and Next.js API base URL.

**Done when**: From a clean clone, `bun install` + `turbo run build` (and dev servers) work without undocumented manual steps.

### Phase 2 — TypeScript on the API

- Introduce TypeScript for `server`: `tsconfig`, typed Express handlers, typed DB layer (`pg` or Drizzle — align with existing Drizzle usage at root).
- Shared types for API request/response bodies (manual types or Zod → inferred types).

**Done when**: Server builds with `tsc` / bundler; no remaining `.js` entrypoints unless intentionally excluded.

### Phase 3 — shadcn/ui and layout overhaul

- Ensure `components.json` and shadcn primitives live with the Next app; add components incrementally (layout shell, buttons, forms, tables, dialogs).
- Replace ad-hoc markup in `app/` with composed shadcn patterns; unify dashboard/hospital/donor/admin chrome (sidebar/top nav, responsive behavior).
- Keep React Server Components vs client boundaries sensible (forms/auth → client where needed).

**Done when**: Primary flows use shared layout components; visual language is consistent; keyboard/focus basics covered.

### Phase 4 — End-to-end integration

- Trace each role’s critical path: register/login → role-specific home → representative actions (requests, donations, inventory/analytics as applicable).
- Fix broken API URLs, CORS, cookie/token handling, and env mismatches between Next and Express.
- Seed script (`seed:demo` or successor) produces a usable demo dataset.

**Done when**: Manual smoke test checklist passes against local Postgres; optional: minimal Playwright/Cypress happy-path later.

---

## Definition of done (E2E)

- [ ] Auth works for each role (happy path).
- [ ] Core entities persist correctly (requests, donations/inventory where implemented).
- [ ] No console-breaking errors on main journeys; API returns consistent error shapes for validation failures.
- [ ] README describes Bun/Turbo commands, DB startup, and env vars.

---

## Risks and decisions to lock early

- **Monorepo shape**: Whether Next stays at repo root or moves under `apps/web` affects imports and deployment — decide once and migrate in one pass.
- **API ownership**: Keep Express vs later consolidating behind Next Route Handlers is a larger refactor; Phase 2–4 assume Express remains unless explicitly changed.
- **Drizzle**: Confirm whether migrations live next to `apps/web` or `packages/database` and match `server` queries.

---

## Optional stretch (after core plan)

- E2E tests (Playwright) for login + one flow per role.
- Stricter env validation (e.g. Zod) at API startup.
- OpenAPI or typed RPC layer between web and server.
