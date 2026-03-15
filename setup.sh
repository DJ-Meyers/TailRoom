#!/bin/bash
set -e

if [ -f .env ]; then
  echo ".env already exists, skipping."
else
  echo "Setting up .env file..."
  echo ""

  read -p "CLERK_SECRET_KEY: " clerk_secret
  read -p "VITE_CLERK_PUBLISHABLE_KEY: " clerk_pub
  read -p "DATABASE_URL [postgresql://postgres:postgres@localhost:5432/tailroom]: " db_url
  db_url=${db_url:-postgresql://postgres:postgres@localhost:5432/tailroom}

  cat > .env <<EOF
# Clerk Authentication
CLERK_SECRET_KEY=$clerk_secret
VITE_CLERK_PUBLISHABLE_KEY=$clerk_pub

# Database
DATABASE_URL=$db_url

# Development Only (Optional)
# VITE_DEV_BYPASS_AUTH=true
# VITE_DEV_USER_ID=dev-user
EOF

  echo ""
  echo ".env created successfully."
fi

pnpm install
