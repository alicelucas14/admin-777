#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/apps/stars777}"
ENV_FILE="${ENV_FILE:-/etc/stars777.env}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

npm run install:all
npm run build

set -a
source "$ENV_FILE"
set +a

pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
sudo systemctl reload nginx

echo "Deployment complete for branch $BRANCH"