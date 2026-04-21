import { useEffect, useState } from 'react';
import Column from './assets/Column';
import SettingsModal from './assets/SettingsModal';
import MicTranscriptPanel from './assets/MicTranscriptPanel';
import LiveSuggestionsPanel from './assets/LiveSuggestionsPanel';
import ChatPanel from './assets/ChatPanel';
import type { ChatMessage, SuggestionBatch } from './types';

import './index.css'

export default function App() {
  const SUGGESTION_INTERVAL_SECONDS = 30;

  const [groqkey, setGroqkey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [model, setModel] = useState('llama-3.1-8b-instant');

  const [transcriptEntries, setTranscriptEntries] = useState<
    { id: string; timestamp: string; text: string }[]
  >([]);

  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(SUGGESTION_INTERVAL_SECONDS);
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
          return SUGGESTION_INTERVAL_SECONDS;
        }

        return prev - 1;
      });
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [suggestionsTimerPaused]);

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const saveSettings = () => {
    setGroqkey(groqkey);
    setModel(model);
    console.log(groqkey, model);
    setIsSettingsOpen(false);
  };

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
        <button type="button" onClick={openSettings} className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">Settings</button>
      </header>

      <main className="columnsContainer flex min-h-0 flex-1 gap-2 p-2 w-full">
        <Column title="Mic & Transcript">
          <MicTranscriptPanel 
            groqApiKey={groqkey} 
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
            groqApiKey={groqkey}
            latestTranscript={transcriptEntries[transcriptEntries.length - 1]}
            suggestionsBatch={suggestionBatches}
            setSuggestionBatches={setSuggestionBatches}
            suggestionsTimerCycle={suggestionsTimerCycle}
            onReloadTimerReset={() => setTimerSeconds(SUGGESTION_INTERVAL_SECONDS)}
          />
        </Column>
        <Column title="Chat">
          <ChatPanel
            groqApiKey={groqkey}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            isChatLoading={isChatLoading}
            setIsChatLoading={setIsChatLoading}
          />
        </Column>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        groqkey={groqkey}
        model={model}
        onGroqkeyChange={setGroqkey}
        onModelChange={setModel}
        onClose={closeSettings}
        onSave={saveSettings}
      />
    </div>
  );
}