import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { firestoreService, CloudDocument } from '@/services/firestore'
import { 
  PenTool, 
  FileText, 
  TrendingUp, 
  Target, 
  Plus,
  Clock,
  Edit,
  Calendar,
  BookOpen,
  Award,
  Brain,
  Zap,
  Sparkles,
  BarChart3
} from 'lucide-react'

interface LocalDocument {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  wordCount: number
  characterCount: number
}

interface DashboardStats {
  totalDocuments: number
  totalWords: number
  recentDocuments: number
  averageWordsPerDocument: number
  totalReadingTime: number
  documentsThisWeek: number
  mostProductiveDay: string
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<(CloudDocument | LocalDocument)[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalWords: 0,
    recentDocuments: 0,
    averageWordsPerDocument: 0,
    totalReadingTime: 0,
    documentsThisWeek: 0,
    mostProductiveDay: 'Monday'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentDocuments, setRecentDocuments] = useState<(CloudDocument | LocalDocument)[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadLocalDocuments = (): LocalDocument[] => {
    try {
      const saved = localStorage.getItem('wordwise-documents')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Error loading local documents:', error)
    }
    return []
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      let userDocs: (CloudDocument | LocalDocument)[] = []
      
      if (user) {
        // Load from Firestore if authenticated
        userDocs = await firestoreService.getUserDocuments(user.id)
      } else {
        // Load from localStorage if not authenticated
        userDocs = loadLocalDocuments()
      }
      
      setDocuments(userDocs)
      
      // Calculate statistics
      const now = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const recentDocs = userDocs.filter(doc => doc.updatedAt > weekAgo)
      const totalWords = userDocs.reduce((total, doc) => total + (doc.wordCount || 0), 0)
      const totalReadingTime = Math.ceil(totalWords / 200) // Assuming 200 words per minute reading speed
      
      // Get most recent 3 documents for display
      const recent = userDocs
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 3)
      
      setRecentDocuments(recent)
      
      // If no documents exist, show encouraging demo stats
      if (userDocs.length === 0) {
        setStats({
          totalDocuments: 0,
          totalWords: 0,
          recentDocuments: 0,
          averageWordsPerDocument: 0,
          totalReadingTime: 0,
          documentsThisWeek: 0,
          mostProductiveDay: 'Ready to start'
        })
      } else {
        setStats({
          totalDocuments: userDocs.length,
          totalWords,
          recentDocuments: recentDocs.length,
          averageWordsPerDocument: userDocs.length > 0 ? Math.round(totalWords / userDocs.length) : 0,
          totalReadingTime,
          documentsThisWeek: recentDocs.length,
          mostProductiveDay: getMostProductiveDay(userDocs)
        })
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMostProductiveDay = (docs: (CloudDocument | LocalDocument)[]): string => {
    if (docs.length === 0) return 'Ready to start'
    
    const dayCount = docs.reduce((acc, doc) => {
      const day = doc.createdAt.toLocaleDateString('en-US', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + (doc.wordCount || 0)
      return acc
    }, {} as Record<string, number>)
    
    const mostProductive = Object.entries(dayCount).reduce((max, [day, count]) => 
      count > max.count ? { day, count } : max, { day: 'Monday', count: 0 }
    )
    
    return mostProductive.day
  }

  const createSampleDocument = () => {
    const sampleDoc: LocalDocument = {
      id: `local-sample-${Date.now()}`,
      title: 'My First AI-Assisted Essay',
      content: `Welcome to WordWise AI! This is a sample document to demonstrate our powerful AI writing features.

The AI-powered grammar checker will help you identify and correct common ESL writing mistakes. For example, it can detect verb tense inconsistencies, subject-verb agreement errors, and suggest more academic vocabulary.

Our intelligent system analyzes your writing style and provides suggestions to improve clarity, coherence, and academic tone. Whether you're writing essays, research papers, or professional documents, WordWise AI adapts to your needs.

Try writing your own content and watch as the AI provides real-time feedback to enhance your writing skills!`,
      createdAt: new Date(),
      updatedAt: new Date(),
      wordCount: 95,
      characterCount: 580
    }

    // Save to localStorage
    const existingDocs = loadLocalDocuments()
    const updatedDocs = [...existingDocs, sampleDoc]
    localStorage.setItem('wordwise-documents', JSON.stringify(updatedDocs))
    
    // Reload dashboard data
    loadDashboardData()
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
  }

  const openDocument = (doc: CloudDocument | LocalDocument) => {
    navigate(`/editor?id=${doc.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name || 'Writer'}!
          </h1>
          <p className="text-gray-300 mt-2">
            Ready to improve your writing? Let's get started with your next document.
          </p>
        </div>

        {/* AI Branding Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI-Powered Writing Assistant</h2>
                <p className="text-purple-100 text-sm mb-2">Transform your writing with advanced AI technology</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/20 px-2 py-1 rounded-full">✨ GPT-4 Powered</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">⚡ Real-time Grammar</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">🎓 Academic Tone</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">🌍 ESL Focused</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Smart Analysis</span>
              </div>
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Instant Feedback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full -ml-10 -mb-10"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    Start Writing with AI
                  </h3>
                  <div className="flex items-center text-purple-400 text-xs mt-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span className="font-medium">GPT-4 Powered</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                Create a new document and experience the power of AI-driven writing assistance. Get real-time grammar corrections, style improvements, and academic tone suggestions as you write.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg transform transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/editor')}
              >
                <Brain className="h-4 w-4 mr-2" />
                Start AI-Assisted Writing
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-4">
                Recent Documents
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Continue working on your saved documents and track your progress.
            </p>
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => navigate('/documents')}
            >
              View All Documents
            </Button>
          </div>
        </div>

        {/* Writing Progress */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-2 text-gray-300">Loading your progress...</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Documents</p>
                    <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
                    {stats.totalDocuments === 0 && (
                      <p className="text-xs text-blue-400 mt-1">Start your first document!</p>
                    )}
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Words Written</p>
                    <p className="text-2xl font-bold text-white">{stats.totalWords.toLocaleString()}</p>
                    {stats.totalWords === 0 && (
                      <p className="text-xs text-green-400 mt-1">Ready to write!</p>
                    )}
                  </div>
                  <Edit className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Recent Activity</p>
                    <p className="text-2xl font-bold text-white">{stats.recentDocuments}</p>
                    {stats.recentDocuments === 0 && (
                      <p className="text-xs text-purple-400 mt-1">Let's get started!</p>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Reading Time</p>
                    <p className="text-2xl font-bold text-white">{stats.totalReadingTime}m</p>
                    {stats.totalReadingTime === 0 && (
                      <p className="text-xs text-orange-400 mt-1">Time to create!</p>
                    )}
                  </div>
                  <Clock className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* No Documents State - Sample Data Option */}
            {documents.length === 0 && (
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-700/50 p-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Experience AI-Powered Writing?</h3>
                  <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
                    Get started with a sample document to see how our AI writing assistant works, or jump right in and create your first document!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={createSampleDocument}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Try Sample Document
                    </Button>
                    <Button 
                      onClick={() => navigate('/editor')}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Document
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Documents */}
            {recentDocuments.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">Recent Documents</h2>
                  <p className="text-sm text-gray-400">Continue where you left off</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => openDocument(doc)}>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{doc.title}</h3>
                          <p className="text-sm text-gray-300 mt-1">
                            {doc.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>{doc.wordCount || 0} words</span>
                            <span>Updated {formatTimestamp(doc.updatedAt)}</span>
                            {doc.id.startsWith('local-') && <span className="text-yellow-400">(Local)</span>}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button variant="outline" size="sm" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {documents.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => navigate('/documents')} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                        View All {documents.length} Documents
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Writing Insights */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Writing Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average words per document:</span>
                    <span className="font-semibold text-white">{stats.averageWordsPerDocument}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Documents this week:</span>
                    <span className="font-semibold text-white">{stats.documentsThisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Most productive day:</span>
                    <span className="font-semibold text-white">{stats.mostProductiveDay}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Quick Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total reading time:</span>
                    <span className="font-semibold text-white">{stats.totalReadingTime} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage used:</span>
                    <span className="font-semibold text-white">{user ? 'Cloud' : 'Local'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account type:</span>
                    <span className="font-semibold text-white">{user ? 'Authenticated' : 'Guest'}</span>
                  </div>
                </div>
              </div>

              {/* NEW: AI Analytics Preview Card */}
              <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-lg shadow-lg border border-indigo-600/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-white">AI Analytics</h3>
                      <div className="flex items-center text-indigo-400 text-xs mt-1">
                        <Brain className="h-3 w-3 mr-1" />
                        <span className="font-medium">GPT-4 Powered</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-indigo-200">Writing Score:</span>
                      <span className="font-bold text-white">92/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-200">Improvement:</span>
                      <span className="font-bold text-green-400">+23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-200">AI Sessions:</span>
                      <span className="font-bold text-white">47</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/analytics')}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none text-sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* AI-Powered ESL Learning Tips */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI-Powered ESL Writing Tips</h2>
              <div className="flex items-center mt-1">
                <span className="px-3 py-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  GPT-4 Enhanced
                </span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 bg-gradient-to-br from-blue-900/80 to-blue-800/80 rounded-lg border border-blue-600/50 shadow-lg">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="h-4 w-4 text-blue-400" />
                </div>
                <h3 className="font-semibold text-blue-200">AI Grammar Focus</h3>
              </div>
              <p className="text-sm text-blue-100 leading-relaxed">
                Our advanced AI detects verb tenses, subject-verb agreement, and complex grammar patterns in real-time, providing instant corrections and learning opportunities.
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-900/80 to-green-800/80 rounded-lg border border-green-600/50 shadow-lg">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="font-semibold text-green-200">Smart Vocabulary</h3>
              </div>
              <p className="text-sm text-green-100 leading-relaxed">
                AI-powered context analysis suggests sophisticated academic vocabulary, synonym alternatives, and helps you express ideas with precision and clarity.
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-900/80 to-purple-800/80 rounded-lg border border-purple-600/50 shadow-lg">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="font-semibold text-purple-200">Academic Tone AI</h3>
              </div>
              <p className="text-sm text-purple-100 leading-relaxed">
                Advanced AI analysis ensures your writing maintains appropriate academic formality, professional tone, and scholarly discourse patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 