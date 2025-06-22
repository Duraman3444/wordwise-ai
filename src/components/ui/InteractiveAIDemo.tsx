import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Sparkles, Zap, CheckCircle, ArrowRight, Play, Pause } from 'lucide-react'
import { Button } from './Button'

interface DemoScenario {
  id: string
  title: string
  description: string
  originalText: string
  improvedText: string
  suggestions: Array<{
    type: 'grammar' | 'vocabulary' | 'clarity' | 'tone'
    text: string
    explanation: string
    color: string
  }>
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'grammar',
    title: 'Grammar Enhancement',
    description: 'Watch AI fix grammar errors in real-time',
    originalText: 'The student have been working on their essay since morning. They was struggling with verb tenses and don\'t know how to improve it.',
    improvedText: 'The student has been working on their essay since morning. They were struggling with verb tenses and didn\'t know how to improve it.',
    suggestions: [
      {
        type: 'grammar',
        text: 'have → has',
        explanation: 'Subject-verb agreement: "student" is singular',
        color: 'from-red-500 to-pink-500'
      },
      {
        type: 'grammar', 
        text: 'was → were',
        explanation: 'Plural subject "They" requires "were"',
        color: 'from-red-500 to-pink-500'
      },
      {
        type: 'grammar',
        text: 'don\'t → didn\'t',
        explanation: 'Past tense consistency with the narrative',
        color: 'from-red-500 to-pink-500'
      }
    ]
  },
  {
    id: 'vocabulary',
    title: 'Academic Vocabulary',
    description: 'See AI suggest sophisticated vocabulary',
    originalText: 'The research shows that climate change is a big problem. Many scientists think we need to do something about it soon.',
    improvedText: 'The research demonstrates that climate change constitutes a significant challenge. Numerous scientists advocate for immediate intervention to address this pressing issue.',
    suggestions: [
      {
        type: 'vocabulary',
        text: 'shows → demonstrates',
        explanation: 'More academic and precise verb choice',
        color: 'from-purple-500 to-indigo-500'
      },
      {
        type: 'vocabulary',
        text: 'big problem → significant challenge',
        explanation: 'Academic terminology for formal writing',
        color: 'from-purple-500 to-indigo-500'
      },
      {
        type: 'vocabulary',
        text: 'think → advocate',
        explanation: 'Stronger, more academic verb',
        color: 'from-purple-500 to-indigo-500'
      }
    ]
  },
  {
    id: 'tone',
    title: 'Academic Tone',
    description: 'Watch AI improve formality and tone',
    originalText: 'I think this theory is pretty cool and it makes a lot of sense. The author did a good job explaining things.',
    improvedText: 'This theory appears compelling and demonstrates logical coherence. The author provides a comprehensive and articulate explanation of the concepts.',
    suggestions: [
      {
        type: 'tone',
        text: 'Remove "I think"',
        explanation: 'Academic writing should be objective',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        type: 'tone',
        text: 'pretty cool → compelling',
        explanation: 'More formal and academic language',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        type: 'tone',
        text: 'did a good job → provides comprehensive',
        explanation: 'Academic precision and formality',
        color: 'from-blue-500 to-cyan-500'
      }
    ]
  }
]

export const InteractiveAIDemo: React.FC = () => {
  const navigate = useNavigate()
  const [currentScenario, setCurrentScenario] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showImproved, setShowImproved] = useState(false)
  const [typingIndex, setTypingIndex] = useState(0)

  const scenario = demoScenarios[currentScenario]

  useEffect(() => {
    if (isPlaying && typingIndex < scenario.originalText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(scenario.originalText.slice(0, typingIndex + 1))
        setTypingIndex(typingIndex + 1)
      }, 50)
      return () => clearTimeout(timeout)
    } else if (isPlaying && typingIndex >= scenario.originalText.length) {
      setTimeout(() => setShowSuggestions(true), 500)
    }
  }, [isPlaying, typingIndex, scenario.originalText])

  const startDemo = () => {
    setIsPlaying(true)
    setDisplayText('')
    setTypingIndex(0)
    setShowSuggestions(false)
    setShowImproved(false)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setDisplayText('')
    setTypingIndex(0)
    setShowSuggestions(false)
    setShowImproved(false)
  }

  const showImprovements = () => {
    setShowImproved(true)
  }

  const switchScenario = (index: number) => {
    setCurrentScenario(index)
    resetDemo()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Live AI Writing Demo</h3>
              <p className="text-purple-100 text-sm">Watch GPT-4 enhance writing in real-time</p>
            </div>
          </div>
          <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
            <Sparkles className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {demoScenarios.map((demo, index) => (
            <button
              key={demo.id}
              onClick={() => switchScenario(index)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                currentScenario === index
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{scenario.title}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{scenario.description}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={startDemo}
            disabled={isPlaying}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            {isPlaying ? 'Playing...' : 'Start Demo'}
          </Button>
          <Button
            onClick={resetDemo}
            variant="outline"
            className="border-gray-300 dark:border-gray-600"
          >
            Reset
          </Button>
        </div>

        {/* Writing Area */}
        <div className="space-y-4">
          {/* Original Text with Typing Effect */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">Original Text</h5>
              {isPlaying && (
                <div className="flex items-center text-purple-600 dark:text-purple-400">
                  <Brain className="h-4 w-4 mr-1 animate-pulse" />
                  <span className="text-sm">AI Analyzing...</span>
                </div>
              )}
            </div>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {displayText}
              {isPlaying && typingIndex < scenario.originalText.length && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          {showSuggestions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-blue-900 dark:text-blue-100">AI Suggestions</h5>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <Zap className="h-4 w-4 mr-1" />
                  <span className="text-sm">GPT-4 Analysis</span>
                </div>
              </div>
              <div className="space-y-2">
                {scenario.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${suggestion.color} text-white rounded-lg p-3 text-sm animate-slide-in`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="font-medium mb-1">{suggestion.text}</div>
                    <div className="text-white/90 text-xs">{suggestion.explanation}</div>
                  </div>
                ))}
              </div>
              <Button
                onClick={showImprovements}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Apply AI Suggestions
              </Button>
            </div>
          )}

          {/* Improved Text */}
          {showImproved && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-green-900 dark:text-green-100">AI-Enhanced Text</h5>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Improved</span>
                </div>
              </div>
              <div className="text-green-800 dark:text-green-200 leading-relaxed">
                {scenario.improvedText}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Experience this AI assistance in your own writing
          </div>
          <Button 
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            Try WordWise AI
          </Button>
        </div>
      </div>


    </div>
  )
} 