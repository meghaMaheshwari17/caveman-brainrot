"use client";

import { useState } from "react";
import InputSection from "@/components/InputSection";
import OutputSection from "@/components/OutputSection";
import { ExplainResult } from "@/lib/claude";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (content: string) => {
    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪨</span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-stone-100">
                Caveman Brainrot
              </h1>
              <p className="text-stone-500 text-xs">Skip the video. Get the knowledge.</p>
            </div>
          </div>
          {state === "done" && (
            <button
              onClick={handleReset}
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors border border-stone-700 hover:border-stone-500 px-3 py-1.5 rounded-lg"
            >
              New content
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {state === "idle" && (
          <div className="flex flex-col items-center">
            {/* Hero */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-stone-100 leading-tight mb-4">
                Turn any transcript into<br />
                <span className="text-amber-400">caveman brainrot</span>
              </h2>
              <p className="text-stone-400 text-lg max-w-md mx-auto">
                Paste a YouTube URL or raw text. Get the key concepts explained at 5 levels — from caveman grunt to expert depth.
              </p>
            </div>

            <InputSection onSubmit={handleSubmit} isLoading={false} />

            {/* Example chips */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              <span className="text-stone-600 text-sm self-center">Try with:</span>
              {["Redis explained", "How TCP/IP works", "What is Docker", "Neural networks"].map((ex) => (
                <span
                  key={ex}
                  className="text-xs bg-stone-900 border border-stone-700 text-stone-400 px-3 py-1.5 rounded-full"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="w-16 h-16 border-4 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-stone-300 font-semibold text-lg">Caveman is thinking...</p>
              <p className="text-stone-500 text-sm mt-1">Extracting key concepts and generating all 5 levels</p>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {["Extracting concepts", "Crafting explanations", "Evolving language"].map((step) => (
                <span
                  key={step}
                  className="text-xs text-stone-600 bg-stone-900 border border-stone-800 px-3 py-1 rounded-full"
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="text-5xl">💀</div>
            <div className="text-center">
              <p className="text-red-400 font-semibold text-lg">Caveman confused</p>
              <p className="text-stone-500 text-sm mt-1 max-w-sm">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {state === "done" && result && (
          <OutputSection result={result} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
