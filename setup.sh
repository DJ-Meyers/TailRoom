#!/bin/bash
set -e

if [ -f .env ]; then
  echo ".env already exists, skipping."
else
  cp .env.example .env
  echo "Created .env from .env.example — fill in your Clerk keys before running the app."
fi

pnpm install
