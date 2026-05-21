import "dotenv/config";
import { readFile } from "node:fs/promises";
import { verifySignature } from "../src/agent/provenance.js";

async function main() {
  const raw = await readFile("provenance.jsonl", "utf8");
  const lines = raw.split("\n").filter(Boolean);

  let ok = 0;
  let bad = 0;
  for (const line of lines) {
    const rec = JSON.parse(line);
    const { hashMatches, signatureValid } = await verifySignature(
      rec.payload,
      rec.payloadHash,
      rec.signature,
      rec.publicKey,
    );
    const passed = hashMatches && signatureValid;
    console.log(
      passed ? "✓" : "✗",
      rec.timestamp,
      rec.payload.action,
      `hash=${hashMatches} sig=${signatureValid}`,
    );
    if (passed) ok++;
    else bad++;
  }
  console.log(`\n${ok} valid, ${bad} invalid (of ${lines.length})`);
  if (bad > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
