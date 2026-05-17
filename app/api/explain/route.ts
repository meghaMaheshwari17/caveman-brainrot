import { NextRequest, NextResponse } from "next/server";
import { extractAndExplain } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { content, apiKey } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return NextResponse.json(
        { error: "Content is too short. Please provide at least a few sentences." },
        { status: 400 }
      );
    }

    const result = await extractAndExplain(content, apiKey || undefined);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
