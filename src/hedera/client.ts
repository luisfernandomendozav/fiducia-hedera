import { Client, AccountId } from "@hashgraph/sdk";
import { parseHederaPrivateKey } from "./operator.js";

export type HederaNetwork = "testnet" | "mainnet" | "previewnet";

export interface HederaClientConfig {
  network: HederaNetwork;
  operatorId: string;
  operatorKey: string;
}

export function makeClient(cfg: HederaClientConfig): Client {
  const client =
    cfg.network === "mainnet"
      ? Client.forMainnet()
      : cfg.network === "previewnet"
        ? Client.forPreviewnet()
        : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(cfg.operatorId),
    parseHederaPrivateKey(cfg.operatorKey),
  );
  return client;
}

export function loadClientFromEnv(): Client {
  const network = (process.env.HEDERA_NETWORK ?? "testnet") as HederaNetwork;
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  if (!operatorId || !operatorKey) {
    throw new Error(
      "HEDERA_OPERATOR_ID / HEDERA_OPERATOR_KEY missing — see .env.example",
    );
  }
  return makeClient({ network, operatorId, operatorKey });
}

export function explorerUrl(
  network: HederaNetwork,
  kind: "tx" | "topic" | "account",
  id: string,
): string {
  const base =
    network === "mainnet"
      ? "https://hashscan.io/mainnet"
      : network === "previewnet"
        ? "https://hashscan.io/previewnet"
        : "https://hashscan.io/testnet";
  return `${base}/${kind}/${id}`;
}
