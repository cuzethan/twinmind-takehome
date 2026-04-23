const DEFAULT_LIVE_SUGGESTIONS_CONTEXT_WINDOW = 2;
const DEFAULT_CHAT_CONTEXT_WINDOW = 15;
const DEFAULT_EXPANDED_ANSWER_CONTEXT_WINDOW = 15;
const DEFAULT_SUGGESTIONS_TIMER_SECONDS = 30;

const DEFAULT_CHAT_SYSTEM_PROMPT = `You are a concise and useful conversation copilot.
Give direct answers first, then short supporting detail.
If the user's request is ambiguous, ask one focused follow-up question.
Use bullet points when it improves clarity.
Do not invent facts not present in transcript context or user messages.`;

const DEFAULT_SUGGESTION_EXPANSION_SYSTEM_PROMPT = `You are expanding a clicked live suggestion into a strong, ready-to-use response.
Produce a polished answer the user can say immediately.
Prioritize specificity, confidence calibration, and practical wording.
If useful, include:
- a 1-2 sentence direct answer
- a brief reasoning section
- one follow-up question to keep momentum`;

const DEFAULT_LIVE_SUGGESTIONS_SYSTEM_PROMPT =
  `You are a real-time meeting copilot.
Goal: produce high-signal, immediately usable suggestions based on recent transcript context.`;

export type AppSettings = {
  groqApiKey: string;
  maxSuggestionsTimerSeconds: number;
  chatSystemPrompt: string;
  chatContextWindow: number;
  suggestionExpansionSystemPrompt: string;
  suggestionExpansionContextWindow: number;
  liveSuggestionsSystemPrompt: string;
  liveSuggestionsContextWindow: number;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  groqApiKey: '',
  maxSuggestionsTimerSeconds: DEFAULT_SUGGESTIONS_TIMER_SECONDS,
  chatSystemPrompt: DEFAULT_CHAT_SYSTEM_PROMPT,
  chatContextWindow: DEFAULT_CHAT_CONTEXT_WINDOW,
  suggestionExpansionSystemPrompt: DEFAULT_SUGGESTION_EXPANSION_SYSTEM_PROMPT,
  suggestionExpansionContextWindow: DEFAULT_EXPANDED_ANSWER_CONTEXT_WINDOW,
  liveSuggestionsSystemPrompt: DEFAULT_LIVE_SUGGESTIONS_SYSTEM_PROMPT,
  liveSuggestionsContextWindow: DEFAULT_LIVE_SUGGESTIONS_CONTEXT_WINDOW,
};
