"use client";

import { useState } from "react";

interface InputSectionProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export default function InputSection({ onSubmit, isLoading }: InputSectionProps) {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async () => {
    setFetchError("");

    if (mode === "url") {
      if (!url.trim()) return;
      setIsFetching(true);
      try {
        const res = await fetch("/api/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onSubmit(data.transcript);
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : "Failed to fetch transcript");
      } finally {
        setIsFetching(false);
      }
    } else {
      if (!text.trim()) return;
      onSubmit(text.trim());
    }
  };

  const busy = isLoading || isFetching;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-stone-700 mb-5 w-fit mx-auto">
        <button
          onClick={() => setMode("url")}
          className={`px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
            mode === "url"
              ? "bg-amber-500 text-stone-900"
              : "bg-stone-900 text-stone-400 hover:text-stone-200"
          }`}
        >
          🔗 YouTube URL
        </button>
        <button
          onClick={() => setMode("text")}
          className={`px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
            mode === "text"
              ? "bg-amber-500 text-stone-900"
              : "bg-stone-900 text-stone-400 hover:text-stone-200"
          }`}
        >
          📄 Paste Text
        </button>
      </div>

      {/* Input */}
      {mode === "url" ? (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && handleSubmit()}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-5 py-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors text-base"
          disabled={busy}
        />
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste any text, article, transcript, or notes here..."
          rows={7}
          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-5 py-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors text-base resize-none"
          disabled={busy}
        />
      )}

      {fetchError && (
        <p className="mt-3 text-red-400 text-sm text-center">{fetchError}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={busy || (mode === "url" ? !url.trim() : !text.trim())}
        className="mt-4 w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all duration-200
          bg-amber-500 text-stone-900 hover:bg-amber-400
          disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-[0.98]"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            {isFetching ? "Fetching transcript..." : "Caveman-ifying..."}
          </span>
        ) : (
          "🪨 Turn Into Brainrot"
        )}
      </button>
    </div>
  );
}
