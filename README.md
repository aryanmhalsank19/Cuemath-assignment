# Cuemath AI Tutor Screener

An AI-powered voice interview tool for screening tutor candidates. This Next.js application conducts a natural 10-minute voice conversation with candidates, evaluates their responses using Google Gemma AI, and provides a structured assessment report.

## Features

- **Voice Interview**: AI asks questions via browser TTS, candidate responds via speech
- **Real-time Transcription**: Web Speech API transcribes audio directly in the browser (free)
- **Adaptive Interviewing**: Google Gemma AI generates follow-up questions based on responses
- **5-Dimension Assessment**: Evaluates Communication Clarity, Simplification Ability, Patience & Empathy, Warmth, and English Fluency
- **Instant Results**: Candidates see results immediately after interview
- **Recruiter View**: Full structured report with scores, evidence quotes, and recommendations

## Tech Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **AI**: Google Gemini 1.5 Flash (interview & assessment)
- **Speech**: Web Speech API (free browser-native transcription)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI API key (free tier available at [Google AI Studio](https://makersuite.google.com/))
- Chrome or Edge browser (for Web Speech API support)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aryanmhalsank19/Cuemath-assignment.git
cd cuemath
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Google AI API key:
```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Getting a Google AI API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the top right
4. Create a new API key (free tier includes generous usage limits)
5. Copy the key and add it to your `.env.local` file

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with Chrome or Edge browser.

## Deployment

### Deploy to Vercel

1. Push to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/aryanmhalsank19/Cuemath-assignment.git
git push -u origin main
```

2. Connect to [Vercel](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variable in Vercel dashboard:
   - `GOOGLE_AI_API_KEY` - Your Google AI API key from Google AI Studio
5. Deploy

**Note**: The application uses file-based session storage (`.sessions.json`). For production, consider using a database like Redis or PostgreSQL for session persistence across multiple server instances.

## Project Structure

```
app/
├── page.tsx              # Landing page
├── interview/page.tsx    # Interview interface (dark theme)
├── results/[sessionId]/   # Results page
├── api/
│   ├── session/          # Create/get sessions
│   ├── transcribe/       # Disabled (uses client-side Web Speech API)
│   ├── respond/          # Gemma AI interviewer
│   └── assess/           # Final assessment via Gemma
components/
├── VoiceRecorder.tsx     # Web Speech API recording component
├── ConversationThread.tsx # Chat display
└── ScoreCard.tsx         # Score visualization
lib/
├── session.ts            # File-based session management
├── claude.ts             # Google Gemma AI wrapper
└── rubric.ts             # Assessment prompts & dimensions
store/
└── interview.ts          # Zustand state management
types/
└── index.ts              # TypeScript types
```

## How It Works

1. **Candidate lands** on welcome page, enters name, clicks "Start Interview"
2. **Session created** with unique ID stored in file-based storage
3. **AI Interview** begins:
   - AI speaks questions using Web Speech API (browser TTS)
   - Candidate responds via microphone
   - Web Speech API transcribes speech directly in the browser (free, no API needed)
   - Transcription sent to `/api/respond` (Gemma AI)
   - Gemma generates next question based on conversation
4. **Interview ends** after ~10 minutes or when candidate clicks "End Interview"
5. **Assessment** runs via `/api/assess` (Gemma evaluates against 5-dimension rubric)
6. **Results page** shows scores and recommendation

## Interview Flow

1. **Welcome** - Greeting and introduction
2. **Warm-up** - Teaching background
3. **Core Scenario** - Explain fractions to a 9-year-old
4. **Situation** - Handle a frustrated student
5. **Wrap-up** - Conclusion

## Assessment Dimensions

- **Communication Clarity** (1-5): Structure and coherence
- **Simplification Ability** (1-5): Breaking down complex concepts
- **Patience & Empathy** (1-5): Emotional intelligence
- **Warmth** (1-5): Approachability and enthusiasm
- **English Fluency** (1-5): Language proficiency

Recommendation: "Advance to next round" (avg ≥ 3.5) or "Hold for review" (avg < 3.5)

## Cost & Usage

- **Google Gemini 1.5 Flash**: Free tier includes generous usage limits. Check [Google AI pricing](https://ai.google.dev/pricing) for details.
- **Web Speech API**: Completely free, built into browsers
- **No additional costs** for transcription or voice features

## Troubleshooting

**"Failed to load session" error:**
- This happens if the server restarts (file-based sessions persist)
- Refresh the page and start a new interview
- Check that `.sessions.json` file exists and is readable

**"Microphone access denied" error:**
- Allow microphone permissions in your browser
- Use Chrome or Edge for best Web Speech API support
- Check your system's microphone settings

**"Failed to generate response" error:**
- Verify your `GOOGLE_AI_API_KEY` is set correctly
- Check the browser console for detailed error messages
- Ensure you have internet connectivity

## License

MIT
