import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '../components/ui/Button'
import { 
  Bold, 
  Italic, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb
} from 'lucide-react'
import { OpenAIService } from '../services/openaiService'

export const Demo: React.FC = () => {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h2>Welcome to WordWise AI Demo!</h2>
      <p>Try our advanced grammar and style checker right here - no signup required!</p>
      <p>This sentence have a grammar error. Its also missing some punctuation The AI will catch these issues and many more!</p>
      <p><strong>Features you can test:</strong></p>
      <ul>
        <li>Real-time grammar checking</li>
        <li>Vocabulary enhancement suggestions</li>
        <li>Style and clarity improvements</li>
      </ul>
      <p>Click "Analyze Text" to see detailed feedback!</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  const openaiService = new OpenAIService()

  const handleAnalyze = async () => {
    if (!editor) return
    
    const content = editor.getText()
    if (content.length < 10) return

    setIsAnalyzing(true)
    try {
      const result = await openaiService.analyzeText(content)
      setAnalysis(result)
      const allSuggestions = [
        ...result.grammarIssues,
        ...result.vocabularyIssues,
        ...result.clarityIssues,
        ...result.styleIssues,
        ...result.spellingIssues
      ]
      setSuggestions(allSuggestions)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">WordWise AI</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">DEMO</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/register'}
                className="hidden sm:flex"
              >
                Sign Up for Full Access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}>
                    <Bold className="h-4 w-4"/>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}>
                    <Italic className="h-4 w-4"/>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <EditorContent 
                  editor={editor} 
                  className="min-h-[500px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                AI Analysis
              </h3>

              {analysis ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {analysis.overallScore}/100
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grammar</span>
                      <span className="text-sm font-medium">{Math.max(0, 100 - analysis.grammarIssues.length * 10)}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vocabulary</span>
                      <span className="text-sm font-medium">{Math.max(0, 100 - analysis.vocabularyIssues.length * 6)}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clarity</span>
                      <span className="text-sm font-medium">{Math.max(0, 100 - analysis.clarityIssues.length * 4)}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Style</span>
                      <span className="text-sm font-medium">{Math.max(0, 100 - analysis.styleIssues.length * 2)}/100</span>
                    </div>
                  </div>

                  {suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {suggestions.slice(0, 5).map((suggestion, index) => (
                          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                            <div className="flex items-center mb-1">
                              {suggestion.type === 'grammar' && <AlertCircle className="h-3 w-3 text-red-500 mr-1" />}
                              {suggestion.type === 'vocabulary' && <Lightbulb className="h-3 w-3 text-purple-500 mr-1" />}
                              {suggestion.type === 'style' && <Info className="h-3 w-3 text-blue-500 mr-1" />}
                              {suggestion.type === 'spelling' && <CheckCircle className="h-3 w-3 text-green-500 mr-1" />}
                              <span className="font-medium capitalize">{suggestion.type}</span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                              {suggestion.suggestion}
                            </div>
                            {suggestion.replacement && (
                              <div className="mt-1 text-green-600 dark:text-green-400">
                                → {suggestion.replacement}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Start typing or click "Analyze Text" to see AI-powered suggestions!</p>
                </div>
              )}
            </div>

            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Demo Limitations</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• No document saving</li>
                <li>• Limited export options</li>
                <li>• Basic AI analysis</li>
              </ul>
              <Button 
                size="sm" 
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/register'}
              >
                Unlock Full Features
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 