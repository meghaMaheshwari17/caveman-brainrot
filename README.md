# 🪨 Caveman Brainrot

> Ask anything. Get the answer in brainrot. Evolve it to expert depth.

**Live app → [caveman-brainrot.vercel.app](https://caveman-brainrot.vercel.app)**

---

## What it does

Type any question — `explain caching`, `what is docker`, `why do we need indexes` — and get the answer explained in short numbered lines that build a story from start to finish. Pick your level before asking. Switch levels to hear the same concept explained differently.

```
you:  explain caching

🪨    1. database good
      2. many people want database
      3. many people → database slow
      4. DATABASE CRY

      5. cache like rock near cave
      6. store answer in cache
      7. no need go to database
      8. DATABASE HAPPY
```

---

## The 5 levels

| # | Level | Style |
|---|---|---|
| 🪨 1 | Caveman | 3–6 words. Broken grammar. Caps. Primitive words only. |
| 🧸 2 | Toddler | Toys, cookies, juice box analogies. "It's like when you..." |
| 🎮 3 | Middle Schooler | Minecraft, Discord, lag, Wi-Fi analogies. One real term in `[brackets]`. |
| 🧠 4 | Normal Human | Smart-friend tone. Technical terms defined in (parentheses). One real analogy. |
| 🔬 5 | Expert | Full precision. O() notation. Trade-offs. Alternatives. No hand-holding. |

Pick a level → ask a question → get the answer in that exact style.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| AI pipeline | **LangGraph** — 3-node graph with automatic retry on bad output |
| LLM providers | Groq / Gemini / OpenAI via **LangChain** unified interface |
| Default model | On-prem **Devstral** (configurable via env) |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## How the AI pipeline works (LangGraph)

Every question runs through a LangGraph state machine:

```
START → invoke_model → validate → [valid: END | retry: invoke_model]
```

- **invoke_model** — calls whichever model is configured (Devstral / Groq / Gemini / OpenAI) via LangChain's unified `.invoke()` interface
- **validate** — checks the response has at least 3 numbered lines
- **retry edge** — if output is malformed, loops back with a format reminder (max 2 attempts)

This means the app never crashes on a bad model response — it self-corrects.

---

## Provider priority

The app resolves which model to use in this order:

1. **User's own key** set in ⚙️ Settings (Groq / Gemini / OpenAI)
2. **On-prem Devstral** via `DEVSTRAL_BASE_URL` + `DEVSTRAL_API_KEY` (server default)
3. `GROQ_API_KEY` env fallback
4. `OPENAI_API_KEY` env fallback
5. `GEMINI_API_KEY` env fallback

Users can bring their own key without touching any server config — just open Settings.

---

## Running locally

```bash
git clone https://github.com/meghaMaheshwari17/caveman-brainrot.git
cd caveman-brainrot
npm install
```

Create `.env.local` with at least one key:

```env
# On-prem Devstral (if you have it)
DEVSTRAL_BASE_URL=http://your-server:port/v1
DEVSTRAL_API_KEY=your-key
DEVSTRAL_MODEL=devstral

# Or use any of these free/paid fallbacks
GROQ_API_KEY=       # Free — get at console.groq.com
OPENAI_API_KEY=
GEMINI_API_KEY=
```

```bash
npm run dev
# → http://localhost:3000
```

> No env key? Open ⚙️ Settings in the app and paste your own Groq / Gemini / OpenAI key. Nothing is stored server-side.

---

## Project structure

```
app/
  page.tsx                  # Chat-style Q&A UI, level picker, history
  api/
    explain/route.ts        # Accepts question + level, runs LangGraph pipeline
    transcript/route.ts     # YouTube transcript fetcher (utility)
components/
  AnswerDisplay.tsx         # Renders numbered-line brainrot answer with → arrows
  SettingsModal.tsx         # Provider picker (Groq/Gemini/OpenAI) + key input
lib/
  claude.ts                 # LangGraph pipeline + LangChain model factory
  prompts.ts                # Level rules + brainrot format prompt builder
  transcript.ts             # YouTube URL → plain text transcript
```

---

## Getting a free API key

**Groq** is the recommended option — free, fast, and uses Llama 3.3 70B.

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up → Create API Key
3. Paste it in ⚙️ Settings inside the app

Other options:
- **Gemini:** [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — free tier
- **OpenAI:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys) — paid

---

## Deploy your own

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add your env vars in the Vercel dashboard under Project → Settings → Environment Variables.
