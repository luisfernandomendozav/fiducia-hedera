import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { z } from "zod";

const PolicySchema = z.object({
  version: z.number(),
  name: z.string(),
  limits: z.object({
    max_tip_tinybars: z.number(),
    max_daily_outflow_tinybars: z.number(),
    min_operator_balance_tinybars: z.number(),
  }),
  approval_thresholds: z.object({
    require_human_approval_above_tinybars: z.number(),
    require_human_approval_for: z.array(z.string()),
  }),
  topic_whitelist: z.array(z.string()),
});

export type Policy = z.infer<typeof PolicySchema>;

export async function loadPolicy(path: string): Promise<Policy> {
  const raw = await readFile(path, "utf8");
  return PolicySchema.parse(parse(raw));
}

export type EvalResult =
  | { status: "pass" }
  | { status: "block"; reason: string }
  | { status: "require_approval"; reason: string };

export interface ProposedAction {
  kind: "tip" | "topic_submit" | "topic_create" | "hold";
  tinybars?: number;
  topicId?: string;
}

export function evaluate(action: ProposedAction, policy: Policy): EvalResult {
  if (action.kind === "tip") {
    if (!action.tinybars || action.tinybars <= 0) {
      return { status: "block", reason: "tip must specify positive tinybars" };
    }
    if (action.tinybars > policy.limits.max_tip_tinybars) {
      return { status: "block", reason: "exceeds max_tip_tinybars" };
    }
    if (action.tinybars > policy.approval_thresholds.require_human_approval_above_tinybars) {
      return { status: "require_approval", reason: "above approval threshold" };
    }
  }

  if (action.kind === "topic_submit") {
    if (!action.topicId) return { status: "block", reason: "topic_submit needs topicId" };
    if (
      policy.topic_whitelist.length > 0 &&
      !policy.topic_whitelist.includes(action.topicId)
    ) {
      return { status: "block", reason: `topic ${action.topicId} not whitelisted` };
    }
  }

  return { status: "pass" };
}
