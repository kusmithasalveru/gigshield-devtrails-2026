#!/bin/bash
# ============================================================
# GigShield - Database Migration
# Runs the PostgreSQL schema against your database
# ============================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA_FILE="$ROOT_DIR/docs/db-schema.sql"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  GigShield - Database Migration"
echo "=========================================="

# Load DATABASE_URL from .env if available
if [ -f "$ROOT_DIR/backend/api-gateway/.env" ]; then
    source "$ROOT_DIR/backend/api-gateway/.env"
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}DATABASE_URL not set.${NC}"
    echo ""
    echo "Options:"
    echo "  1. Set it in backend/api-gateway/.env"
    echo "  2. Export it: export DATABASE_URL=postgresql://user:pass@host:5432/gigshield"
    echo "  3. Pass it directly: DATABASE_URL=... bash scripts/db-migrate.sh"
    echo ""

    # Default to local
    read -p "Use default local connection (postgresql://localhost:5432/gigshield)? [Y/n]: " answer
    if [ "$answer" != "n" ] && [ "$answer" != "N" ]; then
        DATABASE_URL="postgresql://localhost:5432/gigshield"
    else
        exit 1
    fi
fi

echo ""
echo "Connecting to: ${DATABASE_URL%%@*}@***"
echo "Running schema: $SCHEMA_FILE"
echo ""

if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f "$SCHEMA_FILE"

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Migration complete!${NC}"
        echo ""
        echo "Tables created:"
        psql "$DATABASE_URL" -c "\dt" 2>/dev/null
    else
        echo -e "\n${RED}✗ Migration failed.${NC}"
        echo "Check your DATABASE_URL and ensure PostgreSQL is running."
        exit 1
    fi
else
    echo -e "${YELLOW}psql not found.${NC}"
    echo ""
    echo "Alternatives:"
    echo "  1. Install PostgreSQL client: apt install postgresql-client"
    echo "  2. Use Supabase SQL Editor: paste contents of docs/db-schema.sql"
    echo "  3. Use pgAdmin to import the SQL file"
    exit 1
fi
