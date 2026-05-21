#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Fortuna recording preflight =="
echo

echo "1) Typecheck"
pnpm typecheck

echo
echo "2) Build"
pnpm build

echo
echo "3) Hedera testnet account"
pnpm setup:testnet

echo
echo "4) HCS topic"
if ! grep -q '^HEDERA_FORTUNE_TOPIC_ID=.' .env 2>/dev/null; then
  echo "No HEDERA_FORTUNE_TOPIC_ID found in .env; creating topic..."
  pnpm setup:topic
else
  echo "HEDERA_FORTUNE_TOPIC_ID already set."
fi

echo
echo "5) Scripted demo smoke test"
pnpm demo --scenario A

echo
echo "Ready to record. Run: pnpm chat"
echo "Suggested prompts:"
echo "  first PR jitters"
echo "  launch day nerves"
