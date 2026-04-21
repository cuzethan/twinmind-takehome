import type { ChatMessage, TranscriptEntry } from '../types';

export const CHAT_CONTEXT_WINDOW = 12;
export const EXPANDED_ANSWER_CONTEXT_WINDOW = 18;

export const CHAT_SYSTEM_PROMPT = `You are a concise and useful conversation copilot.
Give direct answers first, then short supporting detail.
If the user's request is ambiguous, ask one focused follow-up question.
Use bullet points when it improves clarity.
Do not invent facts not present in transcript context or user messages.`;

export const SUGGESTION_EXPANSION_SYSTEM_PROMPT = `You are expanding a clicked live suggestion into a strong, ready-to-use response.
Produce a polished answer the user can say immediately.
Prioritize specificity, confidence calibration, and practical wording.
If useful, include:
- a 1-2 sentence direct answer
- a brief reasoning section
- one follow-up question to keep momentum`;

function formatTranscriptContext(entries: TranscriptEntry[], contextWindow: number): string {
  const relevantEntries = entries
    .filter((entry) => entry.text.trim().length > 0)
    .slice(-contextWindow);

  if (relevantEntries.length === 0) {
    return 'No transcript context available.';
  }

  return relevantEntries.map((entry) => `[${entry.timestamp}] ${entry.text}`).join('\n');
}

function buildMessagesWithTranscriptContext({
  systemPrompt,
  contextWindow,
  chatMessages,
  transcriptEntries,
}: {
  systemPrompt: string;
  contextWindow: number;
  chatMessages: ChatMessage[];
  transcriptEntries: TranscriptEntry[];
}): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  return [
    { role: 'system', content: systemPrompt },
    {
      role: 'system',
      content: `Recent transcript context:\n${formatTranscriptContext(
        transcriptEntries,
        contextWindow
      )}`,
    },
    ...chatMessages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

export function buildChatMessages(
  chatMessages: ChatMessage[],
  transcriptEntries: TranscriptEntry[]
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  return buildMessagesWithTranscriptContext({
    systemPrompt: CHAT_SYSTEM_PROMPT,
    contextWindow: CHAT_CONTEXT_WINDOW,
    chatMessages,
    transcriptEntries,
  });
}

export function buildSuggestionExpansionMessages(
  chatMessages: ChatMessage[],
  transcriptEntries: TranscriptEntry[]
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  return buildMessagesWithTranscriptContext({
    systemPrompt: SUGGESTION_EXPANSION_SYSTEM_PROMPT,
    contextWindow: EXPANDED_ANSWER_CONTEXT_WINDOW,
    chatMessages,
    transcriptEntries,
  });
}
