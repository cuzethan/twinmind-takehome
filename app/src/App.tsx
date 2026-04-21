import { useState } from 'react';
import Column from './assets/Column';
import SettingsModal from './assets/SettingsModal';
import MicTranscriptPanel from './assets/MicTranscriptPanel';
import LiveSuggestionsPanel from './assets/LiveSuggestionsPanel';
import type { SuggestionBatch } from './types';

import './index.css'

export default function App() {

  const [groqkey, setGroqkey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [model, setModel] = useState('llama-3.1-8b-instant');

  const [transcriptEntries, setTranscriptEntries] = useState<
    { id: string; timestamp: string; text: string }[]
  >([]);

  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);

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

  return (
    <div className="app flex flex-col h-screen">
      <header className="appHeader flex justify-end gap-2 p-2">
        <button type="button" onClick={openSettings} className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">Settings</button>
      </header>

      <main className="columnsContainer flex min-h-0 flex-1 gap-2 p-2 w-full">
        <Column title="Mic & Transcript">
          <MicTranscriptPanel groqApiKey={groqkey} transcriptEntries={transcriptEntries} setTranscriptEntries={setTranscriptEntries} />
        </Column>
        <Column title="Live Suggestions">
          <LiveSuggestionsPanel 
          latestTranscript={transcriptEntries[transcriptEntries.length - 1]}
          suggestionsBatch={suggestionBatches}
          setSuggestionBatches={setSuggestionBatches}
          />
        </Column>
        <Column title="Column 3" />
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