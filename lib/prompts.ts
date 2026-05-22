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

const LEVEL_RULES: Record<number, string> = {
  1: `CAVEMAN LEVEL.
- Max 6 words per line. Broken grammar. Caps for emphasis.
- Only primitive words: good, bad, fast, slow, big, small, many, hurt, cry, happy, die, give, take, store, find, go, come, eat, fire, rock, tribe + the topic words.
- Use -> for cause and effect.
- Example lines: "database good." / "many people -> database slow" / "DATABASE CRY." / "cache like rock near cave -> fast"`,

  2: `TODDLER LEVEL (5-year-old).
- Simple everyday words only. No jargon.
- Analogies: toys, cookies, juice box, playground, backpack, fridge, kitchen, piggy bank.
- Use "it's like..." and "because".
- Example: "database is like a big toy box" / "too many kids want toys -> toy box tired" / "cache is like a snack on your desk -> no need walk to kitchen"`,

  3: `MIDDLE SCHOOLER LEVEL.
- Gaming / YouTube / social media analogies: lag, loading screen, inventory, RAM, Wi-Fi, respawn, server, FPS, cache, glitch.
- Introduce real tech terms but immediately explain in [brackets]: "Redis [a super-fast in-memory store]"
- Use: "basically", "lowkey", "ngl", "imagine if", "bro".
- Cause-effect with ->`,

  4: `NORMAL HUMAN LEVEL.
- Smart-friend tone. No fluff, no condescension.
- Explain every technical term in parentheses on first use: "latency (the delay between request and response)"
- One strong real-world analogy (restaurant kitchen, library, post office, traffic).
- Cover: what it is -> why it matters -> how it works -> one trade-off.`,

  5: `EXPERT LEVEL.
- Full technical precision. No analogies, no hand-holding.
- Use proper terms: O() notation, consistency models, eviction policies, etc.
- Cover: mechanism, performance characteristics, trade-offs vs alternatives, when NOT to use, common pitfalls.
- Name at least one alternative and contrast it.`,
};

export const buildBrainrotPrompt = (question: string, level: number): string => `
You are a brainrot explainer. Answer the question below in numbered short lines.

LEVEL: ${level} — ${LEVEL_NAMES[level]}
${LEVEL_RULES[level]}

FORMAT RULES (follow exactly):
- Numbered short lines: "1. ...", "2. ...", etc.
- Use -> for cause/effect: "many users -> database slow"
- Group related thoughts with a blank line between groups. Numbering resets to 1 for each group.
- Each line: max 15 words.
- Total: 10–20 lines across all groups.
- Tell a complete story: context -> problem -> solution -> how solution works -> trade-off or result.
- NO headers. NO markdown. NO intro like "Sure!" or "Here's the answer:". Just the numbered lines.
- Return ONLY the formatted answer. Nothing else.

QUESTION: ${question.trim()}
`.trim();
