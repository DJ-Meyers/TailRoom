#!/bin/bash
set -e

# Find the main repo's git-crypt key (worktrees don't have their own)
MAIN_GIT_DIR=$(git rev-parse --git-common-dir)
KEY_FILE="$MAIN_GIT_DIR/git-crypt/keys/default"

if [ ! -f "$KEY_FILE" ]; then
  echo "Error: git-crypt key not found at $KEY_FILE"
  echo "Make sure git-crypt is unlocked in the main repo first."
  exit 1
fi

echo "Unlocking git-crypt..."
git-crypt unlock "$KEY_FILE"

# Derive a database name from the worktree directory name
WORKTREE_NAME=$(basename "$PWD")
DB_NAME="tailroom_${WORKTREE_NAME}"
# Sanitize: replace non-alphanumeric chars with underscores
DB_NAME=$(echo "$DB_NAME" | sed 's/[^a-zA-Z0-9_]/_/g')

echo "Creating database $DB_NAME..."
createdb "$DB_NAME" 2>/dev/null || echo "Database $DB_NAME already exists, skipping."

# Update DATABASE_URL in .env
sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:postgres@localhost:5432/$DB_NAME|" .env

echo "Installing dependencies..."
pnpm install

echo "Running migrations..."
pnpm db:migrate

echo ""
echo "Setup complete! Database: $DB_NAME"
