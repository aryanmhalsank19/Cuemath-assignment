import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateName } = body;

    if (!candidateName || typeof candidateName !== 'string') {
      return NextResponse.json(
        { error: 'Candidate name is required' },
        { status: 400 }
      );
    }

    const session = await createSession(candidateName.trim());
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('Session GET: No session ID provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('Session GET: Fetching session', id);
    const session = await getSession(id);

    if (!session) {
      console.error('Session GET: Session not found', id);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('Session GET: Session found', id);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
