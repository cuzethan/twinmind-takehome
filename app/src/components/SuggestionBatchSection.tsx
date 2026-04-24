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

function getSuggestionTypeColors(type: Suggestion['type']) {
  switch (type) {
    case 'question to ask':
      return {
        badge: 'bg-blue-500/30 text-blue-100',
      };
    case 'talking point':
      return {
        badge: 'bg-purple-500/30 text-purple-100',
      };
    case 'answer':
      return {
        badge: 'bg-green-500/30 text-green-100',
      };
    case 'fact-check':
      return {
        badge: 'bg-yellow-500/30 text-yellow-100',
      };
    default:
      return {
        badge: 'bg-slate-600 text-white',
      };
  }
}

function SectionCard({ suggestion, onSuggestionClick }: SectionCardProps) {
  const colors = getSuggestionTypeColors(suggestion.type);

  return (
    <button
      onClick={() => onSuggestionClick(suggestion)}
      className="tm-batch-card"
    >
      <p className={`mb-1 inline-block rounded px-2 py-1 text-xs font-semibold uppercase ${colors.badge}`}>
        {suggestion.type}
      </p>
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
      <p className="tm-muted-meta mt-2 normal-case">Batch {batchNumber} - {batch.timestamp}</p>
    </div>
  );
}
