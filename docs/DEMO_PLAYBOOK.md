# Fortuna — demo video playbook

Target: a 60-90 second clip for X (formerly Twitter). Must stay live ≥ 90 days
per the challenge rules. Record once, post once, link to Hashscan.

## Pre-flight

1. `pnpm install`
2. `.env` populated with a funded testnet operator (≥ 5 HBAR).
3. `pnpm setup:testnet` shows positive balance.
4. `pnpm setup:topic` has run — `HEDERA_FORTUNE_TOPIC_ID` is set.
5. Open https://hashscan.io/testnet/topic/<your-topic-id> in a browser tab.
6. Open a terminal at ~60% width, font ≥ 16pt.

## Shot list (recommended order)

| t (s) | What's on screen | Voiceover (optional) |
|---|---|---|
| 0–5 | Title card: "Fortuna — a fun Hedera agent" | "Meet Fortuna." |
| 5–15 | Terminal: `pnpm chat`. Type a topic ("first PR jitters"). | "I ask Fortuna a topic." |
| 15–30 | Fortune appears with emoji + vibe. | "She writes me a fortune." |
| 30–50 | Click the `tip:` Hashscan link. Show the HBAR transfer record. | "And here's the on-chain tip — real HBAR moving on Hedera testnet." |
| 50–70 | Switch to the topic Hashscan tab. Show the message body. | "The fortune itself is pinned to a public HCS topic. Forever." |
| 70–85 | Back to terminal: ask a second topic. Fortune fires again. | "Every fortune. Two transactions. Zero servers in the loop." |
| 85–90 | End card: GitHub url + handle. | "Code's open. Have fun." |

## Captions / X post

> 🥠 Fortuna — a fun Hedera agent built on the @hashgraph_dev Hedera Agent Kit.
> Ask a topic, get an AI fortune, pin it to HCS, and tip in HBAR — all in one
> shot on testnet.
>
> Submission for the Fun Basic Hedera Agent challenge.
> Code: github.com/<you>/fiducia-hedera

## After posting

- Save the X post URL in `docs/SUBMISSION.md`.
- Don't unlist or delete the post for 90 days.
- Add the X embed (or a still + link) to the GitHub README.
