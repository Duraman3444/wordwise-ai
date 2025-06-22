# WordWise AI - AI-Powered Writing Assistant

![WordWise AI Banner](https://via.placeholder.com/800x200/0ea5e9/ffffff?text=WordWise+AI+-+Write+with+Confidence.+Edit+with+Intelligence.)

**Write with confidence. Edit with intelligence.**

WordWise AI is a next-generation writing assistant built specifically for ESL (English as Second Language) students. Unlike traditional grammar checkers, WordWise AI provides intelligent, contextual guidance with educational explanations that help students learn English patterns while writing.

## 🎯 Project Overview

This is a 7-day MVP development project that builds a Grammarly clone enhanced with cutting-edge AI features, specifically tailored for ESL students writing academic content.

### Target User: ESL Students
- International students in university-level English composition courses
- Focus on academic essay and assignment writing
- Need grammar corrections with educational explanations
- Require vocabulary enhancement and clarity improvements

## ✨ Key Features

### Core MVP Features
- 🤖 **ChatGPT-Powered Grammar Checking** - Advanced AI analysis using OpenAI's GPT models with educational explanations
- 🎯 **Vocabulary Enhancement** - Context-appropriate vocabulary suggestions for academic writing
- 🔍 **Clarity Improvements** - Sentence structure analysis and rewriting suggestions
- 🎨 **Academic Tone Guidance** - Formality detection and professional tone suggestions
- 📊 **Progress Tracking** - Writing improvement analytics and performance metrics
- 🧠 **Educational Feedback** - Detailed explanations to help students learn
- ⚡ **Hybrid Analysis** - Combines ChatGPT intelligence with local grammar rules for comprehensive coverage

### AI-Powered Capabilities
- **Context-Aware Analysis** - Understands document type and user intent
- **Personalized Suggestions** - Adapts to individual writing style and level
- **Educational Explanations** - Grammar rules and writing tips for ESL learners
- **Academic Focus** - Specialized for university-level academic writing

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Zustand** for lightweight state management
- **React Router** for client-side navigation
- **Framer Motion** for smooth animations

### Backend & AI
- **OpenAI GPT-4** for advanced text analysis
- **Firebase Auth** for user authentication
- **Firestore** for real-time data storage
- **Firebase Functions** for serverless AI processing
- **Firebase Hosting** for deployment

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Vitest** for testing
- **Firebase Emulator** for local development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`
- OpenAI API key
- Firebase project set up

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wordwise-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file with your API keys
   echo "VITE_OPENAI_API_KEY=sk-your-openai-api-key-here" > .env.local
   echo "VITE_FIREBASE_API_KEY=your_firebase_api_key" >> .env.local
   # ... add other Firebase config values
   ```
   
   **🔑 Get OpenAI API Key** (for enhanced grammar checking):
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create account and generate API key
   - Add to `.env.local` file
   - **Note**: App works with local rules if no API key provided

4. **Initialize Firebase**
   ```bash
   firebase login
   firebase init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Start Firebase emulators** (in another terminal)
   ```bash
   firebase emulators:start
   ```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
wordwise-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── editor/         # Text editor components
│   │   ├── layout/         # Layout components
│   │   ├── suggestions/    # Suggestion display components
│   │   └── ui/             # Basic UI components
│   ├── pages/              # Page components
│   │   ├── auth/           # Login/Register pages
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Editor.tsx      # Writing editor
│   │   ├── Landing.tsx     # Landing page
│   │   └── Profile.tsx     # User profile
│   ├── store/              # Zustand state management
│   │   ├── authStore.ts    # Authentication state
│   │   └── documentStore.ts # Document and suggestions state
│   ├── services/           # API and external services
│   │   ├── ai.ts          # OpenAI integration
│   │   ├── firebase.ts    # Firebase services
│   │   └── analytics.ts   # Analytics tracking
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── config/             # Configuration files
│   ├── main.tsx           # Application entry point
│   └── App.tsx            # Main App component
├── public/                 # Static assets
├── functions/              # Firebase Cloud Functions
├── docs/                   # Project documentation
│   ├── ARCHITECTURE.md     # System architecture and design
│   ├── WIREFRAMES.md       # UI wireframes and user flows
│   └── TOOL_JUSTIFICATION.md # Technology stack decisions
├── MVP_PLAN.md            # Detailed MVP development plan
├── PRD.md                 # Product Requirements Document
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
└── package.json           # Dependencies and scripts
```

## 📖 Documentation

### Core Documentation
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design, data flow, and technical architecture
- **[UI Wireframes](docs/WIREFRAMES.md)** - Interface mockups and user interaction flows  
- **[Technology Decisions](docs/TOOL_JUSTIFICATION.md)** - Detailed rationale for technology stack choices
- **[Cost Analysis](docs/COST_ANALYSIS.md)** - Business model, pricing, and break-even analysis
- **[User Guide](docs/USER_GUIDE.md)** - Complete guide for students and educators
- **[Product Requirements](PRD.md)** - Comprehensive product specification and business strategy
- **[MVP Development Plan](MVP_PLAN.md)** - 7-day development roadmap and implementation details

### Quick Links
- **[Setup Guide](SETUP.md)** - Step-by-step development environment setup
- **[Firebase Setup](FIREBASE_SETUP.md)** - Backend configuration and deployment
- **[Security Guide](SECURITY_GUIDE.md)** - Security best practices and API key management

## 🎯 MVP User Stories

### High Priority Features

#### 1. Real-time Grammar Checking ⭐
*As an ESL student, I want grammar corrections with explanations so I can learn English patterns while writing.*

- Detect grammar errors in real-time
- Provide educational explanations
- Track improvement over time

#### 2. Vocabulary Enhancement ⭐
*As an ESL student, I want vocabulary suggestions to use more advanced words appropriately.*

- Context-aware vocabulary suggestions
- Academic word alternatives
- Explain word choice nuances

#### 3. Clarity Improvements ⭐
*As an ESL student, I want clarity suggestions to make my ideas easier to understand.*

- Identify unclear sentences
- Suggest structural improvements
- Maintain original meaning while improving clarity

### Medium Priority Features

#### 4. Academic Tone Guidance 📊
*As an ESL student, I want tone suggestions to ensure my writing is appropriately formal for academic contexts.*

#### 5. Progress Tracking 📈
*As an ESL student, I want to track my writing improvements over time to see my progress.*

#### 6. Educational Feedback 📚
*As an ESL student, I want detailed explanations for corrections so I can learn and avoid similar mistakes.*

## 🛠️ Development Guide

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run deploy       # Deploy to Firebase
```

### Development Workflow

1. **Feature Development**
   - Create feature branch: `git checkout -b feature/feature-name`
   - Implement feature following the user stories
   - Test locally with Firebase emulators
   - Submit pull request for review

2. **Testing Strategy**
   - Unit tests for utility functions
   - Integration tests for AI services
   - Manual testing for UI/UX
   - Performance testing for real-time features

3. **Code Quality**
   - TypeScript for type safety
   - ESLint for code consistency
   - Prettier for code formatting
   - Git hooks for pre-commit checks

### Key Development Milestones

#### Day 1-3: Core Foundation
- ✅ Project setup and authentication
- ✅ Text editor with real-time processing
- ✅ Basic grammar checking

#### Day 4-7: AI Enhancement
- ✅ Advanced AI analysis features
- ✅ Progress tracking and analytics
- ✅ Polish and deployment

## 🚢 Deployment

### Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Alternative: Vercel/Netlify

1. **Connect your Git repository**
2. **Set environment variables in dashboard**
3. **Deploy automatically on push to main**

## 📊 Success Metrics

### Core Functionality
- ✅ 85%+ grammar correction accuracy
- ✅ Sub-2 second response time
- ✅ Seamless typing experience
- ✅ All 6 user stories functional

### AI Quality
- ✅ 80%+ suggestion acceptance rate
- ✅ Context-appropriate suggestions
- ✅ Clear educational explanations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Firebase for backend services
- The open-source community for amazing tools
- ESL students who inspired this project

## 📞 Support

If you have any questions or need help with setup:

1. Check the [MVP_PLAN.md](MVP_PLAN.md) for detailed implementation guide
2. Review the GitHub Issues for common problems
3. Create a new issue if you encounter bugs

---

**Built with ❤️ for ESL students worldwide**

*WordWise AI - Making academic writing accessible, one suggestion at a time.*