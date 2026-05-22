import { NextRequest, NextResponse } from "next/server";
import { extractAndExplain, UserProvider } from "@/lib/claude";

const VALID_PROVIDERS: UserProvider[] = ["gemini", "openai", "groq"];

export async function POST(req: NextRequest) {
  try {
    const { content, provider, apiKey } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return NextResponse.json(
        { error: "Content is too short. Please provide at least a few sentences." },
        { status: 400 }
      );
    }

    const userConfig =
      apiKey && provider && VALID_PROVIDERS.includes(provider)
        ? { provider: provider as UserProvider, apiKey }
        : undefined;

    const result = await extractAndExplain(content, userConfig);
    return NextResponse.json(result);
  } catch (error) {
    let message = error instanceof Error ? error.message : "Failed to process content";

    // Give actionable guidance for the most common errors
    if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("rate limit")) {
      message =
        "You've hit your API quota or rate limit. " +
        "Try Groq in ⚙️ Settings — it's free and has generous limits (Llama 3.3 70B). " +
        "Or check your billing at platform.openai.com / aistudio.google.com.";
    } else if (message.includes("401") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("invalid api key")) {
      message = "Invalid API key. Double-check it in ⚙️ Settings.";
    } else if (message.includes("503") || message.toLowerCase().includes("overloaded")) {
      message = "The AI provider is overloaded. Wait a moment and try again, or switch providers in ⚙️ Settings.";
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
