import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { loadPolicy } from "../src/agent/policy.js";
import { loadClientFromEnv } from "../src/hedera/client.js";
import { loadOperatorFromEnv } from "../src/hedera/operator.js";
import { drawFortune } from "../src/fortuna/runner.js";

/**
 * Interactive chat loop — the "fun" surface for the submission video.
 * User types a topic, Fortuna delivers a fortune and burns a real testnet tip
 * + HCS message. Type `q` to exit.
 */
async function main() {
  const policy = await loadPolicy("config/policy.example.yaml");
  const client = loadClientFromEnv();
  const operator = loadOperatorFromEnv();
  const network = (process.env.HEDERA_NETWORK ?? "testnet") as "testnet" | "mainnet" | "previewnet";
  const topicId = process.env.HEDERA_FORTUNE_TOPIC_ID;
  if (!topicId) throw new Error("HEDERA_FORTUNE_TOPIC_ID missing — run `pnpm setup:topic`");

  const tipTinybars = parseInt(process.env.FORTUNA_TIP_TINYBARS ?? "10000000", 10);
  const tipReceiver = process.env.FORTUNA_TIP_RECEIVER || operator.accountId.toString();

  const rl = createInterface({ input: stdin, output: stdout });

  console.log(`\n🥠  Fortuna — Hedera fortune jar`);
  console.log(`    tip: ${tipTinybars} tinybars per fortune  ·  topic: ${topicId}`);
  console.log(`    type a topic and hit enter (or "q" to quit)\n`);

  for (;;) {
    const topic = (await rl.question("you: ")).trim();
    if (!topic || topic === "q" || topic === "quit") break;

    try {
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
        { topic },
      );
      console.log(`\nfortuna ${result.fortune.emoji}: ${result.fortune.fortune}`);
      console.log(`         vibe=${result.fortune.vibe}`);
      if (result.blocked) {
        console.log(`         blocked: ${result.blocked}\n`);
      } else {
        console.log(`         tip: ${result.tipExplorerUrl}`);
        console.log(`         hcs: ${result.topicExplorerUrl}\n`);
      }
    } catch (err) {
      console.error("error:", err instanceof Error ? err.message : err, "\n");
    }
  }

  rl.close();
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
