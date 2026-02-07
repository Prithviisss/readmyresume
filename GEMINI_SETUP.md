# Google Gemini API Setup Guide

This guide will help you configure the AI Resume Analyzer to use Google's Gemini API for resume analysis.

## Why Google Gemini?

✅ **Free tier** - 60 requests per minute at no cost  
✅ **Easy setup** - No account approval delays  
✅ **Fast** - Quick resume analysis  
✅ **Reliable** - Google's infrastructure  

## Setup Steps

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select your existing project or create a new one
4. Copy the generated API key (looks like: `AIzaSy...`)

### Step 2: Add API Key to Your Project

1. Create a `.env` file in the project root (same directory as `package.json`):
   ```
   VITE_GEMINI_API_KEY=AIzaSy_YOUR_API_KEY_HERE
   ```

2. Replace `AIzaSy_YOUR_API_KEY_HERE` with your actual API key

3. **Important:** Never commit this file to git. Add to `.gitignore` if not already there.

### Step 3: Restart Development Server

```bash
npm run dev
```

The upload page will show a ✅ green checkmark when the API key is properly configured.

## How It Works

1. **Upload Resume** - Select a PDF resume from your computer
2. **Enter Job Details** - Provide company name, job title, and job description
3. **Analyze** - Click "Analyze Resume" to send to Gemini API
4. **Results** - Get ATS score, skills analysis, and improvement recommendations

## Testing Without API Key

If you don't have a Gemini API key yet, you can:

1. Click **"Try with Sample Data"** button on the upload page
2. This generates test feedback without needing an API key
3. Explore the full interface and results

## API Rate Limits

- **Free Tier:** 60 requests per minute
- If you exceed this, you'll get a 429 error - just wait a moment and retry
- For higher volume, upgrade to a paid plan in Google Cloud Console

## Troubleshooting

### "API Key not configured"
- ✅ Make sure `.env` file is in the project root
- ✅ Check key format: should start with `AIzaSy`
- ✅ Restart dev server after adding key (`npm run dev`)

### "Invalid API Key"
- Go back to [Google AI Studio](https://aistudio.google.com/app/apikey) and regenerate the key
- Copy the new key exactly
- Update `.env` file and restart dev server

### "Rate limit exceeded"
- You've made more than 60 requests in the last minute
- Wait a minute and try again
- Consider upgrading to a paid plan for higher limits

### "No analysis text received"
- The API returned an empty response
- Try a different resume
- Check console logs for more details

## Advanced Options

### Using Different Gemini Models

Current implementation uses **`gemini-1.5-flash`** (fastest, free tier).

To use a different model, edit `app/lib/gemini.ts`:
```typescript
// Line ~32, update the model name
`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=...`
```

Available models:
- `gemini-1.5-flash` - Fast, free tier (default)
- `gemini-1.5-pro` - More accurate, requires paid plan

### Running Locally Without Internet

If you want to use AI locally without API calls, consider:
- **Ollama** - Run LLMs locally
- **LM Studio** - Desktop AI
- **LocalAI** - Self-hosted

See the main README for alternatives.

## File Changes Made

- ✅ Created `app/lib/gemini.ts` - Gemini API integration
- ✅ Updated `app/routes/upload.tsx` - Uses Gemini instead of Anthropic
- ✅ Created `.env.local` - Configuration file with Gemini key placeholder
- ✅ Updated `.env.example` - Reference example for team members

## Next Steps

1. Create Google API key
2. Add key to `.env` file
3. Run `npm run dev`
4. Upload a resume and test!

For questions or issues, check the browser console (F12) for detailed error messages.
