import { useCallback, useEffect, useState } from 'react';

import Column from './components/Column';
import SettingsModal from './components/SettingsModal';
import MicTranscriptPanel from './components/MicTranscriptPanel';
import LiveSuggestionsPanel from './components/LiveSuggestionsPanel';
import ChatPanel from './components/ChatPanel';

import type { ChatMessage, Suggestion, SuggestionBatch, TranscriptEntry } from './types';
import { DEFAULT_APP_SETTINGS, type AppSettings } from './config/appSettings';

import './index.css'

export default function App() {
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Shared session data consumed across the three columns.
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Chat panel request state plus externally injected message from suggestion clicks.
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [externalSuggestionToSend, setExternalSuggestionToSend] = useState<Suggestion | null>(null);

  // Suggestion refresh timer state: countdown, pause/resume, and refresh trigger counter.
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_APP_SETTINGS.maxSuggestionsTimerSeconds);
  const [suggestionsTimerPaused, setSuggestionsTimerPaused] = useState(true);
  const [suggestionsRefreshTick, setSuggestionsRefreshTick] = useState(0);

  // Suggestion refresh timer.
  useEffect(() => {
    const tick = () => {
      if (suggestionsTimerPaused) {
        return;
      }

      //setup the timer countdown for the next second
      setTimerSeconds((prev) => {
        const next = prev - 1;
        if (next > 0) {
          return next;
        }

        // trigger a new suggestions batch
        setSuggestionsRefreshTick((tick) => tick + 1);

        //reset the timer countdown to the max suggestions timer seconds
        return appSettings.maxSuggestionsTimerSeconds;
      });
    };

    const intervalId = window.setInterval(tick, 1_000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [suggestionsTimerPaused, appSettings.maxSuggestionsTimerSeconds]);

  const saveSettings = (next: AppSettings) => {
    setAppSettings(next);
    setTimerSeconds(next.maxSuggestionsTimerSeconds);
    setIsSettingsOpen(false);
  };

  const handleExternalSuggestionHandled = useCallback(() => {
    setExternalSuggestionToSend(null);
  }, []);

  //for export session data to a JSON file using export button
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
    <div className="app tm-app-shell flex h-screen flex-col">
      <header className="appHeader flex justify-end gap-2 p-2">
        <button type="button" onClick={onExportSession} className="tm-btn-primary p-2">Export</button>
        <button type="button" onClick={() => setIsSettingsOpen(true)} className="tm-btn-primary p-2">Settings</button>
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
            <span className="tm-chip">
              auto-refreshes in {timerSeconds}s
            </span>
          }
        >
          <LiveSuggestionsPanel
            appSettings={appSettings}
            transcriptEntries={transcriptEntries}
            suggestionsBatch={suggestionBatches}
            setSuggestionBatches={setSuggestionBatches}
            suggestionsRefreshTick={suggestionsRefreshTick}
            onReloadTimerReset={() => setTimerSeconds(appSettings.maxSuggestionsTimerSeconds)}
            onSuggestionClick={(suggestion) => setExternalSuggestionToSend(suggestion)}
          />
        </Column>
        <Column title="Chat">
          <ChatPanel
            appSettings={appSettings}
            transcriptEntries={transcriptEntries}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            isChatLoading={isChatLoading}
            setIsChatLoading={setIsChatLoading}
            externalSuggestionToSend={externalSuggestionToSend}
            onExternalSuggestionHandled={handleExternalSuggestionHandled}
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
