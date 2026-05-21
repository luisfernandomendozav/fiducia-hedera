import { execFile } from "node:child_process";
import { promisify } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const execFileP = promisify(execFile);

const FortuneSchema = z.object({
  fortune: z.string().min(8).max(280),
  vibe: z.enum(["lucky", "cautious", "bold", "cozy", "mischievous", "sage"]),
  emoji: z.string().min(1).max(8),
});

export type Fortune = z.infer<typeof FortuneSchema>;

export type AIBackend = "subscription" | "api";

const MODEL = "claude-opus-4-7";
const SYSTEM_PROMPT = [
  "You are Fortuna, a delightful AI fortune-teller who lives inside a Hedera-powered tip jar.",
  "Given a user's mood / topic, write a short, original fortune (one or two sentences, ≤200 chars).",
  "Pick a vibe from: lucky, cautious, bold, cozy, mischievous, sage.",
  "Pick one short emoji that fits.",
  "Return ONLY a JSON object: { \"fortune\": string, \"vibe\": string, \"emoji\": string }. No prose, no code fences.",
].join(" ");

export interface FortuneInput {
  topic: string;
  mood?: string;
  username?: string;
}

export class FortunePlanner {
  private backend: AIBackend;
  private apiClient?: Anthropic;

  constructor(
    backend: AIBackend = (process.env.AI_BACKEND as AIBackend) || "api",
    apiKey = process.env.ANTHROPIC_API_KEY,
  ) {
    if (backend !== "subscription" && backend !== "api") {
      throw new Error(`AI_BACKEND must be "subscription" or "api", got: ${backend}`);
    }
    this.backend = backend;
    if (backend === "api") {
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing (required when AI_BACKEND=api)");
      this.apiClient = new Anthropic({ apiKey });
    }
  }

  async draw(input: FortuneInput): Promise<Fortune> {
    const userMessage = JSON.stringify(input);
    const raw =
      this.backend === "api"
        ? await this.callApi(userMessage)
        : await this.callSubscription(userMessage);
    return FortuneSchema.parse(JSON.parse(stripFences(raw)));
  }

  private async callApi(userMessage: string): Promise<string> {
    const response = await this.apiClient!.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    return response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");
  }

  private async callSubscription(userMessage: string): Promise<string> {
    const prompt = `${SYSTEM_PROMPT}\n\nInput:\n${userMessage}`;
    const { ANTHROPIC_API_KEY: _ignored, ...env } = process.env;
    const { stdout } = await execFileP(
      "claude",
      ["-p", "--model", MODEL, prompt],
      { env, maxBuffer: 10 * 1024 * 1024 },
    );
    return stdout.trim();
  }
}

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}
