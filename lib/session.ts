import { Session } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

const SESSIONS_FILE = path.join(process.cwd(), '.sessions.json');

async function loadSessions(): Promise<Map<string, Session>> {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
    const sessionsArray = JSON.parse(data) as Session[];
    return new Map(sessionsArray.map(s => [s.id, s]));
  } catch {
    return new Map();
  }
}

async function saveSessions(sessions: Map<string, Session>): Promise<void> {
  const sessionsArray = Array.from(sessions.values());
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessionsArray, null, 2));
}

let sessionsCache: Map<string, Session> | null = null;

async function getSessions(): Promise<Map<string, Session>> {
  if (!sessionsCache) {
    sessionsCache = await loadSessions();
  }
  return sessionsCache;
}

export async function createSession(candidateName: string): Promise<Session> {
  const id = uuidv4();
  const session: Session = {
    id,
    candidateName,
    messages: [],
    startTime: Date.now(),
    status: 'active'
  };
  
  const sessions = await getSessions();
  sessions.set(id, session);
  await saveSessions(sessions);
  
  return session;
}

export async function getSession(id: string): Promise<Session | undefined> {
  const sessions = await getSessions();
  return sessions.get(id);
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
  const sessions = await getSessions();
  const session = sessions.get(id);
  if (!session) return undefined;
  
  const updatedSession = { ...session, ...updates };
  sessions.set(id, updatedSession);
  await saveSessions(sessions);
  return updatedSession;
}

export async function addMessage(id: string, role: 'user' | 'assistant', content: string): Promise<Session | undefined> {
  const sessions = await getSessions();
  const session = sessions.get(id);
  if (!session) return undefined;
  
  session.messages.push({ role, content });
  sessions.set(id, session);
  await saveSessions(sessions);
  return session;
}

export async function completeSession(id: string, scores: Session['scores'], recommendation: string, summary: string): Promise<Session | undefined> {
  const sessions = await getSessions();
  const session = sessions.get(id);
  if (!session) return undefined;
  
  session.status = 'complete';
  session.scores = scores;
  session.recommendation = recommendation;
  session.summary = summary;
  sessions.set(id, session);
  await saveSessions(sessions);
  return session;
}

export async function getAllSessions(): Promise<Session[]> {
  const sessions = await getSessions();
  return Array.from(sessions.values());
}
