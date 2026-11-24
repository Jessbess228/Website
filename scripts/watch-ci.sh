#!/usr/bin/env bash
# Watch the latest GitHub Actions run for this repo/branch (needs: gh auth login).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  echo "Then: gh auth login"
  exit 1
fi

REPO="${GITHUB_REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
BRANCH="${1:-$(git branch --show-current)}"
WAIT_SECS="${CI_WATCH_WAIT:-45}"

echo "Repo:   $REPO"
echo "Branch: $BRANCH"

RUN_ID=""
for _ in $(seq 1 "$WAIT_SECS"); do
  RUN_ID="$(gh run list --repo "$REPO" --branch "$BRANCH" --limit 1 --json databaseId,status,conclusion,event,createdAt \
    --jq '.[0] | select(. != null) | .databaseId' 2>/dev/null || true)"
  if [[ -n "$RUN_ID" && "$RUN_ID" != "null" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "$RUN_ID" || "$RUN_ID" == "null" ]]; then
  echo "No workflow run found for branch '$BRANCH' (waited ${WAIT_SECS}s)."
  echo "Open a PR or push a branch, then retry: yarn ci:watch"
  exit 1
fi

echo "Watching run $RUN_ID (live logs; Ctrl+C to stop)…"
echo ""

gh run watch "$RUN_ID" --repo "$REPO" --exit-status