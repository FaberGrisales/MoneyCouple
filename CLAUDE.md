# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install (run from repo root)
pnpm install

# Dev servers
pnpm dev                                    # all apps in parallel
pnpm --filter @moneycouple/api dev          # API only (port 3000)
pnpm --filter @moneycouple/mobile dev       # Expo only (port 8081)

# Type-check (must build shared packages first)
pnpm --filter @moneycouple/shared-types build
pnpm --filter @moneycouple/shared-utils build
pnpm --filter @moneycouple/database build
pnpm typecheck                              # all workspaces

# Lint
pnpm lint
pnpm lint:fix

# Database (run from repo root)
pnpm db:generate    # regenerate Prisma client after schema changes
pnpm db:migrate     # create + apply a new migration
pnpm db:seed        # wipe and re-seed with Colombian test data
pnpm db:studio      # Prisma Studio at localhost:5555
pnpm db:reset       # drop + recreate + reseed (dev only)

# Expo mobile (from apps/mobile)
npx expo start --clear    # always use --clear to avoid stale bundle errors
npx expo-doctor           # verify SDK compatibility

# Local services (Docker required)
bash scripts/setup-dev.sh   # one-shot: Docker up → migrate → seed → build
docker compose up -d        # start PostgreSQL 16, MongoDB 7, Redis 7
```

## Architecture

### Monorepo layout

```
apps/api/       Fastify v5 REST API
apps/mobile/    React Native + Expo SDK 52 (file-based routing via Expo Router)
packages/
  shared-types/   TypeScript enums + interfaces — source of truth for all types
  shared-utils/   Pure utils: formatCOP/formatCOPFull/parseCOP, Result<T,E>
  database/       Prisma schema (PostgreSQL) + Mongoose schemas (MongoDB)
  ui/             (stub) React Native component library
  ai-services/    (stub) Gemini wrappers
```

`typecheck` and `build` tasks depend on `^build`, so shared packages must be compiled before apps can be type-checked.

### Error handling — Result<T, E>

All service-layer functions return `Result<T, E>` from `@moneycouple/shared-utils`, never throw:

```ts
import { ok, err, isOk } from '@moneycouple/shared-utils';

const result = await geminiService.procesarFactura(base64);
if (!isOk(result)) return reply.status(500).send({ error: result.error.message });
return reply.send({ data: result.value });
```

Never use `throw`/`try-catch` at call sites. `GeminiService` and future service classes follow this pattern.

### Database layer

- **PostgreSQL** (via Prisma) — primary data: User, Pareja, Gasto, Cartera, Meta, Division, Notificacion, Sesion.
- **MongoDB** (via Mongoose) — AI analysis results only: `AnalisisIA`, `TranscripcionVoz`, `EventosUsuario` schemas in `packages/database/src/mongodb/schemas/`.
- Prisma client is generated to `packages/database/generated/prisma-client/` (gitignored). Run `pnpm db:generate` after any schema change.
- The API accesses Prisma through a Fastify plugin (`apps/api/src/plugins/prisma.plugin.ts`) that decorates the app with `app.prisma`.
- MongoDB is connected at API startup in `server.ts` via `connectMongo()` from `@moneycouple/database`.

### API structure

`apps/api/src/`

- `env.ts` — Zod schema validates all env vars at startup; process exits with clear field-level errors if any are missing.
- `app.ts` — registers all Fastify plugins and mounts route prefixes (`/api/v1/gastos`, etc.).
- `plugins/` — cors, helmet, rate-limit, prisma, redis, swagger.
- `routes/<resource>/` — all route handlers are currently 501 stubs; implement here in Phase 3+.
- `services/ia/gemini.service.ts` — `GeminiService` wraps Gemini 2.0 Flash for `procesarFactura`, `parsearTextoGasto`, `categorizarGasto`, `generarInsights`.

### Mobile structure

`apps/mobile/app/` uses Expo Router file-based routing:

- `index.tsx` — redirects immediately to `/(tabs)` (auth bypass for dev).
- `(auth)/` — onboarding, login, register (not wired to real auth yet).
- `(tabs)/` — home, analytics, wallets, profile; custom `BottomTabBar` with FAB.
- `gasto/` — nuevo (modal), chat, foto, voz, manual screens.
- `pareja/dashboard.tsx`, `analisis.tsx`, `carteras.tsx` — stubs.

**Theme system**: `useTheme()` from `hooks/useTheme.tsx` provides `{ t, dark, accent, accentDark, toggleDark, setAccent }`. `t` is the current `MC_TOKENS.light|dark` token set. All components consume this — never hardcode colours.

**Icons**: `MCIcon` (`components/ui/MCIcon.tsx`) renders 40+ inline SVG icons via `react-native-svg`. Add new icons there; do not add an icon library dependency.

**Currency**: always use `formatCOP` (compact: `$45K`, `$1.5M`) or `formatCOPFull` (locale: `$1.547.800`) from `@moneycouple/shared-utils`. Currency is always COP.

### TypeScript strictness

`tsconfig.base.json` enables `exactOptionalPropertyTypes: true` and `noUncheckedIndexedAccess: true`. This means:

- Optional properties cannot be explicitly set to `undefined`; use conditional spread: `...(val != null && { field: val })`.
- Array/object index access returns `T | undefined`; use `arr[i]!` only when you know the index is valid.
- The `database` package uses `moduleResolution: bundler`; the `api` package uses `node` (CommonJS).

### Local dev credentials (docker-compose)

```
PostgreSQL: postgresql://moneycouple:mc_dev_pass@localhost:5432/moneycouple_dev
MongoDB:    mongodb://moneycouple:mc_dev_pass@localhost:27017/moneycouple_ia
Redis:      redis://:mc_dev_pass@localhost:6379
```

Test users seeded: `juan@moneycouple.co`, `maria@moneycouple.co` (pareja, premium), `sebastian@moneycouple.co`, `laura@moneycouple.co` (pareja), `carlos@moneycouple.co` (individual).

### Build dependency chain

```
shared-types → shared-utils → database → api
shared-types → shared-utils → mobile (via tsconfig paths, no build needed for mobile)
```

Mobile resolves `@moneycouple/shared-*` directly from source via `tsconfig.json` paths — no build step needed for mobile dev. The API requires compiled `dist/` from those packages.
