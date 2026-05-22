"use client";

import { useState, useRef, useEffect } from "react";
import AnswerDisplay from "@/components/AnswerDisplay";
import SettingsModal, { useUserSettings } from "@/components/SettingsModal";
import { LEVEL_EMOJIS, LEVEL_NAMES } from "@/lib/prompts";

interface QA {
  question: string;
  answer: string;
  level: number;
}

const EXAMPLES = [
  "explain caching",
  "what is a database index",
  "why do we use docker",
  "how does TCP work",
  "what is recursion",
  "explain promises in javascript",
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState(1);
  const [history, setHistory] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { settings, saveSettings } = useUserSettings();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isUserKey = !!(settings.provider && settings.apiKey);

  // Scroll to bottom when new answer arrives
  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const handleAsk = async (q?: string) => {
    const text = (q ?? question).trim();
    if (!text || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          level,
          provider: settings.provider || undefined,
          apiKey: settings.apiKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setHistory((h) => [...h, { question: text, answer: data.answer, level }]);
      setQuestion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const providerLabel = settings.provider
    ? settings.provider === "groq" ? "Groq" : settings.provider === "gemini" ? "Gemini" : "OpenAI"
    : null;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🪨</span>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none">Caveman Brainrot</h1>
              <p className="text-stone-600 text-[10px] font-medium mt-0.5">big brain · small words · ugh.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-stone-600 hover:text-stone-400 border border-stone-800 px-2.5 py-1 rounded-lg transition-colors"
              >
                clear
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                isUserKey
                  ? "border-amber-600/50 text-amber-500 bg-amber-500/5"
                  : "border-stone-800 text-stone-500 hover:text-stone-300"
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isUserKey ? providerLabel : "Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Main scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8">

          {/* Empty state */}
          {history.length === 0 && !loading && (
            <div className="flex flex-col items-center text-center py-10">
              <div className="text-5xl mb-4">🪨</div>
              <h2 className="text-2xl font-black mb-2">Ask. Brainrot. Evolve.</h2>
              <p className="text-stone-500 text-sm max-w-xs leading-relaxed mb-8">
                Ask anything. Get an explanation in short numbered lines.
                Switch levels to go from caveman grunt to expert depth.
              </p>

              {/* Example questions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuestion(ex); inputRef.current?.focus(); }}
                    className="text-xs bg-stone-900 border border-stone-800 text-stone-400 px-3 py-1.5 rounded-full hover:border-stone-700 hover:text-stone-300 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {!isUserKey && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="mt-8 flex items-center gap-2 text-xs text-stone-500 border border-stone-800 bg-stone-900/40 px-4 py-2 rounded-full hover:border-stone-700 transition-all"
                >
                  🦖 Using Devstral by default · add Groq / Gemini / OpenAI key →
                </button>
              )}
            </div>
          )}

          {/* Q&A history */}
          <div className="space-y-10">
            {history.map((qa, i) => (
              <AnswerDisplay key={i} question={qa.question} answer={qa.answer} level={qa.level} />
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-start gap-3 mt-10">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shrink-0">
                {LEVEL_EMOJIS[level]}
              </div>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }} />
                ))}
                <span className="text-stone-600 text-xs ml-2">
                  {LEVEL_NAMES[level]} mode...
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-sm shrink-0">💀</div>
              <div>
                <p className="text-red-400 text-sm font-semibold">UGH. BRAIN HURT.</p>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">{error}</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-xs text-amber-500 underline underline-offset-2 mt-1"
                >
                  Check Settings ⚙️
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Sticky input area */}
      <div className="sticky bottom-0 bg-stone-950/95 backdrop-blur-sm border-t border-stone-800/80">
        <div className="max-w-2xl mx-auto px-5 py-4 space-y-3">

          {/* Level picker */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                  level === l
                    ? "bg-amber-500 text-stone-900"
                    : "bg-stone-900 text-stone-500 hover:text-stone-300 border border-stone-800"
                }`}
              >
                <span className="hidden sm:inline">{LEVEL_EMOJIS[l]} </span>
                <span className="sm:hidden">{LEVEL_EMOJIS[l]}</span>
                <span className="hidden sm:inline">{LEVEL_NAMES[l]}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything... e.g. "explain ${EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]}"`}
              rows={1}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none leading-relaxed"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
              disabled={loading}
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              className="h-11 w-11 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-stone-700 text-[10px] text-center">
            Enter to send · Shift+Enter for new line · pick a level above
          </p>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          currentSettings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(next) => { saveSettings(next); setShowSettings(false); }}
        />
      )}
    </main>
  );
}
