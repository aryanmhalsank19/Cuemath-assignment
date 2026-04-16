import { create } from 'zustand';
import { Session, Message } from '@/types';

interface InterviewState {
  session: Session | null;
  messages: Message[];
  stage: string;
  isRecording: boolean;
  isAISpeaking: boolean;
  isComplete: boolean;
  scores: Session['scores'] | null;
  recommendation: string | null;
  summary: string | null;
  error: string | null;
  elapsedTime: number;
  
  setSession: (session: Session | null) => void;
  setMessages: (messages: Message[]) => void;
  setStage: (stage: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsAISpeaking: (isAISpeaking: boolean) => void;
  setIsComplete: (isComplete: boolean) => void;
  setScores: (scores: Session['scores'] | null) => void;
  setRecommendation: (recommendation: string | null) => void;
  setSummary: (summary: string | null) => void;
  setError: (error: string | null) => void;
  setElapsedTime: (time: number | ((prev: number) => number)) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  session: null,
  messages: [],
  stage: 'welcome',
  isRecording: false,
  isAISpeaking: false,
  isComplete: false,
  scores: null,
  recommendation: null,
  summary: null,
  error: null,
  elapsedTime: 0,
  
  setSession: (session) => set({ session }),
  setMessages: (messages) => set({ messages }),
  setStage: (stage) => set({ stage }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsAISpeaking: (isAISpeaking) => set({ isAISpeaking }),
  setIsComplete: (isComplete) => set({ isComplete }),
  setScores: (scores) => set({ scores }),
  setRecommendation: (recommendation) => set({ recommendation }),
  setSummary: (summary) => set({ summary }),
  setError: (error) => set({ error }),
  setElapsedTime: (time) => set((state) => ({ 
    elapsedTime: typeof time === 'function' ? time(state.elapsedTime) : time 
  })),
  
  reset: () => set({
    session: null,
    messages: [],
    stage: 'welcome',
    isRecording: false,
    isAISpeaking: false,
    isComplete: false,
    scores: null,
    recommendation: null,
    summary: null,
    error: null,
    elapsedTime: 0,
  }),
}));
