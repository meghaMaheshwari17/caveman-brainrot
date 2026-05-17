import Anthropic from "@anthropic-ai/sdk";
import { buildExtractionPrompt } from "./prompts";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ConceptLevel {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "5": string;
}

export interface Concept {
  id: string;
  title: string;
  whyItMatters: string;
  levels: ConceptLevel;
}

export interface ExplainResult {
  topic: string;
  compressionStats: {
    inputWordCount: number;
    estimatedReadMinutes: number;
  };
  concepts: Concept[];
}

export async function extractAndExplain(content: string): Promise<ExplainResult> {
  const wordCount = content.trim().split(/\s+/).length;
  const truncated = content.trim().split(/\s+/).slice(0, 4000).join(" ");

  const prompt = buildExtractionPrompt(truncated, wordCount);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return valid JSON");
  }

  const result: ExplainResult = JSON.parse(jsonMatch[0]);
  return result;
}
