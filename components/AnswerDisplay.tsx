"use client";

import { LEVEL_EMOJIS, LEVEL_NAMES } from "@/lib/prompts";

interface AnswerDisplayProps {
  question: string;
  answer: string;
  level: number;
}

/**
 * Renders the brainrot answer.
 * The model returns numbered lines separated by blank lines (paragraph groups).
 * We render each group as a block, with lines styled per level.
 */
export default function AnswerDisplay({ question, answer, level }: AnswerDisplayProps) {
  // Split into paragraph groups on blank lines
  const groups = answer
    .split(/\n{2,}/)
    .map((g) => g.trim())
    .filter(Boolean);

  const isLevel1 = level === 1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question echo */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
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
          {groups.map((group, gi) => {
            const lines = group
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);

            return (
              <div key={gi} className="space-y-1">
                {lines.map((line, li) => {
                  // Highlight -> as a styled arrow
                  const parts = line.split("->").map((p, i, arr) => (
                    <span key={i}>
                      {p}
                      {i < arr.length - 1 && (
                        <span className="text-amber-500 font-bold mx-1">→</span>
                      )}
                    </span>
                  ));

                  return (
                    <p
                      key={li}
                      className={`leading-snug ${
                        isLevel1
                          ? "font-black text-lg uppercase tracking-wide text-stone-100"
                          : level === 2
                          ? "font-medium text-base text-stone-200"
                          : level === 3
                          ? "font-normal text-base text-stone-200"
                          : level === 4
                          ? "font-normal text-[15px] text-stone-200 leading-relaxed"
                          : "font-normal text-sm text-stone-300 font-mono leading-relaxed"
                      }`}
                    >
                      {parts}
                    </p>
                  );
                })}
              </div>
            );
          })}

          {/* Level badge */}
          <p className="text-stone-600 text-xs mt-2">
            {LEVEL_EMOJIS[level]} {LEVEL_NAMES[level]} level
          </p>
        </div>
      </div>
    </div>
  );
}
