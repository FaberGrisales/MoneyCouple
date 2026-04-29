# MoneyCouple

Personal & couples expense tracking with AI — powered by Gemini 2.0 Flash.

## Stack

- **Mobile**: React Native + Expo (SDK 52), Expo Router, Zustand, TanStack Query, NativeWind
- **API**: Fastify v5, Prisma ORM, PostgreSQL, MongoDB, Redis, Socket.io
- **AI**: Google Gemini 2.0 Flash (invoice OCR, natural language, insights)
- **Storage**: Cloudflare R2
- **Auth**: Clerk + JWT

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### 1. Clone and install

```bash
git clone https://github.com/FaberGrisales/MoneyCouple.git
cd MoneyCouple
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your API keys and database URLs
```

### 3. Set up the database

```bash
pnpm db:push      # Push Prisma schema to your DB
pnpm db:seed      # Seed sample data (5 users, 2 couples, 50+ transactions)
```

### 4. Run development

```bash
pnpm dev          # Starts API (port 3000) + mobile (Expo)
```

Or run individually:

```bash
pnpm --filter @moneycouple/api dev       # API only
pnpm --filter @moneycouple/mobile dev    # Mobile only
```

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm dev`        | Start all apps in parallel           |
| `pnpm build`      | Build all packages and apps          |
| `pnpm lint`       | Run ESLint across the monorepo       |
| `pnpm typecheck`  | TypeScript type checking             |
| `pnpm test`       | Run all tests                        |
| `pnpm db:push`    | Push Prisma schema without migration |
| `pnpm db:migrate` | Create and run a new migration       |
| `pnpm db:seed`    | Seed the database with sample data   |
| `pnpm db:studio`  | Open Prisma Studio                   |

## Project Structure

```
moneycouple/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   └── api/             # Fastify REST API
├── packages/
│   ├── shared-types/    # Shared TypeScript types & enums
│   ├── shared-utils/    # Currency formatters, date utils, Result pattern
│   ├── shared-config/   # Shared configs
│   ├── database/        # Prisma schema + Mongoose schemas
│   ├── ui/              # React Native component library
│   └── ai-services/     # Gemini API wrappers
├── docs/
│   └── architecture.md  # Architecture overview
├── .env.example         # Environment variable template
└── turbo.json           # Turborepo pipeline config
```

## AI Features

- **Foto de factura** → Gemini OCR extracts merchant, items, total, category
- **Chat natural** → "Gasté 50 mil en Starbucks" → structured expense
- **Voz** → Speech-to-text → same chat flow
- **Insights** → Weekly spending patterns, anomaly detection, savings suggestions

## Couple Features

- Link partner with a 4-digit code
- Real-time sync via Socket.io
- Automatic expense splitting by income ratio, 50/50, or custom
- Privacy controls per expense

## License

Private. All rights reserved.
