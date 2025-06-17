import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { openaiService, AISuggestion, AIAnalysisResult } from '@/services/openaiService'
import { 
  Save, 
  Download, 
  Settings, 
  Brain,
  FileText,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Check,
  X,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  Palette,
  Eye,
  EyeOff,
  Cloud,
  CloudOff,
  Loader
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const Editor: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitled Document')
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [fontSize, setFontSize] = useState(14)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true)
  const [showFormatting, setShowFormatting] = useState(true)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [isProcessingSuggestions, setIsProcessingSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const analysisTimeoutRef = useRef<NodeJS.Timeout>()
  const processingTimeoutRef = useRef<NodeJS.Timeout>()
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error'>('saving')

  // AI Analysis functionality
  const analyzeContentWithAI = useCallback(async (text: string) => {
    if (!text.trim()) {
      setAiAnalysis({
        grammarIssues: [],
        vocabularyIssues: [],
        clarityIssues: [],
        styleIssues: [],
        overallScore: 100,
        hasContent: false,
        wordCount: 0
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await openaiService.analyzeText(text, userLevel)
      setAiAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing content:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [userLevel])

  // Load document if ID is provided in URL
  useEffect(() => {
    const docId = searchParams.get('id')
    if (docId) {
      try {
        const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]')
        const document = existingDocs.find((doc: any) => doc.id === docId)
        
        if (document) {
          console.log('Loading document:', document.title)
          setTitle(document.title)
          setContent(document.content)
          setAutoSaveStatus('saved')
          
          // Trigger AI analysis for loaded document
          if (document.content.trim()) {
            analyzeContentWithAI(document.content)
          }
        } else {
          console.log('Document not found:', docId)
        }
      } catch (error) {
        console.error('Error loading document:', error)
      }
    }
  }, [searchParams, analyzeContentWithAI])

  // Auto-save functionality
  useEffect(() => {
    if (!content || content.trim() === '') {
      console.log('No content to save')
      return
    }

    const timer = setTimeout(() => {
      const existingDocId = searchParams.get('id')
      const docId = existingDocId || `doc_${Date.now()}`
      const documentTitle = title.trim() || 'Untitled Document'
      
      const documentData = {
        id: docId,
        title: documentTitle,
        content: content,
        createdAt: existingDocId ? undefined : new Date().toISOString(), // Only set createdAt for new docs
        updatedAt: new Date().toISOString(),
        wordCount: content.split(/\s+/).filter(Boolean).length,
        status: 'draft' as const,
        tags: [] as string[]
      }

      try {
        // Save to localStorage
        const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]')
        const docIndex = existingDocs.findIndex((doc: any) => doc.id === docId)
        
        if (docIndex >= 0) {
          // Update existing document, preserving createdAt
          existingDocs[docIndex] = { 
            ...existingDocs[docIndex], 
            ...documentData,
            createdAt: existingDocs[docIndex].createdAt // Keep original createdAt
          }
          console.log('Updated existing document:', docId)
        } else {
          // Add new document
          documentData.createdAt = new Date().toISOString()
          existingDocs.unshift(documentData) // Add to beginning for recent order
          console.log('Added new document:', docId)
        }
        
        localStorage.setItem('documents', JSON.stringify(existingDocs))
        
        setAutoSaveStatus('saved')
        console.log('Document auto-saved successfully:', {
          id: docId,
          title: documentTitle,
          wordCount: documentData.wordCount
        })
        
        // Update URL if it's a new document
        if (!existingDocId) {
          window.history.replaceState({}, '', `/editor?id=${docId}`)
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
        setAutoSaveStatus('error')
      }
    }, 2000)

    setAutoSaveStatus('saving')
    return () => clearTimeout(timer)
  }, [content, searchParams])

  // AI Analysis on content change
  useEffect(() => {
    // Skip auto-analysis when processing suggestions to prevent duplicate suggestions
    if (isProcessingSuggestions) {
      console.log('⏸️ Skipping auto-analysis: processing suggestions')
      return
    }

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeContentWithAI(content)
    }, 3000) // Analyze after 3 seconds of no typing

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [content, analyzeContentWithAI, isProcessingSuggestions])

  const handleSave = async () => {
    if (!content.trim() && !title.trim()) return
    
    setIsAutoSaving(true)
    try {
      const existingDocId = searchParams.get('id')
      const docId = existingDocId || `doc_${Date.now()}`
      const documentTitle = title.trim() || 'Untitled Document'
      
      const documentData = {
        id: docId,
        title: documentTitle,
        content: content,
        createdAt: existingDocId ? undefined : new Date().toISOString(), // Only set createdAt for new docs
        updatedAt: new Date().toISOString(),
        wordCount: content.split(/\s+/).filter(Boolean).length,
        status: 'draft' as const,
        tags: [] as string[]
      }

      // Save to localStorage - use same key as auto-save
      const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]')
      const docIndex = existingDocs.findIndex((doc: any) => doc.id === docId)
      
      if (docIndex >= 0) {
        // Update existing document, preserving createdAt
        existingDocs[docIndex] = { 
          ...existingDocs[docIndex], 
          ...documentData,
          createdAt: existingDocs[docIndex].createdAt // Keep original createdAt
        }
        console.log('Manual save: Updated existing document:', docId)
      } else {
        // Add new document
        documentData.createdAt = new Date().toISOString()
        existingDocs.unshift(documentData) // Add to beginning for recent order
        console.log('Manual save: Added new document:', docId)
      }
      
      localStorage.setItem('documents', JSON.stringify(existingDocs))
      
      setAutoSaveStatus('saved')
      setLastSaved(new Date())
      console.log('Document saved manually:', {
        id: docId,
        title: documentTitle,
        wordCount: documentData.wordCount
      })
      
      // Update URL if it's a new document
      if (!existingDocId) {
        window.history.replaceState({}, '', `/editor?id=${docId}`)
      }
    } catch (error) {
      console.error('Manual save failed:', error)
      setAutoSaveStatus('error')
    } finally {
      setIsAutoSaving(false)
    }
  }

  const handleExportPDF = () => {
    // Create a proper PDF-like content
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body { 
            font-family: ${fontFamily}, Arial, sans-serif; 
            font-size: ${fontSize}px; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            color: #333;
        }
        h1 { 
            color: #2563eb; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            margin-bottom: 30px;
        }
        .content { 
            white-space: pre-wrap; 
            margin-bottom: 40px; 
        }
        .footer { 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 12px; 
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
    <div class="footer">
        <p>Exported from WordWise AI on ${new Date().toLocaleDateString()}</p>
        <p>Words: ${content.split(/\s+/).filter(word => word.length > 0).length} | Characters: ${content.length}</p>
    </div>
</body>
</html>`
    
    const element = document.createElement('a')
    const file = new Blob([pdfContent], {type: 'text/html'})
    element.href = URL.createObjectURL(file)
    element.download = `${title || 'document'}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    setShowExportMenu(false)
    
    // Show instructions for PDF conversion
    setTimeout(() => {
      alert('HTML file downloaded! To convert to PDF:\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (or Cmd+P on Mac)\n3. Choose "Save as PDF" as the printer\n4. Click Save')
    }, 500)
  }

  const handleExportWord = () => {
    // Create proper Word document content with RTF format
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;\\red0\\green0\\blue255;}
\\f0\\fs24 {\\b\\fs32\\cf2 ${title}\\par}
\\par
${content.replace(/\n/g, '\\par ')}
\\par
\\par
{\\i Exported from WordWise AI on ${new Date().toLocaleDateString()}}
\\par
{\\fs18 Words: ${content.split(/\s+/).filter(word => word.length > 0).length} | Characters: ${content.length}}
}`
    
    const element = document.createElement('a')
    const file = new Blob([rtfContent], {type: 'application/rtf'})
    element.href = URL.createObjectURL(file)
    element.download = `${title || 'document'}.rtf`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    setShowExportMenu(false)
  }

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    setContent(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

    const handleAcceptSuggestion = (issue: any) => {
    console.log('🔍 DEBUG: Accepting suggestion for issue:', issue)
    
    if (!issue.replacement) {
      console.log('❌ No replacement text provided')
      return
    }

    // Set processing flag to prevent auto-analysis
    setIsProcessingSuggestions(true)

    let newContent = content
    let wasReplaced = false

    console.log('🎯 Original content:', content)
    console.log('🎯 AI original:', issue.original)
    console.log('🎯 AI replacement:', issue.replacement)

    // Strategy 1: Use AI's "original" field if available (most reliable)
    if (issue.original && content.includes(issue.original)) {
      const index = content.indexOf(issue.original)
      newContent = content.substring(0, index) + issue.replacement + content.substring(index + issue.original.length)
      wasReplaced = true
      console.log(`✅ AI replacement: "${issue.original}" → "${issue.replacement}"`)
    }
    
    // Strategy 2: Case-insensitive search for AI's original text
    else if (issue.original) {
      const regex = new RegExp(issue.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      const match = content.match(regex)
      if (match && match.index !== undefined) {
        newContent = content.substring(0, match.index) + issue.replacement + content.substring(match.index + match[0].length)
        wasReplaced = true
        console.log(`✅ AI case-insensitive replacement: "${match[0]}" → "${issue.replacement}"`)
      }
    }

    // Strategy 3: Simple word mapping fallback
    if (!wasReplaced) {
      console.log('🔄 Using simple word mapping fallback')
      
      const wordMap: { [key: string]: string } = {
        'pee': 'urinate',
        'poo': 'defecate',
        'shit': 'waste',
        'crap': 'waste',
        'damn': 'darn', 
        'hell': 'heck',
        'vomit': 'regurgitate',
        'good': 'excellent',
        'bad': 'poor',
        'big': 'large',
        'small': 'tiny'
      }
      
      // Try to find any of these words in the content
      for (const [original, replacement] of Object.entries(wordMap)) {
        const regex = new RegExp(`\\b${original}\\b`, 'i')
        if (regex.test(content)) {
          newContent = content.replace(regex, replacement)
          wasReplaced = true
          console.log(`✅ Word map replacement: "${original}" → "${replacement}"`)
          break
        }
      }
    }

    // Strategy 4: Grammar pattern fixes
    if (!wasReplaced) {
      console.log('🔄 Trying grammar pattern fixes')
      
      const grammarFixes: { [key: string]: string } = {
        'I is': 'I am',
        'you is': 'you are',
        'he are': 'he is',
        'she are': 'she is',
        'they is': 'they are'
      }
      
      for (const [incorrect, correct] of Object.entries(grammarFixes)) {
        if (content.toLowerCase().includes(incorrect.toLowerCase())) {
          const regex = new RegExp(incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
          newContent = content.replace(regex, correct)
          wasReplaced = true
          console.log(`✅ Grammar fix: "${incorrect}" → "${correct}"`)
          break
        }
      }
    }

    // Apply the replacement
    if (wasReplaced && newContent !== content) {
      console.log('✅ CONTENT UPDATED!')
      console.log('Before:', content)
      console.log('After:', newContent)
      setContent(newContent)
    } else {
      console.log('❌ No replacement was made')
    }
    
    // Always remove the suggestion from the analysis
    setAiAnalysis(prev => {
      if (!prev) return prev
      
      const updatedAnalysis = {
        ...prev,
        grammarIssues: prev.grammarIssues.filter(item => item.id !== issue.id),
        vocabularyIssues: prev.vocabularyIssues.filter(item => item.id !== issue.id),
        clarityIssues: prev.clarityIssues.filter(item => item.id !== issue.id),
        styleIssues: prev.styleIssues.filter(item => item.id !== issue.id)
      }
      
      // Recalculate score
      const newScore = calculateDynamicScore(
        updatedAnalysis.grammarIssues,
        updatedAnalysis.vocabularyIssues, 
        updatedAnalysis.clarityIssues,
        updatedAnalysis.styleIssues,
        updatedAnalysis.wordCount
      )
      
      return {
        ...updatedAnalysis,
        overallScore: newScore
      }
    })

    // Clear processing flag after a delay to allow multiple suggestion acceptances
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessingSuggestions(false)
      console.log('✅ Re-enabled auto-analysis after suggestion processing')
    }, 5000) // Wait 5 seconds before re-enabling auto-analysis
  }

  // Simple similarity calculation function
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length
    const len2 = str2.length
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null))
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i
    for (let j = 0; j <= len2; j++) matrix[j][0] = j
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        )
      }
    }
    
    return matrix[len2][len1] / Math.max(len1, len2)
  }

  // Dynamic score calculation function (same logic as in openaiService)
  const calculateDynamicScore = (
    grammarIssues: any[], 
    vocabularyIssues: any[], 
    clarityIssues: any[], 
    styleIssues: any[], 
    wordCount: number
  ): number => {
    // Start with perfect score
    let score = 100

    // Grammar issues have the highest impact (up to -8 points each)
    const grammarPenalty = grammarIssues.length * 8
    
    // Vocabulary issues medium impact (up to -4 points each)  
    const vocabularyPenalty = vocabularyIssues.length * 4
    
    // Clarity issues medium impact (up to -5 points each)
    const clarityPenalty = clarityIssues.length * 5
    
    // Style issues lower impact (up to -3 points each)
    const stylePenalty = styleIssues.length * 3

    // Apply penalties
    score -= grammarPenalty
    score -= vocabularyPenalty 
    score -= clarityPenalty
    score -= stylePenalty

    // Additional penalty for very short texts (less than 10 words)
    if (wordCount < 10) {
      score -= 20
    }

    // Bonus for longer, well-written texts (more than 50 words with few issues)
    const totalIssues = grammarIssues.length + vocabularyIssues.length + clarityIssues.length + styleIssues.length
    if (wordCount > 50 && totalIssues === 0) {
      score = Math.min(100, score + 5) // Small bonus for excellent writing
    }

    // Issue density penalty (many issues relative to text length)
    const issuesDensity = totalIssues / Math.max(wordCount / 10, 1) // Issues per 10 words
    if (issuesDensity > 1) {
      score -= Math.floor(issuesDensity * 5) // Extra penalty for dense issues
    }

    // Ensure score stays within reasonable bounds
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  const handleRejectSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]))
    
    // Extend processing flag when dismissing suggestions to prevent immediate re-analysis
    setIsProcessingSuggestions(true)
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessingSuggestions(false)
      console.log('✅ Re-enabled auto-analysis after suggestion dismissal')
    }, 3000) // Wait 3 seconds after dismissing
  }

  const handleUndoDismissal = (suggestionId: string) => {
    setDismissedSuggestions(prev => {
      const newSet = new Set([...prev])
      newSet.delete(suggestionId)
      return newSet
    })
  }

  // Get current analysis data
  const analysis = aiAnalysis || {
    grammarIssues: [],
    vocabularyIssues: [],
    clarityIssues: [],
    styleIssues: [],
    overallScore: 100,
    hasContent: false,
    wordCount: 0
  }

  // Filter out dismissed suggestions
  const filteredAnalysis = {
    ...analysis,
    grammarIssues: analysis.grammarIssues.filter(issue => !dismissedSuggestions.has(issue.id)),
    vocabularyIssues: analysis.vocabularyIssues.filter(issue => !dismissedSuggestions.has(issue.id)),
    clarityIssues: analysis.clarityIssues.filter(issue => !dismissedSuggestions.has(issue.id)),
    styleIssues: analysis.styleIssues.filter(issue => !dismissedSuggestions.has(issue.id))
  }

  const totalIssues = filteredAnalysis.grammarIssues.length + filteredAnalysis.vocabularyIssues.length + 
                     filteredAnalysis.clarityIssues.length + filteredAnalysis.styleIssues.length

  const renderSuggestionBlock = (issue: any, color: string) => {
    const colorStyles = {
      red: {
        bg: 'bg-red-50 dark:bg-red-950/50',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-900 dark:text-red-100',
        subtext: 'text-red-700 dark:text-red-200',
        button: 'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50',
        icon: 'text-red-600 dark:text-red-200',
        suggestion: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-950/50',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-900 dark:text-green-100',
        subtext: 'text-green-700 dark:text-green-200',
        button: 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/50',
        icon: 'text-green-600 dark:text-green-200',
        suggestion: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/50',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-900 dark:text-orange-100',
        subtext: 'text-orange-700 dark:text-orange-200',
        button: 'bg-orange-100 dark:bg-orange-900/50 hover:bg-orange-200 dark:hover:bg-orange-800/50',
        icon: 'text-orange-600 dark:text-orange-200',
        suggestion: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-100'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-100',
        subtext: 'text-blue-700 dark:text-blue-200',
        button: 'bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50',
        icon: 'text-blue-600 dark:text-blue-200',
        suggestion: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100'
      }
    }

    const styles = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue

    return (
      <div key={issue.id} className={`p-3 ${styles.bg} rounded-lg border ${styles.border} transition-colors`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text} mb-1`}>
              {issue.text}
            </p>
            <p className={`text-xs ${styles.subtext}`}>
              {issue.suggestion}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {issue.replacement && (
              <button
                onClick={() => handleAcceptSuggestion(issue)}
                className={`p-1 rounded ${styles.button} transition-colors`}
                title="Accept suggestion"
              >
                <Check className={`h-3 w-3 ${styles.icon}`} />
              </button>
            )}
            <button
              onClick={() => handleRejectSuggestion(issue.id)}
              className={`p-1 rounded ${styles.button} transition-colors`}
              title="Dismiss suggestion"
            >
              <X className={`h-3 w-3 ${styles.icon}`} />
            </button>
          </div>
        </div>
        {issue.replacement && (
          <div className={`text-xs ${styles.suggestion} p-2 rounded mt-2 border font-medium`}>
            Suggested: "{issue.replacement}"
          </div>
        )}
      </div>
    )
  }

  // Function to render text with highlights
  const renderTextWithHighlights = () => {
    if (!content || !analysis.hasContent) {
      return null
    }

    // Collect all issues with their positions and colors
    const allIssues = [
      ...filteredAnalysis.grammarIssues.map(issue => ({ ...issue, color: 'red' })),
      ...filteredAnalysis.vocabularyIssues.map(issue => ({ ...issue, color: 'green' })),
      ...filteredAnalysis.clarityIssues.map(issue => ({ ...issue, color: 'orange' })),
      ...filteredAnalysis.styleIssues.map(issue => ({ ...issue, color: 'blue' }))
    ]

    if (allIssues.length === 0) {
      return <span className="text-transparent">{content}</span>
    }

    // Create an array to track which characters should be highlighted
    const highlights = new Array(content.length).fill(null)
    
    // Find and mark problematic text for highlighting
    for (const issue of allIssues) {
      // Try different strategies to find the problematic text
      let foundText = null
      
            // Strategy 1: Parse AI suggestions to find what should be highlighted (same logic as replacement)
      if (issue.suggestion) {
        const patterns = [
          /(?:use|try)\s+['"]([^'"]+)['"]?\s+instead\s+of\s+['"]?([^'".,]+)['"]?/i,
          /instead\s+of\s+['"]?([^'".,]+)['"]?,?\s*(?:use|try)\s+['"]([^'"]+)['"]?/i,
          /replace\s+['"]?([^'".,]+)['"]?\s+with\s+['"]([^'"]+)['"]?/i,
          /['"]?([^'".,]+)['"]?\s+should\s+be\s+['"]([^'"]+)['"]?/i,
          /change\s+['"]?([^'".,]+)['"]?\s+to\s+['"]([^'"]+)['"]?/i,
          /avoid\s+using\s+['"]?([^'".,]+)['"]?/i
        ]
        
        for (const pattern of patterns) {
          const match = issue.suggestion.match(pattern)
          if (match) {
            let originalText
            
            if (pattern.source.includes('avoid using')) {
              originalText = match[1]
            } else if (pattern.source.includes('instead of')) {
              if (pattern.source.startsWith('(?:use|try)')) {
                originalText = match[2] // "use Y instead of X" format
              } else {
                originalText = match[1] // "instead of X, use Y" format
              }
            } else {
              originalText = match[1] // Most other patterns
            }
            
            if (originalText) {
              const index = content.toLowerCase().indexOf(originalText.toLowerCase().trim())
              if (index !== -1) {
                foundText = { start: index, end: index + originalText.trim().length, color: issue.color }
                break
              }
            }
          }
        }
      }
      
      // Strategy 2: Smart word detection using the same scoring system as replacement
      if (!foundText) {
        const candidateWords = new Set<string>()
        
        // From issue text description
        if (issue.text) {
          const issueWords = issue.text.toLowerCase().match(/\b\w+\b/g) || []
          issueWords.forEach((word: string) => {
            if (word.length > 2 && content.toLowerCase().includes(word)) {
              candidateWords.add(word)
            }
          })
        }
        
        // From suggestion text
        if (issue.suggestion) {
          const suggestionWords = issue.suggestion.toLowerCase().match(/\b\w+\b/g) || []
          suggestionWords.forEach((word: string) => {
            if (word.length > 2 && content.toLowerCase().includes(word) && 
                !['use', 'should', 'avoid', 'try', 'more', 'less', 'better', 'appropriate', 'formal', 'academic'].includes(word)) {
              candidateWords.add(word)
            }
          })
        }
        
        // Score and find the best candidate to highlight
        const scoredCandidates = Array.from(candidateWords).map(word => {
          let score = 0
          const informalWords = ['pee', 'poo', 'diarrhea', 'pooped', 'shit', 'damn', 'hell', 'crap', 
                                 'good', 'bad', 'big', 'small', 'nice', 'cool', 'awesome', 'like', 'very', 'really']
          if (informalWords.includes(word.toLowerCase())) score += 10
          
          const grammarWords = ['is', 'are', 'was', 'were', 'have', 'has', 'do', 'does']
          if (grammarWords.includes(word.toLowerCase())) score += 5
          
          if (issue.text && issue.text.toLowerCase().includes(word)) score += 3
          if (word.length > 6) score += 2
          
          return { word, score }
        }).sort((a, b) => b.score - a.score)
        
        // Highlight the highest-scored candidate
        for (const candidate of scoredCandidates) {
          const index = content.toLowerCase().indexOf(candidate.word.toLowerCase())
          if (index !== -1) {
            foundText = { start: index, end: index + candidate.word.length, color: issue.color }
            break
          }
        }
      }
      
      // Mark the found text for highlighting
      if (foundText) {
        for (let i = foundText.start; i < foundText.end; i++) {
          if (i < highlights.length) {
            highlights[i] = foundText.color
          }
        }
      }
    }

    // Render the text with highlights
    const result = []
    let currentColor = null
    let currentText = ''
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i]
      const charColor = highlights[i]
      
      if (charColor !== currentColor) {
        // Push the current text segment
        if (currentText) {
          if (currentColor) {
            const colorClasses = {
              red: 'bg-red-200 dark:bg-red-900/30 border-b-2 border-red-500',
              green: 'bg-green-200 dark:bg-green-900/30 border-b-2 border-green-500',
              orange: 'bg-orange-200 dark:bg-orange-900/30 border-b-2 border-orange-500',
              blue: 'bg-blue-200 dark:bg-blue-900/30 border-b-2 border-blue-500'
            }
            result.push(
              <span key={`highlight-${result.length}`} className={colorClasses[currentColor as keyof typeof colorClasses] || ''}>
                {currentText}
              </span>
            )
          } else {
            result.push(<span key={`normal-${result.length}`} className="text-transparent">{currentText}</span>)
          }
        }
        
        // Start new segment
        currentColor = charColor
        currentText = char
      } else {
        currentText += char
      }
    }
    
    // Push the final segment
    if (currentText) {
      if (currentColor) {
        const colorClasses = {
          red: 'bg-red-200 dark:bg-red-900/30 border-b-2 border-red-500',
          green: 'bg-green-200 dark:bg-green-900/30 border-b-2 border-green-500',
          orange: 'bg-orange-200 dark:bg-orange-900/30 border-b-2 border-orange-500',
          blue: 'bg-blue-200 dark:bg-blue-900/30 border-b-2 border-blue-500'
        }
        result.push(
          <span key={`highlight-${result.length}`} className={colorClasses[currentColor as keyof typeof colorClasses] || ''}>
            {currentText}
          </span>
        )
      } else {
        result.push(<span key={`normal-${result.length}`} className="text-transparent">{currentText}</span>)
      }
    }
    
    return <>{result}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 transition-colors"
            />
            <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {isAutoSaving ? (
                <>
                  <Cloud className="h-3 w-3 mr-1 animate-pulse" />
                  Saving...
                </>
              ) : lastSaved ? (
                <>
                  <CloudOff className="h-3 w-3 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </>
              ) : null}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
              
              {showSettings && (
                <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editor Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Family
                      </label>
                      <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Arial">Arial</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAutoSaveEnabled}
                        onChange={(e) => setIsAutoSaveEnabled(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Enable auto-save
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showFormatting}
                        onChange={(e) => setShowFormatting(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Show formatting toolbar
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Writing Level (for AI Analysis)
                      </label>
                      <select 
                        value={userLevel}
                        onChange={(e) => setUserLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This helps AI provide appropriate suggestions for your level
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowSettings(false)}
                    className="mt-4 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Close Settings
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
              
              {showExportMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    📄 Export as HTML (for PDF)
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    📝 Export as RTF (Word Compatible)
                  </button>
                </div>
              )}
            </div>
            
            <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {showFormatting && (
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
                <button
                  onClick={() => insertFormatting('**', '**')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Bold"
                >
                  <Bold className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => insertFormatting('*', '*')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Italic"
                >
                  <Italic className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => insertFormatting('<u>', '</u>')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Underline"
                >
                  <Underline className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
                <button
                  onClick={() => insertFormatting('# ', '')}
                  className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => insertFormatting('## ', '')}
                  className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => insertFormatting('### ', '')}
                  className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  title="Heading 3"
                >
                  H3
                </button>
              </div>
              
              <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
                <button
                  onClick={() => insertFormatting('• ', '')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Bullet List"
                >
                  <List className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => insertFormatting('1. ', '')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowFormatting(false)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Hide Toolbar"
                >
                  <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!showFormatting && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => setShowFormatting(true)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <Eye className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Show Formatting</span>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px] transition-colors">
              <div className="p-6">
                <div className="relative bg-white dark:bg-gray-700 rounded-lg">
                  {/* Highlight overlay */}
                  <div
                    className="absolute inset-0 p-4 pointer-events-none z-5 overflow-hidden rounded-lg"
                    style={{ 
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}
                  >
                    {renderTextWithHighlights()}
                  </div>
                  
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your document here. WordWise AI will provide real-time suggestions to help improve your grammar, vocabulary, and clarity as you type..."
                    className="w-full h-[500px] p-4 border border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors relative z-10"
                    style={{ 
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.6'
                    }}
                  />
                  
                  {/* Issue Type Legend */}
                  {totalIssues > 0 && (
                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 text-xs z-20">
                      <div className="text-gray-600 dark:text-gray-300 font-medium mb-1">Issue Types:</div>
                      <div className="space-y-1">
                        {filteredAnalysis.grammarIssues.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-3 h-1 bg-red-500 rounded mr-2"></div>
                            <span className="text-red-600 dark:text-red-400">Grammar ({filteredAnalysis.grammarIssues.length})</span>
                          </div>
                        )}
                        {filteredAnalysis.vocabularyIssues.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-3 h-1 bg-green-500 rounded mr-2"></div>
                            <span className="text-green-600 dark:text-green-400">Vocabulary ({filteredAnalysis.vocabularyIssues.length})</span>
                          </div>
                        )}
                        {filteredAnalysis.clarityIssues.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-3 h-1 bg-orange-500 rounded mr-2"></div>
                            <span className="text-orange-600 dark:text-orange-400">Clarity ({filteredAnalysis.clarityIssues.length})</span>
                          </div>
                        )}
                        {filteredAnalysis.styleIssues.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-3 h-1 bg-blue-500 rounded mr-2"></div>
                            <span className="text-blue-600 dark:text-blue-400">Style ({filteredAnalysis.styleIssues.length})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Writing Stats */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                  <div className="flex items-center space-x-6">
                    <span>Words: {analysis.wordCount}</span>
                    <span>Characters: {content.length}</span>
                    <span>Reading time: {Math.ceil(analysis.wordCount / 200)} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isAnalyzing ? (
                      <>
                        <Loader className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                        <span className="text-blue-600 dark:text-blue-400">AI Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-600 dark:text-blue-400">
                          {analysis.hasContent ? `AI Analysis Complete (${totalIssues} suggestions)` : 'AI Analysis Ready'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - AI Suggestions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* AI Analysis Panel - Made Much Longer */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors min-h-[700px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center transition-colors">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  AI Suggestions
                </h3>
                  {dismissedSuggestions.size > 0 && (
                    <button
                      onClick={() => setDismissedSuggestions(new Set())}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
                      title="Show all suggestions"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </button>
                  )}
                </div>
                
{!analysis.hasContent ? (
                  <div className="text-center py-8">
                    {isAnalyzing ? (
                      <>
                        <Loader className="h-12 w-12 text-blue-500 mx-auto mb-3 animate-spin" />
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                          AI is analyzing your text...
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          This may take a few seconds
                        </p>
                      </>
                    ) : (
                      <>
                        <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">
                    Start writing to get AI-powered suggestions for grammar, vocabulary, and clarity improvements.
                  </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                          Powered by OpenAI GPT-3.5 • Level: {userLevel}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {isAnalyzing && (
                      <div className="flex items-center justify-center py-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <Loader className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin mr-2" />
                        <span className="text-sm text-blue-600 dark:text-blue-400">Updating analysis...</span>
                      </div>
                    )}

                    {/* Overall Score */}
                    {analysis.overallScore && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Writing Score</span>
                          <span className={`text-lg font-bold ${
                            analysis.overallScore >= 90 ? 'text-green-600 dark:text-green-400' :
                            analysis.overallScore >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {analysis.overallScore}/100
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              analysis.overallScore >= 90 ? 'bg-green-600' :
                              analysis.overallScore >= 75 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${analysis.overallScore}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Grammar Suggestions */}
                    {filteredAnalysis.grammarIssues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                          Grammar Issues ({filteredAnalysis.grammarIssues.length})
                          <div className="ml-2 w-8 h-1 bg-red-500 rounded"></div>
                        </h4>
                        <div className="space-y-2">
                          {filteredAnalysis.grammarIssues.map(issue => renderSuggestionBlock(issue, 'red'))}
                        </div>
                      </div>
                    )}

                    {/* Vocabulary Suggestions */}
                    {filteredAnalysis.vocabularyIssues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Lightbulb className="h-4 w-4 text-green-500 mr-1" />
                          Vocabulary Enhancement ({filteredAnalysis.vocabularyIssues.length})
                          <div className="ml-2 w-8 h-1 bg-green-500 rounded"></div>
                        </h4>
                        <div className="space-y-2">
                          {filteredAnalysis.vocabularyIssues.map(issue => renderSuggestionBlock(issue, 'green'))}
                        </div>
                    </div>
                    )}

                    {/* Clarity Suggestions */}
                    {filteredAnalysis.clarityIssues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                          Clarity Issues ({filteredAnalysis.clarityIssues.length})
                          <div className="ml-2 w-8 h-1 bg-orange-500 rounded"></div>
                        </h4>
                        <div className="space-y-2">
                          {filteredAnalysis.clarityIssues.map(issue => renderSuggestionBlock(issue, 'orange'))}
                        </div>
                      </div>
                    )}

                    {/* Style Suggestions */}
                    {filteredAnalysis.styleIssues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                          Style Improvements ({filteredAnalysis.styleIssues.length})
                          <div className="ml-2 w-8 h-1 bg-blue-500 rounded"></div>
                        </h4>
                        <div className="space-y-2">
                          {filteredAnalysis.styleIssues.map(issue => renderSuggestionBlock(issue, 'blue'))}
                        </div>
                    </div>
                    )}

                    {/* No Issues State */}
                    {totalIssues === 0 && !isAnalyzing && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                          Excellent writing!
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No suggestions found. Your writing looks great!
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                          Score: {analysis.overallScore}/100
                        </p>
                      </div>
                    )}

                    {/* Dismissed Suggestions Counter */}
                    {dismissedSuggestions.size > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dismissedSuggestions.size} suggestion{dismissedSuggestions.size > 1 ? 's' : ''} dismissed
                      </p>
                    </div>
                    )}
                  </div>
                )}
              </div>

              {/* Writing Goals */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors">
                  Writing Goals
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Target Words</span>
                      <span className="font-medium text-gray-900 dark:text-white">500</span>
                    </div>
                    <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((analysis.wordCount / 500) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {analysis.wordCount}/500 words ({Math.round((analysis.wordCount / 500) * 100)}%)
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                    Keep writing to reach your daily goal and improve your English skills!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 