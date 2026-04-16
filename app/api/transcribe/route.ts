import { NextResponse } from 'next/server';

// NOTE: Server-side transcription disabled.
// The application now uses the free Web Speech API (browser-native)
// for client-side transcription. This endpoint is kept for compatibility
// but transcription happens entirely in the browser via VoiceRecorder component.

export async function POST() {
  return NextResponse.json(
    { 
      error: 'Server-side transcription disabled. Using client-side Web Speech API instead.',
      transcript: '' 
    },
    { status: 200 }
  );
}
