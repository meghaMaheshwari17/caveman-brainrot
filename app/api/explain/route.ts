import { NextRequest, NextResponse } from "next/server";
import { askBrainrot, UserProvider } from "@/lib/claude";

const VALID_PROVIDERS: UserProvider[] = ["gemini", "openai", "groq"];

export async function POST(req: NextRequest) {
  try {
    const { question, level, provider, apiKey } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return NextResponse.json({ error: "Ask me something first." }, { status: 400 });
    }

    const resolvedLevel = typeof level === "number" && level >= 1 && level <= 5 ? level : 1;

    const userConfig =
      apiKey && provider && VALID_PROVIDERS.includes(provider)
        ? { provider: provider as UserProvider, apiKey }
        : undefined;

    const answer = await askBrainrot(question.trim(), resolvedLevel, userConfig);
    return NextResponse.json({ answer });
  } catch (error) {
    let message = error instanceof Error ? error.message : "Something went wrong";

    if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("rate limit")) {
      message = "You've hit your API quota. Switch to Groq in ⚙️ Settings — it's free and fast.";
    } else if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
      message = "Invalid API key. Double-check it in ⚙️ Settings.";
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
