import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildExtractionPrompt } from "./prompts";

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

export async function extractAndExplain(
  content: string,
  userApiKey?: string
): Promise<ExplainResult> {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No API key found. Add your Gemini API key in Settings or set GEMINI_API_KEY in your environment."
    );
  }

  const wordCount = content.trim().split(/\s+/).length;
  const truncated = content.trim().split(/\s+/).slice(0, 4000).join(" ");
  const prompt = buildExtractionPrompt(truncated, wordCount);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini did not return valid JSON. Try again.");
  }

  const parsed: ExplainResult = JSON.parse(jsonMatch[0]);
  return parsed;
}
