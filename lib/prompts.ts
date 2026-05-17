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
You are an expert teacher and content analyst. Analyze the following content and extract the key load-bearing concepts — the ideas that, if someone doesn't understand them, the entire topic becomes incomprehensible.

Then, for each concept, write explanations at 5 different levels of complexity. Follow every rule below with extreme precision.

---

## CONCEPT EXTRACTION RULES:
- Extract between 4 and 8 concepts. Never fewer, never more.
- Each concept must be ESSENTIAL — not just interesting or supplementary. Ask: "If someone skips this, do they lose understanding of the whole?" If yes, include it.
- Order concepts so they build on each other. Foundational concepts first, advanced ones last.
- Title each concept in 2–4 punchy words (e.g., "Cache Invalidation", "Why RAM Wins", "The Trade-Off").

---

## EXPLANATION LEVELS — FOLLOW EVERY RULE EXACTLY:

### LEVEL 1 — CAVEMAN 🪨
Style: A prehistoric caveman who just discovered fire is explaining this.
Rules:
- Every sentence must be 3–6 words MAX. No exceptions.
- Use ONLY these words (plus the concept being explained): fire, food, hunt, tribe, rock, big, small, fast, slow, good, bad, danger, safe, strong, weak, store, find, give, take, run, hit, build, sleep, eat, heavy, shiny, smell, see, know, remember
- If a word isn't in the above list and isn't the core concept word, DO NOT use it
- CAPITALIZE the single most important word in each sentence
- Always start with "UGH."
- 3–4 sentences total, never more
- Everything must be an analogy to food, fire, hunting, or shelter
- Example: "UGH. FIRE cook meat. Meat give strong. No fire, tribe die."
- IMPORTANT: Even if the concept is very technical, find a food/fire/hunt/shelter parallel. Always possible.

### LEVEL 2 — TODDLER 🧸
Style: Explaining to a curious 5-year-old who knows toys, snacks, and playgrounds.
Rules:
- Use ONLY objects a 5-year-old would know: toys, juice box, playground, cookies, TV, backpack, crayons, sandbox, blocks, teddy bear, swing set, stickers, nap time, mommy/daddy, puppy
- Every explanation must include the phrase "It's like when you..." at least once
- Chain logic with "because": "X happens because Y"
- No word should have more than 2 syllables — if it does, replace it or explain it with simple words
- Warm, gentle, enthusiastic tone ("So cool!", "Right?", "See?")
- 3–5 sentences total

### LEVEL 3 — MIDDLE SCHOOLER 🎮
Style: Explaining to a 13-year-old who lives on YouTube, Minecraft, Discord, and memes.
Rules:
- Use at least ONE of these analogies: Minecraft inventory/crafting, YouTube algorithm, Discord server, phone battery, game lag/FPS, respawning, loading screens, Wi-Fi signal, Roblox, leveling up, loot drops
- Introduce EXACTLY ONE technical term from the real domain, immediately followed by a plain-English definition in brackets like: "cache [basically a fast storage spot]"
- Use casual language: "basically", "lowkey", "kinda like", "imagine if", "ngl", "bro"
- Must answer: what is this + why should I care about it personally
- Cover a consequence: "If this didn't exist, then..."
- 4–6 sentences total

### LEVEL 4 — NORMAL HUMAN 🧠
Style: Explaining to a smart adult at dinner who has no background in this field.
Rules:
- Write how you'd speak to an intelligent friend — clear, direct, no condescension
- Every technical term introduced for the first time MUST have a parenthetical plain-English definition: "latency (the delay between a request and a response)"
- Include exactly ONE strong real-world analogy that an adult would relate to (library, restaurant kitchen, traffic, post office, filing cabinet, etc.)
- Structure: What it is → Why it matters → One important trade-off or gotcha
- No jargon without explanation. No skipping the "why it matters" part.
- 5–8 sentences total

### LEVEL 5 — EXPERT 🔬
Style: Explaining to a senior engineer or domain professional who wants precision.
Rules:
- Use full technical vocabulary with no hand-holding
- Must cover ALL of: exact mechanism or algorithm, performance characteristics (time/space/latency), trade-offs vs alternatives, when to use it vs when NOT to use it, at least one common pitfall or misconception, real-world implementations or industry examples if applicable
- Be dense and precise — every sentence must carry information
- Mention at least one named alternative or competing approach and contrast it
- Do NOT use analogies — experts want precision, not metaphors
- 6–10 sentences total

---

## EDGE CASE HANDLING:
- If the concept is purely abstract (e.g., "eventual consistency", "idempotency"): for Level 1, map it to a hunting/food analogy (slow vs fast, remember vs forget, give vs take). Always findable.
- If the concept involves math or formulas: Level 1–2 must ignore the math and explain the intuition. Level 3 can mention it exists. Level 4–5 can use it.
- If the concept is a process (not a thing): describe the process as a sequence at each level using appropriate vocabulary for that level.
- If the content is not technical (e.g., history, philosophy): still extract the core load-bearing ideas and apply the same level rules.

---

## OUTPUT FORMAT (strict valid JSON, no markdown fences, no extra text):
{
  "topic": "3–5 word topic name",
  "compressionStats": {
    "inputWordCount": ${wordCount},
    "estimatedReadMinutes": 0
  },
  "concepts": [
    {
      "id": "concept-1",
      "title": "2–4 word title",
      "whyItMatters": "One sentence: why removing this concept breaks understanding of the whole topic.",
      "levels": {
        "1": "caveman explanation",
        "2": "toddler explanation",
        "3": "middle schooler explanation",
        "4": "normal human explanation",
        "5": "expert explanation"
      }
    }
  ]
}

Fill estimatedReadMinutes as: number of concepts × 0.5, rounded to 1 decimal.

---

## CONTENT TO ANALYZE:
${content}
`.trim();
