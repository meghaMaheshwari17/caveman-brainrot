import { NextRequest, NextResponse } from "next/server";
import { extractAndExplain, UserProvider } from "@/lib/claude";

const VALID_PROVIDERS: UserProvider[] = ["gemini", "openai"];

export async function POST(req: NextRequest) {
  try {
    const { content, provider, apiKey } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return NextResponse.json(
        { error: "Content is too short. Please provide at least a few sentences." },
        { status: 400 }
      );
    }

    // Build user config only if they provided a valid key + provider
    const userConfig =
      apiKey && provider && VALID_PROVIDERS.includes(provider)
        ? { provider: provider as UserProvider, apiKey }
        : undefined;

    const result = await extractAndExplain(content, userConfig);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
