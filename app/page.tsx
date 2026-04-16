'use client';

import { useState } from 'react';

export default function Home() {
  const [candidateName, setCandidateName] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!candidateName.trim()) return;
    
    setIsStarting(true);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName: candidateName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const session = await response.json();
      window.location.href = `/interview?sessionId=${session.id}`;
    } catch (error) {
      console.error('Error starting interview:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Cuemath <span className="text-orange-500">AI Tutor Screener</span>
          </h1>
          <p className="text-gray-600">
            Your AI-powered voice interview experience
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-gray-800 mb-3">What to expect:</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• A relaxed 10-minute voice conversation</li>
            <li>• Questions about your teaching experience and style</li>
            <li>• Situational scenarios to assess your approach</li>
            <li>• Instant feedback on your performance</li>
            <li>• Speak naturally - just like a real interview</li>
          </ul>
        </div>

        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            disabled={isStarting}
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!candidateName.trim() || isStarting}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isStarting ? 'Starting...' : 'Start Interview'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Make sure you have a working microphone and are in a quiet environment
        </p>
      </div>
    </div>
  );
}
