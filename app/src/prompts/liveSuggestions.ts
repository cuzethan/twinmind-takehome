const ALLOWED_SUGGESTION_TYPES = '"question to ask"|"talking point"|"answer"|"fact-check"';

export const LIVE_SUGGESTIONS_SYSTEM_PROMPT =
  `You generate concise live-assistant suggestions. Return JSON only in this exact schema: {"suggestions":[{"type":${ALLOWED_SUGGESTION_TYPES},"text":"..."}]}. Return exactly 3 suggestions.`;

export function buildLiveSuggestionsUserPrompt(transcriptText: string): string {
  return `Latest transcript context:\n${transcriptText}`;
}
