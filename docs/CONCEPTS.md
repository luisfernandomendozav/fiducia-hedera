# Fortuna — Concepts

## Why a fortune-cookie agent?

The brief is **"Fun Basic Hedera Agent"**. The two hardest design constraints
are:

1. *Fun* — interaction has to feel delightful, not procedural.
2. *Basic* — one clear use case, no plugins required, easy to understand in a
   60-second video.

A fortune jar is a perfect fit:

- **One verb**: ask, receive.
- **Symmetric exchange**: you give a tiny tip, you get a tiny gift. Both
  sides happen on-chain, both are visible on Hashscan.
- **Universal hook**: everyone has felt curious about what's next. The agent
  doesn't need to explain itself.
- **Composable surface**: the same skeleton (plan → policy → execute → sign)
  generalises to anything Hedera Agent Kit exposes — token mints, NFT drops,
  topic governance, etc.

## Three moving parts

### 1. Planner

`src/agent/planner.ts` calls Claude Opus 4.7 with a single system prompt:
"write a short fortune, pick a vibe, pick an emoji, return JSON". The output
is parsed through a `zod` schema so a malformed model response is rejected
before any chain action.

The planner is **off-chain only**. It never sees signing keys, never knows
what HCS topic the result will land in. Its only job is to be charming.

### 2. Policy engine

`src/agent/policy.ts` is a YAML-defined ruleset:

- `max_tip_tinybars` — hard cap per fortune.
- `max_daily_outflow_tinybars` — soft cap (left for the operator to enforce).
- `require_human_approval_above_tinybars` — pause threshold.
- `topic_whitelist` — empty = open, non-empty = only specific topics.

A proposed action goes through `evaluate()` and returns
`pass | block | require_approval`. The planner can be as creative as it
wants — the policy engine is the brake.

### 3. Hedera Agent Kit toolkit

`src/hedera/agent-kit.ts` builds a `HederaLangchainToolkit` in
**autonomous mode** with two plugins loaded:

- `coreAccountPlugin` → `transfer_hbar_tool` (the HBAR tip)
- `coreConsensusPlugin` → `create_topic_tool` (setup) and
  `submit_topic_message_tool` (the fortune as a public, immutable HCS message)

The runner doesn't touch `@hashgraph/sdk` directly — every on-chain operation
goes through the Kit. To add a new agent ability (mint an NFT, swap tokens,
register an alert), import another plugin (`coreTokenPlugin`, `coreEVMPlugin`,
etc.) and call its tool by name. No glue code per tool.

### 4. Provenance

`src/agent/provenance.ts` hashes the (canonicalised) decision payload and
signs it with an Ed25519 key. Each record carries the Hedera transaction
IDs from step 3, so an auditor can re-verify the entire chain off-line.

## One fortune, two on-chain rows

Every `drawFortune()` call produces:

1. An HCS message you can find on Hashscan by topic ID — the fortune content.
2. An HBAR transfer you can find on Hashscan by transaction ID — the tip.

Both are timestamped by Hedera consensus, not by the agent. That's the
"receipt" property: the user takes home a Hashscan link, not a screenshot.

## Why this generalises

The same three boxes — planner, policy, executor — power the sibling
`fiducia-xrpl` project, which runs a treasury copilot instead of a fortune
jar. Drop in different tools (NFT mints, token swaps, alert subscriptions)
and you have a different agent without changing the safety story.
