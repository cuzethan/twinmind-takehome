export type SuggestionBatch = {
    timestamp: string;
    suggestions: Suggestion[];
}

export type TranscriptEntry = {
    id: string;
    timestamp: string;
    text: string;
}

export type Suggestion = {
    type: 'question to ask' | 'talking point' | 'answer' | 'fact-check';
    text: string;
}

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    timestamp: string;
}