'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://1urk9xxl3f.execute-api.us-east-1.amazonaws.com';

export default function Twin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data: { response: string; session_id: string } = await response.json();

      if (!sessionId) {
        setSessionId(data.session_id);
      }

      setMessages((previous) => [
        ...previous,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((previous) => [
        ...previous,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-gray-50 shadow-lg">
      <div className="rounded-t-lg bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Bot className="h-6 w-6" />
          AI Digital Twin
        </h2>
        <p className="mt-1 text-sm text-slate-300">Your AI course companion</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            <Bot className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p>Hello! I&apos;m your Digital Twin.</p>
            <p className="mt-2 text-sm">Ask me anything about AI deployment!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-slate-700 text-white'
                  : 'border border-gray-200 bg-white text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`mt-1 text-xs ${
                  message.role === 'user' ? 'text-slate-300' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div className="delay-100 h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div className="delay-200 h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="rounded-b-lg border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-label="Chat message"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-600"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
