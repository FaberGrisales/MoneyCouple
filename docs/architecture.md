# MoneyCouple — Architecture

## Overview

MoneyCouple is a Turborepo monorepo with two primary apps (`mobile`, `api`) and shared packages.

## Packages

| Package         | Purpose                                                             |
| --------------- | ------------------------------------------------------------------- |
| `shared-types`  | TypeScript interfaces & enums shared by all apps                    |
| `shared-utils`  | Pure utility functions (currency formatting, dates, Result pattern) |
| `shared-config` | Shared ESLint, TypeScript, and build configurations                 |
| `database`      | Prisma schema + Mongoose schemas + generated client                 |
| `ui`            | React Native component library                                      |
| `ai-services`   | Gemini API wrappers                                                 |

## Apps

### Mobile (`apps/mobile`)

- React Native + Expo SDK 52
- Expo Router (file-based routing)
- Zustand for local state
- TanStack Query for server state
- NativeWind (Tailwind CSS for React Native)

### API (`apps/api`)

- Fastify v5 + TypeScript
- Prisma ORM → PostgreSQL (Supabase)
- Mongoose → MongoDB Atlas (AI results)
- Redis (Upstash) for caching
- Socket.io for real-time couple sync
- Gemini 2.0 Flash for AI processing

## Data Flow

```
Mobile → REST API → PostgreSQL (primary data)
Mobile ← Socket.io ← API (real-time couple events)
Mobile → POST /ia/procesar-factura → Gemini API → MongoDB (results) → PostgreSQL (gasto)
```

## Authentication

JWT tokens with Clerk as identity provider. Mobile stores tokens in expo-secure-store.

## Error Handling

All service calls return a `Result<T, E>` type (either `{ ok: true, value }` or `{ ok: false, error }`). This eliminates try/catch at call sites and makes error paths explicit.
