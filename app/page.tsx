"use client";

import { useState, useEffect } from "react";
import InputSection from "@/components/InputSection";
import OutputSection from "@/components/OutputSection";
import SettingsModal, { useUserSettings } from "@/components/SettingsModal";
import { ExplainResult } from "@/lib/claude";

type AppState = "idle" | "loading" | "done" | "error";

const LOADING_LINES = [
  "UGH. CAVEMAN THINKING... 🪨",
  "Converting human gibberish to cave speech...",
  "Banging rocks together to generate knowledge...",
  "Teaching mammoth to understand Docker...",
  "Finding fire in the information...",
  "Dragging concepts out of the long video cave...",
  "Grunting at the AI oracle...",
  "Removing all the fluff (and the clothes)...",
];

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const { settings, saveSettings } = useUserSettings();

  const isUserKey = !!(settings.provider && settings.apiKey);
  const providerLabel = settings.provider === "gemini" ? "Gemini" : settings.provider === "openai" ? "OpenAI" : null;

  // Rotate loading messages
  useEffect(() => {
    if (state !== "loading") return;
    const t = setInterval(() => setLoadingLine((l) => (l + 1) % LOADING_LINES.length), 2200);
    return () => clearInterval(t);
  }, [state]);

  const handleSubmit = async (content: string) => {
    setState("loading");
    setLoadingLine(0);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          provider: settings.provider || undefined,
          apiKey: settings.apiKey || undefined,
        }),
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
    <main className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-500/30">

      {/* Subtle cave texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
      />

      {/* Header */}
      <div className="relative border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">🪨</span>
              <span className="absolute -top-1 -right-1 text-[10px]">✨</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-stone-100 leading-none">
                Caveman Brainrot
              </h1>
              <p className="text-stone-600 text-[11px] mt-0.5 font-medium">big brain · small words · ugh.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state === "done" && (
              <button onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-300 border border-stone-800 hover:border-stone-700 px-3 py-1.5 rounded-lg transition-all">
                ← new content
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isUserKey
                  ? "border-amber-600/60 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10"
                  : "border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-700"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isUserKey ? providerLabel : "Settings"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">

        {/* ── IDLE ── */}
        {state === "idle" && (
          <div className="flex flex-col items-center">

            <div className="text-center mb-10 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                🔥 1 hour video → 4 concepts → 2 min read
              </div>

              <h2 className="text-5xl font-black text-stone-100 leading-[1.1] mb-4 tracking-tight">
                No watch.<br />
                <span className="text-amber-400">Only know.</span>
              </h2>
              <p className="text-stone-400 text-base leading-relaxed">
                Drop a YouTube URL or paste any text. Caveman finds the key ideas
                and explains them from <span className="text-stone-300 font-medium">grunt</span> to <span className="text-stone-300 font-medium">expert</span>.
                Tap to evolve. 🦴
              </p>
            </div>

            {!isUserKey && (
              <button
                onClick={() => setShowSettings(true)}
                className="mb-8 flex items-center gap-2 text-xs text-stone-400 border border-stone-800 bg-stone-900/60 px-4 py-2 rounded-full hover:border-stone-700 hover:text-stone-300 transition-all"
              >
                🦖 Using Devstral by default · Add Gemini or OpenAI key →
              </button>
            )}

            <InputSection onSubmit={handleSubmit} isLoading={false} />

            {/* Example chips */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              <span className="text-stone-700 text-xs self-center font-medium">Try:</span>
              {[
                { label: "⚡ Redis", topic: "Why Redis is fast" },
                { label: "🐳 Docker", topic: "What Docker does" },
                { label: "🧠 Neural nets", topic: "How neural networks learn" },
                { label: "🔒 TCP/IP", topic: "How TCP/IP works" },
              ].map((ex) => (
                <span key={ex.label}
                  className="text-xs bg-stone-900 border border-stone-800 text-stone-500 px-3 py-1.5 rounded-full hover:border-stone-700 hover:text-stone-400 transition-colors cursor-default">
                  {ex.label}
                </span>
              ))}
            </div>

            {/* How it works — 3 steps */}
            <div className="mt-14 grid grid-cols-3 gap-4 w-full max-w-lg text-center">
              {[
                { icon: "📥", step: "1", label: "Drop it in", desc: "URL or raw text" },
                { icon: "🧠", step: "2", label: "Caveman thinks", desc: "AI extracts key concepts" },
                { icon: "🪨", step: "3", label: "Evolve it", desc: "Tap to go from grunt → expert" },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-xl">
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-stone-300 text-xs font-bold">{s.label}</div>
                    <div className="text-stone-600 text-[11px]">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-6 py-24">
            {/* Spinning rock */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-stone-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🪨</div>
            </div>

            {/* Rotating messages */}
            <div className="text-center space-y-2 min-h-[3rem]">
              <p key={loadingLine} className="text-stone-300 font-bold text-base animate-in fade-in duration-500">
                {LOADING_LINES[loadingLine]}
              </p>
              <p className="text-stone-600 text-xs">
                LangGraph pipeline: invoke → validate{isUserKey ? ` · via ${providerLabel}` : " · via Devstral"}
              </p>
            </div>

            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-5 py-24">
            <div className="text-6xl animate-bounce">💀</div>
            <div className="text-center max-w-sm">
              <p className="text-stone-100 font-black text-xl mb-1">UGH. BRAIN HURT.</p>
              <p className="text-stone-500 text-sm leading-relaxed">{error}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleReset}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-sm font-semibold transition-colors">
                Try again
              </button>
              <button onClick={() => setShowSettings(true)}
                className="px-5 py-2.5 border border-amber-700/60 text-amber-500 hover:bg-amber-500/10 rounded-xl text-sm font-semibold transition-colors">
                ⚙️ Check Settings
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {state === "done" && result && (
          <OutputSection result={result} onReset={handleReset} />
        )}
      </div>

      {showSettings && (
        <SettingsModal
          currentSettings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(next) => {
            saveSettings(next);
            setShowSettings(false);
          }}
        />
      )}
    </main>
  );
}
