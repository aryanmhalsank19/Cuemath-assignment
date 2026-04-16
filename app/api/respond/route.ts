import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getSession } from '@/lib/session';
import { getInterviewerResponse } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, transcript } = body;

    console.log('Respond POST: Received request', { sessionId, transcriptLength: transcript?.length });

    if (!sessionId || typeof sessionId !== 'string') {
      console.error('Respond POST: No session ID');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!transcript || typeof transcript !== 'string') {
      console.error('Respond POST: No transcript');
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      console.error('Respond POST: Session not found', sessionId);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'complete') {
      console.error('Respond POST: Interview already complete');
      return NextResponse.json(
        { error: 'Interview already complete' },
        { status: 400 }
      );
    }

    await addMessage(sessionId, 'user', transcript);
    console.log('Respond POST: User message added');

    const updatedSession = await getSession(sessionId);
    if (!updatedSession) {
      console.error('Respond POST: Session lost after message add');
      return NextResponse.json(
        { error: 'Session lost' },
        { status: 404 }
      );
    }
    
    console.log('Respond POST: Calling Gemma API, message count:', updatedSession.messages.length);
    
    const { response, isComplete } = await getInterviewerResponse(updatedSession.messages);

    await addMessage(sessionId, 'assistant', response);
    console.log('Respond POST: Assistant message added', { isComplete });

    const finalSession = await getSession(sessionId);
    if (!finalSession) {
      console.error('Respond POST: Session lost after AI response');
      return NextResponse.json(
        { error: 'Session lost' },
        { status: 404 }
      );
    }

    if (isComplete) {
      finalSession.status = 'complete';
    }

    return NextResponse.json({
      response,
      isComplete,
      updatedSession: finalSession,
    });
  } catch (error) {
    console.error('Response generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
