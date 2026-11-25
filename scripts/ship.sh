#!/usr/bin/env bash
# Push the current branch, open a PR to main if needed, print the PR URL, watch CI.
# Needs: git, gh auth login (https://cli.github.com/)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run once: gh auth login"
  exit 1
fi

BRANCH="$(git branch --show-current)"
BASE="${SHIP_BASE_BRANCH:-main}"

if [[ -z "$BRANCH" ]]; then
  echo "Not on a branch (detached HEAD?). Checkout a feature branch first."
  exit 1
fi

if [[ "$BRANCH" == "$BASE" ]]; then
  echo "You are on '$BASE'. Protected main merges via PR — work on a feature branch:"
  echo "  git checkout -b my-change"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Uncommitted changes. Commit or stash before shipping."
  git status -sb
  exit 1
fi

REPO="${GITHUB_REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
echo "Repo:   $REPO"
echo "Branch: $BRANCH → $BASE"
echo ""

echo "→ git push -u origin HEAD"
git push -u origin HEAD
echo ""

PR_URL="$(gh pr list --repo "$REPO" --head "$BRANCH" --base "$BASE" --state open --json url --jq '.[0].url // empty')"

if [[ -n "$PR_URL" ]]; then
  echo "Open PR already exists:"
  echo "  $PR_URL"
else
  echo "→ gh pr create --base $BASE --head $BRANCH --fill"
  gh pr create --repo "$REPO" --base "$BASE" --head "$BRANCH" --fill
  PR_URL="$(gh pr view --repo "$REPO" --json url -q .url)"
  echo ""
  echo "PR: $PR_URL"
fi

echo ""
echo "→ yarn ci:watch $BRANCH"
exec bash "$ROOT/scripts/watch-ci.sh" "$BRANCH"