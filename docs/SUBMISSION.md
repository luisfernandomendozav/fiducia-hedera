# Fun Basic Hedera Agent — submission checklist

Track the final hand-in here. Tick boxes as you go, fill in the urls.

## 1. Public GitHub repo

- [ ] Create empty repo (`gh repo create fiducia-hedera --public`)
- [ ] Push this directory
- [ ] README has a clear "what / why / how" + screenshots or gif
- [ ] LICENSE chosen (MIT is fine)
- [ ] Repo URL: ____________

## 2. Built using the Hedera Agent Kit (JS or Python)

- [x] `hedera-agent-kit@^3.8.2` declared in `package.json`
- [x] `src/hedera/agent-kit.ts` builds `HederaLangchainToolkit` (autonomous mode)
- [x] Every on-chain call (`transfer_hbar_tool`, `create_topic_tool`,
      `submit_topic_message_tool`) goes through the Kit — no raw
      `@hashgraph/sdk` transactions in the runner
- [x] `pnpm typecheck` and `pnpm build` clean

## 3. Real on-chain transaction

Every `drawFortune()` call produces **two** real testnet transactions:

- `TransferTransaction` — the HBAR tip (payment)
- `TopicMessageSubmitTransaction` — the fortune posted to HCS (on-chain action)

Both produce Hashscan links the user can click. Save a representative one
here as proof:

- Sample tip tx: https://hashscan.io/testnet/tx/0.0.8870451@1779394377.159542450
- Sample HCS message tx: https://hashscan.io/testnet/tx/0.0.8870451@1779394377.632328418

## 4. Demo video on X

- [ ] Filmed using `docs/DEMO_PLAYBOOK.md`
- [ ] Posted to X with project handle
- [ ] X post URL: ____________
- [ ] Confirmed retention for ≥ 90 days (calendar reminder set)

## 5. Feedback on AI Studio tools

The challenge requires one piece of feedback. Use the template below — it
keeps the answer concrete and easy to copy into whatever form AI Studio
provides.

> **Project:** Fortuna (fiducia-hedera)
>
> **What worked well:**
> - Hedera Agent Kit's tool surface mapped 1:1 to the two operations the
>   agent needed (transfer + topic submit). No glue code needed beyond the
>   thin wrapper in `src/hedera/agent-kit.ts`.
> - `@hashgraph/sdk` v2 receipts give Hashscan-friendly transaction IDs out
>   of the box, which made the "tap the link" demo moment trivial.
>
> **What was rough:**
> - (fill in something specific — version churn between Agent Kit minors,
>   docs gap on plugin authoring, ChatAnthropic adapter status, etc.)
>
> **What I'd love next:**
> - (fill in a wish — e.g., a first-class Anthropic adapter, a CLI codegen
>   that scaffolds a new agent, examples for non-LangChain runtimes.)

- [ ] Feedback submitted
- [ ] Submission ID / acknowledgement: ____________

## Final hand-in

Once everything above is ticked:

1. Tweet the demo video.
2. File the form / PR / Discord post the challenge specifies.
3. Update the top of this file with the submission timestamp.
