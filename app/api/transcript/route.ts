import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "@/lib/transcript";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const transcript = await fetchTranscript(url);
    return NextResponse.json({ transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch transcript";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
