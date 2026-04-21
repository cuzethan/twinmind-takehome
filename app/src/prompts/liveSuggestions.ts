const ALLOWED_SUGGESTION_TYPES = '"question to ask"|"talking point"|"answer"|"fact-check"';

export const DEFAULT_LIVE_SUGGESTIONS_SYSTEM_PROMPT =
  `You are a real-time meeting copilot.
Goal: produce high-signal, immediately usable suggestions based on recent transcript context.

You must output JSON only in this exact schema:
{"suggestions":[{"type":${ALLOWED_SUGGESTION_TYPES},"text":"..."}]}

Hard requirements:
- Return exactly 3 suggestions.
- Use a diverse mix of types when possible.
- Keep each suggestion under 20 words.
- Make each suggestion concrete and directly actionable.
- Avoid generic advice and avoid repeating transcript wording.
- If context is weak, still provide best-effort suggestions grounded in what is available.`;

export const DEFAULT_LIVE_SUGGESTIONS_CONTEXT_WINDOW = 10;

type TranscriptPromptEntry = {
  timestamp: string;
  text: string;
};

export function buildLiveSuggestionsUserPrompt(
  transcriptEntries: TranscriptPromptEntry[],
  contextWindow: number = DEFAULT_LIVE_SUGGESTIONS_CONTEXT_WINDOW
): string {
  const relevantEntries = transcriptEntries
    .filter((entry) => entry.text.trim().length > 0)
    .slice(-contextWindow);

  const transcriptContext = relevantEntries
    .map((entry) => `[${entry.timestamp}] ${entry.text}`)
    .join('\n');

  return `Recent transcript context (${relevantEntries.length} entries):
${transcriptContext}`;
}
