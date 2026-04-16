'use client';

import { Message } from '@/types';
import { useEffect, useRef } from 'react';

interface ConversationThreadProps {
  messages: Message[];
  isAISpeaking: boolean;
}

export default function ConversationThread({ messages, isAISpeaking }: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>Starting interview...</p>
        </div>
      )}
      
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-gray-200 text-gray-800 rounded-br-sm'
                : 'bg-teal-500 text-white rounded-bl-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}

      {isAISpeaking && (
        <div className="flex justify-start">
          <div className="bg-teal-500 text-white rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
