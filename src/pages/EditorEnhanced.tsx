import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { firestoreService, CloudDocument } from '../services/firestore'
import { GrammarChecker, GrammarError } from '../services/grammarChecker'
// Icons removed to fix compilation errors
// useNavigate removed to fix compilation error

interface LocalDocument {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  wordCount: number
  characterCount: number
}

export const EditorEnhanced: React.FC = () => {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitled Document')
  const [issues, setIssues] = useState<GrammarError[]>([])
  const [selectedIssue, setSelectedIssue] = useState<GrammarError | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const grammarChecker = useRef(new GrammarChecker())
  
  // Document management state
  const [documents, setDocuments] = useState<(CloudDocument | LocalDocument)[]>([])
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load documents on mount (cloud if authenticated, local if not)
  useEffect(() => {
    loadUserDocuments()
  }, [user])

  // Auto-save current document
  useEffect(() => {
    if (content.trim() || title !== 'Untitled Document') {
      const timeoutId = setTimeout(() => {
        saveCurrentDocument()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [content, title, user])

  const loadUserDocuments = async () => {
    try {
      setIsLoading(true)
      
      if (user) {
        // Load from Firestore if authenticated
        const userDocs = await firestoreService.getUserDocuments(user.uid)
        setDocuments(userDocs)
        
        if (!currentDocumentId && userDocs.length > 0) {
          const latestDoc = userDocs[0]
          loadDocument(latestDoc)
        }
      } else {
        // Load from localStorage if not authenticated
        const localDocs = loadLocalDocuments()
        setDocuments(localDocs)
        
                 if (!currentDocumentId && localDocs.length > 0) {
           const latestDoc = localDocs[0]
           loadDocument(latestDoc)
         }
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const saveLocalDocuments = (docs: LocalDocument[]) => {
    try {
      localStorage.setItem('wordwise-documents', JSON.stringify(docs))
    } catch (error) {
      console.error('Error saving local documents:', error)
    }
  }

  const saveCurrentDocument = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)

      if (user) {
        // Save to Firestore if authenticated
        if (currentDocumentId) {
          await firestoreService.updateDocument(currentDocumentId, user.uid, {
            title,
            content
          })
        } else {
          const newDoc = await firestoreService.createDocument({
            title,
            content,
            userId: user.uid
          })
          setCurrentDocumentId(newDoc.id)
          setDocuments(prev => [newDoc, ...prev])
        }
      } else {
        // Save to localStorage if not authenticated
        const localDocs = loadLocalDocuments()
        const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
        
        if (currentDocumentId) {
          // Update existing local document
          const updatedDocs = localDocs.map(doc => 
            doc.id === currentDocumentId 
              ? { ...doc, title, content, updatedAt: new Date(), wordCount, characterCount: content.length }
              : doc
          )
          saveLocalDocuments(updatedDocs)
          setDocuments(updatedDocs)
        } else {
          // Create new local document
          const newDoc: LocalDocument = {
            id: `local-${Date.now()}`,
            title,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount,
            characterCount: content.length
          }
          const updatedDocs = [newDoc, ...localDocs]
          saveLocalDocuments(updatedDocs)
          setDocuments(updatedDocs)
          setCurrentDocumentId(newDoc.id)
        }
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const loadDocument = (doc: CloudDocument | LocalDocument) => {
    setTitle(doc.title)
    setContent(doc.content)
    setCurrentDocumentId(doc.id)
    setShowDocuments(false)
    
    // Check grammar for loaded document
    if (doc.content) {
      try {
        grammarChecker.current.checkText(doc.content).then(detectedIssues => {
          setIssues(detectedIssues)
        }).catch(error => {
          console.error('Error checking grammar:', error)
        })
      } catch (error) {
        console.error('Error checking grammar:', error)
      }
    }
  }

  const createNewDocument = () => {
    setTitle('Untitled Document')
    setContent('')
    setCurrentDocumentId(null)
    setIssues([])
    setSelectedIssue(null)
    setSuggestions([])
    setShowDocuments(false)
  }

  const deleteDocument = async (docId: string) => {
    try {
      if (user && !docId.startsWith('local-')) {
        // Delete from Firestore
        await firestoreService.deleteDocument(docId, user.uid)
      } else {
        // Delete from localStorage
        const localDocs = loadLocalDocuments()
        const updatedDocs = localDocs.filter(doc => doc.id !== docId)
        saveLocalDocuments(updatedDocs)
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      
      // If we're deleting the current document, create a new one
      if (docId === currentDocumentId) {
        createNewDocument()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleTextChange = (newText: string) => {
    setContent(newText)
    
    // Debounced grammar checking
    setIsChecking(true)
    setTimeout(() => {
      try {
        grammarChecker.current.checkText(newText).then(detectedIssues => {
          setIssues(detectedIssues)
          setIsChecking(false)
        }).catch(error => {
          console.error('Error checking grammar:', error)
          setIsChecking(false)
        })
      } catch (error) {
        console.error('Error checking grammar:', error)
        setIsChecking(false)
      }
    }, 500)
  }

  const handleIssueClick = (issue: GrammarError) => {
    setSelectedIssue(issue)
    const suggestionList = issue.suggestion || []
    setSuggestions(suggestionList)

    // Highlight the issue in the textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(issue.start, issue.end)
    }
  }

  const applySuggestion = (suggestion: string) => {
    if (!selectedIssue) return

    const newContent = 
      content.substring(0, selectedIssue.start) + 
      suggestion + 
      content.substring(selectedIssue.end)
    
    setContent(newContent)
    
    // Re-check grammar after applying suggestion
    try {
      grammarChecker.current.checkText(newContent).then(updatedIssues => {
        setIssues(updatedIssues)
      }).catch(error => {
        console.error('Error checking grammar:', error)
      })
    } catch (error) {
      console.error('Error checking grammar:', error)
    }
    
    setSelectedIssue(null)
    setSuggestions([])
  }

  const exportDocument = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
              placeholder="Document title..."
            />
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Saved {formatTimestamp(lastSaved)} {user ? '(Cloud)' : '(Local)'}
              </span>
            )}
            {isSaving && (
              <span className="text-sm text-blue-600">Saving...</span>
            )}
            {!user && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                Sign in to save to cloud
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              My Documents ({documents.length})
            </button>
            <button
              onClick={createNewDocument}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Document
            </button>
            <button
              onClick={exportDocument}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Documents Sidebar */}
        {showDocuments && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Documents {!user && '(Local)'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No documents yet. Start writing to create your first document!
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        doc.id === currentDocumentId
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        onClick={() => loadDocument(doc)}
                        className="flex-1"
                      >
                        <h4 className="font-medium text-gray-900 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {doc.content.substring(0, 100)}...
                        </p>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>{doc.wordCount} words</span>
                          <span>
                            {formatTimestamp(doc.updatedAt)}
                            {doc.id.startsWith('local-') && ' (Local)'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this document?')) {
                            deleteDocument(doc.id)
                          }
                        }}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {/* Writing Area */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 p-6">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Start writing your document here..."
                className="w-full h-full resize-none border-none outline-none text-lg leading-relaxed"
                style={{ fontFamily: 'Georgia, serif' }}
              />
            </div>
            
            {/* Stats Bar */}
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex space-x-6">
                  <span>{content.length} characters</span>
                  <span>{content.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
                  <span>{issues.length} issues found</span>
                </div>
                {isChecking && (
                  <span className="text-blue-600">Checking grammar...</span>
                )}
              </div>
            </div>
          </div>

          {/* Grammar Suggestions Panel */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Grammar Assistant</h3>
              <p className="text-sm text-gray-600 mt-1">
                Click on any issue below to see suggestions
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '600px' }}>
              {issues.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">✓</div>
                  <p className="text-gray-600">No grammar issues found!</p>
                  <p className="text-sm text-gray-500 mt-1">Your writing looks great.</p>
                </div>
              ) : (
                issues.map((issue, index) => (
                  <div
                    key={index}
                    onClick={() => handleIssueClick(issue)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedIssue === issue
                        ? 'border-blue-300 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        issue.type === 'spelling' ? 'bg-red-100 text-red-700' :
                        issue.type === 'grammar' ? 'bg-orange-100 text-orange-700' :
                        issue.type === 'style' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {issue.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      "{content.substring(issue.start, issue.end)}"
                    </p>
                    
                    <p className="text-xs text-gray-600 mb-3">{issue.message}</p>
                    
                    {selectedIssue === issue && suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Suggestions:</p>
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
                              applySuggestion(suggestion)
                            }}
                            className="block w-full text-left px-3 py-2 text-sm bg-green-50 text-green-800 rounded border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            "{suggestion}"
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 