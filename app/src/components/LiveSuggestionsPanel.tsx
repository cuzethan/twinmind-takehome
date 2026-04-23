import { useCallback, useEffect, useRef } from 'react';
import type { Suggestion, SuggestionBatch, TranscriptEntry } from '../types';
import type { AppSettings } from '../config/appSettings';
import { buildLiveSuggestionsApiMessages } from '../config/util';
import SuggestionBatchSection from './SuggestionBatchSection';
import axios from 'axios';

const SUGGESTION_TYPES = ['question to ask', 'talking point', 'answer', 'fact-check'] as const;

type LiveSuggestionsPanelProps = {
  appSettings: AppSettings;
  transcriptEntries: TranscriptEntry[];
  suggestionsBatch: SuggestionBatch[];
  setSuggestionBatches: React.Dispatch<React.SetStateAction<SuggestionBatch[]>>;
  suggestionsRefreshTick: number;
  onReloadTimerReset: () => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
};

type SuggestionsResponse = {
  suggestions?: Array<{ type?: string; text?: string }>;
};

type GroqChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

function isValidSuggestionType(type: string): type is Suggestion['type'] {
  return SUGGESTION_TYPES.includes(type as Suggestion['type']);
}

function parseSuggestions(content: string): Suggestion[] {
  const parsed = JSON.parse(content) as SuggestionsResponse;
  if (!Array.isArray(parsed.suggestions)) {
    return [];
  }

  return parsed.suggestions
    .map((suggestion) => {
      const suggestionType = typeof suggestion.type === 'string' ? suggestion.type : '';
      const suggestionText = typeof suggestion.text === 'string' ? suggestion.text.trim() : '';

      if (!isValidSuggestionType(suggestionType) || !suggestionText) {
        return null;
      }

      return {
        type: suggestionType,
        text: suggestionText,
      };
    })
    .filter((suggestion): suggestion is Suggestion => suggestion !== null)
    .slice(0, 3);
}

function appendSuggestionBatch(
  data: GroqChatCompletionResponse,
  setSuggestionBatches: React.Dispatch<React.SetStateAction<SuggestionBatch[]>>
): void {
  const responseText = data.choices?.[0]?.message?.content?.trim();
  if (!responseText) {
    throw new Error('Suggestion generation returned empty content.');
  }

  const normalizedSuggestions = parseSuggestions(responseText);
  if (normalizedSuggestions.length !== 3) {
    throw new Error('Suggestion generation did not return exactly 3 valid suggestions.');
  }

  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  setSuggestionBatches((prev) => [
    ...prev,
    {
      timestamp,
      suggestions: normalizedSuggestions,
    },
  ]);
}

export default function LiveSuggestionsPanel({
  appSettings,
  transcriptEntries,
  suggestionsBatch,
  setSuggestionBatches,
  suggestionsRefreshTick,
  onReloadTimerReset,
  onSuggestionClick,
}: LiveSuggestionsPanelProps) {
  const isRequestInFlightRef = useRef(false);
  const lastTriggeredTranscriptIdRef = useRef<string | null>(null);
  const suggestionsListRef = useRef<HTMLDivElement | null>(null);
  const latestTranscript = transcriptEntries[transcriptEntries.length - 1];

  const generateSuggestionsFromTranscript = useCallback(async (source: 'timer' | 'reload') => {

    //if the request is already in flight, or the groq api key is not set, or the latest transcript is not set, return
    if (isRequestInFlightRef.current || !appSettings.groqApiKey || !latestTranscript?.text?.trim()) {
      return;
    }

    // if the source is the timer and the last triggered transcript id is the same as the latest transcript id, return
    if (source === 'timer' && lastTriggeredTranscriptIdRef.current === latestTranscript.id) {
      return;
    }

    // set the request in flight flag to true
    isRequestInFlightRef.current = true;
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'openai/gpt-oss-120b',
        messages: buildLiveSuggestionsApiMessages(transcriptEntries, {
          systemPrompt: appSettings.liveSuggestionsSystemPrompt,
          contextWindow: appSettings.liveSuggestionsContextWindow,
        }),
        temperature: 0.4,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${appSettings.groqApiKey}`,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Suggestion generation failed with status ${response.statusText}`);
      }

      const data = response.data as GroqChatCompletionResponse;
      appendSuggestionBatch(data, setSuggestionBatches);
      lastTriggeredTranscriptIdRef.current = latestTranscript.id;
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      isRequestInFlightRef.current = false;
    }
  }, [
    appSettings.groqApiKey,
    appSettings.liveSuggestionsContextWindow,
    appSettings.liveSuggestionsSystemPrompt,
    latestTranscript,
    setSuggestionBatches,
    transcriptEntries,
  ]);

  const handleReloadSuggestions = () => {
    void generateSuggestionsFromTranscript('reload');
    onReloadTimerReset();
  };

  //generate suggestions from the transcript every time the suggestions refresh tick is not 0
  useEffect(() => {
    //stops initial render from generating suggestions
    if (suggestionsRefreshTick !== 0) {
      void generateSuggestionsFromTranscript('timer');
    }
  }, [generateSuggestionsFromTranscript, suggestionsRefreshTick]);

  //scroll to the top of the suggestions list when the suggestions batch changes
  useEffect(() => {
    if (suggestionsListRef.current) {
      suggestionsListRef.current.scrollTop = 0;
    }
  }, [suggestionsBatch.length]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <button onClick={handleReloadSuggestions}
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">Reload Button</button>
      <div
        ref={suggestionsListRef}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {[...suggestionsBatch].reverse().map((batch, index) => (
          <SuggestionBatchSection
            key={`${batch.timestamp}-${index}`}
            batch={batch}
            batchNumber={suggestionsBatch.length - index}
            onSuggestionClick={onSuggestionClick}
          />
        ))}
      </div>
    </div>
  );
}