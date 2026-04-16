'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/interview';
import VoiceRecorder from '@/components/VoiceRecorder';
import ConversationThread from '@/components/ConversationThread';
import { Message } from '@/types';

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');
  
  const {
    session,
    messages,
    isRecording,
    isAISpeaking,
    isComplete,
    error,
    elapsedTime,
    setSession,
    setMessages,
    setIsAISpeaking,
    setIsComplete,
    setError,
    setElapsedTime,
  } = useInterviewStore();

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    const loadSession = async () => {
      try {
        const response = await fetch(`/api/session?id=${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session');
        const sessionData = await response.json();
        setSession(sessionData);
        setMessages(sessionData.messages || []);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session');
      }
    };

    loadSession();
  }, [sessionId, setSession, setMessages, setError]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [setElapsedTime]);

  const handleTranscript = async (transcript: string) => {
    if (!sessionId || !transcript.trim()) return;

    try {
      const response = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, transcript }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(data.updatedSession.messages || []);
      
      if (data.isComplete) {
        setIsComplete(true);
        router.push(`/results/${sessionId}`);
      }
    } catch (err) {
      console.error('Error getting response:', err);
      setError('Failed to get response');
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error('Failed to complete assessment');

      router.push(`/results/${sessionId}`);
    } catch (err) {
      console.error('Error ending interview:', err);
      setError('Failed to complete assessment');
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isAISpeaking) {
        speakText(lastMessage.content);
      }
    }
  }, [messages, isAISpeaking, setIsAISpeaking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-red-700 underline"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-semibold">
            {session?.candidateName}'s Interview
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{formatTime(elapsedTime)}</span>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              End Interview
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 gap-4">
        <div className="bg-gray-800 rounded-lg flex-1 overflow-hidden border border-gray-700">
          <ConversationThread messages={messages} isAISpeaking={isAISpeaking} />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <VoiceRecorder
            onTranscript={handleTranscript}
            disabled={isAISpeaking || isComplete}
            isAISpeaking={isAISpeaking}
          />
        </div>
      </main>

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">End Interview?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end the interview early? You can continue or complete the assessment now.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleEndInterview}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                End & Assess
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
