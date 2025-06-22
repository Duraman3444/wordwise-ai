import React, { useState } from 'react'
import { AnalyticsDashboard } from '../components/ui/AnalyticsDashboard'
import { 
  Brain,
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Filter,
  Share2,
  Settings,
  Sparkles
} from 'lucide-react'
import { Button } from '../components/ui/Button'

export const Analytics: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  const handleExportReport = () => {
    // Simulate report generation
    console.log(`Generating ${exportFormat.toUpperCase()} report...`)
    
    // Create a mock download
    const element = document.createElement('a')
    const file = new Blob(['Mock Analytics Report Content'], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `wordwise-analytics-report.${exportFormat}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold">Writing Analytics</h1>
                    <div className="flex items-center bg-yellow-400 text-black rounded-full px-3 py-1">
                      <Brain className="h-4 w-4 mr-1" />
                      <span className="text-sm font-semibold">AI-Powered</span>
                    </div>
                  </div>
                  <p className="text-purple-100 text-lg mt-1">
                    Comprehensive insights into your writing journey
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Real-time Analysis</span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Predictive Insights</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="pdf" className="text-gray-900">PDF Report</option>
                  <option value="excel" className="text-gray-900">Excel Export</option>
                  <option value="csv" className="text-gray-900">CSV Data</option>
                </select>
                
                <Button 
                  variant="outline" 
                  onClick={handleExportReport}
                  className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">92</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15.2K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Words Written</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Error Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">23%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improvement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your Writing Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress, identify patterns, and accelerate your improvement with AI-powered insights.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <AnalyticsDashboard 
          onExportReport={handleExportReport}
        />
      </div>

      {/* AI Insights Footer */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3 mb-4">
              <Brain className="h-5 w-5 mr-2" />
              <span className="font-semibold">AI-Powered Analytics</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Unlock Deeper Insights with Premium Analytics
            </h3>
            <p className="text-indigo-100 max-w-2xl mx-auto mb-6">
              Get advanced predictive analytics, custom reporting, and personalized improvement plans 
              powered by our GPT-4 AI engine.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              >
                <FileText className="h-5 w-5 mr-2" />
                View Sample Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 