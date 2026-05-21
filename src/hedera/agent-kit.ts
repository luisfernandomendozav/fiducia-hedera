import { Client } from "@hashgraph/sdk";
import {
  HederaLangchainToolkit,
  AgentMode,
  coreAccountPlugin,
  coreConsensusPlugin,
  coreAccountPluginToolNames,
  coreConsensusPluginToolNames,
} from "hedera-agent-kit";

// hedera-agent-kit exports the class type indirectly via HederaLangchainToolkit.tools.
// Pull the element type so we don't depend on whether the class is re-exported.
type HederaAgentKitTool = HederaLangchainToolkit["tools"][number];

/**
 * Names of every Agent Kit tool we use. Pinning these here means a kit upgrade
 * that drops or renames a tool surfaces as a single compile-time hit.
 */
export const TOOL = {
  TRANSFER_HBAR: coreAccountPluginToolNames.TRANSFER_HBAR_TOOL,
  CREATE_TOPIC: coreConsensusPluginToolNames.CREATE_TOPIC_TOOL,
  SUBMIT_TOPIC_MESSAGE: coreConsensusPluginToolNames.SUBMIT_TOPIC_MESSAGE_TOOL,
} as const;

export type ToolName = (typeof TOOL)[keyof typeof TOOL];

/**
 * Shape returned by Agent Kit tools when running in autonomous mode.
 * (Mirrors `RawTransactionResponse` from the kit.)
 */
export interface KitRawResult {
  status: string;
  transactionId: string;
  topicId?: { toString(): string } | null;
  accountId?: { toString(): string } | null;
  tokenId?: { toString(): string } | null;
  scheduleId?: { toString(): string } | null;
}

export interface KitInvokeResult {
  raw: KitRawResult;
  humanMessage: string;
}

export interface FortunaToolkitOptions {
  client: Client;
  /** Operator account id (e.g. "0.0.1234"). Used as the default `sourceAccountId`. */
  operatorAccountId: string;
}

export class FortunaToolkit {
  private toolkit: HederaLangchainToolkit;
  private toolsByName: Map<string, HederaAgentKitTool>;

  constructor(opts: FortunaToolkitOptions) {
    this.toolkit = new HederaLangchainToolkit({
      client: opts.client,
      configuration: {
        plugins: [coreAccountPlugin, coreConsensusPlugin],
        tools: [TOOL.TRANSFER_HBAR, TOOL.CREATE_TOPIC, TOOL.SUBMIT_TOPIC_MESSAGE],
        context: {
          accountId: opts.operatorAccountId,
          mode: AgentMode.AUTONOMOUS,
        },
      },
    });

    this.toolsByName = new Map();
    for (const tool of this.toolkit.getTools()) {
      this.toolsByName.set(tool.method, tool);
    }
  }

  getTools(): HederaAgentKitTool[] {
    return this.toolkit.getTools();
  }

  private getTool(name: ToolName): HederaAgentKitTool {
    const tool = this.toolsByName.get(name);
    if (!tool) {
      throw new Error(
        `hedera-agent-kit tool "${name}" not found — pin a matching version in package.json`,
      );
    }
    return tool;
  }

  /**
   * StructuredTool#invoke returns the kit's stringified `{ raw, humanMessage }`.
   * We parse it back so callers get typed access.
   */
  async invoke(name: ToolName, args: Record<string, unknown>): Promise<KitInvokeResult> {
    const tool = this.getTool(name);
    const raw = await tool.invoke(args);
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as KitInvokeResult;
      } catch {
        return { raw: { status: "UNKNOWN", transactionId: "" }, humanMessage: raw };
      }
    }
    return raw as KitInvokeResult;
  }
}
