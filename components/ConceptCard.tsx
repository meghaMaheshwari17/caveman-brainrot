"use client";

import { useState } from "react";
import { Concept } from "@/lib/claude";
import { LEVEL_NAMES, LEVEL_EMOJIS } from "@/lib/prompts";

interface ConceptCardProps {
  concept: Concept;
  index: number;
}

const LEVEL_STYLES: Record<number, { border: string; badge: string; button: string }> = {
  1: {
    border: "border-stone-600",
    badge: "bg-stone-700 text-stone-200",
    button: "bg-stone-700 hover:bg-stone-600 text-stone-100 font-black tracking-widest uppercase text-xs",
  },
  2: {
    border: "border-yellow-700",
    badge: "bg-yellow-900 text-yellow-200",
    button: "bg-yellow-700 hover:bg-yellow-600 text-yellow-100 font-bold text-sm rounded-full",
  },
  3: {
    border: "border-green-700",
    badge: "bg-green-900 text-green-200",
    button: "bg-green-700 hover:bg-green-600 text-green-100 font-semibold text-sm",
  },
  4: {
    border: "border-blue-700",
    badge: "bg-blue-900 text-blue-200",
    button: "bg-blue-700 hover:bg-blue-600 text-blue-100 font-medium text-sm",
  },
  5: {
    border: "border-purple-700",
    badge: "bg-purple-900 text-purple-200",
    button: "bg-purple-700 hover:bg-purple-600 text-purple-100 font-medium text-sm",
  },
};

const LEVEL_FONTS: Record<number, string> = {
  1: "font-black text-lg leading-relaxed tracking-wide uppercase",
  2: "font-medium text-base leading-relaxed",
  3: "font-normal text-base leading-relaxed",
  4: "font-normal text-base leading-relaxed",
  5: "font-normal text-sm leading-relaxed font-mono",
};

export default function ConceptCard({ concept, index }: ConceptCardProps) {
  const [level, setLevel] = useState(1);
  const [animating, setAnimating] = useState(false);

  const evolve = () => {
    if (level >= 5 || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setLevel((l) => l + 1);
      setAnimating(false);
    }, 200);
  };

  const devolve = () => {
    if (level <= 1 || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setLevel((l) => l - 1);
      setAnimating(false);
    }, 200);
  };

  const style = LEVEL_STYLES[level];
  const levelKey = String(level) as keyof typeof concept.levels;

  return (
    <div
      className={`rounded-2xl border-2 ${style.border} bg-stone-900 p-5 flex flex-col gap-4 transition-all duration-300`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-stone-100 font-bold text-base">{concept.title}</h3>
          <p className="text-stone-500 text-xs mt-0.5">{concept.whyItMatters}</p>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${style.badge}`}>
          {LEVEL_EMOJIS[level]} {LEVEL_NAMES[level]}
        </span>
      </div>

      {/* Level dots */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((l) => (
          <div
            key={l}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              l <= level ? "bg-amber-500" : "bg-stone-700"
            }`}
          />
        ))}
      </div>

      {/* Explanation */}
      <div
        className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        <p className={`text-stone-200 ${LEVEL_FONTS[level]}`}>
          {concept.levels[levelKey]}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-2">
        <button
          onClick={devolve}
          disabled={level <= 1 || animating}
          className="text-stone-500 hover:text-stone-300 disabled:opacity-20 text-xs transition-colors px-2 py-1"
        >
          ← Dumb it down
        </button>

        <button
          onClick={evolve}
          disabled={level >= 5 || animating}
          className={`px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${style.button}`}
        >
          {level >= 5 ? "MAX EVOLVED 🔬" : `Evolve →`}
        </button>
      </div>
    </div>
  );
}
