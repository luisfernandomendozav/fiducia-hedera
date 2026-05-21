# Fortuna — Fun Basic Hedera Agent

A delightful AI fortune-cookie tip jar on **Hedera testnet**, built with the
[Hedera Agent Kit](https://github.com/hashgraph-online/hedera-agent-kit).
Submission for the **Fun Basic Hedera Agent** challenge.

> Tell Fortuna a topic. She writes you a fortune, pins it as an immutable
> message on a Hedera Consensus Service topic, and burns a tiny HBAR tip in
> the process. Every fortune comes with a Hashscan link.

This project is a sibling of [`fiducia`](../fiducia) and [`fiducia-xrpl`](../fiducia-xrpl)
— same architecture (Claude-driven planner + policy engine + Ed25519
provenance), different chain.

---

## What it does

1. **Plan** — Claude generates a short, original fortune from the
   user's topic / mood.
2. **Check** — the policy engine evaluates the proposed tip + topic against
   declarative rules (`config/policy.example.yaml`).
3. **Execute on-chain** — the agent submits the fortune to an HCS topic and
   transfers HBAR to the tip receiver. Both are **real testnet transactions**.
4. **Sign** — every decision is hashed and Ed25519-signed into a local
   `provenance.jsonl` audit log; `pnpm verify` re-checks the chain.

---

## Quick start

```bash
# 1. Get a funded testnet account at https://portal.hedera.com/
#    (Testnet → Create Account → copy the account ID and DER private key)
pnpm install
cp .env.example .env
# fill HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY
# keep AI_BACKEND=subscription if you use the local Claude CLI

# 2. Sanity-check the account
pnpm setup:testnet

# 3. Create a public HCS topic (appended to .env automatically)
pnpm setup:topic

# 4. Talk to Fortuna
pnpm chat
# or run a scripted scenario for the demo video:
pnpm demo --scenario A
```

Each run prints:

```
🌙  "Ship the v1 — your future self has snacks waiting."
vibe   : bold
tip    : https://hashscan.io/testnet/tx/0.0.xxxx@...
hcs    : https://hashscan.io/testnet/tx/0.0.xxxx@...
prov   : 7f3a...        <- signed in provenance.jsonl
```

---

## Stack

- TypeScript (Node 22+)
- [`@hashgraph/sdk`](https://www.npmjs.com/package/@hashgraph/sdk) — official Hedera SDK
- [`hedera-agent-kit`](https://github.com/hashgraph-online/hedera-agent-kit) — tool surface for the agent
- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk) — Claude planner when `AI_BACKEND=api`
- `@noble/ed25519` — signed provenance
- `zod`, `yaml` — schema + policy

---

## Layout

```
src/
├── agent/
│   ├── planner.ts      Claude-driven fortune generator (typed via zod)
│   ├── policy.ts       declarative tip/topic policy
│   └── provenance.ts   Ed25519-signed decision log
├── hedera/
│   ├── client.ts       Hedera client + Hashscan url helpers
│   ├── operator.ts     load operator from .env
│   └── agent-kit.ts    typed wrapper over HederaLangchainToolkit
└── fortuna/
    ├── runner.ts       plan → policy → invoke Kit tools → sign
    └── scenarios.ts    scripted demo flows
```

Every on-chain action — `create_topic_tool`, `submit_topic_message_tool`,
`transfer_hbar_tool` — goes through `hedera-agent-kit`'s `HederaLangchainToolkit`
in autonomous mode. The `@hashgraph/sdk` is a transitive dependency only.

---

## Submission checklist

Fun Basic Hedera Agent requires:

- [x] Built on the Hedera Agent Kit (JS)
- [x] Performs a real on-chain transaction (HBAR transfer **and** HCS submit per fortune)
- [x] Fun, delightful interaction (AI fortune cookies with vibes + emoji)
- [ ] Public GitHub repo — push this directory
- [ ] Demo video on X (script in `docs/DEMO_PLAYBOOK.md`)
- [ ] Feedback submitted on AI Studio tools — see `docs/SUBMISSION.md`

See [`docs/SUBMISSION.md`](docs/SUBMISSION.md) for the full submission walkthrough.
