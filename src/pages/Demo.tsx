import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '../components/ui/Button'
import { InteractiveAIDemo } from '../components/ui/InteractiveAIDemo'
import { 
  Bold, 
  Italic, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Brain,
  Zap
} from 'lucide-react'
import { AIService } from '../services/ai'

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

  const handleAnalyze = async () => {
    if (!editor) return
    
    const content = editor.getText()
    if (content.length < 10) return

    setIsAnalyzing(true)
    try {
      const suggestions = await AIService.analyzeText(content, 'student', 'demo')
      // Convert AI service format to match expected format
      const result = {
        grammarIssues: suggestions.filter(s => s.type === 'grammar'),
        vocabularyIssues: suggestions.filter(s => s.type === 'vocabulary'),
        clarityIssues: suggestions.filter(s => s.type === 'clarity'),
        styleIssues: suggestions.filter(s => s.type === 'style'),
        spellingIssues: suggestions.filter(s => s.type === 'spelling'),
        overallScore: Math.max(0, 100 - suggestions.length * 5)
      }
      setAnalysis(result)
      setSuggestions(suggestions)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">WordWise AI</span>
                    <span className="px-3 py-1 text-xs bg-yellow-400 text-black rounded-full font-semibold">LIVE DEMO</span>
                  </div>
                  <p className="text-purple-100 text-sm">Experience GPT-4 powered writing assistance</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-white/20 rounded-full px-3 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/register'}
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium"
              >
                Get Full Access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-6 py-3 mb-6 shadow-lg">
            <Brain className="h-5 w-5 mr-2" />
            <span className="font-semibold">Watch AI in Action</span>
            <Zap className="h-4 w-4 ml-2" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See How AI Transforms Your Writing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Watch our GPT-4 powered AI analyze and enhance text in real-time. Then try the live editor below!
          </p>
        </div>
        
        <InteractiveAIDemo />
      </div>

      {/* AI Writing Coach Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3 mb-6">
              <Brain className="h-6 w-6 mr-3" />
              <span className="font-bold text-lg">NEW: AI Writing Coach</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Your Personal AI Writing Assistant
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Get real-time writing guidance, smart goal tracking, and personalized coaching powered by GPT-4
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Templates</h3>
              <p className="text-indigo-100 text-sm">
                Choose from academic essays, research reports, and business proposals with AI-guided structure
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Goal Tracking</h3>
              <p className="text-indigo-100 text-sm">
                Set writing goals and track progress with intelligent metrics and adaptive coaching
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Adaptive Tips</h3>
              <p className="text-indigo-100 text-sm">
                Receive personalized writing tips that adapt to your skill level and writing patterns
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center bg-yellow-400 text-black rounded-full px-4 py-2 mb-4 font-semibold">
              <Zap className="h-4 w-4 mr-2" />
              Available in Full Version Only
            </div>
            <p className="text-indigo-100 mb-6">
              The AI Writing Coach is part of our premium features. Sign up to unlock intelligent writing assistance!
            </p>
            <Button 
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3 shadow-lg transform transition-all duration-200 hover:scale-105"
              onClick={() => window.location.href = '/register'}
            >
              <Brain className="h-5 w-5 mr-2" />
              Get AI Writing Coach
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live Editor Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Try It Yourself - Live AI Editor
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Now it's your turn! Type or edit the text below and click "Analyze Text" to get AI-powered suggestions.
          </p>
        </div>

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
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white ml-4 shadow-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze with AI
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {/* AI Analysis Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Analysis</h3>
                    <p className="text-purple-100 text-xs">GPT-4 Powered Insights</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
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
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-medium mb-2">Ready for AI Analysis</p>
                    <p className="text-xs">Type in the editor or click "Analyze with AI" to see intelligent suggestions!</p>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center mr-2">
                    <Info className="h-3 w-3 text-white" />
                  </div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Demo Limitations</h4>
                </div>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 mb-4">
                  <li>• No document saving or cloud sync</li>
                  <li>• Limited AI analysis depth</li>
                  <li>• No export options or collaboration</li>
                  <li>• Basic suggestion types only</li>
                </ul>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                  onClick={() => window.location.href = '/register'}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Unlock Full AI Power
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 