#!/bin/bash
# One-command deploy: commit + push.
# Push triggers both deploys in parallel:
#   - Backend:  .github/workflows/deploy-backend.yml (only if backend/** changed) -> SSHes into VM, docker compose rebuild
#   - Frontend: Netlify auto-build on push to main (netlify.toml)
set -e

MSG="${1:-Deploy: $(date '+%Y-%m-%d %H:%M')}"

git add -A

if git diff --cached --quiet; then
  echo "No changes to commit — pushing current HEAD anyway."
else
  git commit -m "$MSG"
fi

git push origin main

echo ""
echo "Pushed to main."
echo "  Frontend: Netlify auto-deploy (check your Netlify dashboard)"

if git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -q '^backend/\|^\.github/workflows/deploy-backend\.yml'; then
  echo "  Backend:  backend/** changed -> watching GitHub Actions run..."
  sleep 5
  gh run watch --exit-status "$(gh run list --workflow=deploy-backend.yml --branch=main --limit=1 --json databaseId --jq '.[0].databaseId')"
else
  echo "  Backend:  no backend/** changes, deploy workflow not triggered."
fi
