import { Client } from "@hashgraph/sdk";
import { FortunePlanner, type Fortune, type FortuneInput } from "../agent/planner.js";
import { evaluate, type Policy } from "../agent/policy.js";
import { ProvenanceLogger, type ProvenanceRecord } from "../agent/provenance.js";
import { FortunaToolkit, TOOL } from "../hedera/agent-kit.js";
import { explorerUrl, type HederaNetwork } from "../hedera/client.js";

export interface FortunaConfig {
  client: Client;
  network: HederaNetwork;
  policy: Policy;
  operatorId: string;
  tipReceiver: string;
  tipTinybars: number;
  topicId: string;
}

export interface FortunaOutcome {
  fortune: Fortune;
  tipTx?: string;
  tipExplorerUrl?: string;
  topicTx?: string;
  topicExplorerUrl?: string;
  provenance: ProvenanceRecord;
  blocked?: string;
}

const TINYBARS_PER_HBAR = 100_000_000;

/**
 * One round of Fortuna:
 *   1. Plan a fortune with Claude (off-chain).
 *   2. Evaluate the tip against the policy.
 *   3. Submit the fortune to the public HCS topic via Hedera Agent Kit.
 *   4. Transfer the HBAR tip via Hedera Agent Kit.
 *   5. Sign + record provenance over the whole bundle.
 */
export async function drawFortune(
  cfg: FortunaConfig,
  input: FortuneInput,
): Promise<FortunaOutcome> {
  const planner = new FortunePlanner();
  const toolkit = new FortunaToolkit({
    client: cfg.client,
    operatorAccountId: cfg.operatorId,
  });
  const provenance = new ProvenanceLogger();

  const fortune = await planner.draw(input);

  const policyEval = evaluate(
    { kind: "tip", tinybars: cfg.tipTinybars },
    cfg.policy,
  );

  if (policyEval.status === "block") {
    const record = await provenance.record({
      action: "blocked",
      reason: policyEval.reason,
      policyEvaluation: policyEval.status,
      outputs: { fortune },
    });
    return { fortune, provenance: record, blocked: policyEval.reason };
  }

  const message = JSON.stringify({
    kind: "fortuna.fortune",
    ts: new Date().toISOString(),
    topic: input.topic,
    mood: input.mood,
    fortune: fortune.fortune,
    vibe: fortune.vibe,
    emoji: fortune.emoji,
  });

  const topicResult = await toolkit.invoke(TOOL.SUBMIT_TOPIC_MESSAGE, {
    topicId: cfg.topicId,
    message,
    transactionMemo: `fortuna:${fortune.vibe}`,
  });

  const tipAmountHbar = cfg.tipTinybars / TINYBARS_PER_HBAR;
  const tipResult = await toolkit.invoke(TOOL.TRANSFER_HBAR, {
    transfers: [{ accountId: cfg.tipReceiver, amount: tipAmountHbar }],
    sourceAccountId: cfg.operatorId,
    transactionMemo: `fortuna:${fortune.vibe}:${fortune.emoji}`,
  });

  const record = await provenance.record({
    action: "fortuna.fortune",
    reason: "delivered fortune + tip via hedera-agent-kit",
    policyEvaluation: policyEval.status,
    modelVersion: "claude-opus-4-7",
    outputs: { fortune, tipTinybars: cfg.tipTinybars, topicId: cfg.topicId },
    hederaTxIds: [topicResult.raw.transactionId, tipResult.raw.transactionId],
  });

  return {
    fortune,
    tipTx: tipResult.raw.transactionId,
    tipExplorerUrl: explorerUrl(cfg.network, "tx", tipResult.raw.transactionId),
    topicTx: topicResult.raw.transactionId,
    topicExplorerUrl: explorerUrl(cfg.network, "tx", topicResult.raw.transactionId),
    provenance: record,
  };
}
