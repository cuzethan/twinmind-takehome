import { useEffect, useState } from 'react';
import type { AppSettings } from '../config/appSettings';
import { DEFAULT_APP_SETTINGS } from '../config/appSettings';

type SettingsModalProps = {
  isOpen: boolean;
  onSave: (next: AppSettings) => void;
  onClose: () => void;
  settings: AppSettings;
};

function parsePositiveInt(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return null;
  }
  return n;
}

export default function SettingsModal({ isOpen, onSave, onClose, settings }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) {
    return null;
  }

  const buttonBaseClass = 'rounded-md px-3 py-2 text-sm cursor-pointer';
  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500';
  const textareaClass = `${inputClass} min-h-[100px] resize-y font-mono text-xs`;

  const parsedTimer = parsePositiveInt(String(draft.maxSuggestionsTimerSeconds));
  const parsedChatWindow = parsePositiveInt(String(draft.chatContextWindow));
  const parsedExpansionWindow = parsePositiveInt(String(draft.suggestionExpansionContextWindow));
  const parsedLiveWindow = parsePositiveInt(String(draft.liveSuggestionsContextWindow));

  const promptsOk =
    draft.chatSystemPrompt.trim().length > 0 &&
    draft.suggestionExpansionSystemPrompt.trim().length > 0 &&
    draft.liveSuggestionsSystemPrompt.trim().length > 0;

  const canSave =
    promptsOk &&
    parsedTimer !== null &&
    parsedChatWindow !== null &&
    parsedExpansionWindow !== null &&
    parsedLiveWindow !== null;

  const applyPromptDefaults = () => {
    setDraft((prev) => ({
      ...prev,
      maxSuggestionsTimerSeconds: DEFAULT_APP_SETTINGS.maxSuggestionsTimerSeconds,
      chatSystemPrompt: DEFAULT_APP_SETTINGS.chatSystemPrompt,
      chatContextWindow: DEFAULT_APP_SETTINGS.chatContextWindow,
      suggestionExpansionSystemPrompt: DEFAULT_APP_SETTINGS.suggestionExpansionSystemPrompt,
      suggestionExpansionContextWindow: DEFAULT_APP_SETTINGS.suggestionExpansionContextWindow,
      liveSuggestionsSystemPrompt: DEFAULT_APP_SETTINGS.liveSuggestionsSystemPrompt,
      liveSuggestionsContextWindow: DEFAULT_APP_SETTINGS.liveSuggestionsContextWindow,
    }));
  };

  const handleSave = () => {
    if (!canSave || !parsedTimer || !parsedChatWindow || !parsedExpansionWindow || !parsedLiveWindow) {
      return;
    }
    onSave({
      ...draft,
      maxSuggestionsTimerSeconds: parsedTimer,
      chatContextWindow: parsedChatWindow,
      suggestionExpansionContextWindow: parsedExpansionWindow,
      liveSuggestionsContextWindow: parsedLiveWindow,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-600">Edit API access, timing, prompts, and context windows.</p>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="groq-key">
            Groq API Key
          </label>
          <input
            id="groq-key"
            type="text"
            value={draft.groqApiKey}
            onChange={(event) => setDraft((prev) => ({ ...prev, groqApiKey: event.target.value }))}
            placeholder="Enter your API key"
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="max-suggestions-timer-seconds"
          >
            Max suggestions timer (seconds)
          </label>
          <input
            id="max-suggestions-timer-seconds"
            type="number"
            min={1}
            value={draft.maxSuggestionsTimerSeconds}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                maxSuggestionsTimerSeconds: Number.parseInt(event.target.value, 10) || 0,
              }))
            }
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="chat-context-window">
            Chat transcript context window (lines)
          </label>
          <input
            id="chat-context-window"
            type="number"
            min={1}
            value={draft.chatContextWindow}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                chatContextWindow: Number.parseInt(event.target.value, 10) || 0,
              }))
            }
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="chat-system-prompt">
            Chat system prompt
          </label>
          <textarea
            id="chat-system-prompt"
            value={draft.chatSystemPrompt}
            onChange={(event) => setDraft((prev) => ({ ...prev, chatSystemPrompt: event.target.value }))}
            className={textareaClass}
          />
        </div>

        <div className="mt-4">
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="expansion-context-window"
          >
            Suggestion expansion transcript context window (lines)
          </label>
          <input
            id="expansion-context-window"
            type="number"
            min={1}
            value={draft.suggestionExpansionContextWindow}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                suggestionExpansionContextWindow: Number.parseInt(event.target.value, 10) || 0,
              }))
            }
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="expansion-system-prompt"
          >
            Suggestion expansion system prompt
          </label>
          <textarea
            id="expansion-system-prompt"
            value={draft.suggestionExpansionSystemPrompt}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, suggestionExpansionSystemPrompt: event.target.value }))
            }
            className={textareaClass}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="live-context-window">
            Live suggestions transcript context window (lines)
          </label>
          <input
            id="live-context-window"
            type="number"
            min={1}
            value={draft.liveSuggestionsContextWindow}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                liveSuggestionsContextWindow: Number.parseInt(event.target.value, 10) || 0,
              }))
            }
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="live-system-prompt"
          >
            Live suggestions system prompt
          </label>
          <textarea
            id="live-system-prompt"
            value={draft.liveSuggestionsSystemPrompt}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, liveSuggestionsSystemPrompt: event.target.value }))
            }
            className={textareaClass}
          />
        </div>

        {!promptsOk && (
          <p className="mt-2 text-sm text-amber-700">System prompts cannot be empty.</p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={applyPromptDefaults}
            className={`${buttonBaseClass} border border-gray-300 text-gray-700 hover:bg-gray-100`}
          >
            Reset prompts and tunables to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${buttonBaseClass} border border-gray-300 text-gray-700 hover:bg-gray-100`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`${buttonBaseClass} bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
