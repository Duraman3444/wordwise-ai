import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { 
  PenTool, 
  Brain, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Users,
  CheckCircle,
  Zap
} from 'lucide-react'

export const Landing: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
              Write with <span className="text-blue-600 dark:text-blue-400">Confidence</span>.
              <br />
              Edit with <span className="text-blue-600 dark:text-blue-400">Intelligence</span>.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors">
              WordWise AI is designed specifically for ESL students. Get grammar corrections 
              with educational explanations, vocabulary enhancement, and writing guidance 
              that helps you learn English patterns while you write.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Writing Better Today
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/login')}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Already have an account?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Built Specifically for ESL Students
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
              Unlike generic grammar checkers, WordWise AI understands your learning journey 
              and provides educational feedback to improve your English writing skills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Real-time Grammar Checking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                AI-powered grammar analysis with educational explanations 
                tailored for ESL learners. Learn English patterns while you write.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <BookOpen className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Vocabulary Enhancement
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Context-appropriate vocabulary suggestions for academic writing. 
                Expand your word choice with explanations of nuances.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Clarity Improvements
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Make your ideas clearer and easier to understand. Get structural 
                improvements while maintaining your original meaning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Academic Tone Guidance
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Ensure your writing is appropriately formal for academic contexts. 
                Learn the difference between casual and professional language.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Track your writing improvements over time. See your progress 
                and identify areas for continued learning.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                Educational Feedback
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">
                Detailed explanations for every correction. Learn grammar rules 
                and writing tips to avoid similar mistakes in the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
                Why ESL Students Choose WordWise AI
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">Educational Focus</h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Every suggestion comes with an explanation to help you learn, 
                      not just fix errors.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">Academic Writing Specialized</h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Designed for university-level academic writing with proper 
                      tone and formality guidance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">Context-Aware AI</h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Advanced AI understands your intent and provides relevant, 
                      personalized suggestions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">Real-time Learning</h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">
                      Learn as you write with instant feedback and educational 
                      explanations for continuous improvement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="text-center">
                <PenTool className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                  Ready to improve your writing?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">
                  Join thousands of ESL students who are already writing with confidence.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 