"use client";

import { LEVEL_EMOJIS, LEVEL_NAMES } from "@/lib/prompts";

interface AnswerDisplayProps {
  question: string;
  answer: string;
  level: number;
}

const TEXT_STYLE: Record<number, string> = {
  1: "font-black text-lg uppercase tracking-wide text-stone-100 leading-snug",
  2: "font-medium text-base text-stone-200 leading-snug",
  3: "font-normal text-base text-stone-200 leading-snug",
  4: "font-normal text-[15px] text-stone-200 leading-relaxed",
  5: "font-normal text-sm text-stone-300 font-mono leading-relaxed",
};

/** Render a line's text, turning -> into a styled amber arrow */
function renderLine(text: string) {
  // Strip any leading number+dot the model may have added (we handle numbering ourselves)
  const stripped = text.replace(/^\d+\.\s*/, "");
  const parts = stripped.split("->");

  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <span className="text-amber-500 font-bold mx-1">→</span>
      )}
    </span>
  ));
}

export default function AnswerDisplay({ question, answer, level }: AnswerDisplayProps) {
  // Split into paragraph groups on blank lines, collect all lines with their group index
  const groups: string[][] = answer
    .split(/\n{2,}/)
    .map((g) =>
      g.split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    )
    .filter((g) => g.length > 0);

  // Build a flat counter across all groups for continuous numbering
  let counter = 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 text-stone-400">
          you
        </div>
        <p className="text-stone-300 text-base font-medium pt-0.5">{question}</p>
      </div>

      {/* Answer */}
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shrink-0 mt-0.5">
          {LEVEL_EMOJIS[level]}
        </div>

        <div className="flex-1 space-y-4">
          {groups.map((lines, gi) => (
            <div key={gi} className="space-y-1.5">
              {lines.map((line) => {
                counter += 1;
                const n = counter;
                return (
                  <div key={n} className="flex items-baseline gap-2">
                    {/* Number */}
                    <span className="text-stone-600 text-xs font-mono w-5 shrink-0 text-right select-none">
                      {n}.
                    </span>
                    {/* Line */}
                    <p className={TEXT_STYLE[level]}>
                      {renderLine(line)}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}

          <p className="text-stone-700 text-xs mt-3 ml-7">
            {LEVEL_EMOJIS[level]} {LEVEL_NAMES[level]} level
          </p>
        </div>
      </div>
    </div>
  );
}
