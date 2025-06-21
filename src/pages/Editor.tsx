import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { AIService } from '@/services/ai'
import { Suggestion } from '@/types'
import PDFExportService from '@/services/pdfExport'
import { WordExportService } from '@/services/wordExport'
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
  Underline as UnderlineIcon,
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
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [isProcessingSuggestions, setIsProcessingSuggestions] = useState(false)
  const [isAnalyzingTone, setIsAnalyzingTone] = useState(false)
  const [academicToneSuggestions, setAcademicToneSuggestions] = useState<Suggestion[]>([])
  const [showAcademicTone, setShowAcademicTone] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const analysisTimeoutRef = useRef<NodeJS.Timeout>()
  const processingTimeoutRef = useRef<NodeJS.Timeout>()
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error'>('saving')
  const editorRef = useRef<TiptapEditor | null>(null)
  const lastAnalyzedTextRef = useRef<string>('')
  const dismissedSuggestionKeysRef = useRef<Set<string>>(new Set()) // Content-based dismissed suggestions

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Typography,
      SuggestionMark.configure({ multicolor: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const html = editor.getHTML();
      
      // Sync content state with editor
      if (html !== content) {
        setContent(html);
      }
      
      // Simple debounced analysis
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = setTimeout(() => {
        analyzeContentWithAI(text);
      }, 3000);
    },
  });

  const analyzeContentWithAI = useCallback(async (text: string) => {
    if (!text.trim() || !editor) {
      setAiAnalysis(null);
      return;
    }
    
    // Prevent analyzing the same text multiple times
    if (text === lastAnalyzedTextRef.current) {
      console.log('Skipping analysis - same text as before');
      return;
    }
    
    lastAnalyzedTextRef.current = text;
    setIsAnalyzing(true);
    try {
      const suggestions = await AIService.analyzeText(text, 'professional', 'document');
      console.log('Received suggestions:', suggestions);
      
      // SIMPLIFIED filtering - only filter out permanently dismissed suggestions
      const filteredSuggestions = suggestions.filter(suggestion => {
        // Check if this suggestion has been permanently dismissed
        const contentKey = `${suggestion.type}:${suggestion.originalText}:${suggestion.message}`;
        const isPermanentlyDismissed = dismissedSuggestionKeysRef.current.has(contentKey);
        
        if (isPermanentlyDismissed) {
          console.log(`Filtering out permanently dismissed suggestion: "${contentKey}"`);
          return false;
        }
        
        // Robust check: only filter if the original text no longer exists
        const originalText = suggestion.originalText || '';
        const originalTextExists = originalText.length === 0 || text.includes(originalText);
        
        if (!originalTextExists) {
          console.log(`Filtering out suggestion - text no longer exists: "${originalText}"`);
          return false;
        }
        
        return true;
      });
      
      console.log('Filtered suggestions (simplified):', filteredSuggestions);
      
      // Separate academic tone suggestions from regular suggestions
      const regularSuggestions = filteredSuggestions.filter(s => s.type !== 'academic_tone');
      const academicToneSuggestions = filteredSuggestions.filter(s => s.type === 'academic_tone');
      
      // Filter out academic tone suggestions that have been semantically dismissed
      const filteredAcademicSuggestions = academicToneSuggestions.filter(suggestion => {
        // Check semantic key dismissal
        if (suggestion.semanticKey && dismissedSuggestionKeysRef.current.has(suggestion.semanticKey)) {
          console.log(`Filtering out semantically dismissed suggestion: ${suggestion.semanticKey}`);
          return false;
        }
        
        // Check content-based dismissal
        const contentKey = `${suggestion.type}:${suggestion.originalText}:${suggestion.message}`;
        if (dismissedSuggestionKeysRef.current.has(contentKey)) {
          console.log(`Filtering out content-dismissed suggestion: ${contentKey}`);
          return false;
        }
        
        return true;
      });
      
      console.log('Academic tone suggestions after filtering:', filteredAcademicSuggestions.length);
      
      // Convert to expected format
      const analysis = {
        grammarIssues: regularSuggestions.filter(s => s.type === 'grammar'),
        vocabularyIssues: regularSuggestions.filter(s => s.type === 'vocabulary'),
        clarityIssues: regularSuggestions.filter(s => s.type === 'clarity'),
        styleIssues: regularSuggestions.filter(s => s.type === 'style'),
        spellingIssues: regularSuggestions.filter(s => s.type === 'spelling'),
        punctuationIssues: regularSuggestions.filter(s => s.type === 'punctuation'),
        overallScore: Math.max(0, 100 - regularSuggestions.length * 5)
      };
      
      console.log('Processed analysis:', analysis);
      console.log('Academic tone suggestions:', filteredAcademicSuggestions);
      
      setAiAnalysis(analysis);
      setAcademicToneSuggestions(filteredAcademicSuggestions);
      
      // Show academic tone panel if there are suggestions
      if (filteredAcademicSuggestions.length > 0) {
        setShowAcademicTone(true);
      } else if (academicToneSuggestions.length > 0 && filteredAcademicSuggestions.length === 0) {
        // If we had suggestions but they were all filtered out, hide the panel
        setShowAcademicTone(false);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      setAiAnalysis({
        grammarIssues: [],
        vocabularyIssues: [],
        clarityIssues: [],
        styleIssues: [],
        spellingIssues: [],
        punctuationIssues: [],
        overallScore: 100
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [editor]);

  useEffect(() => {
    if(editor && aiAnalysis) {
        const { state, view } = editor;
        const { tr } = state;
        const currentText = editor.getText();

        // Clear previous highlights first
        tr.removeMark(0, state.doc.content.size, editor.schema.marks.suggestionMark);
        
        const allIssues = [
          ...(aiAnalysis.grammarIssues || []),
          ...(aiAnalysis.spellingIssues || []),
          ...(aiAnalysis.vocabularyIssues || []),
          ...(aiAnalysis.clarityIssues || []),
          ...(aiAnalysis.styleIssues || []),
          ...(aiAnalysis.punctuationIssues || []),
        ].filter(issue => !dismissedSuggestions.has(issue.id));

        // Apply new highlights using text-based approach for consistency
        allIssues.forEach(issue => {
          if (issue.originalText) {
            const originalIndex = currentText.indexOf(issue.originalText);
            if (originalIndex !== -1) {
              const from = originalIndex + 1;
              const to = from + issue.originalText.length;
              
              if (from >= 1 && to >= 1 && to <= editor.state.doc.content.size) {
                tr.addMark(from, to, editor.schema.marks.suggestionMark.create({ 'data-suggestion-type': issue.type }));
              }
            }
          } else if (issue.position && issue.position.start !== undefined && issue.position.end !== undefined) {
            // Fallback to position-based highlighting
            const from = issue.position.start + 1;
            const to = issue.position.end + 1;
      
            if (from >= 1 && to >= 1 && to <= editor.state.doc.content.size) {
              tr.addMark(from, to, editor.schema.marks.suggestionMark.create({ 'data-suggestion-type': issue.type }));
            }
          }
        });
        view.dispatch(tr);
    }
  }, [aiAnalysis, editor, dismissedSuggestions]);
  
  useEffect(() => {
    if (editor) {
        editorRef.current = editor;
        
        // Only set default content if no content exists and no document is being loaded
        const docId = searchParams.get('id')
        if (!docId && !content) {
          editor.commands.setContent('<p>Start writing your document here...</p>')
        }
        
        analyzeContentWithAI(editor.getText());
    }
  }, [editor]);

    const handleAcceptSuggestion = (issue: Suggestion) => {
    if (!editor) return;

    let replacement = issue.suggestions[0] || '';
    
    console.log(`🎯 Accepting suggestion: "${issue.originalText}" → "${replacement}"`);
    
    // Mark suggestion as dismissed immediately to remove it from UI
    setDismissedSuggestions(prev => new Set([...prev, issue.id]));
    
    // For academic tone suggestions, also dismiss them from the academic tone list
    if (issue.type === 'academic_tone' || issue.isAcademicTone) {
      setAcademicToneSuggestions(prev => prev.filter(s => s.id !== issue.id));
      
      // Use semantic key for dismissal if available
      if (issue.semanticKey) {
        dismissedSuggestionKeysRef.current.add(issue.semanticKey);
        console.log(`🔑 Added semantic dismissal key: ${issue.semanticKey}`);
      }
      
      // Also create content-based dismissal key for backward compatibility
      const contentKey = `${issue.type}:${issue.originalText}:${issue.message}`;
      dismissedSuggestionKeysRef.current.add(contentKey);
      console.log(`📝 Added content dismissal key: ${contentKey}`);
      
      // Smart punctuation handling for academic tone
      const currentText = editor.getText();
      const originalInContext = issue.originalText;
      const contextBeforeOriginal = currentText.substring(0, currentText.indexOf(originalInContext));
      const contextAfterOriginal = currentText.substring(currentText.indexOf(originalInContext) + originalInContext.length);
      
      // Check if there's already punctuation after the original text in context
      const hasTrailingPunctuation = contextAfterOriginal.match(/^[.!?]/);
      
      // If there's already punctuation in the context, remove it from our replacement
      if (hasTrailingPunctuation && replacement.match(/[.!?]$/)) {
        replacement = replacement.replace(/[.!?]+$/, '');
        console.log(`🔧 Removed duplicate punctuation to prevent: "${replacement}"`);
      }
    }
    
    // Apply the text replacement
    if (issue.originalText && replacement) {
      const currentText = editor.getText();
      
      // Find and replace the text while preserving HTML structure
      if (currentText.includes(issue.originalText)) {
        // Use position-based replacement for precision
        const textContent = editor.getText();
        const startIndex = textContent.indexOf(issue.originalText);
        
        if (startIndex !== -1) {
          const from = startIndex + 1; // TipTap uses 1-based indexing
          const to = from + issue.originalText.length;
          
          // Use TipTap's built-in text replacement
          editor.chain()
            .focus()
            .setTextSelection({ from, to })
            .insertContent(replacement)
            .run();
            
          console.log(`✅ Successfully applied suggestion: "${issue.originalText}" → "${replacement}"`);
          
          // The suggestion will disappear from UI due to dismissedSuggestions state
          // Other suggestions will remain visible
          // The highlighting will be updated automatically by the useEffect
        }
      }
    } else if (issue.position && replacement) {
      // Use position-based replacement
      const from = issue.position.start + 1;
      const to = issue.position.end + 1;
      
      if (from >= 1 && to >= 1 && to <= editor.state.doc.content.size) {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent(replacement)
          .run();
          
        console.log(`✅ Successfully applied suggestion (position-based): "${issue.originalText}" → "${replacement}"`);
      }
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    // Find the suggestion being dismissed to get its content
    const allIssues = [
      ...(aiAnalysis?.grammarIssues || []),
      ...(aiAnalysis?.spellingIssues || []),
      ...(aiAnalysis?.vocabularyIssues || []),
      ...(aiAnalysis?.clarityIssues || []),
      ...(aiAnalysis?.styleIssues || []),
      ...(aiAnalysis?.punctuationIssues || []),
      ...academicToneSuggestions, // Include academic tone suggestions
    ];
    
    const suggestionToDismiss = allIssues.find(issue => issue.id === suggestionId);
    
    if (suggestionToDismiss) {
      // Use semantic key for dismissal if available
      if (suggestionToDismiss.semanticKey) {
        dismissedSuggestionKeysRef.current.add(suggestionToDismiss.semanticKey);
        console.log(`🔑 Permanently dismissed suggestion with semantic key: "${suggestionToDismiss.semanticKey}"`);
      }
      
      // Also create a content-based key for backward compatibility
      const contentKey = `${suggestionToDismiss.type}:${suggestionToDismiss.originalText}:${suggestionToDismiss.message}`;
      dismissedSuggestionKeysRef.current.add(contentKey);
      console.log(`📝 Permanently dismissed suggestion: "${contentKey}"`);
      console.log('All dismissed keys:', Array.from(dismissedSuggestionKeysRef.current));
      
      // For academic tone suggestions, also remove them from the academic tone list
      if (suggestionToDismiss.type === 'academic_tone' || suggestionToDismiss.isAcademicTone) {
        setAcademicToneSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      }
    }
    
    // Also add to the ID-based set for immediate UI updates
    setDismissedSuggestions(prev => new Set(prev).add(suggestionId));
  };
  
  const getFilteredIssues = (issues: Suggestion[] = []) => issues.filter(issue => !dismissedSuggestions.has(issue.id));

  const renderSuggestionBlock = (issue: Suggestion) => {
    const typeStyles: Record<string, { icon: React.ReactElement; borderColor: string; titleColor: string }> = {
        grammar: { icon: <AlertCircle className="h-4 w-4 text-red-500" />, borderColor: 'border-red-500/50', titleColor: 'text-red-800 dark:text-red-200' },
        spelling: { icon: <Type className="h-4 w-4 text-yellow-500" />, borderColor: 'border-yellow-500/50', titleColor: 'text-yellow-800 dark:text-yellow-200' },
        vocabulary: { icon: <Palette className="h-4 w-4 text-green-500" />, borderColor: 'border-green-500/50', titleColor: 'text-green-800 dark:text-green-200' },
        clarity: { icon: <Lightbulb className="h-4 w-4 text-blue-500" />, borderColor: 'border-blue-500/50', titleColor: 'text-blue-800 dark:text-blue-200' },
        style: { icon: <CheckCircle className="h-4 w-4 text-purple-500" />, borderColor: 'border-purple-500/50', titleColor: 'text-purple-800 dark:text-purple-200' },
        punctuation: { icon: <AlertCircle className="h-4 w-4 text-orange-500" />, borderColor: 'border-orange-500/50', titleColor: 'text-orange-800 dark:text-orange-200' },
    };
    const styles = typeStyles[issue.type] || typeStyles.clarity;

    return (
      <div key={issue.id} className={`p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 ${styles.borderColor} mb-2`}>
        <div className={`flex items-start font-semibold text-sm ${styles.titleColor} mb-2`}>
            <span className="mr-2">{styles.icon}</span>
            <span>{issue.message}</span>
        </div>
        {issue.originalText && issue.suggestions && issue.suggestions[0] && (
          <div className="text-xs text-gray-600 dark:text-gray-400 pl-6 mb-2">
            Change <span className="font-mono bg-gray-200 dark:bg-gray-700 p-0.5 rounded">"{issue.originalText}"</span> to <span className="font-mono bg-gray-200 dark:bg-gray-700 p-0.5 rounded">"{issue.suggestions[0]}"</span>
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
  
  const renderIssueSection = (title: string, issues: Suggestion[] = [], icon: React.ReactNode) => {
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
      ...getFilteredIssues(aiAnalysis.punctuationIssues),
  ] : []).length;

  // Load document if ID is provided in URL
  useEffect(() => {
    const docId = searchParams.get('id')
    if (docId && editor) {
      try {
        const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]')
        const document = existingDocs.find((doc: any) => doc.id === docId)
        
        if (document) {
          console.log('Loading document:', document.title)
          setTitle(document.title)
          setContent(document.content)
          editor.commands.setContent(document.content) // Set editor content
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
  }, [searchParams, editor, analyzeContentWithAI])

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !content || content.trim() === '' || content === '<p></p>') {
      console.log('No content to save')
      return
    }

    const timer = setTimeout(() => {
      const existingDocId = searchParams.get('id')
      const docId = existingDocId || `doc_${Date.now()}`
      const documentTitle = title.trim() || 'Untitled Document'
      const textContent = editor.getText()
      
      const documentData = {
        id: docId,
        title: documentTitle,
        content: content,
        createdAt: existingDocId ? undefined : new Date().toISOString(), // Only set createdAt for new docs
        updatedAt: new Date().toISOString(),
        wordCount: textContent.split(/\s+/).filter(Boolean).length,
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
  }, [content, title, editor, searchParams])

  const handleSave = async () => {
    if (!editor || (!content.trim() && !title.trim()) || content === '<p></p>') return
    
    setIsAutoSaving(true)
    try {
      const existingDocId = searchParams.get('id')
      const docId = existingDocId || `doc_${Date.now()}`
      const documentTitle = title.trim() || 'Untitled Document'
      const textContent = editor.getText()
      
      const documentData = {
        id: docId,
        title: documentTitle,
        content: content,
        createdAt: existingDocId ? undefined : new Date().toISOString(), // Only set createdAt for new docs
        updatedAt: new Date().toISOString(),
        wordCount: textContent.split(/\s+/).filter(Boolean).length,
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

  const handleExportPDF = async () => {
    if (!editor) return;
    
    try {
      setShowExportMenu(false);
      
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating PDF...';
      loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);
      
      const htmlContent = editor.getHTML();
      const author = user?.email || 'WordWise AI User';
      
      await PDFExportService.exportToPDF({
        title: title || 'Untitled Document',
        content: htmlContent,
        author: author,
        includeMetadata: true,
        includeWordCount: true,
        fontSize: fontSize,
        lineSpacing: 1.5
      });
      
      // Remove loading toast and show success
      document.body.removeChild(loadingToast);
      
      const successToast = document.createElement('div');
      successToast.textContent = '✅ PDF exported successfully!';
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      
      const errorToast = document.createElement('div');
      errorToast.textContent = '❌ PDF export failed. Please try again.';
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  }

  const handleExportWord = async () => {
    if (!editor) return;
    
    try {
      setShowExportMenu(false);
      
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating Word document...';
      loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);
      
      const htmlContent = editor.getHTML();
      const author = user?.email || 'WordWise AI User';
      
      await WordExportService.exportToWordWithFormatting({
        title: title || 'Untitled Document',
        content: htmlContent,
        author: author,
        includeMetadata: true,
        includeWordCount: true,
        fontSize: fontSize
      });
      
      // Remove loading toast and show success
      document.body.removeChild(loadingToast);
      
      const successToast = document.createElement('div');
      successToast.textContent = '✅ Word document (RTF) exported successfully!';
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Word export failed:', error);
      
      const errorToast = document.createElement('div');
      errorToast.textContent = '❌ Word export failed. Please try again.';
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  }

  const handleExportAnalytics = async () => {
    if (!editor || !aiAnalysis) return;
    
    try {
      setShowExportMenu(false);
      
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating Analytics PDF...';
      loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);
      
      const htmlContent = editor.getHTML();
      const textContent = editor.getText();
      const author = user?.email || 'WordWise AI User';
      
      // Collect all suggestions for analytics
      const allSuggestions = [
        ...(aiAnalysis.grammarIssues || []),
        ...(aiAnalysis.spellingIssues || []),
        ...(aiAnalysis.vocabularyIssues || []),
        ...(aiAnalysis.clarityIssues || []),
        ...(aiAnalysis.styleIssues || []),
        ...(aiAnalysis.punctuationIssues || [])
      ];
      
      // Calculate analytics
      const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
      const sentenceCount = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const avgWordsPerSentence = Math.round(wordCount / Math.max(sentenceCount, 1));
      const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
      
      await PDFExportService.exportWithAnalytics({
        title: title || 'Untitled Document',
        content: htmlContent,
        author: author,
        writingScore: aiAnalysis.overallScore,
        suggestions: allSuggestions.map(s => ({
          type: s.type,
          message: s.message,
          originalText: s.originalText || ''
        })),
        analytics: {
          readingTime: `${readingTime} minute${readingTime !== 1 ? 's' : ''}`,
          sentenceCount,
          avgWordsPerSentence
        },
        includeMetadata: true,
        includeWordCount: true,
        fontSize: fontSize,
        lineSpacing: 1.5
      });
      
      // Remove loading toast and show success
      document.body.removeChild(loadingToast);
      
      const successToast = document.createElement('div');
      successToast.textContent = '✅ Analytics PDF exported successfully!';
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Analytics PDF export failed:', error);
      
      const errorToast = document.createElement('div');
      errorToast.textContent = '❌ Analytics export failed. Please try again.';
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  }

  const handleExportWordAnalytics = async () => {
    if (!editor || !aiAnalysis) return;
    
    try {
      setShowExportMenu(false);
      
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating Analytics Word document...';
      loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);
      
      const htmlContent = editor.getHTML();
      const textContent = editor.getText();
      const author = user?.email || 'WordWise AI User';
      
      // Collect all suggestions for analytics
      const allSuggestions = [
        ...(aiAnalysis.grammarIssues || []),
        ...(aiAnalysis.spellingIssues || []),
        ...(aiAnalysis.vocabularyIssues || []),
        ...(aiAnalysis.clarityIssues || []),
        ...(aiAnalysis.styleIssues || []),
        ...(aiAnalysis.punctuationIssues || [])
      ];
      
      // Calculate analytics
      const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
      const sentenceCount = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const avgWordsPerSentence = Math.round(wordCount / Math.max(sentenceCount, 1));
      const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
      
      await WordExportService.exportWithAnalytics({
        title: title || 'Untitled Document',
        content: htmlContent,
        author: author,
        writingScore: aiAnalysis.overallScore,
        suggestions: allSuggestions.map(s => ({
          type: s.type,
          message: s.message,
          originalText: s.originalText || ''
        })),
        analytics: {
          readingTime: `${readingTime} minute${readingTime !== 1 ? 's' : ''}`,
          sentenceCount,
          avgWordsPerSentence
        },
        includeMetadata: true,
        includeWordCount: true,
        fontSize: fontSize
      });
      
      // Remove loading toast and show success
      document.body.removeChild(loadingToast);
      
      const successToast = document.createElement('div');
      successToast.textContent = '✅ Analytics Word document (RTF) exported successfully!';
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Analytics Word export failed:', error);
      
      const errorToast = document.createElement('div');
      errorToast.textContent = '❌ Analytics Word export failed. Please try again.';
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
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

  // Function to reset suggestion tracking
  const resetSuggestionTracking = useCallback(() => {
    dismissedSuggestionKeysRef.current.clear();
    setDismissedSuggestions(new Set());
    lastAnalyzedTextRef.current = '';
    setAiAnalysis(null);
    setAcademicToneSuggestions([]);
    console.log('Reset all suggestion tracking (dismissed and analysis)');
  }, []);

  // Academic tone analysis function - trigger re-analysis with focus on academic tone
  const analyzeAcademicTone = useCallback(async () => {
    const text = editor?.getText();
    if (!text?.trim()) return;

    setIsAnalyzingTone(true);
    try {
      // Clear previous analysis to force re-analysis
      lastAnalyzedTextRef.current = '';
      await analyzeContentWithAI(text);
      
      // If no academic tone suggestions, show panel with encouragement
      setTimeout(() => {
        setShowAcademicTone(true);
      }, 100);
    } catch (error) {
      console.error('Academic tone analysis failed:', error);
    } finally {
      setIsAnalyzingTone(false);
    }
  }, [editor, analyzeContentWithAI]);

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
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </button>
                  {aiAnalysis && (
                    <button
                      onClick={handleExportAnalytics}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Export PDF with Analytics
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      analyzeAcademicTone();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Brain className="h-4 w-4 mr-2 text-blue-500" />
                    Check Academic Tone
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Word (.rtf)
                  </button>
                  {aiAnalysis && (
                    <button
                      onClick={handleExportWordAnalytics}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Export Word with Analytics
                    </button>
                  )}
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
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleMark('underline').run()} className={editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}><UnderlineIcon className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}><List className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}><ListOrdered className="h-4 w-4"/></Button>
                        <div className="border-l border-gray-300 dark:border-gray-600 mx-2 h-6"></div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={analyzeAcademicTone}
                          disabled={isAnalyzingTone}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          {isAnalyzingTone ? <Loader className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                          <span className="ml-1 text-xs">Academic Tone</span>
                        </Button>
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
                            {renderIssueSection("Punctuation Issues", aiAnalysis?.punctuationIssues, <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />)}
                            {renderIssueSection("Vocabulary", aiAnalysis?.vocabularyIssues, <Palette className="h-4 w-4 text-green-500 mr-2" />)}
                            {renderIssueSection("Clarity", aiAnalysis?.clarityIssues, <Lightbulb className="h-4 w-4 text-blue-500 mr-2" />)}
                            {renderIssueSection("Style", aiAnalysis?.styleIssues, <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />)}
                        </>
                    )}
                    </div>
                  </div>

                  {/* Academic Tone Guidance Panel */}
                  {showAcademicTone && (
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Brain className="h-5 w-5 text-blue-500 mr-2" />
                          Academic Tone Guidance
                          {isAnalyzingTone && <Loader className="h-4 w-4 ml-2 animate-spin" />}
                        </h3>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setShowAcademicTone(false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
              </div>

                      <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                        {academicToneSuggestions.length === 0 && !isAnalyzingTone ? (
                          <div className="text-center py-6">
                            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                            <p className="font-medium text-green-600 dark:text-green-400">
                              Great academic tone! Your writing maintains appropriate formality.
                            </p>
                    </div>
                        ) : (
                          academicToneSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                                  {suggestion.message}
                                </h4>
                                <div className="flex space-x-1">
                                  <Button
                                    size="xs"
                                    onClick={() => handleAcceptSuggestion(suggestion)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleRejectSuggestion(suggestion.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  This is your sentence formalized and with better academic tone:
                                </div>
                                
                                {suggestion.originalText && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Original:</span>
                                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-400 px-3 py-2 mt-1 text-sm italic">
                                      "{suggestion.originalText}"
                                    </div>
                                  </div>
                                )}
                                
                                {suggestion.suggestions && suggestion.suggestions.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Suggested:</span>
                                    <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-400 px-3 py-2 mt-1 text-sm font-medium">
                                      "{suggestion.suggestions[0]}"
                                    </div>
                                  </div>
                                )}
                                
                                {suggestion.explanation && (
                                  <div className="bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    <div className="font-medium mb-1">Why this improves your writing:</div>
                                    <div className="whitespace-pre-line">{suggestion.explanation}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
              </div>
                    </div>
                    </div>
                    </div>
                  </div>
  );
}; 