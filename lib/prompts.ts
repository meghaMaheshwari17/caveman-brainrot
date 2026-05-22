export const LEVEL_NAMES: Record<number, string> = {
  1: "Caveman",
  2: "Toddler",
  3: "Middle Schooler",
  4: "Normal Human",
  5: "Expert",
};

export const LEVEL_EMOJIS: Record<number, string> = {
  1: "🪨",
  2: "🧸",
  3: "🎮",
  4: "🧠",
  5: "🔬",
};

export const buildExtractionPrompt = (content: string, wordCount: number) => `
You are an expert teacher. Extract 4-6 load-bearing concepts from the content below — ideas that, if skipped, break understanding of the whole topic. Then explain each at 5 levels.

LEVEL RULES (follow strictly):

🪨 LEVEL 1 — CAVEMAN
- Max 5 words per sentence. Use CAPS for key word.
- Only: fire, food, hunt, tribe, rock, big, small, fast, slow, good, bad, strong, weak, store, find, give, take, run, build, eat, know, remember + the concept word
- Start with "UGH." — 3-4 sentences. Map everything to food/fire/hunting/shelter.
- Example: "UGH. FIRE cook meat. Meat give strong. No fire, tribe die."

🧸 LEVEL 2 — TODDLER
- Objects a 5-year-old knows: toys, juice, cookies, playground, blocks, TV, backpack, puppy
- Must include "It's like when you..." at least once
- Max 2-syllable words, use "because" to chain logic — 3-5 sentences

🎮 LEVEL 3 — MIDDLE SCHOOLER
- Use gaming/YouTube analogy: Minecraft, Discord, lag, loading screen, inventory, Wi-Fi, respawn, loot
- Introduce exactly ONE technical term with brackets: "cache [a super-fast storage spot]"
- Use: "basically", "lowkey", "imagine if", "ngl" — 4-6 sentences

🧠 LEVEL 4 — NORMAL HUMAN
- Smart-friend tone. Every new technical term gets a plain-English definition in parentheses on first use.
- One real-world analogy (library, kitchen, traffic, etc.)
- Cover: what it is → why it matters → one trade-off — 5-7 sentences

🔬 LEVEL 5 — EXPERT
- Full technical precision. No analogies, no hand-holding.
- Cover: mechanism, performance characteristics, trade-offs vs alternatives, when NOT to use it, common pitfalls.
- Name at least one alternative approach and contrast it — 6-9 sentences

EDGE CASES:
- Abstract concepts: Level 1-2 must use food/hunting/toy parallel — always findable
- Math-heavy: Level 1-2 explain intuition only, Level 4-5 can use notation
- Non-technical content: same rules, extract the load-bearing ideas

OUTPUT — strict JSON only, no markdown, no extra text:
{
  "topic": "3-5 word topic",
  "compressionStats": {
    "inputWordCount": ${wordCount},
    "estimatedReadMinutes": 0
  },
  "concepts": [
    {
      "id": "concept-1",
      "title": "2-4 word title",
      "whyItMatters": "One sentence: why skipping this breaks understanding.",
      "levels": {
        "1": "caveman text",
        "2": "toddler text",
        "3": "middle schooler text",
        "4": "normal human text",
        "5": "expert text"
      }
    }
  ]
}

Set estimatedReadMinutes = number of concepts × 0.5.

CONTENT:
${content}
`.trim();
