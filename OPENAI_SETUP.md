# OpenAI Setup for Enhanced Grammar Checking

WordWise AI now supports **ChatGPT-powered grammar suggestions** for much more accurate and comprehensive grammar checking!

## 🚀 Quick Setup

1. **Get an OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key (starts with `sk-`)

2. **Add to Your Environment**
   Create a `.env.local` file in the project root:
   ```bash
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## ✨ What You Get

### Without OpenAI API Key (Local Rules Only):
- Basic grammar checking
- Spelling corrections
- Simple punctuation fixes
- Limited suggestions

### With OpenAI API Key (Enhanced):
- **ChatGPT-powered analysis**
- Advanced grammar detection
- Context-aware suggestions
- Complex sentence structure improvements
- Nuanced style recommendations
- Much more accurate corrections

## 🔒 Security Notes

- **Never commit your API key** to version control
- The `.env.local` file is already in `.gitignore`
- API keys are kept secure in your local environment
- In production, use a backend proxy for API calls

## 💡 Cost Information

- OpenAI API usage is pay-per-use
- Grammar checking typically costs $0.001-0.002 per analysis
- Very affordable for personal use
- Consider setting usage limits in OpenAI dashboard

## 🛠 Troubleshooting

If you see "Using local grammar rules only" in the console:
1. Check your API key starts with `sk-`
2. Ensure `.env.local` is in the project root
3. Restart the development server
4. Check browser console for error messages

## Example .env.local File

```bash
# OpenAI API Key for enhanced grammar checking
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Firebase config (already set up for demo)
VITE_FIREBASE_API_KEY=your-firebase-key
```

---

**Note**: The application works perfectly without an OpenAI API key using local grammar rules. Adding the API key just provides enhanced AI-powered suggestions! 