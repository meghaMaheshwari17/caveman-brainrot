# 🪨 Caveman Brainrot

> Skip the video. Get the knowledge.

Paste any YouTube URL or raw text and get the key concepts explained at 5 levels of complexity — from caveman grunt all the way to expert depth. Hit **Evolve** on any concept card to level up the explanation.

**Live demo:** _link coming after deploy_

---

## What it does

Most AI summarizers just shrink content. This one does something different:

1. **Extracts load-bearing concepts** — the ideas without which the whole topic collapses (4–8 per input)
2. **Explains each at 5 evolution levels**, all generated in one shot:

| Level | Name | Style |
|---|---|---|
| 🪨 1 | Caveman | 3–6 word sentences. Fire. Hunt. Tribe. |
| 🧸 2 | Toddler | Toys, juice boxes, playground analogies |
| 🎮 3 | Middle Schooler | Minecraft, Discord, gaming references |
| 🧠 4 | Normal Human | Smart-friend explanation with real analogies |
| 🔬 5 | Expert | Full technical depth, trade-offs, alternatives |

3. **Tap Evolve** to level up a concept, or **Dumb it down** to go back
4. Shows a **compression ratio** — how much faster this is vs watching the full video

---

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **AI:** Google Gemini 2.0 Flash via `@google/generative-ai`
- **Transcripts:** `youtube-transcript` — no YouTube API key needed
- **Styling:** Tailwind CSS
- **Deploy:** Vercel

---

## Running locally

**1. Clone and install**

```bash
git clone https://github.com/meghaMaheshwari17/caveman-brainrot.git
cd caveman-brainrot
npm install
```

**2. Get a Gemini API key**

Go to [aistudio.google.com](https://aistudio.google.com) → Get API Key → Create API Key. Free tier is enough.

**3. Add it to `.env.local`**

```bash
cp .env.local.example .env.local
# then paste your key into GEMINI_API_KEY
```

**4. Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> You can also add your Gemini key directly in the app via the ⚙️ Settings button — no env file needed.

---

## Project structure

```
app/
  page.tsx                  # Main UI and state
  api/
    explain/route.ts        # Calls Gemini, returns concepts + all 5 levels
    transcript/route.ts     # Fetches YouTube transcript from URL
components/
  InputSection.tsx          # URL / paste text toggle
  ConceptCard.tsx           # Single concept with evolve animation
  OutputSection.tsx         # Grid of cards + compression stats
  SettingsModal.tsx         # API key input, stored in localStorage
lib/
  claude.ts                 # Gemini SDK wrapper
  prompts.ts                # Detailed prompts for all 5 evolution levels
  transcript.ts             # YouTube video ID extraction + transcript fetch
```

---

## Deploying to Vercel

```bash
vercel login
vercel --prod
```

Add `GEMINI_API_KEY` as an environment variable in your Vercel project settings. Users can also supply their own key via the in-app Settings panel.

---

## How the prompts work

The extraction prompt is highly engineered. For each of the 5 levels, it enforces:

- **Level 1:** Vocabulary is literally restricted to ~30 primitive words. Every sentence ≤ 6 words. Caps for emphasis. Always starts with "UGH."
- **Level 2:** Must use a toy/snack analogy. Must include "It's like when you...". Max 2-syllable words.
- **Level 3:** Must use a gaming/YouTube analogy. Must introduce exactly one technical term with a bracketed plain-English definition.
- **Level 4:** Must define every technical term in parentheses on first use. Must cover: what it is → why it matters → one trade-off.
- **Level 5:** Must cover: exact mechanism, performance characteristics, trade-offs, when NOT to use, at least one alternative with comparison.

Edge cases handled: abstract concepts, math-heavy content, process descriptions, non-technical topics.
