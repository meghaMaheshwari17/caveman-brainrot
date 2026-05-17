"use client";

import { ExplainResult } from "@/lib/claude";
import ConceptCard from "./ConceptCard";

interface OutputSectionProps {
  result: ExplainResult;
  onReset: () => void;
}

export default function OutputSection({ result, onReset }: OutputSectionProps) {
  const { topic, compressionStats, concepts } = result;

  const inputMins = Math.round(compressionStats.inputWordCount / 150);
  const readMins = compressionStats.estimatedReadMinutes;
  const compressionRatio = inputMins > 0 ? Math.round(inputMins / readMins) : 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Topic header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-stone-100 mb-4">{topic}</h2>

        {/* Stats */}
        <div className="inline-flex items-center gap-6 bg-stone-900 border border-stone-700 rounded-2xl px-6 py-3 text-sm">
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{compressionStats.inputWordCount.toLocaleString()}</div>
            <div className="text-stone-500 text-xs">words in</div>
          </div>
          <div className="text-stone-600 text-xl">→</div>
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{concepts.length}</div>
            <div className="text-stone-500 text-xs">key concepts</div>
          </div>
          <div className="text-stone-600 text-xl">→</div>
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{readMins} min</div>
            <div className="text-stone-500 text-xs">to understand</div>
          </div>
          {compressionRatio > 1 && (
            <>
              <div className="text-stone-600 text-xl">·</div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">{compressionRatio}×</div>
                <div className="text-stone-500 text-xs">faster</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hint */}
      <p className="text-stone-500 text-sm text-center mb-6">
        Each card starts in caveman mode. Hit <span className="text-amber-400 font-semibold">Evolve →</span> to level up the explanation.
      </p>

      {/* Concept grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, i) => (
          <ConceptCard key={concept.id} concept={concept} index={i} />
        ))}
      </div>

      {/* Reset */}
      <div className="text-center mt-10">
        <button
          onClick={onReset}
          className="text-stone-500 hover:text-stone-300 text-sm transition-colors underline underline-offset-4"
        >
          ← Start over with new content
        </button>
      </div>
    </div>
  );
}
