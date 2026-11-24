#!/usr/bin/env bash
# List recent GitHub Actions runs for the current branch.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

REPO="${GITHUB_REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
BRANCH="${1:-$(git branch --show-current)}"
LIMIT="${2:-8}"

gh run list --repo "$REPO" --branch "$BRANCH" --limit "$LIMIT"