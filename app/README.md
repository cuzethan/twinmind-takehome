# Setup

1. Clone this GitHub repository.
2. Navigate to the app directory:
   ```bash
   cd app
   ```
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
4. After the app launches, open **Settings** and add your Groq API key.

# Stack

This project uses the following stack:

- **Frontend:** React + TypeScript
- **Build tooling:** Vite
- **Styling:** Tailwind CSS
- **HTTP client:** Axios
- **AI services:** Groq API (Whisper transcription + chat completions)

* Note - I decided intentionally did not implement a backend here because I felt like doing the API calls on React directly was sufficent and more clear for the demo.

# Prompt design notes 

## First iteration

I just AI generated the prompts for my system, and although they performed better than I thought in terms of grabbing context, the formatting the AI spat out was not clear, and the expanded suggestions were not that helpful overall, since it had a bunch of rambling

## Second iteration

This pass tightens behavior in `src/config/appSettings.ts`: larger windows where depth matters, type-aware expansion copy, and a live-suggestions prompt that reasons about the *current* conversational beat and how two transcript slices should be weighted.

### Context windows

- **Live suggestions:** the configurable **broader** transcript window defaults to **10** transcript blocks(`liveSuggestionsContextWindow`), matching the first iteration’s “right now” goal. The API also sends a **high-priority** block: always the **last two** pieces of transcript, as a second user message (see `buildLiveSuggestionsApiMessages` in `src/config/util.ts`). Raising the setting widens the broader block while the high-priority tail stays with the two latest transcript blocks; the system prompt tells the model to weight that tail heavily when the two differ.
- **Chat** default window expanded to **twenty** entries so the open ai model has a bit more meeting history when the user chats explicitly.
- **Suggestion expansion** (clicked card → longer help) increases to **fifty** entries so expansion can lean on substantially more transcript when explaining or elaborating a single suggestion.

### Suggestion expansion system prompt

The first iteration used one generic instruction: produce a polished, immediately usable answer with optional structure (short answer, brief reasoning, one follow-up).

The second iteration branches **by suggestion type** (`question to ask`, `talking point`, `answer`, `fact-check`), each with a tailored goal (why this question matters, guided topics, why this answer fits, what is accurate vs misleading and how to correct it diplomatically). A closing block sets expectations: **plain prose**, no markdown or stray headings, roughly **100–150 words**.

### Live suggestions system prompt

The short “high-signal copilot” line is replaced with explicit **moment detection**: the model is asked to notice what is happening right now (question, strong claim, new topic) and to **map that moment to types** (for example, prioritize `answer` after a question, consider `fact-check` after a bold claim, `talking point` or `question to ask` when a topic shifts).

It adds **diversity** (“never return three suggestions of the same type”), **standalone usefulness** (each card should read well without a click), and **dual-context instructions**: the user message supplies a broader transcript slice and a high-priority slice; the prompt tells the model to **weight the high-priority window heavily** when generating the three cards.

Hard formatting constraints (JSON shape, three suggestions, word limits, etc.) remain in the separate system block described below; this iteration focuses on *what* the model should optimize for before those rules apply.

## NOTE: hard output requirements, on live suggestions: 

Live suggestion requests append a separate system block with **strict output rules** (see `src/config/util.ts`). In short: the model must return **JSON only** in a fixed shape (`suggestions` array with typed entries), **exactly three** suggestions, a **diverse mix of types** when possible, each **under twenty words**, **concrete and actionable**, avoiding generic filler and **verbatim repetition** of the transcript. If the transcript slice is thin, the model is still asked to produce **best-effort**, grounded suggestions. Those constraints exist so the UI can parse reliably and the on-screen cards stay short and scannable.
