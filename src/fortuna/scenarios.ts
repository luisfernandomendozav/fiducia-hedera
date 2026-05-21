import type { FortuneInput } from "../agent/planner.js";

export interface Scenario {
  id: string;
  title: string;
  narrative: string;
  input: FortuneInput;
}

export const SCENARIOS: Record<string, Scenario> = {
  A: {
    id: "A",
    title: "Monday-morning courage",
    narrative:
      "A new dev pushes their first PR before stand-up. They drop 0.1 HBAR into Fortuna asking for courage.",
    input: { topic: "first PR review jitters", mood: "anxious-but-hopeful", username: "newgrad" },
  },
  B: {
    id: "B",
    title: "Late-night shipping",
    narrative:
      "Solo founder finishing a launch at 2am. Tips Fortuna for a sign whether to ship now or sleep.",
    input: { topic: "should I ship the v1 tonight or sleep?", mood: "wired", username: "soloship" },
  },
  C: {
    id: "C",
    title: "Coffee-shop loiterer",
    narrative:
      "Person sitting in a café between meetings, just curious about the rest of the week.",
    input: { topic: "the rest of this week", mood: "curious", username: "cafe-randomizer" },
  },
};
