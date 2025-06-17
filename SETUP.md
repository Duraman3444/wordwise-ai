# WordWise AI - Quick Setup Guide

This guide will help you set up the WordWise AI project quickly for MVP development.

## 🚀 Fast Track Setup (5 minutes)

### Step 1: Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Verify Firebase CLI installation
firebase --version
```

### Step 2: Project Setup
```bash
# Clone or navigate to your project directory
cd wordwise-ai

# Install all dependencies
npm install

# This should install all the packages from package.json
```

### Step 3: Environment Configuration
```bash
# Create environment file
touch .env.local

# Add the following to .env.local:
echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" >> .env.local
echo "VITE_FIREBASE_API_KEY=your_firebase_api_key" >> .env.local
echo "VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com" >> .env.local
echo "VITE_FIREBASE_PROJECT_ID=your_project_id" >> .env.local
echo "VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com" >> .env.local
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=123456789" >> .env.local
echo "VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456" >> .env.local
```

### Step 4: Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select the following services:
# ✅ Firestore: Configure security rules and indexes files
# ✅ Functions: Configure a Cloud Functions directory
# ✅ Hosting: Configure files for Firebase Hosting
# ✅ Emulators: Set up local emulator suite

# Use existing project and select your Firebase project
# Accept default settings or customize as needed
```

### Step 5: Start Development
```bash
# Start the development server
npm run dev

# In another terminal, start Firebase emulators
firebase emulators:start
```

## 🎯 MVP Development Priorities

### Day 1: Foundation
- [ ] Set up authentication (Login/Register)
- [ ] Create basic text editor
- [ ] Test OpenAI API integration
- [ ] Basic UI components

### Day 2: Core Features
- [ ] Real-time grammar checking
- [ ] Suggestion highlighting
- [ ] Basic AI analysis
- [ ] Document saving

### Day 3: Enhancement
- [ ] Vocabulary suggestions
- [ ] Educational explanations
- [ ] Progress tracking
- [ ] Polish UI/UX

## 🔧 Common Issues & Solutions

### Issue: OpenAI API Key Not Working
**Solution:**
1. Verify your API key is valid
2. Check if you have sufficient credits
3. Ensure the key is properly set in `.env.local`
4. Restart the development server

### Issue: Firebase Connection Failed
**Solution:**
1. Check your Firebase project configuration
2. Verify all environment variables are set
3. Ensure Firebase project is active
4. Try `firebase login` and re-authenticate

### Issue: Build Errors
**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check for TypeScript errors with `npm run lint`
4. Verify all imports are correct

## 📦 Key Dependencies

### Core Dependencies (Already in package.json)
- `react` - UI framework
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - Styling
- `zustand` - State management
- `firebase` - Backend services
- `openai` - AI integration

### Development Dependencies
- `@types/*` - TypeScript types
- `eslint` - Code linting
- `vitest` - Testing framework

## 🎨 UI Development Tips

### Color Scheme (from tailwind.config.js)
- Primary: Blue (`primary-500`)
- Accent: Yellow (`accent-500`)
- Error: Red (`error-500`)
- Success: Green (`success-500`)

### Component Structure
```
components/
├── ui/           # Basic components (Button, Input, Card)
├── layout/       # Layout components (Header, Sidebar)
├── editor/       # Text editor components
├── suggestions/  # Suggestion display components
└── auth/         # Authentication components
```

## 🚢 Deployment Checklist

### Before Deployment
- [ ] All environment variables set
- [ ] Build completes without errors
- [ ] All features tested locally
- [ ] Firebase rules configured
- [ ] Performance optimized

### Deployment Commands
```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting
```

## 📱 Testing Strategy

### Local Testing
1. Use Firebase emulators for backend
2. Test with various text samples
3. Verify AI suggestions quality
4. Check mobile responsiveness

### AI Testing Samples
Use these texts to test AI functionality:
- Simple grammar errors
- Complex sentence structures
- Academic vs casual tone
- ESL common mistakes

## 🎯 MVP Success Criteria

- [ ] User can register and login
- [ ] Text editor works smoothly
- [ ] Grammar checking provides suggestions
- [ ] Vocabulary enhancement works
- [ ] Educational explanations appear
- [ ] Basic progress tracking
- [ ] Responsive design
- [ ] Fast performance (< 2s suggestions)

## 📞 Need Help?

1. Check the main [README.md](README.md) for detailed documentation
2. Review [MVP_PLAN.md](MVP_PLAN.md) for development strategy
3. Look at the code structure and comments
4. Test with Firebase emulators first
5. Use console.log for debugging AI responses

---

**🎉 Ready to build the future of writing assistance!**

*Follow this guide step by step, and you'll have a working MVP in no time.* 