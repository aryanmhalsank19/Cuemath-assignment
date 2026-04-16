export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Score {
  score: number;
  evidence: string;
}

export interface AssessmentScores {
  clarity: Score;
  simplification: Score;
  patience: Score;
  warmth: Score;
  fluency: Score;
}

export interface Assessment {
  scores: AssessmentScores;
  recommendation: 'Advance to next round' | 'Hold for review';
  summary: string;
}

export interface Session {
  id: string;
  candidateName: string;
  messages: Message[];
  startTime: number;
  status: 'active' | 'complete';
  scores?: AssessmentScores;
  recommendation?: string;
  summary?: string;
}

export type InterviewStage = 'welcome' | 'warmup' | 'core' | 'followup1' | 'situation' | 'followup2' | 'wrapup' | 'complete';

export interface DimensionDefinition {
  name: string;
  description: string;
}
