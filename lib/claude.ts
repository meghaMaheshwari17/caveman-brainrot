/**
 * lib/claude.ts — Brainrot Q&A pipeline using LangGraph
 *
 * GRAPH:
 *   START → invoke_model → validate → [valid: END | too short: retry → invoke_model]
 *
 * One question + one level → one flowing brainrot answer (numbered lines).
 * No cards, no JSON parsing — just raw text output validated for length.
 *
 * PROVIDER PRIORITY:
 * 1. User key from Settings (Groq / Gemini / OpenAI)
 * 2. On-prem Devstral (DEVSTRAL_BASE_URL + DEVSTRAL_API_KEY)
 * 3. GROQ_API_KEY env (free, recommended fallback)
 * 4. OPENAI_API_KEY env
 * 5. GEMINI_API_KEY env
 */

import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { buildBrainrotPrompt } from "./prompts";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProvider = "gemini" | "openai" | "groq";

export interface UserConfig {
  provider: UserProvider;
  apiKey: string;
}

// ─── Graph state ──────────────────────────────────────────────────────────────

const PipelineState = Annotation.Root({
  prompt: Annotation<string>({ reducer: (_, y) => y, default: () => "" }),
  answer: Annotation<string>({ reducer: (_, y) => y, default: () => "" }),
  retries: Annotation<number>({ reducer: (_, y) => y, default: () => 0 }),
});

type State = typeof PipelineState.State;

// ─── Model factory ────────────────────────────────────────────────────────────

function buildModel(userConfig?: UserConfig) {
  const MAX_TOKENS = 1000; // Brainrot answers are short — no need for more

  if (userConfig?.apiKey && userConfig?.provider) {
    if (userConfig.provider === "groq") {
      return new ChatOpenAI({
        apiKey: userConfig.apiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        maxTokens: MAX_TOKENS,
        configuration: { baseURL: "https://api.groq.com/openai/v1" },
      });
    }
    if (userConfig.provider === "gemini") {
      return new ChatGoogleGenerativeAI({
        apiKey: userConfig.apiKey,
        model: "gemini-2.0-flash",
        temperature: 0.4,
        maxOutputTokens: MAX_TOKENS,
      });
    }
    if (userConfig.provider === "openai") {
      return new ChatOpenAI({
        apiKey: userConfig.apiKey,
        model: "gpt-4o-mini",
        temperature: 0.4,
        maxTokens: MAX_TOKENS,
      });
    }
  }

  if (process.env.DEVSTRAL_BASE_URL && process.env.DEVSTRAL_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.DEVSTRAL_API_KEY,
      model: process.env.DEVSTRAL_MODEL || "devstral",
      configuration: { baseURL: process.env.DEVSTRAL_BASE_URL },
      temperature: 0.4,
      maxTokens: MAX_TOKENS,
    });
  }

  if (process.env.GROQ_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      maxTokens: MAX_TOKENS,
      configuration: { baseURL: "https://api.groq.com/openai/v1" },
    });
  }

  if (process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0.4,
      maxTokens: MAX_TOKENS,
    });
  }

  if (process.env.GEMINI_API_KEY) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      temperature: 0.4,
      maxOutputTokens: MAX_TOKENS,
    });
  }

  throw new Error(
    "No AI model configured. Add your Groq / Gemini / OpenAI key in ⚙️ Settings — Groq is free!"
  );
}

// ─── Graph nodes ──────────────────────────────────────────────────────────────

function makeInvokeNode(model: ReturnType<typeof buildModel>) {
  return async (state: State): Promise<Partial<State>> => {
    // On retry, remind the model to follow the format
    const prompt =
      state.retries > 0
        ? `${state.prompt}\n\nIMPORTANT: Return ONLY numbered lines like "1. ..." with blank lines between groups. No other text.`
        : state.prompt;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const raw =
      typeof response.content === "string"
        ? response.content.trim()
        : JSON.stringify(response.content);

    return { answer: raw, retries: state.retries + 1 };
  };
}

function validateAnswer(state: State): Partial<State> {
  // Answer must have at least 3 numbered lines to be valid
  const lineCount = (state.answer.match(/^\d+\./gm) || []).length;
  if (lineCount < 3) return { answer: "" };
  return {};
}

function shouldRetry(state: State): "invoke_model" | typeof END {
  if (!state.answer && state.retries < 2) return "invoke_model";
  return END;
}

// ─── Graph builder ────────────────────────────────────────────────────────────

function buildGraph(userConfig?: UserConfig) {
  const model = buildModel(userConfig);
  const invokeModel = makeInvokeNode(model);

  const graph = new StateGraph(PipelineState)
    .addNode("invoke_model", invokeModel)
    .addNode("validate", validateAnswer)
    .addEdge(START, "invoke_model")
    .addEdge("invoke_model", "validate")
    .addConditionalEdges("validate", shouldRetry);

  return graph.compile();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function askBrainrot(
  question: string,
  level: number,
  userConfig?: UserConfig
): Promise<string> {
  const prompt = buildBrainrotPrompt(question, level);
  const app = buildGraph(userConfig);
  const finalState = await app.invoke({ prompt });

  if (!finalState.answer) {
    throw new Error("The model didn't return a valid answer. Try again.");
  }

  return finalState.answer;
}
