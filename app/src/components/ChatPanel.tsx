import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, Suggestion, TranscriptEntry } from '../types';
import type { AppSettings } from '../config/appSettings';
import { buildTranscriptAugmentedChatMessages } from '../config/util';
import axios from 'axios';

type ChatPanelProps = {
    appSettings: AppSettings;
    transcriptEntries: TranscriptEntry[];
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    isChatLoading: boolean;
    setIsChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
    externalSuggestionToSend: Suggestion | null;
    onExternalSuggestionHandled: () => void;
};

export default function ChatPanel({
    appSettings,
    transcriptEntries,
    chatMessages,
    setChatMessages,
    isChatLoading,
    setIsChatLoading,
    externalSuggestionToSend,
    onExternalSuggestionHandled,
}: ChatPanelProps) {
    const [draft, setDraft] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!messagesContainerRef.current) {
            return;
        }
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [chatMessages, isChatLoading]);

    const sendMessage = async (
        data: string | Suggestion,
        mode: 'chat' | 'suggestionExpansion' = 'chat',
    ) => {
        const content = typeof data === 'string' ? data.trim() : data.text.trim();
        if (!content || isChatLoading) {
            return;
        }
        if (!appSettings.groqApiKey) {
            setErrorMessage('Add your Groq API key in Settings first.');
            return;
        }

        setErrorMessage('');

        const userMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            role: 'user',
            content,
            timestamp: new Date().toLocaleTimeString(),
        };

        const nextMessages = [...chatMessages, userMessage];
        setChatMessages(nextMessages);
        setIsChatLoading(true);

        const groqMessages =
            mode === 'suggestionExpansion'
                ? buildTranscriptAugmentedChatMessages(nextMessages, transcriptEntries,
                  appSettings.suggestionExpansionSystemPrompt,
                  appSettings.suggestionExpansionContextWindow,
                  data as Suggestion,
                )
                : buildTranscriptAugmentedChatMessages(nextMessages, transcriptEntries, 
                  appSettings.chatSystemPrompt,
                  appSettings.chatContextWindow,
                  null,
                );

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'openai/gpt-oss-120b',
                messages: groqMessages,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${appSettings.groqApiKey}`,
                },
            });

            if (response.status !== 200) {
                throw new Error('Failed to get assistant response.');
            }

            const data = response.data;
            const assistantContent = data.choices?.[0]?.message?.content?.trim();

            if (!assistantContent) {
                throw new Error('Assistant returned an empty response.');
            }

            const assistantMessage: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date().toLocaleTimeString(),
            };

            setChatMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error while chatting.');
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSend = async () => {
        await sendMessage(draft, 'chat');
        setDraft('');
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            await handleSend();
        }
    };

    useEffect(() => {
        if (!externalSuggestionToSend) {
            return;
        }

        void sendMessage(externalSuggestionToSend, 'suggestionExpansion').finally(() => {
            onExternalSuggestionHandled();
        });
    }, [externalSuggestionToSend, onExternalSuggestionHandled]);

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div
                ref={messagesContainerRef}
                className="tm-surface min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
            >
                {chatMessages.length === 0 ? (
                    <p className="tm-muted-text">Start a chat by sending a message.</p>
                ) : (
                    chatMessages.map((message) => (
                        <div key={message.id} className="tm-card">
                            <p className="tm-muted-meta">
                                {message.role} · {message.timestamp}
                            </p>
                            <p className="text-sm">{message.content}</p>
                        </div>
                    ))
                )}
                {isChatLoading && <p className="tm-muted-text">Assistant is thinking...</p>}
            </div>

            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="tm-input"
                    disabled={isChatLoading}
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={isChatLoading}
                    className="tm-btn-primary"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
