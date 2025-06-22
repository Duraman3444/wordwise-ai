import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Award,
  Calendar,
  Clock,
  FileText,
  Zap,
  Eye,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { Button } from './Button'

interface WritingSession {
  id: string
  date: Date
  wordCount: number
  duration: number // in minutes
  errorsFound: number
  errorsFixed: number
  score: number
  focus: 'grammar' | 'vocabulary' | 'style' | 'clarity' | 'academic'
}

interface AnalyticsData {
  totalSessions: number
  totalWords: number
  totalTime: number
  averageScore: number
  improvementRate: number
  strongestArea: string
  weakestArea: string
  weeklyProgress: number[]
  errorTrends: {
    grammar: number[]
    vocabulary: number[]
    style: number[]
    clarity: number[]
  }
  dailyWriting: {
    date: string
    words: number
    score: number
  }[]
  achievements: {
    id: string
    title: string
    description: string
    earned: boolean
    date?: Date
  }[]
}

interface AnalyticsDashboardProps {
  currentContent?: string
  currentAnalysis?: any
  onExportReport?: () => void
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  currentContent = '',
  currentAnalysis,
  onExportReport
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'words' | 'errors'>('score')

  // Generate realistic analytics data
  const analyticsData = useMemo<AnalyticsData>(() => {
    const sessions: WritingSession[] = []
    const now = new Date()
    
    // Generate 30 days of sample data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      if (Math.random() > 0.3) { // 70% chance of writing on any given day
        sessions.push({
          id: `session-${i}`,
          date,
          wordCount: Math.floor(Math.random() * 800) + 200,
          duration: Math.floor(Math.random() * 90) + 15,
          errorsFound: Math.floor(Math.random() * 15) + 2,
          errorsFixed: Math.floor(Math.random() * 12) + 1,
          score: Math.floor(Math.random() * 30) + 70,
          focus: ['grammar', 'vocabulary', 'style', 'clarity', 'academic'][Math.floor(Math.random() * 5)] as any
        })
      }
    }

    const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0)
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0)
    const averageScore = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length : 0

    // Weekly progress (last 7 weeks)
    const weeklyProgress = []
    for (let week = 6; week >= 0; week--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (week * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekSessions = sessions.filter(s => s.date >= weekStart && s.date <= weekEnd)
      const weekScore = weekSessions.length > 0 ? 
        weekSessions.reduce((sum, s) => sum + s.score, 0) / weekSessions.length : 0
      weeklyProgress.push(Math.round(weekScore))
    }

    // Error trends
    const errorTrends = {
      grammar: [12, 10, 8, 6, 5, 4, 3],
      vocabulary: [8, 7, 6, 5, 4, 3, 2],
      style: [6, 5, 4, 4, 3, 2, 2],
      clarity: [4, 4, 3, 3, 2, 2, 1]
    }

    // Daily writing data
    const dailyWriting = sessions.slice(-7).map(session => ({
      date: session.date.toLocaleDateString('en-US', { weekday: 'short' }),
      words: session.wordCount,
      score: session.score
    }))

    return {
      totalSessions: sessions.length,
      totalWords,
      totalTime,
      averageScore: Math.round(averageScore),
      improvementRate: 23, // 23% improvement
      strongestArea: 'Academic Tone',
      weakestArea: 'Grammar',
      weeklyProgress,
      errorTrends,
      dailyWriting,
      achievements: [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first writing session',
          earned: true,
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Word Warrior',
          description: 'Write 1000 words in a single session',
          earned: true,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Grammar Guardian',
          description: 'Fix 50 grammar errors',
          earned: true,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: '4',
          title: 'Consistency King',
          description: 'Write for 7 consecutive days',
          earned: false
        },
        {
          id: '5',
          title: 'Perfect Score',
          description: 'Achieve a perfect 100 writing score',
          earned: false
        }
      ]
    }
  }, [timeRange])

  const refreshAnalytics = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400'
    if (value < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  // Simple bar chart component
  const SimpleBarChart = ({ data, color = 'bg-blue-500' }: { data: number[], color?: string }) => {
    const maxValue = Math.max(...data)
    return (
      <div className="flex items-end space-x-1 h-20">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 chart-bar`}
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-1">{value}</span>
          </div>
        ))}
      </div>
    )
  }

  // Simple line chart component
  const SimpleLineChart = ({ data, color = 'border-blue-500' }: { data: number[], color?: string }) => {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1

    return (
      <div className="relative h-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`${color.replace('border-', 'text-')} chart-line`}
            points={data.map((value, index) => 
              `${(index / (data.length - 1)) * 100},${100 - ((value - minValue) / range) * 100}`
            ).join(' ')}
          />
          {data.map((value, index) => (
            <circle
              key={index}
              cx={(index / (data.length - 1)) * 100}
              cy={100 - ((value - minValue) / range) * 100}
              r="2"
              className={color.replace('border-', 'fill-')}
            />
          ))}
        </svg>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Powered by GPT-4 • Real-time insights
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshAnalytics}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={onExportReport}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Writing Score</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analyticsData.averageScore}</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(12)}
                <span className={`text-sm ml-1 ${getChangeColor(12)}`}>+12% this week</span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Words</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.totalWords.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(8)}
                <span className={`text-sm ml-1 ${getChangeColor(8)}`}>+8% this week</span>
              </div>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Time Spent</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{Math.round(analyticsData.totalTime / 60)}h</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(15)}
                <span className={`text-sm ml-1 ${getChangeColor(15)}`}>+15% this week</span>
              </div>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Improvement</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analyticsData.improvementRate}%</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(5)}
                <span className={`text-sm ml-1 ${getChangeColor(5)}`}>+5% this week</span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Writing Progress Chart */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-blue-500" />
              Writing Progress
            </h3>
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              <Brain className="h-3 w-3 mr-1 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">AI Tracked</span>
            </div>
          </div>
          <SimpleLineChart data={analyticsData.weeklyProgress} color="border-blue-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>7 weeks ago</span>
            <span>This week</span>
          </div>
        </div>

        {/* Error Reduction Chart */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Error Reduction
            </h3>
            <div className="flex items-center bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <Sparkles className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">AI Powered</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Grammar</span>
                <span className="text-green-600 font-medium">-75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Vocabulary</span>
                <span className="text-green-600 font-medium">-60%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Style</span>
                <span className="text-green-600 font-medium">-45%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">AI-Generated Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Strongest Area</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your <strong>{analyticsData.strongestArea}</strong> has improved by 34% this month. Keep up the excellent work!
            </p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="h-4 w-4 text-blue-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Focus Area</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consider focusing on <strong>{analyticsData.weakestArea}</strong> to see the biggest improvement in your writing score.
            </p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Zap className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Prediction</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              At your current pace, you'll reach a <strong>95+ writing score</strong> within the next 2 weeks.
            </p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Writing Achievements
          </h3>
          <span className="text-sm text-gray-500">
            {analyticsData.achievements.filter(a => a.earned).length} of {analyticsData.achievements.length} earned
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                achievement.earned
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-center mb-2">
                {achievement.earned ? (
                  <CheckCircle className="h-5 w-5 text-yellow-600 mr-2" />
                ) : (
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2" />
                )}
                <span className={`font-medium ${achievement.earned ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-500'}`}>
                  {achievement.title}
                </span>
              </div>
              <p className={`text-sm ${achievement.earned ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-400'}`}>
                {achievement.description}
              </p>
              {achievement.earned && achievement.date && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Earned {achievement.date.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 