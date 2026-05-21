import "dotenv/config";
import { loadPolicy } from "../src/agent/policy.js";
import { loadClientFromEnv } from "../src/hedera/client.js";
import { loadOperatorFromEnv } from "../src/hedera/operator.js";
import { drawFortune } from "../src/fortuna/runner.js";
import { SCENARIOS } from "../src/fortuna/scenarios.js";
import { appendFile } from "node:fs/promises";

function parseArgs(): { scenarioId: string } {
  const args = process.argv.slice(2);
  let scenarioId: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--scenario" || a === "-s") {
      scenarioId = args[++i];
    } else if (a.startsWith("--scenario=")) {
      scenarioId = a.split("=")[1];
    } else if (!a.startsWith("-") && !scenarioId) {
      scenarioId = a;
    }
  }
  if (!scenarioId) {
    console.error("usage: pnpm demo --scenario A|B|C");
    process.exit(1);
  }
  scenarioId = scenarioId.toUpperCase();
  if (!SCENARIOS[scenarioId]) {
    console.error(`unknown scenario "${scenarioId}". available: ${Object.keys(SCENARIOS).join(", ")}`);
    process.exit(1);
  }
  return { scenarioId };
}

async function main() {
  const { scenarioId } = parseArgs();
  const scenario = SCENARIOS[scenarioId];

  const policy = await loadPolicy("config/policy.example.yaml");
  const client = loadClientFromEnv();
  const operator = loadOperatorFromEnv();
  const network = (process.env.HEDERA_NETWORK ?? "testnet") as "testnet" | "mainnet" | "previewnet";
  const topicId = process.env.HEDERA_FORTUNE_TOPIC_ID;
  if (!topicId) throw new Error("HEDERA_FORTUNE_TOPIC_ID missing — run `pnpm setup:topic`");

  const tipTinybars = parseInt(process.env.FORTUNA_TIP_TINYBARS ?? "10000000", 10);
  const tipReceiver = process.env.FORTUNA_TIP_RECEIVER || operator.accountId.toString();

  console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  FORTUNA — fun Hedera fortune-cookie agent                     ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
  console.log(`scenario: ${scenario.id} — ${scenario.title}`);
  console.log(`${scenario.narrative}\n`);

  const result = await drawFortune(
    {
      client,
      network,
      policy,
      operatorId: operator.accountId.toString(),
      tipReceiver,
      tipTinybars,
      topicId,
    },
    scenario.input,
  );

  console.log(`\n${result.fortune.emoji}  "${result.fortune.fortune}"`);
  console.log(`vibe   : ${result.fortune.vibe}`);
  if (result.blocked) {
    console.log(`blocked: ${result.blocked}`);
  } else {
    console.log(`tip    : ${result.tipExplorerUrl}`);
    console.log(`hcs    : ${result.topicExplorerUrl}`);
  }
  console.log(`prov   : ${result.provenance.payloadHash}`);

  await appendFile("provenance.jsonl", JSON.stringify(result.provenance) + "\n");

  client.close();
}

main().catch((err) => {
  console.error("\nFAILED:", err);
  process.exit(1);
});
