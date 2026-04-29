#!/usr/bin/env bash
# MoneyCouple — Development Setup Script
# Run this once to set up your local development environment.
# Usage: bash scripts/setup-dev.sh

set -euo pipefail

RESET='\033[0m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'

ok()   { echo -e "${GREEN}✓${RESET}  $*"; }
warn() { echo -e "${YELLOW}⚠${RESET}   $*"; }
info() { echo -e "${CYAN}→${RESET}  $*"; }
fail() { echo -e "${RED}✗${RESET}  $*" >&2; exit 1; }

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo ""
echo "  ╔══════════════════════════════════╗"
echo "  ║   MoneyCouple Dev Setup v1.0     ║"
echo "  ╚══════════════════════════════════╝"
echo ""

# ── Step 1: Check Docker ──────────────────────────────────────────────────────
info "Checking Docker..."
if ! docker info &>/dev/null; then
  warn "Docker is not accessible without sudo. Adding your user to the docker group..."
  sudo usermod -aG docker "$USER"
  warn "You need to log out and back in (or run 'newgrp docker') for group changes to take effect."
  warn "Then re-run this script."
  info "Running with sudo for now..."
  DOCKER_CMD="sudo docker"
else
  DOCKER_CMD="docker"
  ok "Docker ready"
fi

# ── Step 2: Start services ─────────────────────────────────────────────────────
info "Starting PostgreSQL, MongoDB, Redis..."
$DOCKER_CMD compose up -d

info "Waiting for PostgreSQL to be healthy..."
for i in $(seq 1 20); do
  if $DOCKER_CMD compose exec -T postgres pg_isready -U moneycouple -d moneycouple_dev &>/dev/null; then
    ok "PostgreSQL ready"
    break
  fi
  sleep 2
  if [ "$i" -eq 20 ]; then
    fail "PostgreSQL did not become ready in time"
  fi
done

info "Waiting for MongoDB to be healthy..."
for i in $(seq 1 15); do
  if $DOCKER_CMD compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null 2>&1; then
    ok "MongoDB ready"
    break
  fi
  sleep 2
  if [ "$i" -eq 15 ]; then
    warn "MongoDB not ready — AI storage will be skipped during seed"
    break
  fi
done

# ── Step 3: Install dependencies ──────────────────────────────────────────────
info "Installing dependencies..."
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
pnpm install
ok "Dependencies installed"

# ── Step 4: Approve Prisma build scripts ──────────────────────────────────────
info "Approving Prisma build scripts..."
printf 'a\n' | pnpm --filter @moneycouple/database exec prisma generate 2>/dev/null || \
  pnpm --filter @moneycouple/database exec prisma generate
ok "Prisma client generated"

# ── Step 5: Run migration ─────────────────────────────────────────────────────
info "Running database migration..."
cd "$ROOT/packages/database"
DATABASE_URL="postgresql://moneycouple:mc_dev_pass@localhost:5432/moneycouple_dev?schema=public" \
  npx prisma migrate deploy
ok "Migration applied"
cd "$ROOT"

# ── Step 6: Run seed ──────────────────────────────────────────────────────────
info "Seeding database..."
pnpm --filter @moneycouple/database db:seed
ok "Database seeded"

# ── Step 7: Build shared packages ────────────────────────────────────────────
info "Building shared packages..."
pnpm --filter @moneycouple/shared-types build
pnpm --filter @moneycouple/shared-utils build
ok "Shared packages built"

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║   ✅  Setup complete!                                ║"
echo "  ╠══════════════════════════════════════════════════════╣"
echo "  ║                                                      ║"
echo "  ║   Start the API:     pnpm --filter @moneycouple/api dev   ║"
echo "  ║   Start mobile:      pnpm --filter @moneycouple/mobile dev║"
echo "  ║   Prisma Studio:     pnpm db:studio                  ║"
echo "  ║                                                      ║"
echo "  ║   Test users:                                        ║"
echo "  ║     juan@moneycouple.co   (premium, pareja)          ║"
echo "  ║     maria@moneycouple.co  (premium, pareja)          ║"
echo "  ║     carlos@moneycouple.co (individual)               ║"
echo "  ║                                                      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
