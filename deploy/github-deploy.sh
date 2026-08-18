#!/usr/bin/env bash
# Invoked over SSH by the "Deploy" GitHub Actions workflow (see
# .github/workflows/deploy.yml) via a forced command in authorized_keys —
# the deploy key can run *only* this script, nothing else.
set -euo pipefail

PROJECT_DIR="/root/projects/CRYSTAL CUBE"
SERVICE_NAME="crystal-b2b.service"

cd "$PROJECT_DIR"

git fetch origin main
git reset --hard origin/main

npm ci
npm run build

systemctl restart "$SERVICE_NAME"
systemctl is-active "$SERVICE_NAME"
