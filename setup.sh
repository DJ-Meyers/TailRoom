#!/bin/bash
set -e

# Copy .env from the main repo (worktrees don't have their own)
MAIN_REPO=$(git rev-parse --git-common-dir | sed 's|/\.git$||; s|/\.git/worktrees/.*||')

if [ -f "$MAIN_REPO/.env" ]; then
  echo "Copying .env from main repo..."
  cp "$MAIN_REPO/.env" .env
else
  echo "Error: No .env found in main repo ($MAIN_REPO)"
  echo "Create one from .env.example first."
  exit 1
fi

# Derive a database name from the worktree directory name
WORKTREE_NAME=$(basename "$PWD")
DB_NAME="tailroom_${WORKTREE_NAME}"
# Sanitize: replace non-alphanumeric chars with underscores
DB_NAME=$(echo "$DB_NAME" | sed 's/[^a-zA-Z0-9_]/_/g')

echo "Creating database $DB_NAME..."
createdb "$DB_NAME" 2>/dev/null || echo "Database $DB_NAME already exists, skipping."

# Update DATABASE_URL in .env using the current system user (macOS Postgres default)
PG_USER=$(whoami)
sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://$PG_USER@localhost:5432/$DB_NAME|" .env

echo "Installing dependencies..."
pnpm install

echo "Running migrations..."
pnpm db:migrate

echo "Seeding database..."
pnpm db:seed

echo ""
echo "Setup complete! Database: $DB_NAME"
