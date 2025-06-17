// OpenAI API Service for AI Writing Suggestions
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here'

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

class OpenAIService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  constructor() {
    this.apiKey = OPENAI_API_KEY
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

    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length

    try {
      const prompt = this.createAnalysisPrompt(content, userLevel)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert ESL writing assistant. Analyze text and provide specific, actionable feedback for grammar, vocabulary, clarity, and style improvements. Return valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText)
        return this.getFallbackAnalysis(content, wordCount)
      }

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      
      return this.processAIResponse(analysis, wordCount)
    } catch (error) {
      console.error('Error analyzing text with OpenAI:', error)
      return this.getFallbackAnalysis(content, wordCount)
    }
  }

  private createAnalysisPrompt(content: string, userLevel: string): string {
    return `
CRITICAL: You must analyze the ACTUAL text provided and only suggest fixes for problems that ACTUALLY EXIST.

Text to analyze:
"${content}"

Carefully read the text above and provide specific suggestions ONLY for problems that actually exist in that exact text. Return a JSON object with this structure:

{
  "grammar": [
    {
      "issue": "Description of the actual grammar issue found",
      "suggestion": "How to fix the actual problem",
      "original": "exact problematic text from the content",
      "replacement": "corrected version",
      "confidence": 0.9
    }
  ],
  "vocabulary": [
    {
      "issue": "Description of actual vocabulary issue found",
      "suggestion": "Why this actual word should be changed",
      "original": "actual word from content",
      "replacement": "better word",
      "confidence": 0.8
    }
  ],
  "clarity": [
    {
      "issue": "Description of actual clarity issue found", 
      "suggestion": "How to make this actual text clearer",
      "original": "actual unclear text",
      "replacement": "clearer version",
      "confidence": 0.7
    }
  ],
  "style": [
    {
      "issue": "Description of actual style issue found",
      "suggestion": "How this actual text can be more formal",
      "original": "actual informal text",
      "replacement": "formal version",
      "confidence": 0.6
    }
  ]
}

STRICT ANALYSIS RULES:
1. ONLY analyze the exact text provided above
2. The "original" field must contain text that ACTUALLY EXISTS in the user's content
3. Do NOT suggest fixing "I is" if the text says "I am"
4. Do NOT suggest fixing problems that don't exist
5. Copy the problematic text EXACTLY as it appears (including capitalization)
6. "replacement" must be maximum 2 words

FOCUS ON ACTUAL ISSUES:
- Inappropriate words that actually appear: "pee", "poo", "vomit", etc.
- Grammar errors that actually exist: incorrect verb forms, tense issues
- Informal language actually used: "like" instead of "prefer", etc.
- Style improvements for words actually present

If no real issues exist in a category, return an empty array for that category.
`
  }

  private processAIResponse(analysis: any, wordCount: number): AIAnalysisResult {
    const generateId = (category: string, index: number) => `${category}-${index}-${Date.now()}`

    const grammarIssues: AISuggestion[] = (analysis.grammar || []).map((item: any, index: number) => ({
      id: generateId('grammar', index),
      text: item.issue,
      suggestion: item.suggestion,
      replacement: item.replacement,
      original: item.original, // Add original text to replace
      type: 'grammar' as const,
      category: 'grammar' as const,
      confidence: item.confidence || 0.8
    }))

    const vocabularyIssues: AISuggestion[] = (analysis.vocabulary || []).map((item: any, index: number) => ({
      id: generateId('vocabulary', index),
      text: item.issue,
      suggestion: item.suggestion,
      replacement: item.replacement,
      original: item.original, // Add original text to replace
      type: 'vocabulary' as const,
      category: 'vocabulary' as const,
      confidence: item.confidence || 0.7
    }))

    const clarityIssues: AISuggestion[] = (analysis.clarity || []).map((item: any, index: number) => ({
      id: generateId('clarity', index),
      text: item.issue,
      suggestion: item.suggestion,
      replacement: item.replacement,
      original: item.original, // Add original text to replace
      type: 'clarity' as const,
      category: 'clarity' as const,
      confidence: item.confidence || 0.6
    }))

    const styleIssues: AISuggestion[] = (analysis.style || []).map((item: any, index: number) => ({
      id: generateId('style', index),
      text: item.issue,
      suggestion: item.suggestion,
      replacement: item.replacement,
      original: item.original, // Add original text to replace
      type: 'style' as const,
      category: 'style' as const,
      confidence: item.confidence || 0.5
    }))

    // Calculate dynamic score based on issues found
    const dynamicScore = this.calculateWritingScore(grammarIssues, vocabularyIssues, clarityIssues, styleIssues, wordCount)

    return {
      grammarIssues,
      vocabularyIssues,
      clarityIssues,
      styleIssues,
      overallScore: dynamicScore,
      hasContent: true,
      wordCount
    }
  }

  private calculateWritingScore(
    grammarIssues: AISuggestion[], 
    vocabularyIssues: AISuggestion[], 
    clarityIssues: AISuggestion[], 
    styleIssues: AISuggestion[], 
    wordCount: number
  ): number {
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

  private getFallbackAnalysis(content: string, wordCount: number): AIAnalysisResult {
    // Fallback analysis when API fails
    const suggestions: AISuggestion[] = []

    // Basic grammar checks
    if (content.toLowerCase().includes('i am go')) {
      suggestions.push({
        id: 'grammar-tense-1',
        text: 'Verb tense consistency issue detected',
        suggestion: 'Use "I am going" or "I go" for proper tense',
        replacement: 'I am going',
        type: 'grammar',
        category: 'grammar',
        confidence: 0.9
      })
    }

    // Vocabulary suggestions
    if (content.toLowerCase().includes('very good')) {
      suggestions.push({
        id: 'vocab-enhancement-1',
        text: 'Consider using stronger vocabulary',
        suggestion: 'Replace "very good" with more specific adjectives',
        replacement: 'excellent',
        type: 'vocabulary',
        category: 'vocabulary',
        confidence: 0.7
      })
    }

    // Separate suggestions by category
    const grammarIssues = suggestions.filter(s => s.category === 'grammar')
    const vocabularyIssues = suggestions.filter(s => s.category === 'vocabulary')
    const clarityIssues = suggestions.filter(s => s.category === 'clarity')
    const styleIssues = suggestions.filter(s => s.category === 'style')

    // Calculate dynamic score for fallback analysis too
    const dynamicScore = this.calculateWritingScore(grammarIssues, vocabularyIssues, clarityIssues, styleIssues, wordCount)

    return {
      grammarIssues,
      vocabularyIssues,
      clarityIssues,
      styleIssues,
      overallScore: dynamicScore,
      hasContent: true,
      wordCount
    }
  }

  async applySuggestion(originalText: string, suggestion: AISuggestion): Promise<string> {
    if (!suggestion.replacement) return originalText
    
    // Try to find and replace the original text with the replacement
    // This is a more sophisticated approach that looks for the original problematic text
    
    // If we have information about what text to replace, use that
    if (suggestion.text && suggestion.text.includes('"') && suggestion.replacement) {
      // Extract quoted text from suggestion.text (e.g., 'Consider using "prefer" instead of "like"')
      const quotedMatch = suggestion.text.match(/"([^"]+)"/g)
      if (quotedMatch && quotedMatch.length >= 1) {
        // Get the text that should be replaced (usually the first quoted text)
        const textToReplace = quotedMatch[quotedMatch.length - 1].replace(/"/g, '')
        
        // Create a case-insensitive regex that matches word boundaries
        const regex = new RegExp(`\\b${textToReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        return originalText.replace(regex, suggestion.replacement)
      }
    }
    
    // Fallback: try to intelligently find what to replace based on common patterns
    const lines = originalText.split('\n')
    let modified = false
    
    for (let i = 0; i < lines.length && !modified; i++) {
      const line = lines[i]
      
      // Try different replacement strategies
      const strategies = [
        // Strategy 1: Look for the exact replacement text already in the content
        () => {
          if (line.toLowerCase().includes(suggestion.replacement!.toLowerCase())) {
            return line // Already contains the suggested text
          }
          return null
        },
        
        // Strategy 2: Replace common problematic words
        () => {
          const commonReplacements: { [key: string]: string[] } = {
            'prefer': ['like', 'love'],
            'excellent': ['good', 'very good'],
            'therefore': ['so'],
            'however': ['but'],
            'furthermore': ['also', 'and'],
            'in addition': ['and', 'also'],
            'consequently': ['so']
          }
          
          const suggestionLower = suggestion.replacement!.toLowerCase()
          if (commonReplacements[suggestionLower]) {
            for (const word of commonReplacements[suggestionLower]) {
              const regex = new RegExp(`\\b${word}\\b`, 'gi')
              if (regex.test(line)) {
                lines[i] = line.replace(regex, suggestion.replacement!)
                modified = true
                break
              }
            }
          }
          return null
        },
        
        // Strategy 3: Grammar fixes
        () => {
          const grammarFixes: { [key: string]: string } = {
            'I am going': 'I am go',
            'there are': 'there is',
            'they are': 'they is'
          }
          
          for (const [correct, incorrect] of Object.entries(grammarFixes)) {
            if (suggestion.replacement!.toLowerCase() === correct.toLowerCase()) {
              const regex = new RegExp(`\\b${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
              if (regex.test(line)) {
                lines[i] = line.replace(regex, suggestion.replacement!)
                modified = true
                break
              }
            }
          }
          return null
        }
      ]
      
      // Try each strategy
      for (const strategy of strategies) {
        const result = strategy()
        if (result !== null || modified) break
      }
    }
    
    return lines.join('\n')
  }
}

export const openaiService = new OpenAIService() 