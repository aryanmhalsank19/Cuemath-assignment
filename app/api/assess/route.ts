import { NextRequest, NextResponse } from 'next/server';
import { getSession, completeSession } from '@/lib/session';
import { getAssessment } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.messages.length < 3) {
      return NextResponse.json(
        { error: 'Not enough conversation data for assessment' },
        { status: 400 }
      );
    }

    const assessment = await getAssessment(session.messages);

    const updatedSession = await completeSession(
      sessionId,
      assessment.scores,
      assessment.recommendation,
      assessment.summary
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      assessment,
      session: updatedSession,
    });
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
