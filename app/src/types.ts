export type SuggestionBatch = {
timestamp: string;
suggestions: Suggestion[];
}

type Suggestion = {
type: 'question to ask' | 'talking point' | 'answer' | 'fact-check';
text: string;
}