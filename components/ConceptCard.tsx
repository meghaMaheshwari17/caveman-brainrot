"use client";

import { useState } from "react";
import { Concept } from "@/lib/claude";
import { LEVEL_NAMES, LEVEL_EMOJIS } from "@/lib/prompts";

interface ConceptCardProps {
  concept: Concept;
  index: number;
}

const LEVEL_STYLES: Record<number, {
  border: string;
  headerBg: string;
  badge: string;
  button: string;
  textColor: string;
}> = {
  1: {
    border: "border-stone-700",
    headerBg: "bg-stone-800/60",
    badge: "bg-stone-700 text-stone-300",
    button: "bg-stone-700 hover:bg-stone-600 text-stone-100 font-black tracking-wider uppercase text-xs border border-stone-600",
    textColor: "text-stone-100",
  },
  2: {
    border: "border-yellow-800/60",
    headerBg: "bg-yellow-950/40",
    badge: "bg-yellow-900/60 text-yellow-300",
    button: "bg-yellow-600 hover:bg-yellow-500 text-yellow-950 font-bold text-sm rounded-full",
    textColor: "text-stone-100",
  },
  3: {
    border: "border-green-800/60",
    headerBg: "bg-green-950/30",
    badge: "bg-green-900/60 text-green-300",
    button: "bg-green-600 hover:bg-green-500 text-white font-semibold text-sm",
    textColor: "text-stone-100",
  },
  4: {
    border: "border-blue-800/60",
    headerBg: "bg-blue-950/30",
    badge: "bg-blue-900/60 text-blue-300",
    button: "bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm",
    textColor: "text-stone-100",
  },
  5: {
    border: "border-purple-800/60",
    headerBg: "bg-purple-950/30",
    badge: "bg-purple-900/60 text-purple-300",
    button: "bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm",
    textColor: "text-stone-100",
  },
};

const LEVEL_FONTS: Record<number, string> = {
  1: "font-black text-xl leading-snug tracking-wider uppercase",
  2: "font-medium text-base leading-relaxed",
  3: "font-normal text-base leading-relaxed",
  4: "font-normal text-[15px] leading-relaxed",
  5: "font-normal text-sm leading-relaxed font-mono",
};

const LEVEL_BG: Record<number, string> = {
  1: "bg-stone-900",
  2: "bg-stone-900",
  3: "bg-stone-900",
  4: "bg-stone-900",
  5: "bg-stone-900",
};

const EVOLVE_LABELS: Record<number, string> = {
  1: "Evolve 🧸",
  2: "Evolve 🎮",
  3: "Evolve 🧠",
  4: "Evolve 🔬",
  5: "MAXED OUT 🔬",
};

export default function ConceptCard({ concept, index }: ConceptCardProps) {
  const [level, setLevel] = useState(1);
  const [animating, setAnimating] = useState(false);

  const evolve = () => {
    if (level >= 5 || animating) return;
    setAnimating(true);
    setTimeout(() => { setLevel((l) => l + 1); setAnimating(false); }, 180);
  };

  const devolve = () => {
    if (level <= 1 || animating) return;
    setAnimating(true);
    setTimeout(() => { setLevel((l) => l - 1); setAnimating(false); }, 180);
  };

  const style = LEVEL_STYLES[level];
  const levelKey = String(level) as keyof typeof concept.levels;

  return (
    <div
      className={`rounded-2xl border ${style.border} ${LEVEL_BG[level]} flex flex-col overflow-hidden transition-all duration-300`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Card header */}
      <div className={`${style.headerBg} px-4 pt-4 pb-3 border-b border-stone-800/60`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-stone-100 font-bold text-sm leading-snug">{concept.title}</h3>
            <p className="text-stone-500 text-xs mt-0.5 leading-snug line-clamp-2">{concept.whyItMatters}</p>
          </div>
          <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${style.badge}`}>
            {LEVEL_EMOJIS[level]} {LEVEL_NAMES[level]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mt-3">
          {[1, 2, 3, 4, 5].map((l) => (
            <button
              key={l}
              onClick={() => {
                if (animating) return;
                setAnimating(true);
                setTimeout(() => { setLevel(l); setAnimating(false); }, 150);
              }}
              className={`h-1 flex-1 rounded-full transition-all duration-300 hover:opacity-80 ${
                l <= level ? "bg-amber-500" : "bg-stone-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 flex-1">
        <div className={`transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}>
          <p className={`${style.textColor} ${LEVEL_FONTS[level]}`}>
            {concept.levels[levelKey]}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-4 flex items-center justify-between gap-3">
        <button
          onClick={devolve}
          disabled={level <= 1 || animating}
          className="text-stone-600 hover:text-stone-400 disabled:opacity-20 text-xs transition-colors flex items-center gap-1"
        >
          ← simpler
        </button>

        <button
          onClick={evolve}
          disabled={level >= 5 || animating}
          className={`px-4 py-2 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${style.button}`}
        >
          {EVOLVE_LABELS[level]}
        </button>
      </div>
    </div>
  );
}
