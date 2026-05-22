/**
 * lib/claude.ts — AI pipeline using LangGraph
 *
 * WHY LANGGRAPH?
 * LangGraph lets you build stateful, multi-step AI pipelines as explicit graphs.
 * Each node is a pure function. Edges define control flow. Conditional edges
 * let you loop (e.g. retry on bad output) without messy try/catch spaghetti.
 *
 * THE GRAPH:
 *
 *   START
 *     │
 *     ▼
 *  [invoke_model]  ← retries loop back here
 *     │
 *     ▼
 *  [parse_and_validate]
 *     │
 *     ├─ valid ──────────► END
 *     │
 *     └─ invalid + retries < 2 ──► [invoke_model]
 *
 * Benefits over a plain try/catch:
 * - Each node is isolated and testable
 * - Retry logic is a graph edge, not imperative code
 * - Easy to add new nodes later (e.g. quality_check, translate, summarize)
 * - State is explicit — you can inspect every step
 *
 * PROVIDER RESOLUTION (priority order):
 * 1. User-provided key from browser Settings (Gemini or OpenAI)
 * 2. Server env: DEVSTRAL_* (your on-prem model — the default)
 * 3. Server env: OPENAI_API_KEY fallback
 * 4. Server env: GEMINI_API_KEY fallback
 */

import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { buildExtractionPrompt } from "./prompts";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProvider = "gemini" | "openai" | "groq";

export interface UserConfig {
  provider: UserProvider;
  apiKey: string;
}

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

// ─── Graph state ──────────────────────────────────────────────────────────────
// Annotation.Root defines the shape of state that flows through every node.
// Each field has a reducer (how to merge updates) and a default.

const PipelineState = Annotation.Root({
  // Input
  prompt: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  // Raw text response from the model
  rawResponse: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  // Parsed result — null until parse_and_validate succeeds
  result: Annotation<ExplainResult | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
  // How many times we've tried (used to cap retries)
  retries: Annotation<number>({
    reducer: (_, y) => y,
    default: () => 0,
  }),
  // Last parse error — shown in retry prompt for self-correction
  parseError: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
});

type State = typeof PipelineState.State;

// ─── Model factory ────────────────────────────────────────────────────────────

function buildModel(userConfig?: UserConfig) {
  // maxTokens cap — prevents runaway generation and reduces cost/quota burn.
  // 2500 is enough for 6 concepts × 5 levels with room to spare.
  const MAX_TOKENS = 2500;

  // Priority 1: user-provided key from browser Settings
  if (userConfig?.apiKey && userConfig?.provider) {
    if (userConfig.provider === "gemini") {
      return new ChatGoogleGenerativeAI({
        apiKey: userConfig.apiKey,
        model: "gemini-2.0-flash",
        temperature: 0.2,
        maxOutputTokens: MAX_TOKENS,
      });
    }
    if (userConfig.provider === "openai") {
      return new ChatOpenAI({
        apiKey: userConfig.apiKey,
        model: "gpt-4o-mini",
        temperature: 0.2,
        maxTokens: MAX_TOKENS,
      });
    }
    if (userConfig.provider === "groq") {
      return new ChatOpenAI({
        apiKey: userConfig.apiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        maxTokens: MAX_TOKENS,
        configuration: { baseURL: "https://api.groq.com/openai/v1" },
      });
    }
  }

  // Priority 2: on-prem Devstral (server default)
  // Devstral is OpenAI-compatible — runs via vLLM, Ollama, or similar
  if (process.env.DEVSTRAL_BASE_URL && process.env.DEVSTRAL_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.DEVSTRAL_API_KEY,
      model: process.env.DEVSTRAL_MODEL || "devstral",
      configuration: { baseURL: process.env.DEVSTRAL_BASE_URL },
      temperature: 0.2,
      maxTokens: MAX_TOKENS,
    });
  }

  // Priority 3: Groq env fallback (free, fast — recommended default)
  if (process.env.GROQ_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      maxTokens: MAX_TOKENS,
      configuration: { baseURL: "https://api.groq.com/openai/v1" },
    });
  }

  // Priority 4: OpenAI env fallback
  if (process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0.2,
      maxTokens: MAX_TOKENS,
    });
  }

  // Priority 5: Gemini env fallback
  if (process.env.GEMINI_API_KEY) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      temperature: 0.2,
      maxOutputTokens: MAX_TOKENS,
    });
  }

  throw new Error(
    "No AI model configured. Set DEVSTRAL_BASE_URL + DEVSTRAL_API_KEY in your environment, " +
    "or add your Gemini / OpenAI key in ⚙️ Settings."
  );
}

