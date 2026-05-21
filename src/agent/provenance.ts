import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

export interface DecisionInputs {
  action: string;
  reason: string;
  policyEvaluation: string;
  inputsHash?: string;
  modelVersion?: string;
  outputs?: unknown;
  hederaTxIds?: string[];
}

export interface ProvenanceRecord {
  timestamp: string;
  payload: DecisionInputs;
  payloadHash: string;
  signature: string;
  publicKey: string;
}

export class ProvenanceLogger {
  private privateKey: Uint8Array;
  private publicKeyHex: string | null = null;

  constructor(privateKeyHex = process.env.AGENT_IDENTITY_KEY) {
    this.privateKey = privateKeyHex
      ? hexToBytes(privateKeyHex)
      : ed.utils.randomPrivateKey();
  }

  private async getPublicKeyHex(): Promise<string> {
    if (!this.publicKeyHex) {
      const pub = await ed.getPublicKeyAsync(this.privateKey);
      this.publicKeyHex = bytesToHex(pub);
    }
    return this.publicKeyHex;
  }

  async record(payload: DecisionInputs): Promise<ProvenanceRecord> {
    const canonical = canonicalize(payload);
    const payloadHash = bytesToHex(sha256(new TextEncoder().encode(canonical)));
    const signature = await ed.signAsync(payloadHash, this.privateKey);
    return {
      timestamp: new Date().toISOString(),
      payload,
      payloadHash,
      signature: bytesToHex(signature),
      publicKey: await this.getPublicKeyHex(),
    };
  }
}

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) => JSON.stringify(k) + ":" + canonicalize((value as Record<string, unknown>)[k]),
  );
  return "{" + parts.join(",") + "}";
}

export async function verifySignature(
  payload: unknown,
  expectedHash: string,
  signatureHex: string,
  publicKeyHex: string,
): Promise<{ hashMatches: boolean; signatureValid: boolean }> {
  const canonical = canonicalize(payload);
  const hash = bytesToHex(sha256(new TextEncoder().encode(canonical)));
  const hashMatches = hash === expectedHash;
  const sigBytes = hexToBytes(signatureHex);
  const pubBytes = hexToBytes(publicKeyHex);
  const signatureValid = await ed.verifyAsync(sigBytes, hash, pubBytes);
  return { hashMatches, signatureValid };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
