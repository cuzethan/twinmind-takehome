import type { ChatMessage, TranscriptEntry } from '../types';

const DEFAULT_EMPTY_TRANSCRIPT_TEXT = 'No transcript context available.';

type ApiMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const HARD_LIVE_SUGGESTIONS_REQUIREMENTS = `You must output JSON only in this exact schema:
{"suggestions":[{"type":"question to ask"|"talking point"|"answer"|"fact-check","text":"..."}]}

Hard requirements:
- Return exactly 3 suggestions.
- Use a diverse mix of types when possible.
- Keep each suggestion under 20 words.
- Make each suggestion concrete and directly actionable.
- Avoid generic advice and avoid repeating transcript wording.
- If context is weak, still provide best-effort suggestions grounded in what is available.`;

type TranscriptPromptEntry = Pick<TranscriptEntry, 'timestamp' | 'text'>;

//get the most recent transcript entries based on the context window
function getRecentTranscriptEntries(
  transcriptEntries: TranscriptPromptEntry[],
  contextWindow: number
): TranscriptPromptEntry[] {
  return transcriptEntries.filter((entry) => entry.text.trim().length > 0).slice(-contextWindow);
}

//format the transcript entries for the prompt
function formatTranscriptEntriesForPrompt(
  transcriptEntries: TranscriptPromptEntry[],
  fallbackText: string
): string {
  if (transcriptEntries.length === 0) {
    return fallbackText;
  }

  return transcriptEntries.map((entry) => `[${entry.timestamp}] ${entry.text}`).join('\n');
}

//build the transcript context block for the prompt
export function buildTranscriptContextBlock(
  transcriptEntries: TranscriptPromptEntry[],
  contextWindow: number
): string {
  const recentEntries = getRecentTranscriptEntries(transcriptEntries, contextWindow);

  return formatTranscriptEntriesForPrompt(
    recentEntries,
    DEFAULT_EMPTY_TRANSCRIPT_TEXT
  );
}

export function buildTranscriptAugmentedChatMessages(
  chatMessages: ChatMessage[],
  transcriptEntries: TranscriptEntry[],
  systemPrompt: string,
  contextWindow: number
): ApiMessage[] {
  const transcriptContext = buildTranscriptContextBlock(transcriptEntries, contextWindow);

  return [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: `Recent transcript context:\n${transcriptContext}` },
    ...chatMessages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

//build the user prompt for the live suggestions
function buildLiveSuggestionsUserPrompt(
  transcriptEntries: TranscriptPromptEntry[],
  contextWindow: number
): string {
  const recentEntries = getRecentTranscriptEntries(transcriptEntries, contextWindow);
  const transcriptContext = formatTranscriptEntriesForPrompt(recentEntries, '');

  return `Recent transcript context (${recentEntries.length} entries):
${transcriptContext}`;
}

export function buildLiveSuggestionsApiMessages(
  transcriptEntries: TranscriptPromptEntry[],
  options: { systemPrompt: string; contextWindow: number }
): { role: 'system' | 'user'; content: string }[] {
  return [
    { role: 'system', content: options.systemPrompt },
    { role: 'system', content: HARD_LIVE_SUGGESTIONS_REQUIREMENTS },
    {
      role: 'user',
      content: buildLiveSuggestionsUserPrompt(transcriptEntries, options.contextWindow),
    },
  ];
}
