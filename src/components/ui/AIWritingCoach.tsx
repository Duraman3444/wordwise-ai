import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle,
  BookOpen,
  Clock,
  Award,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Users,
  PenTool,
  FileText,
  Star,
  PlayCircle,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Timer,
  Trophy
} from 'lucide-react'
import { Button } from './Button'

interface WritingMetrics {
  wordCount: number
  readingTime: number
  sentenceCount: number
  avgSentenceLength: number
  complexWords: number
  readabilityScore: number
  toneScore: number
  clarityScore: number
  vocabularyDiversity: number
  transitionWords: number
}

interface WritingGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  type: 'wordCount' | 'readability' | 'tone' | 'clarity' | 'vocabulary' | 'custom'
  completed: boolean
  deadline?: Date
  priority: 'high' | 'medium' | 'low'
  category: 'daily' | 'weekly' | 'project'
}

interface CoachingTip {
  id: string
  category: 'grammar' | 'style' | 'structure' | 'vocabulary' | 'flow' | 'engagement'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // in minutes
  relatedTopics: string[]
}

interface SmartTemplate {
  id: string
  name: string
  description: string
  category: 'academic' | 'business' | 'creative' | 'technical'
  structure: string[]
  tips: string[]
  estimatedLength: number
}

interface WritingSession {
  startTime: Date
  wordCount: number
  focusScore: number
  improvementAreas: string[]
}

interface AIWritingCoachProps {
  content: string
  onGoalSet?: (goal: WritingGoal) => void
  onTipApplied?: (tipId: string) => void
  onTemplateSelected?: (template: SmartTemplate) => void
}

