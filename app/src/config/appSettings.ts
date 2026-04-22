import {
  DEFAULT_CHAT_CONTEXT_WINDOW,
  DEFAULT_CHAT_SYSTEM_PROMPT,
  DEFAULT_EXPANDED_ANSWER_CONTEXT_WINDOW,
  DEFAULT_SUGGESTION_EXPANSION_SYSTEM_PROMPT,
} from '../prompts/chat';
import {
  DEFAULT_LIVE_SUGGESTIONS_CONTEXT_WINDOW,
  DEFAULT_LIVE_SUGGESTIONS_SYSTEM_PROMPT,
} from '../prompts/liveSuggestions';

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
  maxSuggestionsTimerSeconds: 30,
  chatSystemPrompt: DEFAULT_CHAT_SYSTEM_PROMPT,
  chatContextWindow: DEFAULT_CHAT_CONTEXT_WINDOW,
  suggestionExpansionSystemPrompt: DEFAULT_SUGGESTION_EXPANSION_SYSTEM_PROMPT,
  suggestionExpansionContextWindow: DEFAULT_EXPANDED_ANSWER_CONTEXT_WINDOW,
  liveSuggestionsSystemPrompt: DEFAULT_LIVE_SUGGESTIONS_SYSTEM_PROMPT,
  liveSuggestionsContextWindow: DEFAULT_LIVE_SUGGESTIONS_CONTEXT_WINDOW,
};
