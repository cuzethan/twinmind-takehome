# Prompt design notes (draft)

## First iteration

This section captures early choices before deeper iteration from real usage and testing.

### Context windows

Live suggestions use a **small default context window** (two recent transcript entries). The idea is to anchor the model on what is happening *right now* in the meeting: quick, local nudges rather than a recap of the whole conversation. A wider window would dilute that signal and make suggestions feel less tied to the immediate beat.

Chat and expanded-suggestion flows use a **much larger default window** (fifteen entries). Those paths are meant for richer back-and-forth: answering questions, elaborating a clicked suggestion, and grounding answers in more transcript history. The extra context trades freshness for coherence when the user explicitly asks for depth.

Both values are defaults in settings; they can be tuned per environment or preference.

### Default system prompts

The bundled default system prompts (live suggestions, chat, and suggestion expansion) were **initially produced with an AI assistant as scaffolding** so the app could be exercised end-to-end without spending a long cycle on copy. They are reasonable starting points, not final product voice; replace or refine them once you have real users and tone requirements.

## NOTE: hard output requirements, on live suggestions: 

Live suggestion requests append a separate system block with **strict output rules** (see `src/config/util.ts`). In short: the model must return **JSON only** in a fixed shape (`suggestions` array with typed entries), **exactly three** suggestions, a **diverse mix of types** when possible, each **under twenty words**, **concrete and actionable**, avoiding generic filler and **verbatim repetition** of the transcript. If the transcript slice is thin, the model is still asked to produce **best-effort**, grounded suggestions. Those constraints exist so the UI can parse reliably and the on-screen cards stay short and scannable.
