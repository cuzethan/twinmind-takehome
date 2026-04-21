import type { SuggestionBatch, Suggestion } from '../types';

type SuggestionBatchSectionProps = {
  batch: SuggestionBatch;
  batchNumber: number;
  onSuggestionClick: (suggestion: Suggestion) => void;
};

type SectionCardProps = {
  suggestion: Suggestion;
  onSuggestionClick: (suggestion: Suggestion) => void;
};

function SectionCard({ suggestion, onSuggestionClick }: SectionCardProps) {
  return (
    <button
      onClick={() => onSuggestionClick(suggestion)}
      className="w-full rounded-md border border-gray-300 p-2 text-left cursor-pointer"
    >
      <p className="mb-1 text-xs font-semibold uppercase text-gray-500">{suggestion.type}</p>
      <p>{suggestion.text}</p>
    </button>
  );
}

export default function SuggestionBatchSection({
  batch,
  batchNumber,
  onSuggestionClick,
}: SuggestionBatchSectionProps) {
  return (
    <div className="mb-4">
      <div className="space-y-2">
        {batch.suggestions.map((suggestion, index) => {
          return (
            <SectionCard
              key={`${batch.timestamp}-${suggestion.type}-${index}`}
              suggestion={suggestion}
              onSuggestionClick={onSuggestionClick}
            />
          );
        })}
      </div>
      <p>Batch {batchNumber} - {batch.timestamp}</p>
    </div>
  );
}