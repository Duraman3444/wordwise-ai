import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { InteractiveAIDemo } from '@/components/ui/InteractiveAIDemo'
import { 
  PenTool, 
  Brain, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Users,
  CheckCircle,
  Zap,
  Sparkles
} from 'lucide-react'

export const Landing: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 py-20 transition-colors">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* AI Branding Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Brain className="h-5 w-5 text-white mr-2" />
              <span className="text-white font-medium">Powered by GPT-4 AI Technology</span>
              <Sparkles className="h-4 w-4 text-white ml-2" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Write with <span className="text-yellow-300">AI-Powered</span> Confidence.
              <br />
              Learn with <span className="text-yellow-300">Intelligent</span> Feedback.
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              WordWise AI combines advanced GPT-4 technology with ESL-focused learning. 
              Get real-time grammar corrections, vocabulary enhancement, and academic tone guidance 
              that helps you master English writing patterns.
            </p>
            
            {/* AI Features Highlight */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
                <Zap className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-white text-sm font-medium">Real-time AI Analysis</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
                <Brain className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-white text-sm font-medium">Smart Grammar Checking</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
                <BookOpen className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-white text-sm font-medium">Academic Vocabulary AI</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Brain className="h-5 w-5 mr-2" />
                Start AI-Powered Writing
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/demo')}
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try AI Demo - No Signup
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/login')}
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-4 py-2 mb-4">
              <Brain className="h-4 w-4 mr-2" />
              <span className="font-medium">AI-Powered Features</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Advanced AI Technology Built for ESL Students
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
              Our GPT-4 powered writing assistant understands your learning journey 
              and provides intelligent, educational feedback to accelerate your English mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                AI Grammar Analysis
              </h3>
              <div className="inline-flex items-center bg-blue-600 text-white rounded-full px-2 py-1 text-xs font-medium mb-3">
                <Sparkles className="h-3 w-3 mr-1" />
                GPT-4 Powered
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Advanced AI detects complex grammar patterns, verb tenses, and subject-verb agreement 
                with educational explanations tailored for ESL learners.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Smart Vocabulary AI
              </h3>
              <div className="inline-flex items-center bg-yellow-600 text-white rounded-full px-2 py-1 text-xs font-medium mb-3">
                <Brain className="h-3 w-3 mr-1" />
                Context-Aware
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                AI-powered context analysis suggests sophisticated academic vocabulary 
                and explains word nuances for precise expression.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                AI Clarity Enhancement
              </h3>
              <div className="inline-flex items-center bg-green-600 text-white rounded-full px-2 py-1 text-xs font-medium mb-3">
                <Zap className="h-3 w-3 mr-1" />
                Real-time
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Intelligent restructuring suggestions make your ideas clearer 
                while preserving your original meaning and voice.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Academic Tone AI
              </h3>
              <div className="inline-flex items-center bg-purple-600 text-white rounded-full px-2 py-1 text-xs font-medium mb-3">
                <Brain className="h-3 w-3 mr-1" />
                AI-Guided
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Advanced AI ensures appropriate formality for academic contexts 
                and teaches professional language patterns.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                AI Progress Tracking
              </h3>
              <div className="inline-flex items-center bg-indigo-600 text-white rounded-full px-2 py-1 text-xs font-medium mb-3">
                <Sparkles className="h-3 w-3 mr-1" />
                Smart Analytics
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                AI analyzes your writing patterns over time and identifies 
                areas for improvement with personalized insights.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Educational AI Feedback
              </h3>
              <div className="inline-flex items-center bg-red-600 text-white rounded-full px-2 py-1 text-xs font-medium mb-3">
                <Brain className="h-3 w-3 mr-1" />
                Learning-Focused
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Every AI suggestion includes detailed explanations and grammar rules 
                to accelerate your English learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Demo Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-6 py-3 mb-6 shadow-lg">
              <Brain className="h-5 w-5 mr-2" />
              <span className="font-semibold">Live AI Demo</span>
              <Sparkles className="h-4 w-4 ml-2" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              See AI Writing Enhancement in Action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors">
              Watch our GPT-4 powered AI analyze text and provide intelligent suggestions in real-time. 
              Experience the power of AI-enhanced writing assistance before you start.
            </p>
          </div>
          
          <InteractiveAIDemo />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="font-medium">Why Choose AI-Powered Learning</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
                Why ESL Students Choose WordWise AI
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">
                      <Brain className="h-4 w-4 inline mr-2 text-purple-600" />
                      AI-Powered Educational Focus
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Every AI suggestion includes detailed explanations and learning opportunities, 
                      not just error corrections.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">
                      <Zap className="h-4 w-4 inline mr-2 text-blue-600" />
                      Academic Writing AI Specialist
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      GPT-4 technology specifically trained for university-level academic writing 
                      with proper tone and formality guidance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">
                      <Sparkles className="h-4 w-4 inline mr-2 text-yellow-600" />
                      Context-Aware AI Intelligence
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Advanced AI understands your writing intent and provides relevant, 
                      personalized suggestions based on context.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">
                      <TrendingUp className="h-4 w-4 inline mr-2 text-green-600" />
                      Real-time AI Learning
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Learn as you write with instant AI feedback and educational 
                      explanations for continuous improvement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-600 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                  Ready to experience AI-powered writing?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">
                  Join thousands of ESL students who are already mastering English with our intelligent AI assistant.
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                    onClick={() => navigate('/register')}
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Start AI-Powered Learning Free
                  </Button>
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>Powered by GPT-4 • No Credit Card Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 