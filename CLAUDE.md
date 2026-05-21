# Fortuna (fiducia-hedera) — Claude Code project context

> Auto-loaded by Claude Code. Keep this concise. Deep context lives in `README.md` and `docs/`.

## What this project is

**Fortuna** is a fun AI fortune-cookie tip-jar agent on **Hedera testnet**,
built on top of the [Hedera Agent Kit](https://github.com/hashgraph-online/hedera-agent-kit).
It's the submission for the **Fun Basic Hedera Agent** challenge.

Sibling project to:
- `../fiducia` — Next.js front-end shell
- `../fiducia-xrpl` — RLUSD treasury copilot on the XRP Ledger (same architecture, different chain)

## Where to find what

| File | Purpose |
|---|---|
| `README.md` | Stack, quick start, layout |
| `docs/CONCEPTS.md` | How the agent thinks — planner / policy / provenance |
| `docs/DEMO_PLAYBOOK.md` | Script for the X demo video |
| `docs/SUBMISSION.md` | Hackathon submission checklist + feedback template |
| `src/agent/` | Planner (Claude), policy engine, provenance logger |
| `src/hedera/` | Hedera client, operator, typed `HederaLangchainToolkit` wrapper |
| `src/fortuna/` | Runner + scenarios |
| `config/policy.example.yaml` | Declarative tip / topic policy |
| `scripts/setup-testnet.ts` | Verify operator credentials + print balance |
| `scripts/setup-topic.ts` | Create the HCS topic Fortuna writes to |
| `scripts/demo.ts` | Run a named scenario (A/B/C) end-to-end |
| `scripts/chat.ts` | Interactive REPL surface (use this for the video) |

## Architecture at a glance

```
Planner (Claude)  →  Policy Engine (YAML)  →  Provenance Logger (Ed25519)
                              │
                              ▼
              HederaLangchainToolkit (hedera-agent-kit, autonomous mode)
                              │
                  ┌───────────┴────────────┐
                  ▼                        ▼
        transfer_hbar_tool         submit_topic_message_tool
        (real HBAR tip)            (immutable fortune on HCS)
```

## Stack

- TypeScript, Node 22+
- `@hashgraph/sdk`, `hedera-agent-kit`, `@anthropic-ai/sdk`, `@noble/ed25519`, `zod`, `yaml`
- No bundler; run with `tsx`
- Strict TS, ES2023 target

## Key constraints & conventions

- **Every fortune must produce a signed provenance record** AND post to HCS. That's the receipt the user takes home.
- **Policy is evaluated deterministically before execution.** Claude proposes the fortune; the policy engine decides whether the tip can fire.
- **Never commit `.env` or `provenance.jsonl`.** `.gitignore` covers them — double-check before pushing.
- **Operator keys are DER-encoded ECDSA or ED25519 private keys** from https://portal.hedera.com/. Don't paste a raw seed.
- **Testnet only** by default. To go mainnet, change `HEDERA_NETWORK` and tighten the policy first.

## Submission strategy

This is for the **Fun Basic Hedera Agent** challenge:
1. Build a delightful agent on top of Hedera Agent Kit
2. Demonstrate a real on-chain transaction
3. Demo video on X (≥ 90-day retention)
4. Public GitHub repo
5. Submit feedback on AI Studio tools

See `docs/SUBMISSION.md` for the checklist + filming script.

## Memory system

Cross-session memory lives at:
`~/.claude/projects/-home-cukaspodolski-Documents-fiducia-hedera/memory/`

This is a fresh project — no memories yet.

## Current state

- [x] Scaffold (planner + policy + provenance + executor + scenarios + CLI)
- [x] `pnpm install` smoke test on the current checkout
- [x] First real testnet fortune drawn end-to-end
- [ ] Demo video recorded and posted to X
- [ ] GitHub repo published
- [ ] AI Studio feedback submitted
