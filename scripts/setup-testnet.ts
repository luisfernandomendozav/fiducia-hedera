import "dotenv/config";

/**
 * Hedera testnet accounts must be created out-of-band at https://portal.hedera.com/
 * (faucet is rate-limited and requires email/oauth). This script just verifies
 * that the credentials in your .env are valid and prints your balance.
 */
import { loadClientFromEnv } from "../src/hedera/client.js";
import { loadOperatorFromEnv } from "../src/hedera/operator.js";
import { AccountBalanceQuery } from "@hashgraph/sdk";

async function main() {
  const operator = loadOperatorFromEnv();
  const client = loadClientFromEnv();

  console.log("operator :", operator.accountId.toString());

  const balance = await new AccountBalanceQuery()
    .setAccountId(operator.accountId)
    .execute(client);

  console.log("balance  :", balance.hbars.toString());
  console.log("\nIf this is empty, grab a funded testnet account at:");
  console.log("  https://portal.hedera.com/  →  Testnet  →  Create Account");
  console.log("then paste the ID and DER-encoded private key into .env");

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
