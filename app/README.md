# Prompt design notes (draft)

## First iteration

This section captures early choices before deeper iteration from real usage and testing.

### Context windows

Live suggestions use a **small default context window** (two recent transcript entries). The idea is to anchor the model on what is happening *right now* in the meeting: quick, local nudges rather than a recap of the whole conversation. A wider window would dilute that signal and make suggestions feel less tied to the immediate beat.

Chat and expanded-suggestion flows use a **much larger default window** (fifteen entries in this first pass). Those paths are meant for richer back-and-forth: answering questions, elaborating a clicked suggestion, and grounding answers in more transcript history. The extra context trades freshness for coherence when the user explicitly asks for depth. **Later defaults** for those two windows are documented under [Second iteration](#second-iteration).

Both values are defaults in settings; they can be tuned per environment or preference.

### Default system prompts

The bundled default system prompts (live suggestions, chat, and suggestion expansion) were **initially produced with an AI assistant as scaffolding** so the app could be exercised end-to-end without spending a long cycle on copy. They are reasonable starting points, not final product voice; replace or refine them once you have real users and tone requirements.

## Second iteration

This pass tightens behavior in `src/config/appSettings.ts`: larger windows where depth matters, type-aware expansion copy, and a live-suggestions prompt that reasons about the *current* conversational beat and how two transcript slices should be weighted.

### Context windows

- **Live suggestions:** the configurable **broader** transcript window still defaults to **two** lines (`liveSuggestionsContextWindow`), matching the first iteration’s “right now” goal. The API also sends a **high-priority** block: always the **last two** pieces of transcript, as a second user message (see `buildLiveSuggestionsApiMessages` in `src/config/util.ts`). Raising the setting widens the broader block while the high-priority tail stays two lines; the system prompt tells the model to weight that tail heavily when the two differ.
- **Chat** default window increases from fifteen to **twenty** entries so the copilot has a bit more meeting history when the user chats explicitly.
- **Suggestion expansion** (clicked card → longer help) increases from fifteen to **fifty** entries so expansion can lean on substantially more transcript when explaining or elaborating a single suggestion.

### Suggestion expansion system prompt

The first iteration used one generic instruction: produce a polished, immediately usable answer with optional structure (short answer, brief reasoning, one follow-up).

The second iteration branches **by suggestion type** (`question to ask`, `talking point`, `answer`, `fact-check`), each with a tailored goal (why this question matters, guided topics, why this answer fits, what is accurate vs misleading and how to correct it diplomatically). A closing block sets expectations: **plain prose**, no markdown or stray headings, roughly **100–150 words**.

### Live suggestions system prompt

The short “high-signal copilot” line is replaced with explicit **moment detection**: the model is asked to notice what is happening right now (question, strong claim, new topic) and to **map that moment to types** (for example, prioritize `answer` after a question, consider `fact-check` after a bold claim, `talking point` or `question to ask` when a topic shifts).

It adds **diversity** (“never return three suggestions of the same type”), **standalone usefulness** (each card should read well without a click), and **dual-context instructions**: the user message supplies a broader transcript slice and a high-priority slice; the prompt tells the model to **weight the high-priority window heavily** when generating the three cards.

Hard formatting constraints (JSON shape, three suggestions, word limits, etc.) remain in the separate system block described below; this iteration focuses on *what* the model should optimize for before those rules apply.

## NOTE: hard output requirements, on live suggestions: 

Live suggestion requests append a separate system block with **strict output rules** (see `src/config/util.ts`). In short: the model must return **JSON only** in a fixed shape (`suggestions` array with typed entries), **exactly three** suggestions, a **diverse mix of types** when possible, each **under twenty words**, **concrete and actionable**, avoiding generic filler and **verbatim repetition** of the transcript. If the transcript slice is thin, the model is still asked to produce **best-effort**, grounded suggestions. Those constraints exist so the UI can parse reliably and the on-screen cards stay short and scannable.