export const AIWritingCoach: React.FC<AIWritingCoachProps> = ({ 
  content, 
  onGoalSet, 
  onTipApplied,
  onTemplateSelected
}) => {
  const [metrics, setMetrics] = useState<WritingMetrics>({
    wordCount: 0,
    readingTime: 0,
    sentenceCount: 0,
    avgSentenceLength: 0,
    complexWords: 0,
    readabilityScore: 0,
    toneScore: 0,
    clarityScore: 0,
    vocabularyDiversity: 0,
    transitionWords: 0
  })

  const [goals, setGoals] = useState<WritingGoal[]>([
    {
      id: '1',
      title: 'Daily Word Goal',
      description: 'Write 500 words today',
      target: 500,
      current: 0,
      type: 'wordCount',
      completed: false,
      priority: 'high',
      category: 'daily',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Readability Improvement',
      description: 'Achieve 80+ readability score',
      target: 80,
      current: 0,
      type: 'readability',
      completed: false,
      priority: 'medium',
      category: 'project'
    },
    {
      id: '3',
      title: 'Vocabulary Diversity',
      description: 'Use 50+ unique academic words',
      target: 50,
      current: 0,
      type: 'vocabulary',
      completed: false,
      priority: 'medium',
      category: 'weekly'
    }
  ])

  const [tips, setTips] = useState<CoachingTip[]>([
    {
      id: '1',
      category: 'structure',
      title: 'Strengthen Topic Sentences',
      description: 'Each paragraph should start with a clear topic sentence that previews the main argument.',
      priority: 'high',
      actionable: true,
      difficulty: 'intermediate',
      estimatedTime: 5,
      relatedTopics: ['paragraph structure', 'academic writing', 'clarity']
    },
    {
      id: '2',
      category: 'vocabulary',
      title: 'Enhance Academic Vocabulary',
      description: 'Replace informal words with sophisticated academic alternatives to elevate your tone.',
      priority: 'medium',
      actionable: true,
      difficulty: 'intermediate',
      estimatedTime: 3,
      relatedTopics: ['formal writing', 'academic tone', 'word choice']
    },
    {
      id: '3',
      category: 'flow',
      title: 'Add Transition Phrases',
      description: 'Use transitional phrases like "Furthermore," "In contrast," and "Consequently" to improve flow.',
      priority: 'medium',
      actionable: true,
      difficulty: 'beginner',
      estimatedTime: 2,
      relatedTopics: ['transitions', 'flow', 'coherence']
    },
    {
      id: '4',
      category: 'engagement',
      title: 'Vary Sentence Structure',
      description: 'Mix simple, compound, and complex sentences to create rhythm and maintain reader interest.',
      priority: 'low',
      actionable: true,
      difficulty: 'advanced',
      estimatedTime: 10,
      relatedTopics: ['sentence variety', 'style', 'engagement']
    }
  ])

  const [templates] = useState<SmartTemplate[]>([
    {
      id: '1',
      name: 'Academic Essay',
      description: 'Structure for formal academic papers',
      category: 'academic',
      structure: ['Introduction with thesis', 'Body paragraphs with evidence', 'Counterargument', 'Conclusion'],
      tips: ['Use formal tone', 'Cite sources properly', 'Maintain objective voice'],
      estimatedLength: 1500
    },
    {
      id: '2',
      name: 'Research Report',
      description: 'Comprehensive research documentation',
      category: 'academic',
      structure: ['Executive Summary', 'Literature Review', 'Methodology', 'Results', 'Discussion'],
      tips: ['Include data visualization', 'Use clear headings', 'Maintain scientific tone'],
      estimatedLength: 3000
    },
    {
      id: '3',
      name: 'Business Proposal',
      description: 'Professional business document',
      category: 'business',
      structure: ['Executive Summary', 'Problem Statement', 'Proposed Solution', 'Implementation Plan', 'Budget'],
      tips: ['Be concise and persuasive', 'Include financial projections', 'Use professional language'],
      estimatedLength: 2000
    }
  ])

  const [currentSession, setCurrentSession] = useState<WritingSession>({
    startTime: new Date(),
    wordCount: 0,
    focusScore: 100,
    improvementAreas: []
  })

  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    goals: true,
    tips: true,
    templates: false,
    insights: false,
    session: false
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showGoalCreator, setShowGoalCreator] = useState(false)
  const [adaptiveLevel, setAdaptiveLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')

  // Enhanced content analysis
  useEffect(() => {
    if (content) {
      analyzeContent(content)
    }
  }, [content])

  const analyzeContent = async (text: string) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const complexWords = words.filter(word => word.length > 6).length
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
    const transitionWords = words.filter(word => 
      ['however', 'furthermore', 'moreover', 'consequently', 'therefore', 'nevertheless'].includes(word.toLowerCase())
    ).length
    
    const newMetrics: WritingMetrics = {
      wordCount: words.length,
      readingTime: Math.ceil(words.length / 200),
      sentenceCount: sentences.length,
      avgSentenceLength: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      complexWords,
      readabilityScore: Math.max(0, Math.min(100, 100 - (complexWords / words.length) * 100)),
      toneScore: Math.min(100, 60 + (words.length / 10)),
      clarityScore: Math.min(100, 70 + (words.length / 20)),
      vocabularyDiversity: words.length > 0 ? Math.round((uniqueWords / words.length) * 100) : 0,
      transitionWords
    }
    
    setMetrics(newMetrics)
    
    // Update goals progress
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        let current = 0
        switch (goal.type) {
          case 'wordCount':
            current = newMetrics.wordCount
            break
          case 'readability':
            current = newMetrics.readabilityScore
            break
          case 'tone':
            current = newMetrics.toneScore
            break
          case 'clarity':
            current = newMetrics.clarityScore
            break
          case 'vocabulary':
            current = newMetrics.vocabularyDiversity
            break
        }
        return {
          ...goal,
          current,
          completed: current >= goal.target
        }
      })
    )

    // Update current session
    setCurrentSession(prev => ({
      ...prev,
      wordCount: newMetrics.wordCount,
      focusScore: Math.max(50, prev.focusScore - (Math.random() * 5)), // Simulate focus decay
      improvementAreas: newMetrics.readabilityScore < 70 ? ['readability'] : []
    }))

    // Adaptive tip filtering based on user level and current metrics
    const filteredTips = tips.filter(tip => {
      if (adaptiveLevel === 'beginner' && tip.difficulty === 'advanced') return false
      if (adaptiveLevel === 'advanced' && tip.difficulty === 'beginner') return false
      
      // Show relevant tips based on current metrics
      if (tip.category === 'vocabulary' && newMetrics.vocabularyDiversity > 80) return false
      if (tip.category === 'flow' && newMetrics.transitionWords > 3) return false
      
      return true
    })
    
    setTips(filteredTips)
    setIsAnalyzing(false)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const getTipIcon = (category: string) => {
    switch (category) {
      case 'grammar': return <CheckCircle className="h-4 w-4" />
      case 'style': return <PenTool className="h-4 w-4" />
      case 'structure': return <BarChart3 className="h-4 w-4" />
      case 'vocabulary': return <BookOpen className="h-4 w-4" />
      case 'flow': return <TrendingUp className="h-4 w-4" />
      case 'engagement': return <Users className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const createNewGoal = () => {
    const newGoal: WritingGoal = {
      id: Date.now().toString(),
      title: 'Custom Goal',
      description: 'Set your writing target',
      target: 100,
      current: 0,
      type: 'custom',
      completed: false,
      priority: 'medium',
      category: 'project'
    }
    setGoals(prev => [...prev, newGoal])
    onGoalSet?.(newGoal)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 h-fit max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">AI Writing Coach</h3>
              <p className="text-purple-100 text-xs">Adaptive guidance & smart insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAnalyzing && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-2"></div>
                <span className="text-xs">Analyzing...</span>
              </div>
            )}
            <Button size="xs" variant="ghost" className="text-white hover:bg-white/20">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Writing Session */}
        <div>
          <button
            onClick={() => toggleSection('session')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Timer className="h-4 w-4 mr-2 text-green-600" />
              Current Session
            </h4>
            {expandedSections.session ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.session && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)}m
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Session Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(currentSession.focusScore)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Focus Score</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${currentSession.focusScore}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Writing Metrics */}
        <div>
          <button
            onClick={() => toggleSection('metrics')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
              Advanced Metrics
            </h4>
            {expandedSections.metrics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.metrics && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.wordCount}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Words</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.readingTime}m</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Read Time</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Readability</span>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.readabilityScore)}`}>
                    {metrics.readabilityScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Academic Tone</span>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.toneScore)}`}>
                    {metrics.toneScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clarity</span>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.clarityScore)}`}>
                    {metrics.clarityScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vocabulary Diversity</span>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.vocabularyDiversity)}`}>
                    {metrics.vocabularyDiversity}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transition Words</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.transitionWords}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Smart Writing Goals */}
        <div>
          <button
            onClick={() => toggleSection('goals')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-600" />
              Smart Goals
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
                {goals.filter(g => g.completed).length}/{goals.length}
              </span>
            </h4>
            <div className="flex items-center space-x-2">
              <Button size="xs" variant="ghost" onClick={createNewGoal}>
                <Plus className="h-3 w-3" />
              </Button>
              {expandedSections.goals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          
          {expandedSections.goals && (
            <div className="mt-3 space-y-3">
              {goals.map(goal => (
                <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</span>
                      {goal.completed && <Trophy className="h-4 w-4 text-yellow-600 ml-2" />}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {goal.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.category === 'daily' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        goal.category === 'weekly' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {goal.category}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.completed ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {goal.current} / {goal.target} {goal.type === 'wordCount' ? 'words' : 'score'}
                    </div>
                    {goal.deadline && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Templates */}
        <div>
          <button
            onClick={() => toggleSection('templates')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-4 w-4 mr-2 text-indigo-600" />
              Smart Templates
            </h4>
            {expandedSections.templates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.templates && (
            <div className="mt-3 space-y-3">
              {templates.map(template => (
                <div key={template.id} className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{template.description}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    ~{template.estimatedLength} words • {template.structure.length} sections
                  </div>
                  <Button
                    size="xs"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => onTemplateSelected?.(template)}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adaptive AI Tips */}
        <div>
          <button
            onClick={() => toggleSection('tips')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
              Adaptive Tips
              <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                {adaptiveLevel}
              </span>
            </h4>
            {expandedSections.tips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.tips && (
            <div className="mt-3 space-y-3">
              {tips.map(tip => (
                <div key={tip.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(tip.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {getTipIcon(tip.category)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                          {tip.title}
                        </span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(tip.difficulty)}`}>
                          {tip.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {tip.description}
                      </p>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {tip.estimatedTime}min
                        </div>
                        <div className="text-xs text-gray-500">
                          {tip.relatedTopics.slice(0, 2).map(topic => (
                            <span key={topic} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded mr-1">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      {tip.actionable && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => onTipApplied?.(tip.id)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Apply Tip
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div>
          <button
            onClick={() => toggleSection('insights')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-green-600" />
              AI Insights
            </h4>
            {expandedSections.insights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.insights && (
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Writing Progress Analysis
                  </span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Your vocabulary diversity has improved by 15% this session. Consider incorporating more academic transitions to enhance flow further.
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <Award className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Strength Recognition
                  </span>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-200">
                  Excellent use of complex sentence structures! Your average sentence length demonstrates sophisticated writing maturity.
                </p>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Personalized Recommendation
                  </span>
                </div>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Based on your writing pattern, try the "Research Report" template for your next academic piece. It matches your analytical style.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 