// ─── Graph nodes ──────────────────────────────────────────────────────────────

/**
 * Node 1: invoke_model
 * Calls the LLM with the extraction prompt (or a self-correction prompt on retry).
 * All providers go through the same .invoke([HumanMessage]) interface — that's
 * what LangChain's BaseChatModel abstraction buys us.
 */
function makeInvokeNode(model: ReturnType<typeof buildModel>) {
  return async (state: State): Promise<Partial<State>> => {
    // On retry: ask the model to fix its previous bad output
    const prompt =
      state.retries > 0
        ? `${state.prompt}\n\nYour previous response failed JSON parsing with error: "${state.parseError}".\n` +
          `Previous response was:\n${state.rawResponse}\n\n` +
          `Please fix the JSON and return ONLY valid JSON, nothing else.`
        : state.prompt;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const raw =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return { rawResponse: raw, retries: state.retries + 1 };
  };
}

/**
 * Node 2: parse_and_validate
 * Tries to extract and parse JSON from the model's raw response.
 * Sets result on success, sets parseError on failure (used in next retry prompt).
 */
async function parseAndValidate(state: State): Promise<Partial<State>> {
  try {
    const jsonMatch = state.rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in response");

    const parsed = JSON.parse(jsonMatch[0]) as ExplainResult;

    // Basic shape validation
    if (!parsed.topic || !Array.isArray(parsed.concepts) || parsed.concepts.length === 0) {
      throw new Error("Response missing required fields: topic or concepts array");
    }
    for (const c of parsed.concepts) {
      if (!c.levels?.["1"] || !c.levels?.["5"]) {
        throw new Error(`Concept "${c.title}" is missing explanation levels`);
      }
    }

    return { result: parsed, parseError: "" };
  } catch (e) {
    return {
      result: null,
      parseError: e instanceof Error ? e.message : "Unknown parse error",
    };
  }
}

/**
 * Conditional edge: should_retry
 * If result is null (parse failed) and we haven't hit 3 attempts, loop back.
 * Otherwise end. This is what makes LangGraph useful — retry logic as a graph
 * edge, not nested try/catch.
 */
function shouldRetry(state: State): "invoke_model" | typeof END {
  // Max 2 attempts (1 initial + 1 self-correction).
  // 3 retries was causing 3× token burn on bad outputs.
  if (!state.result && state.retries < 2) return "invoke_model";
  return END;
}

// ─── Graph builder ────────────────────────────────────────────────────────────

function buildGraph(userConfig?: UserConfig) {
  const model = buildModel(userConfig);
  const invokeModel = makeInvokeNode(model);

  const graph = new StateGraph(PipelineState)
    .addNode("invoke_model", invokeModel)
    .addNode("parse_and_validate", parseAndValidate)
    .addEdge(START, "invoke_model")
    .addEdge("invoke_model", "parse_and_validate")
    .addConditionalEdges("parse_and_validate", shouldRetry);

  return graph.compile();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function extractAndExplain(
  content: string,
  userConfig?: UserConfig
): Promise<ExplainResult> {
  const words = content.trim().split(/\s+/);
  const wordCount = words.length;
  // Cap at 2,000 words (~2,500 tokens). Was 4,000 — halved to cut input cost.
  // The model extracts concepts from key ideas, not every word.
  const truncated = words.slice(0, 2000).join(" ");
  const prompt = buildExtractionPrompt(truncated, wordCount);

  const app = buildGraph(userConfig);
  const finalState = await app.invoke({ prompt });

  if (!finalState.result) {
    throw new Error(
      finalState.parseError
        ? `Model returned invalid output after 3 attempts: ${finalState.parseError}`
        : "Model did not return a valid response. Try again."
    );
  }

  return finalState.result;
}
