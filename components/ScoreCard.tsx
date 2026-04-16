'use client';

import { Score } from '@/types';

interface ScoreCardProps {
  dimension: string;
  score: Score;
}

export default function ScoreCard({ dimension, score }: ScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 4) return 'bg-green-500';
    if (s >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-sm">{dimension}</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i <= score.score ? getColor(score.score) : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor(score.score)}`}
          style={{ width: `${(score.score / 5) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 italic">&quot;{score.evidence}&quot;</p>
    </div>
  );
}
