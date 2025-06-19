// WARNING: OpenAI API keys should NEVER be exposed to client-side code
// This implementation needs to be moved to a secure backend/serverless function

// Initialize OpenAI client - MOVED TO BACKEND
// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true, // Note: In production, use server-side API
// })

import { Suggestion, SuggestionType, TextPosition, AIAnalysis } from '@/types'

export class AIService {
  /**
   * Analyze text and generate suggestions
   * TODO: Move this to a secure backend endpoint
   */
  static async analyzeText(
    text: string,
    userType: 'student' | 'professional' | 'creator' = 'student',
    documentType: string = 'essay'
  ): Promise<Suggestion[]> {
    try {
      // Use secure Firebase Function endpoint
      const response = await fetch('https://analyzetext-7d2ertcnaa-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          userType,
          documentType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      return this.parseSuggestions(data.analysisResult, text);
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error('Failed to analyze text with AI');
    }
  }

  /**
   * Generate comprehensive analysis report
   */
  static async generateAnalysis(
    text: string,
    userType: 'student' | 'professional' | 'creator' = 'student',
    documentType: string = 'essay'
  ): Promise<AIAnalysis> {
    try {
      // TODO: Implement with secure backend endpoint
      throw new Error('Full analysis feature requires backend implementation')
      
      // const prompt = this.buildFullAnalysisPrompt(text, userType, documentType)
      // 
      // const response = await openai.chat.completions.create({
      //   model: 'gpt-4',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: this.getAnalysisSystemPrompt(userType, documentType)
      //     },
      //     {
      //       role: 'user',
      //       content: prompt
      //     }
      //   ],
      //   temperature: 0.2,
      //   max_tokens: 3000,
      // })
      //
      // const analysisResult = response.choices[0]?.message?.content
      // if (!analysisResult) {
      //   throw new Error('No analysis result received')
      // }
      //
      // return this.parseFullAnalysis(analysisResult, text)
    } catch (error) {
      console.error('AI Full Analysis error:', error)
      throw new Error('Failed to generate comprehensive analysis')
    }
  }

  /**
   * Improve text based on specific criteria
   */
  static async improveText(
    text: string,
    improvementType: 'clarity' | 'conciseness' | 'tone' | 'vocabulary',
    userType: 'student' | 'professional' | 'creator' = 'student'
  ): Promise<string> {
    try {
      // TODO: Implement with secure backend endpoint
      throw new Error('Text improvement feature requires backend implementation')
      
      // const prompt = this.buildImprovementPrompt(text, improvementType, userType)
      // 
      // const response = await openai.chat.completions.create({
      //   model: 'gpt-4',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: this.getImprovementSystemPrompt(improvementType, userType)
      //     },
      //     {
      //       role: 'user',
      //       content: prompt
      //     }
      //   ],
      //   temperature: 0.4,
      //   max_tokens: 1500,
      // })
      //
      // return response.choices[0]?.message?.content || text
    } catch (error) {
      console.error('AI Improvement error:', error)
      throw new Error('Failed to improve text')
    }
  }

  /**
   * Build analysis prompt for suggestions
   */
  private static buildAnalysisPrompt(
    text: string,
    userType: string,
    documentType: string
  ): string {
    return `Please analyze the following ${documentType} written by a ${userType} and provide specific suggestions for improvement:

Text to analyze:
"${text}"

Focus on:
1. Grammar and spelling errors
2. Style and clarity issues
3. Vocabulary enhancement opportunities
4. Tone and formality adjustments
5. Conciseness improvements

Return your analysis in the following JSON format:
{
  "suggestions": [
    {
      "type": "grammar|spelling|style|vocabulary|clarity|tone|conciseness",
      "severity": "error|warning|info",
      "message": "Brief description of the issue",
      "explanation": "Detailed explanation of why this is an issue",
      "originalText": "The problematic text",
      "suggestions": ["suggestion1", "suggestion2"],
      "confidence": 0.95,
      "position": {"start": 0, "end": 10}
    }
  ]
}`
  }

  /**
   * Build comprehensive analysis prompt
   */
  private static buildFullAnalysisPrompt(
    text: string,
    userType: string,
    documentType: string
  ): string {
    return `Provide a comprehensive analysis of this ${documentType} written by a ${userType}:

"${text}"

Return analysis in JSON format:
{
  "overallScore": 85,
  "metrics": {
    "grammar": 90,
    "style": 80,
    "clarity": 85,
    "engagement": 75,
    "readability": 88
  },
  "summary": "Overall assessment...",
  "improvements": ["Specific improvement 1", "Specific improvement 2"],
  "strengths": ["Strength 1", "Strength 2"]
}`
  }

  /**
   * Get system prompt based on user type and document type
   */
  private static getSystemPrompt(userType: string, documentType: string): string {
    const basePrompt = "You are an expert writing assistant that provides constructive, educational feedback."
    
    switch (userType) {
      case 'student':
        return `${basePrompt} You're helping a student improve their ${documentType}. Focus on educational explanations and learning opportunities. Be encouraging but thorough in your feedback.`
      case 'professional':
        return `${basePrompt} You're helping a professional improve their ${documentType}. Focus on clarity, professionalism, and business communication effectiveness.`
      case 'creator':
        return `${basePrompt} You're helping a content creator improve their ${documentType}. Focus on engagement, readability, and audience connection.`
      default:
        return basePrompt
    }
  }

  /**
   * Get analysis system prompt
   */
  private static getAnalysisSystemPrompt(userType: string, documentType: string): string {
    return `You are an expert writing analyst. Provide comprehensive analysis for a ${userType}'s ${documentType}. Be specific, constructive, and tailored to their needs.`
  }

  /**
   * Get improvement system prompt
   */
  private static getImprovementSystemPrompt(
    improvementType: string,
    userType: string
  ): string {
    return `You are a writing improvement specialist. Focus specifically on ${improvementType} improvements for a ${userType}. Maintain the original meaning while enhancing the specified aspect.`
  }

  /**
   * Build improvement prompt
   */
  private static buildImprovementPrompt(
    text: string,
    improvementType: string,
    userType: string
  ): string {
    return `Please improve the following text specifically for ${improvementType}, keeping in mind this is written by a ${userType}:

"${text}"

Return only the improved version of the text.`
  }

  /**
   * Parse suggestions from AI response
   */
  private static parseSuggestions(response: any, originalText: string): Suggestion[] {
    try {
      // Handle the actual ChatGPT response format from Firebase Function
      const suggestions = Array.isArray(response) ? response : (response.suggestions || []);
      
      return suggestions.map((s: any, index: number) => {
        // Create a more unique ID based on content and position
        const uniqueId = s.id || `${s.type || 'suggestion'}-${s.originalText || ''}-${s.position?.start || index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          id: uniqueId,
          type: s.type as SuggestionType,
          severity: 'error' as const,
          message: s.message || s.suggestion || 'Grammar suggestion',
          explanation: s.message || s.explanation || 'Improvement suggestion',
          position: s.position as TextPosition,
          originalText: s.originalText || s.original || '',
          suggestions: Array.isArray(s.suggestions) ? s.suggestions : (s.replacement ? [s.replacement] : []),
          confidence: s.confidence || 0.8,
          timestamp: new Date(),
        }
      }).filter((suggestion: Suggestion, index: number, array: Suggestion[]) => {
        // Remove duplicate suggestions based on originalText and replacement
        const key = `${suggestion.originalText}->${suggestion.suggestions[0] || ''}`;
        return array.findIndex((s: Suggestion) => `${s.originalText}->${s.suggestions[0] || ''}` === key) === index;
      });
    } catch (error) {
      console.error('Failed to parse suggestions:', error)
      return []
    }
  }

  /**
   * Parse full analysis from AI response
   */
  private static parseFullAnalysis(response: string, _originalText: string): AIAnalysis {
    try {
      const parsed = JSON.parse(response)
      return {
        documentId: '', // Will be set by caller
        overallScore: parsed.overallScore,
        metrics: parsed.metrics,
        suggestions: [], // Will be populated separately
        summary: parsed.summary,
        improvements: parsed.improvements,
        strengths: parsed.strengths,
        generatedAt: new Date(),
      }
    } catch (error) {
      console.error('Failed to parse analysis:', error)
      // Return default analysis
      return {
        documentId: '',
        overallScore: 75,
        metrics: { grammar: 75, style: 75, clarity: 75, engagement: 75, readability: 75 },
        suggestions: [],
        summary: 'Analysis could not be completed.',
        improvements: ['Please try again with a different text sample.'],
        strengths: ['Text submitted for analysis.'],
        generatedAt: new Date(),
      }
    }
  }
} 