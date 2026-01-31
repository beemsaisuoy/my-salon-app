'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10), // Last 10 messages for context
                }),
            });

            const data = await response.json();

            if (data.error) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.error },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.response },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'ขอโทษค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-pink-dark to-pink shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center text-white text-2xl"
                aria-label="AI Chat"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 left-6 z-40 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-dark to-pink p-4 text-white">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h3 className="font-bold">AI ผู้ช่วย</h3>
                                <p className="text-xs text-pink-light">ถามได้เลยค่ะ!</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-8">
                                <p className="text-4xl mb-2">💬</p>
                                <p className="text-sm">สวัสดีค่ะ! มีอะไรให้ช่วยไหมคะ?</p>
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => setInput('มีบริการอะไรบ้าง?')}
                                        className="block w-full text-left text-xs bg-white p-2 rounded-lg border hover:bg-pink-50 transition"
                                    >
                                        🔹 มีบริการอะไรบ้าง?
                                    </button>
                                    <button
                                        onClick={() => setInput('ราคาตัดผมเท่าไหร่?')}
                                        className="block w-full text-left text-xs bg-white p-2 rounded-lg border hover:bg-pink-50 transition"
                                    >
                                        🔹 ราคาตัดผมเท่าไหร่?
                                    </button>
                                    <button
                                        onClick={() => setInput('มีขนมอะไรขายบ้าง?')}
                                        className="block w-full text-left text-xs bg-white p-2 rounded-lg border hover:bg-pink-50 transition"
                                    >
                                        🔹 มีขนมอะไรขายบ้าง?
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-pink-dark text-white rounded-br-none'
                                            : 'bg-white text-gray-700 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-3 bg-white border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="พิมพ์ข้อความ..."
                                className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-pink text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 rounded-full bg-pink-dark text-white flex items-center justify-center hover:bg-pink transition disabled:opacity-50"
                            >
                                ➤
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
