#!/usr/bin/env bash
# Proof for create-release-at-sha.mjs (run from repo root).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export GH_RELEASE_STUB=1
export GITHUB_REPOSITORY="proof/cruxgroup"
export GITHUB_TOKEN="proof-token"
export GITHUB_REF=refs/heads/main

run_proof() {
  local label="$1"
  shift
  local SCRATCH
  SCRATCH="$(mktemp -d)"
  trap 'rm -rf "$SCRATCH"' RETURN

  echo "=== ${label} ==="
  cd "$SCRATCH"
  git init -b main
  git config user.email "proof@cruxgroup.in"
  git config user.name "proof"

  "$@"

  node "$ROOT/.github/scripts/create-release-at-sha.mjs"
  echo
}

proof_feat_ahead_of_release_sha() {
  echo "base" > f.txt
  git add f.txt
  git commit -m "chore(CWA-26): base"
  git tag v1.0.0

  echo "feat1" >> f.txt
  git add f.txt
  git commit -m "feat(CWA-26): first feature"
  FEAT1=$(git rev-parse HEAD)

  echo "feat2" >> f.txt
  git add f.txt
  git commit -m "feat(CWA-26)!: breaking change on main tip only"
  FEAT2=$(git rev-parse HEAD)

  git reset --hard "$FEAT2"
  export RELEASE_SHA="$FEAT1"
  export GITHUB_SHA="$FEAT1"
}

proof_chore_only_since_tag() {
  echo "base" > f.txt
  git add f.txt
  git commit -m "chore(CWA-26): base"
  git tag v1.0.0

  echo "chore1" >> f.txt
  git add f.txt
  git commit -m "chore(CWA-26): housekeeping only"
  CHORE=$(git rev-parse HEAD)

  echo "chore2" >> f.txt
  git add f.txt
  git commit -m "ci(CWA-26): ci-only on main tip"
  TIP=$(git rev-parse HEAD)
  git reset --hard "$TIP"

  export RELEASE_SHA="$CHORE"
  export GITHUB_SHA="$CHORE"
}

run_proof "Proof 1: main at feat! after RELEASE_SHA → must be v1.1.0 (not v2.0.0)" proof_feat_ahead_of_release_sha
run_proof "Proof 2: only chore/ci since last tag → exit 0, no release" proof_chore_only_since_tag
