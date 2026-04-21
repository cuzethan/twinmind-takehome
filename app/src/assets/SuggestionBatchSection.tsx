import type { SuggestionBatch, Suggestion } from '../types';

type SuggestionBatchSectionProps = {
  batch: SuggestionBatch;
  batchNumber: number;
}

function SectionCard({ suggestion }: { suggestion: Suggestion }) {
  const sendSuggestionToChat = (suggestion: Suggestion) => {
    console.log('Sending suggestion to chat:', suggestion);
  }
  return (
    <button
      onClick={() => sendSuggestionToChat(suggestion)}
      className="w-full rounded-md border border-gray-300 p-2 text-left cursor-pointer"
    >
      <p className="mb-1 text-xs font-semibold uppercase text-gray-500">{suggestion.type}</p>
      <p>{suggestion.text}</p>
    </button>
  );
}

export default function SuggestionBatchSection({ batch, batchNumber }: SuggestionBatchSectionProps) {
  return (
    <div className="mb-4">
      <div className="space-y-2">
        {batch.suggestions.map((suggestion, index) => {
        return <SectionCard key={`${batch.timestamp}-${suggestion.type}-${index}`} suggestion={suggestion} />
        })}
      </div>
      <p>Batch {batchNumber} - {batch.timestamp}</p>
    </div>
  );
}