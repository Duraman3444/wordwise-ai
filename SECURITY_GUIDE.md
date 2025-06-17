# WordWise AI - Security Guide

## 🚨 CRITICAL SECURITY ISSUES FOUND

### Environment Variables Exposure
- **OpenAI API Key**: ❌ WAS EXPOSED (now fixed)
- **Firebase API Key**: ✅ Safe to expose (protected by Firebase security rules)

## 🔒 Security Best Practices

### 1. Environment Variables Rules

#### ✅ SAFE to expose with `VITE_` prefix:
- `VITE_FIREBASE_API_KEY` - Firebase keys are safe for client-side
- `VITE_FIREBASE_PROJECT_ID` - Public project identifiers
- `VITE_FIREBASE_AUTH_DOMAIN` - Public domain names
- `VITE_APP_VERSION` - Public version info

#### ❌ NEVER expose with `VITE_` prefix:
- `OPENAI_API_KEY` - Server-side only
- `STRIPE_SECRET_KEY` - Server-side only
- `DATABASE_PASSWORD` - Server-side only
- Any API keys that charge per usage

### 2. Backend Implementation Required

#### Create Secure API Endpoint
```typescript
// backend/api/analyze-text.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only
});

export async function analyzeText(text: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an ESL writing assistant...' },
      { role: 'user', content: text }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });
  
  return response.choices[0]?.message?.content;
}
```

#### Update Client to Use Backend
```typescript
// client/services/ai.ts
export async function analyzeText(text: string): Promise<Suggestion[]> {
  const response = await fetch('/api/analyze-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) throw new Error('Analysis failed');
  return response.json();
}
```

### 3. Firebase Security (Already Secure)

Firebase API keys are **safe** to expose because:
- They identify your project, not authenticate it
- Security is enforced by Firestore security rules
- Client-side keys are designed to be public

#### Ensure Firestore Rules are Secure
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Documents require authentication
    match /documents/{documentId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Deployment Security Checklist

#### ✅ Pre-deployment:
- [ ] No `VITE_OPENAI_API_KEY` in environment files
- [ ] OpenAI calls moved to backend/serverless functions
- [ ] Firebase security rules tested and deployed
- [ ] No secrets in git history
- [ ] `.env` files in `.gitignore`

#### ✅ Environment Setup:
```bash
# .env.local (for development)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_PROJECT_ID=your_project
# DO NOT ADD: VITE_OPENAI_API_KEY=xxx

# .env.server (backend only - never commit)
OPENAI_API_KEY=sk-your-secret-key
```

### 5. Implementation Roadmap

#### Phase 1: Immediate (DONE)
- [x] Remove OpenAI key from client
- [x] Update environment types
- [x] Add security warnings

#### Phase 2: Backend Setup (TODO)
- [ ] Create serverless function for AI analysis
- [ ] Deploy to Vercel/Netlify Functions
- [ ] Update client to use backend endpoint
- [ ] Test end-to-end functionality

#### Phase 3: Enhanced Security (TODO)
- [ ] Rate limiting on AI endpoints
- [ ] User authentication for AI features
- [ ] Request validation and sanitization
- [ ] Error handling without info leakage

### 6. Monitoring & Alerts

#### Set up monitoring for:
- Unusual API usage patterns
- Failed authentication attempts
- Client-side error rates
- Backend response times

## 🛡️ Security Resources

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OpenAI API Security Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular audits and updates are essential. 