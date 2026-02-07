# 🚀 Anthropic Claude Setup Guide

Your AI Resume Analyzer is now configured to use **Anthropic Claude** for analysis instead of Puter.js!

## **Quick Setup (3 steps)**

### **Step 1: Get Anthropic API Key**
1. Go to https://console.anthropic.com
2. Sign up for a **free account**
3. Navigate to **API Keys** section
4. Click **Create New Key**
5. Copy your API key (starts with `sk-ant-v1-`)

### **Step 2: Add API Key to Project**
1. Open `.env.local` in the project root
2. Replace:
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   ```
   with:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxx
   ```
3. **Do NOT commit this file to git!** (it's in .gitignore)

### **Step 3: Restart Development Server**
```bash
npm run dev
```

---

## **How to Use**

1. **Upload a resume** (PDF format)
2. **Enter job details** (company, title, job description)
3. **Click "Analyze Resume"**
4. Wait 30-60 seconds for Claude to analyze
5. **Get detailed feedback** with ATS score and recommendations

---

## **Troubleshooting**

### ❌ "API key not configured"
- Check `.env.local` exists in project root
- Verify `VITE_ANTHROPIC_API_KEY` has your actual key
- Restart dev server after adding the key

### ❌ "API Error 401 Unauthorized"
- Your API key is invalid or expired
- Go back to https://console.anthropic.com and get a new key
- Make sure you copied the full key (includes `sk-ant-v1-` prefix)

### ❌ "Analysis took too long"
- Anthropic service might be slow (happens rarely)
- Click "Retry" to try again
- Or click "Skip & Proceed" to see resume without analysis

### ❌ "Failed to extract text from PDF"
- Your PDF might be image-based or scanned
- PDFs must contain selectable text
- Try converting to a searchable PDF first

---

## **Features**

✅ **No Puter.js needed** - Works completely offline except for AI calls
✅ **Data stored locally** - All resumes saved in browser localStorage  
✅ **Fast analysis** - Claude 3.5 Sonnet is excellent for resume analysis
✅ **Free tier available** - Anthropic offers free trial credits
✅ **Sample mode** - Click "Try with Sample Data" to test without API key

---

## **API Costs**

Anthropic Claude 3.5 Sonnet pricing:
- **Input:** $3 per 1M tokens
- **Output:** $15 per 1M tokens
- **Typical resume:** ~500 tokens input, ~2000 tokens output
- **Estimated cost per analysis:** ~$0.035 (less than 1 cent!)

---

## **Files Changed**

- `app/routes/upload.tsx` - Now uses Anthropic + localStorage
- `app/routes/resume.tsx` - Reads from localStorage instead of Puter
- `app/lib/anthropic.ts` - New Anthropic API integration
- `.env.local` - Your API key (keep private!)

---

## **Questions?**

- Check browser console (F12) for detailed error logs
- API logs are stored in localStorage under "debugLogs"
- Run in console: `JSON.parse(localStorage.getItem('debugLogs')).forEach(log => console.log(log))`

Happy analyzing! 🎉
