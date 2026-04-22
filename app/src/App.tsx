import { useCallback, useEffect, useState } from 'react';
import Column from './components/Column';
import SettingsModal from './components/SettingsModal';
import MicTranscriptPanel from './components/MicTranscriptPanel';
import LiveSuggestionsPanel from './components/LiveSuggestionsPanel';
import ChatPanel from './components/ChatPanel';
import type { ChatMessage, SuggestionBatch, TranscriptEntry } from './types';
import { DEFAULT_APP_SETTINGS, type AppSettings } from './config/appSettings';

import './index.css'

export default function App() {
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [externalChatMessage, setExternalChatMessage] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_APP_SETTINGS.maxSuggestionsTimerSeconds);
  const [suggestionsTimerPaused, setSuggestionsTimerPaused] = useState(true);
  const [suggestionsTimerCycle, setSuggestionsTimerCycle] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (suggestionsTimerPaused) {
        return;
      }
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setSuggestionsTimerCycle((currentCycle) => currentCycle + 1);
          return appSettings.maxSuggestionsTimerSeconds;
        }

        return prev - 1;
      });
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [suggestionsTimerPaused, appSettings.maxSuggestionsTimerSeconds]);

  const saveSettings = (next: AppSettings) => {
    setAppSettings(next);
    setTimerSeconds(next.maxSuggestionsTimerSeconds);
    setIsSettingsOpen(false);
  };

  const handleExternalChatMessageHandled = useCallback(() => {
    setExternalChatMessage(null);
  }, []);

  const onExportSession = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      session: {
        transcriptEntries,
        suggestionBatches,
        chatMessages,
      },
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `session-export-${new Date().toISOString()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="app flex flex-col h-screen">
      <header className="appHeader flex justify-end gap-2 p-2">
        <button type="button" onClick={onExportSession} className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">Export</button>
        <button type="button" onClick={() => setIsSettingsOpen(true)} className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">Settings</button>
      </header>

      <main className="columnsContainer flex min-h-0 flex-1 gap-2 p-2 w-full">
        <Column title="Mic & Transcript">
          <MicTranscriptPanel
            groqApiKey={appSettings.groqApiKey}
            transcriptEntries={transcriptEntries}
            setTranscriptEntries={setTranscriptEntries}
            setSuggestionsTimerPaused={setSuggestionsTimerPaused}
          />
        </Column>
        <Column
          title="Live Suggestions"
          titleRight={
            <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700">
              auto-refreshes in {timerSeconds}s
            </span>
          }
        >
          <LiveSuggestionsPanel
            groqApiKey={appSettings.groqApiKey}
            transcriptEntries={transcriptEntries}
            suggestionsBatch={suggestionBatches}
            setSuggestionBatches={setSuggestionBatches}
            suggestionsTimerCycle={suggestionsTimerCycle}
            liveSuggestionsSystemPrompt={appSettings.liveSuggestionsSystemPrompt}
            liveSuggestionsContextWindow={appSettings.liveSuggestionsContextWindow}
            onReloadTimerReset={() => setTimerSeconds(appSettings.maxSuggestionsTimerSeconds)}
            onSuggestionClick={(suggestion) => setExternalChatMessage(suggestion.text)}
          />
        </Column>
        <Column title="Chat">
          <ChatPanel
            groqApiKey={appSettings.groqApiKey}
            transcriptEntries={transcriptEntries}
            chatSystemPrompt={appSettings.chatSystemPrompt}
            chatContextWindow={appSettings.chatContextWindow}
            suggestionExpansionSystemPrompt={appSettings.suggestionExpansionSystemPrompt}
            suggestionExpansionContextWindow={appSettings.suggestionExpansionContextWindow}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            isChatLoading={isChatLoading}
            setIsChatLoading={setIsChatLoading}
            externalMessageToSend={externalChatMessage}
            onExternalMessageHandled={handleExternalChatMessageHandled}
          />
        </Column>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={saveSettings}
        settings={appSettings}
      />
    </div>
  );
}
