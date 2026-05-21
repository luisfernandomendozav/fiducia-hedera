import "dotenv/config";
import { loadPolicy } from "./agent/policy.js";
import { loadClientFromEnv } from "./hedera/client.js";
import { loadOperatorFromEnv } from "./hedera/operator.js";
import { drawFortune } from "./fortuna/runner.js";
import { SCENARIOS } from "./fortuna/scenarios.js";

async function main() {
  const policy = await loadPolicy("config/policy.example.yaml");
  const client = loadClientFromEnv();
  const operator = loadOperatorFromEnv();

  const network = (process.env.HEDERA_NETWORK ?? "testnet") as "testnet" | "mainnet" | "previewnet";
  const topicId = process.env.HEDERA_FORTUNE_TOPIC_ID;
  if (!topicId) throw new Error("HEDERA_FORTUNE_TOPIC_ID missing — run `pnpm setup:topic`");

  const tipTinybars = parseInt(process.env.FORTUNA_TIP_TINYBARS ?? "10000000", 10);
  const tipReceiver = process.env.FORTUNA_TIP_RECEIVER || operator.accountId.toString();

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
    SCENARIOS.A.input,
  );

  console.log("\nfortune:", result.fortune);
  if (result.blocked) {
    console.log("blocked:", result.blocked);
  } else {
    console.log("tip tx :", result.tipExplorerUrl);
    console.log("hcs tx :", result.topicExplorerUrl);
  }
  console.log("prov   :", result.provenance.payloadHash);

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
