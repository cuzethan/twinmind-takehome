import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';

type ChatPanelProps = {
    groqApiKey: string;
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    isChatLoading: boolean;
    setIsChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
    externalMessageToSend: string | null;
    onExternalMessageHandled: () => void;
};

export default function ChatPanel({
    groqApiKey,
    chatMessages,
    setChatMessages,
    isChatLoading,
    setIsChatLoading,
    externalMessageToSend,
    onExternalMessageHandled,
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

    const sendMessage = async (rawContent: string) => {
        const content = rawContent.trim();
        if (!content || isChatLoading) {
            return;
        }
        if (!groqApiKey) {
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

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: nextMessages.map((message) => ({
                        role: message.role,
                        content: message.content,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get assistant response.');
            }

            const data = await response.json();
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
        await sendMessage(draft);
        setDraft('');
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            await handleSend();
        }
    };

    useEffect(() => {
        if (!externalMessageToSend) {
            return;
        }

        void sendMessage(externalMessageToSend).finally(() => {
            onExternalMessageHandled();
        });
    }, [externalMessageToSend, onExternalMessageHandled]);

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div
                ref={messagesContainerRef}
                className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-md border p-3"
            >
                {chatMessages.length === 0 ? (
                    <p className="text-sm text-gray-500">Start a chat by sending a message.</p>
                ) : (
                    chatMessages.map((message) => (
                        <div key={message.id} className="rounded-md border border-gray-200 p-2">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                {message.role} · {message.timestamp}
                            </p>
                            <p className="text-sm">{message.content}</p>
                        </div>
                    ))
                )}
                {isChatLoading && <p className="text-sm text-gray-500">Assistant is thinking...</p>}
            </div>

            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    disabled={isChatLoading}
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={isChatLoading}
                    className="rounded-md bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                    Send
                </button>
            </div>
        </div>
    );
}