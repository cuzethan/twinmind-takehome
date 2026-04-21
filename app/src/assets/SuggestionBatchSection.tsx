import type { SuggestionBatch, Suggestion } from '../types';

type SuggestionBatchSectionProps = {
  batch: SuggestionBatch;
}

function SectionCard({ suggestion }: { suggestion: Suggestion }) {
  const sendSuggestionToChat = (suggestion: Suggestion) => {
    console.log('Sending suggestion to chat:', suggestion);
  }
  return (
    <button onClick={() => sendSuggestionToChat(suggestion)} className="border border-gray-300 rounded-md p-2 w-full">
      <p>{suggestion.text}</p>
    </button>
  );
}

export default function SuggestionBatchSection({ batch }: SuggestionBatchSectionProps) {
  return (
    <div>
      {batch.suggestions.map((suggestion) => {
        return <SectionCard key={suggestion.text} suggestion={suggestion} />
      })}
      <p>{batch.timestamp}</p>
    </div>
  );
}