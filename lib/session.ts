import { Session } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory session storage for Vercel serverless compatibility
// Note: Sessions are lost when the serverless function cold restarts
// For production, use a proper database (Redis, PostgreSQL, etc.)
const sessions = new Map<string, Session>();

export async function createSession(candidateName: string): Promise<Session> {
  const id = uuidv4();
  const session: Session = {
    id,
    candidateName,
    messages: [],
    startTime: Date.now(),
    status: 'active'
  };
  sessions.set(id, session);
  return session;
}

export async function getSession(id: string): Promise<Session | undefined> {
  return sessions.get(id);
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
  const session = sessions.get(id);
  if (!session) return undefined;
  
  const updatedSession = { ...session, ...updates };
  sessions.set(id, updatedSession);
  return updatedSession;
}

export async function addMessage(id: string, role: 'user' | 'assistant', content: string): Promise<Session | undefined> {
  const session = sessions.get(id);
  if (!session) return undefined;
  
  session.messages.push({ role, content });
  return session;
}

export async function completeSession(id: string, scores: Session['scores'], recommendation: string, summary: string): Promise<Session | undefined> {
  const session = sessions.get(id);
  if (!session) return undefined;
  
  session.status = 'complete';
  session.scores = scores;
  session.recommendation = recommendation;
  session.summary = summary;
  return session;
}

export async function getAllSessions(): Promise<Session[]> {
  return Array.from(sessions.values());
}
