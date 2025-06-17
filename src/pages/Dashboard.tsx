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
  Award
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
      
      setStats({
        totalDocuments: userDocs.length,
        totalWords,
        recentDocuments: recentDocs.length,
        averageWordsPerDocument: userDocs.length > 0 ? Math.round(totalWords / userDocs.length) : 0,
        totalReadingTime,
        documentsThisWeek: recentDocs.length,
        mostProductiveDay: getMostProductiveDay(userDocs)
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMostProductiveDay = (docs: (CloudDocument | LocalDocument)[]): string => {
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-4">
                Start Writing
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Create a new document and get real-time AI suggestions as you write.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              onClick={() => navigate('/editor')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
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
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Words Written</p>
                    <p className="text-2xl font-bold text-white">{stats.totalWords.toLocaleString()}</p>
                  </div>
                  <Edit className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Recent Activity</p>
                    <p className="text-2xl font-bold text-white">{stats.recentDocuments}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Reading Time</p>
                    <p className="text-2xl font-bold text-white">{stats.totalReadingTime}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

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
            <div className="grid md:grid-cols-2 gap-6 mb-8">
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
            </div>
          </>
        )}

        {/* ESL Learning Tips */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">ESL Writing Tips</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-900 rounded-lg border border-blue-700">
              <h3 className="font-medium text-blue-200 mb-2">Grammar Focus</h3>
              <p className="text-sm text-blue-100">
                Pay attention to verb tenses and subject-verb agreement for clearer communication.
              </p>
            </div>
            <div className="p-4 bg-green-900 rounded-lg border border-green-700">
              <h3 className="font-medium text-green-200 mb-2">Vocabulary Building</h3>
              <p className="text-sm text-green-100">
                Use WordWise's suggestions to discover new words and improve your academic vocabulary.
              </p>
            </div>
            <div className="p-4 bg-purple-900 rounded-lg border border-purple-700">
              <h3 className="font-medium text-purple-200 mb-2">Writing Structure</h3>
              <p className="text-sm text-purple-100">
                Organize your ideas with clear paragraphs and smooth transitions between thoughts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 