import "dotenv/config";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { loadClientFromEnv, explorerUrl } from "../src/hedera/client.js";
import { loadOperatorFromEnv } from "../src/hedera/operator.js";
import { FortunaToolkit, TOOL } from "../src/hedera/agent-kit.js";

async function main() {
  const client = loadClientFromEnv();
  const operator = loadOperatorFromEnv();
  const network = (process.env.HEDERA_NETWORK ?? "testnet") as "testnet" | "mainnet" | "previewnet";

  const toolkit = new FortunaToolkit({
    client,
    operatorAccountId: operator.accountId.toString(),
  });

  console.log("creating Fortuna HCS topic via hedera-agent-kit...");
  const result = await toolkit.invoke(TOOL.CREATE_TOPIC, {
    topicMemo: "fortuna.fortune-log v1",
    isSubmitKey: false,
  });

  const rawTopicId = result.raw.topicId;
  const topicId =
    typeof rawTopicId === "string"
      ? rawTopicId
      : rawTopicId && typeof rawTopicId === "object" && "shard" in rawTopicId && "realm" in rawTopicId && "num" in rawTopicId
        ? `${rawTopicId.shard}.${rawTopicId.realm}.${rawTopicId.num}`
        : rawTopicId?.toString();
  if (!topicId || topicId === "[object Object]") {
    console.error("kit response:", result);
    throw new Error("topic creation didn't return a usable topic id");
  }

  console.log("topic id :", topicId);
  console.log("tx       :", explorerUrl(network, "tx", result.raw.transactionId));
  console.log("hashscan :", explorerUrl(network, "topic", topicId));

  // Persist the topic id back into .env so `pnpm dev` picks it up.
  if (existsSync(".env")) {
    const raw = await readFile(".env", "utf8");
    if (raw.match(/^HEDERA_FORTUNE_TOPIC_ID=/m)) {
      const next = raw.replace(/^HEDERA_FORTUNE_TOPIC_ID=.*$/m, `HEDERA_FORTUNE_TOPIC_ID=${topicId}`);
      await writeFile(".env", next);
    } else {
      await appendFile(".env", `\nHEDERA_FORTUNE_TOPIC_ID=${topicId}\n`);
    }
    console.log("updated HEDERA_FORTUNE_TOPIC_ID in .env");
  } else {
    console.log("(no .env yet — copy .env.example and paste HEDERA_FORTUNE_TOPIC_ID manually)");
  }

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
