'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled: boolean;
  isAISpeaking: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export default function VoiceRecorder({
  onTranscript,
  disabled,
  isAISpeaking,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setPermissionError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript;
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone access denied. Please allow microphone permissions.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(true);
      
      const transcript = finalTranscriptRef.current.trim();
      if (transcript) {
        onTranscript(transcript);
      } else {
        onTranscript("I didn't catch that, could you repeat?");
      }
      
      finalTranscriptRef.current = '';
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [onTranscript]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setPermissionError('Speech recognition is not available.');
      return;
    }

    try {
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
      setIsRecording(true);
      setPermissionError(null);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setPermissionError('Could not start recording. Please try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  if (permissionError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
        <p className="text-red-700 text-sm">{permissionError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={toggleRecording}
        disabled={disabled || isProcessing || isAISpeaking}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${isRecording 
            ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110' 
            : isAISpeaking
              ? 'bg-gray-400 cursor-not-allowed'
              : disabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 hover:scale-105'
          }
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {isRecording && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
        )}
      </button>
      
      <div className="text-sm font-medium">
        {isProcessing ? (
          <span className="text-orange-400 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : isAISpeaking ? (
          <span className="text-teal-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            AI is speaking...
          </span>
        ) : isRecording ? (
          <span className="text-red-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording...
          </span>
        ) : disabled ? (
          <span className="text-gray-500">Waiting...</span>
        ) : (
          <span className="text-gray-400">Tap to speak</span>
        )}
      </div>
    </div>
  );
}
