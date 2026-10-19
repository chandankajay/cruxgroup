#!/usr/bin/env bash
# Prints Vercel CLI invocations from the repository root (no --cwd).
# Vercel project Root Directory must stay apps/<app> in the dashboard — do not cd into it in CI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP="${1:-web}"
MODE="${2:-dev}"

case "$APP" in
  web) DEV_ALIAS="dev.cruxgroup.in" ;;
  admin) DEV_ALIAS="dev-admin.cruxgroup.in" ;;
  bookings) DEV_ALIAS="dev-bookings.cruxgroup.in" ;;
  *) DEV_ALIAS="dev.${APP}.cruxgroup.in" ;;
esac

echo "Repository root (cwd for all commands): $ROOT"
echo "Vercel project Root Directory setting: apps/${APP}"
echo "Do NOT pass --cwd apps/${APP} — that doubles the path with Root Directory."
echo

case "$MODE" in
  dev)
    echo "vercel pull --yes --environment=preview"
    echo "vercel build"
    echo "url=\$(vercel deploy --prebuilt --archive=tgz)"
    echo "# CI only: alias if origin/main tip still equals GITHUB_SHA for this deploy run"
    echo "origin_main=\$(git ls-remote origin refs/heads/main | cut -f1)"
    echo "if [ \"\$origin_main\" = \"\$GITHUB_SHA\" ]; then"
    echo "  vercel alias set \"\$url\" \"${DEV_ALIAS}\" --scope \"\$VERCEL_ORG_ID\""
    echo "else"
    echo "  echo 'main has moved past this commit; skipping alias'"
    echo "fi"
    ;;
  prod-build)
    echo "vercel pull --yes --environment=production"
    echo "vercel build --prod"
    echo "url=\$(vercel deploy --prebuilt --prod --skip-domain --archive=tgz)"
    ;;
  promote)
    echo "vercel promote \"<deployment-url>\" --yes"
    ;;
  *)
    echo "Usage: $0 [web|admin|bookings] [dev|prod-build|promote]"
    exit 1
    ;;
esac
