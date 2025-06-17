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
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import UnderlineExtension from '@tiptap/extension-underline'

// Custom mark for applying suggestion highlights
const SuggestionMark = Highlight.extend({
  name: 'suggestionMark',
  
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-suggestion-type': {
        default: 'grammar',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-suggestion-type'),
        renderHTML: (attributes: Record<string, any>) => {
            if (!attributes['data-suggestion-type']) {
                return {}
            }
            return { 'data-suggestion-type': attributes['data-suggestion-type'] }
        },
      },
    };
  },
});

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
  const editorRef = useRef<TiptapEditor | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Typography,
      SuggestionMark.configure({ multicolor: true }),
    ],
    content: '<p>Hello my name is Abdurrahman Mirza and this is my gramar checker.</p>',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = setTimeout(() => {
        analyzeContentWithAI(text);
      }, 1500);
    },
  });

  const analyzeContentWithAI = useCallback(async (text: string) => {
    if (!text.trim() || !editor) {
      setAiAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysis = await openaiService.analyzeText(text);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [editor]);

  useEffect(() => {
    if(editor && aiAnalysis) {
        const { state, view } = editor;
        const { tr } = state;

        // Clear previous highlights first
        tr.removeMark(0, state.doc.content.size, editor.schema.marks.suggestionMark);
        
        const allIssues = [
          ...(aiAnalysis.grammarIssues || []),
          ...(aiAnalysis.spellingIssues || []),
          ...(aiAnalysis.vocabularyIssues || []),
          ...(aiAnalysis.clarityIssues || []),
          ...(aiAnalysis.styleIssues || []),
        ];

        // Apply new highlights
        allIssues.forEach(issue => {
          const from = issue.startPosition !== undefined ? issue.startPosition + 1 : -1;
          const to = issue.endPosition !== undefined ? issue.endPosition + 1 : -1;
    
          if (from >= 1 && to >= 1 && to <= editor.state.doc.content.size) {
            tr.addMark(from, to, editor.schema.marks.suggestionMark.create({ 'data-suggestion-type': issue.type }));
          }
        });
        view.dispatch(tr);
    }
  }, [aiAnalysis, editor]);
  
  useEffect(() => {
    if (editor) {
        editorRef.current = editor;
        analyzeContentWithAI(editor.getText());
    }
  }, [editor]);

  const handleAcceptSuggestion = (issue: AISuggestion) => {
    if (!editor) return;

    const from = issue.startPosition !== undefined ? issue.startPosition + 1 : -1;
    const to = issue.endPosition !== undefined ? issue.endPosition + 1 : -1;
    const replacement = issue.replacement ?? '';
    
    if (from === -1 || to === -1) {
        console.error("Cannot apply suggestion due to missing position:", issue);
        return;
    }

    editor.chain().focus()
      .insertContentAt({ from, to }, replacement)
      .run();

    setDismissedSuggestions(prev => new Set(prev).add(issue.id));
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set(prev).add(suggestionId));
  };
  
  const getFilteredIssues = (issues: AISuggestion[] = []) => issues.filter(issue => !dismissedSuggestions.has(issue.id));

  const renderSuggestionBlock = (issue: AISuggestion) => {
    const typeStyles = {
        grammar: { icon: <AlertCircle className="h-4 w-4 text-red-500" />, borderColor: 'border-red-500/50', titleColor: 'text-red-800 dark:text-red-200' },
        spelling: { icon: <Type className="h-4 w-4 text-yellow-500" />, borderColor: 'border-yellow-500/50', titleColor: 'text-yellow-800 dark:text-yellow-200' },
        vocabulary: { icon: <Palette className="h-4 w-4 text-green-500" />, borderColor: 'border-green-500/50', titleColor: 'text-green-800 dark:text-green-200' },
        clarity: { icon: <Lightbulb className="h-4 w-4 text-blue-500" />, borderColor: 'border-blue-500/50', titleColor: 'text-blue-800 dark:text-blue-200' },
        style: { icon: <CheckCircle className="h-4 w-4 text-purple-500" />, borderColor: 'border-purple-500/50', titleColor: 'text-purple-800 dark:text-purple-200' },
    };
    const styles = typeStyles[issue.type] || typeStyles.clarity;

    return (
      <div key={issue.id} className={`p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 ${styles.borderColor} mb-2`}>
        <div className={`flex items-start font-semibold text-sm ${styles.titleColor} mb-2`}>
            <span className="mr-2">{styles.icon}</span>
            <span>{issue.suggestion}</span>
        </div>
        {issue.original && (issue.replacement || issue.replacement === '') && (
          <div className="text-xs text-gray-600 dark:text-gray-400 pl-6 mb-2">
            Change <span className="font-mono bg-gray-200 dark:bg-gray-700 p-0.5 rounded">"{issue.original}"</span> to <span className="font-mono bg-gray-200 dark:bg-gray-700 p-0.5 rounded">"{issue.replacement}"</span>
          </div>
        )}
        <div className="flex items-center justify-end space-x-2 pl-6">
            <Button size="xs" variant="ghost" onClick={() => handleAcceptSuggestion(issue)} className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50">
                <Check className="h-4 w-4 mr-1"/> Accept
            </Button>
            <Button size="xs" variant="ghost" onClick={() => handleRejectSuggestion(issue.id)} className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50">
                <X className="h-4 w-4 mr-1"/> Dismiss
            </Button>
        </div>
      </div>
    );
  };
  
  const renderIssueSection = (title: string, issues: AISuggestion[] = [], icon: React.ReactNode) => {
      const filtered = getFilteredIssues(issues);
      if (filtered.length === 0) return null;
      return (
          <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  {icon}
                  {title} ({filtered.length})
              </h4>
              <div className="space-y-2">
                  {filtered.map(renderSuggestionBlock)}
              </div>
          </div>
      )
  };

  const totalIssues = (aiAnalysis ? [
      ...getFilteredIssues(aiAnalysis.grammarIssues),
      ...getFilteredIssues(aiAnalysis.spellingIssues),
      ...getFilteredIssues(aiAnalysis.vocabularyIssues),
      ...getFilteredIssues(aiAnalysis.clarityIssues),
      ...getFilteredIssues(aiAnalysis.styleIssues),
  ] : []).length;

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

    return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent focus:outline-none"
            />
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />Settings
              </Button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                  <h3 className="font-semibold mb-3">Editor Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{fontSize}px</span>
                    </div>
                    <div className="flex items-center">
                                             <input
                         type="checkbox"
                         id="autoSave"
                         checked={isAutoSaveEnabled}
                         onChange={(e) => setIsAutoSaveEnabled(e.target.checked)}
                         className="mr-2"
                       />
                      <label htmlFor="autoSave" className="text-sm">Enable Auto-save</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as HTML/PDF
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Word (RTF)
                  </button>
                </div>
              )}
            </div>
            
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isAutoSaving}
            >
              {isAutoSaving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
                    
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {editor && (
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}><Bold className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}><Italic className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleMark('underline').run()} className={editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}><Underline className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}><List className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}><ListOrdered className="h-4 w-4"/></Button>
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
            </div>
            
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Brain className="h-5 w-5 text-blue-500 mr-2" />
                  AI Suggestions
                        {isAnalyzing && <Loader className="h-4 w-4 ml-2 animate-spin" />}
                </h3>
                  {dismissedSuggestions.size > 0 && (
                        <Button size="xs" variant="ghost" onClick={() => setDismissedSuggestions(new Set())}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                  )}
                </div>
                
                {aiAnalysis && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Writing Score</span>
                        <span className={`font-bold text-lg ${aiAnalysis.overallScore > 80 ? 'text-green-500' : aiAnalysis.overallScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>{aiAnalysis.overallScore}/100</span>
                  </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
                      <div className={`h-1.5 rounded-full ${aiAnalysis.overallScore > 80 ? 'bg-green-500' : aiAnalysis.overallScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${aiAnalysis.overallScore}%`}}></div>
                        </div>
                      </div>
                    )}

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {totalIssues === 0 && !isAnalyzing ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="font-medium text-green-600 dark:text-green-400">Excellent! No issues found.</p>
                      </div>
                    ) : (
                        <>
                            {renderIssueSection("Grammar Issues", aiAnalysis?.grammarIssues, <AlertCircle className="h-4 w-4 text-red-500 mr-2" />)}
                            {renderIssueSection("Spelling Issues", aiAnalysis?.spellingIssues, <Type className="h-4 w-4 text-yellow-500 mr-2" />)}
                            {renderIssueSection("Vocabulary", aiAnalysis?.vocabularyIssues, <Palette className="h-4 w-4 text-green-500 mr-2" />)}
                            {renderIssueSection("Clarity", aiAnalysis?.clarityIssues, <Lightbulb className="h-4 w-4 text-blue-500 mr-2" />)}
                            {renderIssueSection("Style", aiAnalysis?.styleIssues, <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />)}
                        </>
                    )}
                    </div>
                  </div>
              </div>
                    </div>
                    </div>
                    </div>
                  </div>
  );
}; 