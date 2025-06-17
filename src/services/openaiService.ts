// WARNING: OpenAI API keys should NEVER be exposed to client-side code
// This service should be moved to a secure backend implementation

export interface AISuggestion {
  id: string
  text: string
  suggestion: string
  replacement?: string
  original?: string // The exact text that should be replaced
  type: 'grammar' | 'vocabulary' | 'clarity' | 'style'
  category: 'grammar' | 'vocabulary' | 'clarity' | 'style'
  confidence: number
  startPosition?: number
  endPosition?: number
}

export interface AIAnalysisResult {
  grammarIssues: AISuggestion[]
  vocabularyIssues: AISuggestion[]
  clarityIssues: AISuggestion[]
  styleIssues: AISuggestion[]
  overallScore: number
  hasContent: boolean
  wordCount: number
}

/**
 * DEPRECATED: This service should be moved to a secure backend
 * Use the new backend API endpoint instead
 */
export class OpenAIService {
  constructor() {
    console.warn('🚨 SECURITY WARNING: OpenAI service should be moved to secure backend');
  }

  async analyzeText(content: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<AIAnalysisResult> {
    if (!content.trim()) {
      return {
        grammarIssues: [],
        vocabularyIssues: [],
        clarityIssues: [],
        styleIssues: [],
        overallScore: 100,
        hasContent: false,
        wordCount: 0
      }
    }

    // TODO: Replace with secure backend API call
    throw new Error('OpenAI service moved to backend for security. Please implement backend API endpoint.');
  }

  async applySuggestion(originalText: string, suggestion: AISuggestion): Promise<string> {
    if (!suggestion.original || !suggestion.replacement) {
      return originalText;
    }

    // Simple text replacement
    return originalText.replace(suggestion.original, suggestion.replacement);
  }

  /**
   * Fallback analysis for when backend is not available
   */
  private getFallbackAnalysis(content: string, wordCount: number): AIAnalysisResult {
    return {
      grammarIssues: [],
      vocabularyIssues: [],
      clarityIssues: [],
      styleIssues: [],
      overallScore: 85, // Conservative fallback score
      hasContent: wordCount > 0,
      wordCount
    }
  }
}

// Export a singleton instance
export const openaiService = new OpenAIService()
export default openaiService 