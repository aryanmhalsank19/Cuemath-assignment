'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ScoreCard from '@/components/ScoreCard';
import { Session } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/api/session?id=${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session');
        const sessionData = await response.json();
        setSession(sessionData);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{error || 'Session not found'}</p>
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

  const avgScore = session.scores
    ? Object.values(session.scores).reduce((sum, s) => sum + s.score, 0) / 5
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Interview Results
          </h1>
          <p className="text-gray-600">
            Candidate: {session.candidateName}
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recommendation</h2>
            <div
              className={`px-4 py-2 rounded-full font-semibold ${
                session.recommendation === 'Advance to next round'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {session.recommendation}
            </div>
          </div>
          <p className="text-gray-700">{session.summary}</p>
        </div>

        {session.scores && (
          <div className="grid gap-4 mb-6">
            <ScoreCard dimension="Communication Clarity" score={session.scores.clarity} />
            <ScoreCard dimension="Simplification" score={session.scores.simplification} />
            <ScoreCard dimension="Patience" score={session.scores.patience} />
            <ScoreCard dimension="Warmth" score={session.scores.warmth} />
            <ScoreCard dimension="Fluency" score={session.scores.fluency} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-semibold text-gray-800">Full Transcript</h2>
            {showTranscript ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showTranscript && (
            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              {session.messages.map((message, index) => (
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
                    <p className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'Interviewer'}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
