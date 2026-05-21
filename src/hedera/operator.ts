import { PrivateKey, AccountId } from "@hashgraph/sdk";

export interface Operator {
  accountId: AccountId;
  privateKey: PrivateKey;
}

export function parseHederaPrivateKey(key: string): PrivateKey {
  const trimmed = key.trim();
  if (trimmed.startsWith("302")) {
    return PrivateKey.fromStringDer(trimmed);
  }

  try {
    return PrivateKey.fromStringECDSA(trimmed);
  } catch (ecdsaError) {
    try {
      return PrivateKey.fromStringED25519(trimmed);
    } catch {
      throw ecdsaError;
    }
  }
}

export function loadOperatorFromEnv(): Operator {
  const id = process.env.HEDERA_OPERATOR_ID;
  const key = process.env.HEDERA_OPERATOR_KEY;
  if (!id || !key) {
    throw new Error("HEDERA_OPERATOR_ID / HEDERA_OPERATOR_KEY missing — run setup:testnet");
  }
  return {
    accountId: AccountId.fromString(id),
    privateKey: parseHederaPrivateKey(key),
  };
}
