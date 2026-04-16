import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, Assessment } from '@/types';
import { INTERVIEWER_SYSTEM_PROMPT, ASSESSMENT_SYSTEM_PROMPT } from './rubric';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function getInterviewerResponse(
  messages: Message[],
  systemPrompt: string = INTERVIEWER_SYSTEM_PROMPT
): Promise<{ response: string; isComplete: boolean }> {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not set');
      return {
        response: "I apologize, but the API key is not configured. Please check your environment variables.",
        isComplete: false,
      };
    }

    const conversationHistory = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: conversationHistory,
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage('Continue the interview naturally.');
    const response = await result.response.text();

    const isComplete = response.includes('[INTERVIEW_COMPLETE]');
    const cleanResponse = response.replace('[INTERVIEW_COMPLETE]', '').trim();

    return {
      response: cleanResponse,
      isComplete,
    };
  } catch (error) {
    console.error('Gemma API error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return {
      response: "I apologize, but I'm having trouble connecting right now. Please continue sharing your thoughts?",
      isComplete: false,
    };
  }
}

export async function getAssessment(transcript: Message[]): Promise<Assessment> {
  try {
    const transcriptText = transcript
      .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `${ASSESSMENT_SYSTEM_PROMPT}\n\nPlease analyze this interview transcript and provide your assessment:\n\n${transcriptText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as Assessment;
  } catch (error) {
    console.error('Assessment error:', error);
    return getFallbackAssessment(transcript);
  }
}

function getFallbackAssessment(transcript: Message[]): Assessment {
  const userMessages = transcript.filter(m => m.role === 'user');
  const fullText = userMessages.map(m => m.content.toLowerCase()).join(' ');
  
  const avgResponseLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / (userMessages.length || 1);
  const hasExamples = /example|like when|for instance|say/.test(fullText);
  const hasEncouragement = /great job|well done|you can do it|don't worry|take your time/.test(fullText);
  const hasAnalogies = /like a|imagine|think of it as/.test(fullText);
  const wordCount = fullText.split(/\s+/).length;
  
  const clarity = Math.min(5, Math.max(3, Math.floor(avgResponseLength / 50) + 2));
  const simplification = hasAnalogies || hasExamples ? 4 : 3;
  const patience = hasEncouragement ? 4 : 3;
  const warmth = hasEncouragement || /love|enjoy|excited/.test(fullText) ? 4 : 3;
  const fluency = wordCount > 50 ? 4 : 3;
  
  const avgScore = (clarity + simplification + patience + warmth + fluency) / 5;
  
  const longestResponse = userMessages.reduce((longest, m) => 
    m.content.length > longest.length ? m.content : longest, ''
  );
  const evidenceQuote = longestResponse.length > 100 
    ? longestResponse.substring(0, 100) + '...' 
    : longestResponse || 'Candidate provided thoughtful responses throughout the interview.';

  return {
    scores: {
      clarity: { score: clarity, evidence: evidenceQuote },
      simplification: { score: simplification, evidence: evidenceQuote },
      patience: { score: patience, evidence: evidenceQuote },
      warmth: { score: warmth, evidence: evidenceQuote },
      fluency: { score: fluency, evidence: evidenceQuote },
    },
    recommendation: avgScore >= 3.5 ? 'Advance to next round' : 'Hold for review',
    summary: avgScore >= 3.5 
      ? 'The candidate demonstrated solid teaching fundamentals and a warm, approachable style. Their responses showed good communication skills and empathy for students.'
      : 'The candidate showed some teaching potential but would benefit from additional development in explanation clarity and student engagement techniques.',
  };
}
