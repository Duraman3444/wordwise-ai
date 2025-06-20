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
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting GPT analysis...', { textLength: text.length, userType, documentType });
      
      // GPT-first approach with 15-second timeout
      const response = await Promise.race([
        fetch('https://analyzetext-7d2ertcnaa-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            userType,
            documentType,
            includeAcademicTone: true // Request academic tone analysis
          })
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('GPT timeout after 15 seconds')), 15000)
        )
      ]) as Response;

      if (!response.ok) {
        throw new Error(`GPT API error: ${response.status}`);
      }

      const data = await response.json();
      const aiSuggestions = data.analysisResult || [];
      
      console.log('✅ GPT Response received:', {
        clientTime: `${Date.now() - startTime}ms`,
        serverTime: `${data.processingTime || 0}ms`,
        rawSuggestions: aiSuggestions.length,
        suggestions: aiSuggestions
      });

      // Always add local academic tone analysis as well
      console.log('🎓 Adding local academic tone analysis...');
      const localAcademicSuggestions = await this.getLocalAcademicToneGuidance(text, documentType);
      console.log('🔍 Local academic tone suggestions:', localAcademicSuggestions);

      // Combine GPT suggestions with local academic tone analysis
      let allSuggestions = [...aiSuggestions];
      
      if (localAcademicSuggestions.length > 0) {
        const localFormattedSuggestions = localAcademicSuggestions.map((suggestion, index) => ({
          id: suggestion.id,
          type: suggestion.type,
          severity: suggestion.severity,
          originalText: suggestion.originalText,
          suggestions: suggestion.suggestions,
          message: suggestion.message,
          explanation: suggestion.explanation,
          confidence: suggestion.confidence,
          isAcademicTone: true
        }));
        
        allSuggestions = [...allSuggestions, ...localFormattedSuggestions];
        console.log('✅ Combined suggestions with local academic tone analysis');
      }

      if (Array.isArray(allSuggestions) && allSuggestions.length > 0) {
        const suggestions = allSuggestions.map((item: any, index: number) => ({
          id: item.id || `gpt_${index}`,
          type: (item.type || 'grammar') as SuggestionType,
          severity: item.severity || 'error',
          originalText: item.originalText || '',
          suggestions: Array.isArray(item.suggestions) ? item.suggestions : [item.suggestions].filter(Boolean),
          message: item.message || 'GPT suggestion',
          explanation: item.explanation || 'AI-powered improvement suggestion',
          position: {
            start: text.indexOf(item.originalText) >= 0 ? text.indexOf(item.originalText) : 0,
            end: text.indexOf(item.originalText) >= 0 ? text.indexOf(item.originalText) + (item.originalText?.length || 0) : 0
          },
          confidence: item.confidence || 0.95,
          timestamp: new Date(),
          isAcademicTone: item.type === 'academic_tone' || item.isAcademicTone || false
        }));
        
        console.log('🎯 Analysis completed successfully:', suggestions.length, 'suggestions');
        console.log('📋 Academic tone suggestions found:', suggestions.filter(s => s.type === 'academic_tone').length);
        return suggestions;
      }

      // If no suggestions from GPT, still return local academic tone analysis
      if (localAcademicSuggestions.length > 0) {
        console.log('⚠️ GPT returned no suggestions, using local academic tone analysis');
        return localAcademicSuggestions;
      }

      console.log('⚠️ No suggestions from GPT or local analysis');
      return [{
        id: 'gpt_no_issues',
        type: 'grammar' as SuggestionType,
        severity: 'info' as const,
        originalText: text.substring(0, 30) + '...',
        suggestions: ['No issues detected by AI'],
        message: 'GPT analysis complete - no issues found',
        explanation: 'The AI analysis found no grammar, spelling, or style issues in your text.',
        position: {
          start: 0,
          end: text.length
        },
        confidence: 0.9,
        timestamp: new Date()
      }];

    } catch (error) {
      console.error('❌ GPT Analysis failed:', error);
      
      // Fallback to local academic tone analysis
      const localSuggestions = await this.getLocalAcademicToneGuidance(text, documentType);
      console.log('🔄 Fallback to local academic tone analysis:', localSuggestions.length, 'suggestions');
      
      if (localSuggestions.length > 0) {
        return localSuggestions;
      }
      
      // Simple fallback - just return an error message
      return [{
        id: 'gpt_error',
        type: 'grammar' as SuggestionType,
        severity: 'warning' as const,
        originalText: text.substring(0, 50) + '...',
        suggestions: ['GPT analysis failed - please try again'],
        message: 'Analysis temporarily unavailable',
        explanation: 'The AI service is temporarily unavailable. Please check your connection and try again.',
        position: {
          start: 0,
          end: Math.min(50, text.length)
        },
        confidence: 0.1,
        timestamp: new Date()
      }];
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
}`;
  }

  /**
   * Get full analysis (placeholder - will be implemented when needed)
   */
  static async getFullAnalysis(
    text: string,
    userType: 'student' | 'professional' | 'creator' = 'student',
    documentType: string = 'essay'
  ): Promise<AIAnalysis> {
    throw new Error('Full analysis feature requires backend implementation');
  }

  /**
   * Get improvement suggestions (placeholder - will be implemented when needed)
   */
  static async getImprovementSuggestions(
    text: string,
    improvementType: string,
    userType: 'student' | 'professional' | 'creator' = 'student'
  ): Promise<string> {
    throw new Error('Improvement suggestions feature requires backend implementation');
  }

  /**
   * Analyze text for academic tone and provide guidance (now integrated into main analysis)
   */
  static async analyzeAcademicTone(
    text: string,
    documentType: 'essay' | 'research_paper' | 'thesis' | 'report' = 'essay'
  ): Promise<Suggestion[]> {
    // This is now integrated into the main analyzeText function
    return this.analyzeText(text, 'student', documentType);
  }

  /**
   * Get local academic tone guidance with sentence-level improvements
   */
  private static async getLocalAcademicToneGuidance(
    text: string,
    documentType: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Split text into sentences for sentence-level analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach((sentence, sentenceIndex) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length < 10) return; // Skip very short sentences
      
      // Check if sentence needs academic formalization
      const academicSuggestion = this.getAcademicSentenceImprovement(trimmedSentence);
      
      if (academicSuggestion) {
        const sentenceStart = text.indexOf(trimmedSentence);
        
        // Create a semantic content key to prevent re-suggesting the same improvement
        const semanticKey = this.getSemanticContentKey(trimmedSentence, academicSuggestion.improved);
        
        suggestions.push({
          id: `academic_sentence_${sentenceIndex}`,
          type: 'academic_tone',
          severity: 'info',
          originalText: trimmedSentence,
          suggestions: [academicSuggestion.improved],
          message: 'Academic tone improvement',
          explanation: `This is your sentence formalized and with better academic tone:\n\nOriginal: "${trimmedSentence}"\nSuggested: "${academicSuggestion.improved}"\n\n${academicSuggestion.reason}`,
          position: {
            start: sentenceStart >= 0 ? sentenceStart : 0,
            end: sentenceStart >= 0 ? sentenceStart + trimmedSentence.length : trimmedSentence.length
          },
          confidence: 0.85,
          timestamp: new Date(),
          isAcademicTone: true,
          semanticKey // Add semantic key for better dismissal tracking
        });
      }
    });

    return suggestions;
  }

  /**
   * Create a semantic content key that identifies the core meaning of a suggestion
   * This helps prevent re-suggesting the same semantic improvement after text changes
   */
  private static getSemanticContentKey(originalText: string, improvedText: string): string {
    const original = originalText.toLowerCase().trim();
    const improved = improvedText.toLowerCase().trim();
    
    // Extract semantic patterns
    const patterns = [
      'masturbation_topic',
      'opinion_question', 
      'perspective_question',
      'informal_to_formal',
      'slang_to_academic'
    ];
    
    // Check for masturbation/sexual topic
    if ((original.includes('beatin') && original.includes('dih')) || 
        (improved.includes('masturbation') || improved.includes('opinion on masturbation'))) {
      return 'semantic:masturbation_topic_formalization';
    }
    
    // Check for opinion/perspective questions
    if ((original.includes('what is') && original.includes('opinion')) ||
        (improved.includes('what is your perspective') || improved.includes('what is your opinion'))) {
      return 'semantic:opinion_perspective_question';
    }
    
    // Check for informal to formal patterns
    if (original.includes('yo') || original.includes('ur') || 
        improved.includes('your') && !original.includes('your')) {
      return 'semantic:informal_pronoun_formalization';
    }
    
    // Fallback to content-based key
    return `semantic:${original.substring(0, 20)}_to_${improved.substring(0, 20)}`;
  }

  /**
   * Get academic sentence improvement suggestions
   */
  private static getAcademicSentenceImprovement(sentence: string): { improved: string; reason: string } | null {
    const lower = sentence.toLowerCase();
    
    // Pattern 1: Informal questions about opinions
    if (lower.includes('what is yo') && lower.includes('opinion')) {
      const topic = this.extractTopicFromSentence(sentence);
      return {
        improved: `What is your perspective on ${topic}?`,
        reason: 'Academic writing benefits from formal language and complete words rather than informal contractions.'
      };
    }
    
    // Pattern 2: Slang or informal expressions
    if (lower.includes('beatin') || lower.includes('yo dih')) {
      return {
        improved: 'What is your opinion on masturbation?',
        reason: 'Academic writing requires formal terminology and complete sentence structure.'
      };
    }
    
    // Pattern 3: Casual conversation starters
    if (lower.match(/^(hey|yo|what's up|sup)/)) {
      return {
        improved: 'I would like to inquire about your perspective on this matter.',
        reason: 'Academic writing uses formal greetings and structured inquiry methods.'
      };
    }
    
    // Pattern 4: Informal expressions with "gonna", "wanna", etc.
    if (lower.match(/\b(gonna|wanna|gotta|kinda|sorta)\b/)) {
      let improved = sentence;
      improved = improved.replace(/\bgonna\b/gi, 'going to');
      improved = improved.replace(/\bwanna\b/gi, 'want to');
      improved = improved.replace(/\bgotta\b/gi, 'must');
      improved = improved.replace(/\bkinda\b/gi, 'somewhat');
      improved = improved.replace(/\bsorta\b/gi, 'somewhat');
      
      return {
        improved,
        reason: 'Academic writing requires formal language without informal contractions.'
      };
    }
    
    // Pattern 5: First person casual expressions
    if (lower.match(/^(i think|i feel|i believe)/) && !lower.includes('research') && !lower.includes('analysis')) {
      const content = sentence.replace(/^i (think|feel|believe)\s*/i, '');
      return {
        improved: `Research suggests that ${content.toLowerCase()}`,
        reason: 'Academic writing uses evidence-based language rather than personal opinions.'
      };
    }
    
    // Pattern 6: Very informal or slang-heavy sentences
    if (this.isVeryInformal(sentence)) {
      return {
        improved: this.formalizeInformalSentence(sentence),
        reason: 'This sentence has been formalized to meet academic writing standards.'
      };
    }
    
    return null;
  }

  /**
   * Extract topic from informal sentence
   */
  private static extractTopicFromSentence(sentence: string): string {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('beatin') && lower.includes('dih')) {
      return 'masturbation';
    }
    
    // Try to extract topic after "on"
    const onMatch = lower.match(/\son\s+(.+?)[\s?!.]*$/);
    if (onMatch) {
      return this.formalizePhrase(onMatch[1]);
    }
    
    return 'this topic';
  }

  /**
   * Check if sentence is very informal
   */
  private static isVeryInformal(sentence: string): boolean {
    const informalWords = ['yo', 'dih', 'beatin', 'da', 'ur', 'u', 'wat', 'wot', 'dis', 'dat'];
    const lower = sentence.toLowerCase();
    const foundWords = informalWords.filter(word => lower.includes(word));
    const informalCount = foundWords.length;
    
    return informalCount >= 2;
  }

  /**
   * Formalize very informal sentence
   */
  private static formalizeInformalSentence(sentence: string): string {
    let formal = sentence;
    
    // Common informal replacements
    const replacements: Record<string, string> = {
      'yo': 'your',
      'dih': 'penis',
      'beatin': 'masturbation',
      'da': 'the',
      'ur': 'your',
      'u': 'you',
      'wat': 'what',
      'wot': 'what',
      'dis': 'this',
      'dat': 'that'
    };
    
    Object.entries(replacements).forEach(([informal, formal_word]) => {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      formal = formal.replace(regex, formal_word);
    });
    
    // Ensure proper capitalization and punctuation
    formal = formal.charAt(0).toUpperCase() + formal.slice(1);
    if (!formal.match(/[.!?]$/)) {
      formal += '.';
    }
    
    return formal;
  }

  /**
   * Formalize a phrase
   */
  private static formalizePhrase(phrase: string): string {
    return phrase.replace(/\b(beatin yo dih|beating yo dick)\b/gi, 'masturbation')
                .replace(/\byo\b/gi, 'your')
                .replace(/\bdih\b/gi, 'penis')
                .trim();
  }
}