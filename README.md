# Blood Donation Management System

A Next.js + Express/Postgres app for connecting hospitals that need blood with donors who can help, with role-specific donor, hospital, and admin flows.

## Workspace

This repo uses Bun workspaces and Turborepo.

- `apps/web` - Next.js App Router frontend
- `apps/server` - TypeScript Express API
- `docker-compose.yml` - local Postgres database

## Prerequisites

- Bun 1.3.x
- Docker Desktop, or a local PostgreSQL 15+ instance

## Quick Start

Install dependencies from the repo root:

```bash
bun install
```

Start Postgres:

```bash
docker compose up -d db
```

Reset and seed the database:

```bash
bun run db:reset
bun run seed:demo
```

Start both development servers:

```bash
bun run dev
```

Useful URLs:

- Web: http://localhost:3000
- API: http://localhost:5000

## Common Commands

```bash
bun run dev          # run web and API through Turborepo
bun run dev:web      # run only the Next.js app
bun run dev:server   # run only the Express API
bun run build        # build all packages
bun run typecheck    # typecheck all packages
bun run lint         # lint/check all packages
```

## Environment

The default local database matches `docker-compose.yml`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=blood_donation
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The API currently defaults to those local database values when no `.env` is present. Add package-specific env files when needed:

- `apps/server/.env` for API/database settings
- `apps/web/.env.local` for browser-visible Next.js settings such as `NEXT_PUBLIC_API_URL`

## Demo Users

After seeding:

| Role | Email | Password |
| --- | --- | --- |
| Donor | donor1@lifedrops.demo | Demo@123 |
| Hospital | hospital1@lifedrops.demo | Demo@123 |
| Admin | admin@lifedrops.demo | Admin@123 |

## Notes

- Bun is the package manager for this repo; `bun.lock` is the workspace lockfile.
- Turborepo package tasks live in each package. The root `package.json` only delegates through `turbo run`.
- The server source is TypeScript in `apps/server/src` and compiles to `apps/server/dist`.
