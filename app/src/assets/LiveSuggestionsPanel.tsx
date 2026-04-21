import type { SuggestionBatch } from '../types';
import SuggestionBatchSection from './SuggestionBatchSection';

type LiveSuggestionsPanelProps = {
  latestTranscript?: { id: string; timestamp: string; text: string };
  suggestionsBatch: SuggestionBatch[];
  setSuggestionBatches: React.Dispatch<React.SetStateAction<SuggestionBatch[]>>;
}

export default function LiveSuggestionsPanel({ latestTranscript, suggestionsBatch, setSuggestionBatches }: LiveSuggestionsPanelProps) {
  
  const handleReloadSuggestions = () => {
    console.log('Reloading suggestions');
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={handleReloadSuggestions}
      className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">Reload Button</button>
      <div>
        {suggestionsBatch.map((batch) => (
          <SuggestionBatchSection key={batch.timestamp} batch={batch} />
        ))}
      </div>
    </div>
  );
}