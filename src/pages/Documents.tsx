import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { firestoreService, CloudDocument } from '@/services/firestore'
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LocalDocument {
  id: string
  title: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  wordCount: number
  characterCount?: number
  status?: string
  tags?: string[]
}

export const Documents: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<LocalDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<LocalDocument[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'updatedAt' | 'createdAt'>('updatedAt')
  const [filterBy, setFilterBy] = useState<'all' | 'recent'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Load documents from localStorage
  const loadDocuments = async () => {
    console.log('Loading documents from localStorage...')
    try {
      const storedDocs = localStorage.getItem('documents')
      if (storedDocs) {
        const parsedDocs = JSON.parse(storedDocs)
        console.log('Found documents in localStorage:', parsedDocs.length)
        setDocuments(parsedDocs)
      } else {
        console.log('No documents found in localStorage')
        setDocuments([])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh documents manually
  const handleRefresh = async () => {
    setIsRefreshing(true)
    console.log('Manually refreshing documents...')
    await loadDocuments()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Load documents on component mount and when window gains focus
  useEffect(() => {
    loadDocuments()
    
    const handleFocus = () => {
      console.log('Window focused, refreshing documents...')
      loadDocuments()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const createNewDocument = () => {
    navigate('/editor')
  }

  const openDocument = (doc: LocalDocument) => {
    navigate(`/editor?id=${doc.id}`)
  }

  const deleteDocument = async (doc: LocalDocument) => {
    if (!confirm(`Delete "${doc.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Delete from localStorage
      const localDocs = documents.filter(d => d.id !== doc.id)
      localStorage.setItem('documents', JSON.stringify(localDocs))
      
      setDocuments(localDocs)
    } catch (error) {
      console.error('Error deleting document:', error)
    }
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
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }).format(date)
    }
  }

  const getReadingTime = (wordCount: number) => {
    return Math.ceil(wordCount / 200) || 1
  }

  // Filter and sort documents
  useEffect(() => {
    let filtered = documents

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, sortBy])

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      let content = ''
      const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension

      if (file.type === 'text/plain') {
        // Handle plain text files
        content = await file.text()
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword' ||
                 file.name.endsWith('.docx') || 
                 file.name.endsWith('.doc')) {
        // Handle Word documents
        try {
          // For now, we'll show a message that Word import needs additional setup
          toast.error('Word document import requires additional setup. Please copy and paste your content into the editor for now.')
          return
        } catch (error) {
          console.error('Error reading Word document:', error)
          toast.error('Failed to read Word document. Please try copying and pasting your content.')
          return
        }
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Handle PDF files
        toast.error('PDF import requires additional setup. Please copy and paste your content into the editor for now.')
        return
      } else if (file.type === 'application/rtf' || file.name.endsWith('.rtf')) {
        // Handle RTF files
        content = await file.text()
        // Remove RTF formatting codes for basic text extraction
        content = content.replace(/\\[a-z]{1,32}(-?\d{1,10})?[ ]?|\\'[0-9a-f]{2}|\\([^a-z])|[{}]|\r\n?|\n/gi, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
      } else {
        toast.error('Unsupported file type. Please use .txt, .rtf, .doc, .docx, or .pdf files.')
        return
      }

      if (content.trim()) {
        // Create a new document with imported content
        const newDocument: LocalDocument = {
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: fileName || 'Imported Document',
          content: content.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: content.trim().split(/\s+/).filter(word => word.length > 0).length,
          characterCount: content.length
        }

        // Save to localStorage
        const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]')
        const updatedDocs = [newDocument, ...existingDocs]
        localStorage.setItem('documents', JSON.stringify(updatedDocs))

        // Update local state
        setDocuments(prev => [newDocument, ...prev])
        
        toast.success(`File "${fileName}" imported successfully!`)
        
        // Navigate to editor with the imported document
        navigate(`/editor?imported=${newDocument.id}`)
      } else {
        toast.error('The imported file appears to be empty or could not be read.')
      }
    } catch (error) {
      console.error('Error importing file:', error)
      toast.error('Failed to import file. Please try again.')
    } finally {
      setIsImporting(false)
      // Reset the file input
      event.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Documents</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors">
              Manage your writing projects and continue where you left off.
              {!user && ' Documents are saved locally.'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            {/* File Import */}
            <div className="relative">
              <input
                type="file"
                id="file-import"
                accept=".txt,.rtf,.doc,.docx,.pdf"
                onChange={handleFileImport}
                className="hidden"
                disabled={isImporting}
              />
              <Button 
                onClick={() => document.getElementById('file-import')?.click()} 
                variant="outline" 
                size="sm"
                disabled={isImporting}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import File'}
              </Button>
            </div>
            
            <Button onClick={createNewDocument} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="updated">Last Modified</option>
                <option value="created">Date Created</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors">Loading your documents...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">
              {searchTerm ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">
              {searchTerm 
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first document to get started with WordWise AI.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={createNewDocument} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create First Document
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center transition-colors">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">Total Documents</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{documents.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center transition-colors">
                    <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">Total Words</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                      {documents.reduce((total, doc) => total + (doc.wordCount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center transition-colors">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">Recent Activity</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                      {documents.filter(doc => {
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        const docDate = new Date(doc.updatedAt)
                        return docDate > weekAgo
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center transition-colors">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">Avg Reading Time</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                      {documents.length > 0 
                        ? Math.round(documents.reduce((total, doc) => total + getReadingTime(doc.wordCount || 0), 0) / documents.length)
                        : 0}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => openDocument(doc)}
                      >
                        {doc.title}
                      </h3>
                      <div className="relative group">
                        <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </button>
                        <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button
                            onClick={() => openDocument(doc)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center transition-colors"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDocument(doc)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 flex items-center transition-colors"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 transition-colors">
                      {doc.content.substring(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span>{doc.wordCount || 0} words</span>
                        <span>{getReadingTime(doc.wordCount || 0)} min read</span>
                      </div>
                      <span>{formatTimestamp(new Date(doc.updatedAt))}</span>
                    </div>
                    
                    {doc.id.startsWith('local-') && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 transition-colors">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 transition-colors">
                          Local Only
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 