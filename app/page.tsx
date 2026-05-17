"use client";

import { useState } from "react";
import InputSection from "@/components/InputSection";
import OutputSection from "@/components/OutputSection";
import SettingsModal, { useApiKey } from "@/components/SettingsModal";
import { ExplainResult } from "@/lib/claude";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { apiKey, saveKey } = useApiKey();

  const handleSubmit = async (content: string) => {
    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, apiKey: apiKey || undefined }),
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

          <div className="flex items-center gap-2">
            {state === "done" && (
              <button
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors border border-stone-700 hover:border-stone-500 px-3 py-1.5 rounded-lg"
              >
                New content
              </button>
            )}
            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              title="Settings"
              className={`p-2 rounded-lg border transition-colors ${
                apiKey
                  ? "border-amber-600 text-amber-500 hover:border-amber-400"
                  : "border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {state === "idle" && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-stone-100 leading-tight mb-4">
                Turn any transcript into<br />
                <span className="text-amber-400">caveman brainrot</span>
              </h2>
              <p className="text-stone-400 text-lg max-w-md mx-auto">
                Paste a YouTube URL or raw text. Get the key concepts explained at 5 levels — from caveman grunt to expert depth.
              </p>
            </div>

            {/* API key nudge */}
            {!apiKey && (
              <button
                onClick={() => setShowSettings(true)}
                className="mb-8 flex items-center gap-2 text-xs text-amber-500 border border-amber-800 bg-amber-950/40 px-4 py-2 rounded-full hover:border-amber-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Add your own Gemini API key → Settings
              </button>
            )}

            <InputSection onSubmit={handleSubmit} isLoading={false} />

            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              <span className="text-stone-600 text-sm self-center">Try with:</span>
              {["Redis explained", "How TCP/IP works", "What is Docker", "Neural networks"].map((ex) => (
                <span key={ex} className="text-xs bg-stone-900 border border-stone-700 text-stone-400 px-3 py-1.5 rounded-full">
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
                <span key={step} className="text-xs text-stone-600 bg-stone-900 border border-stone-800 px-3 py-1 rounded-full">
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
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-sm font-medium transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-2.5 border border-amber-700 text-amber-500 hover:bg-amber-950/40 rounded-xl text-sm font-medium transition-colors"
              >
                Check API Key
              </button>
            </div>
          </div>
        )}

        {state === "done" && result && (
          <OutputSection result={result} onReset={handleReset} />
        )}
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onKeySaved={(key) => {
            saveKey(key);
            setShowSettings(false);
          }}
        />
      )}
    </main>
  );
}
