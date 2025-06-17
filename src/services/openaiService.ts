// WARNING: OpenAI API keys should NEVER be exposed to client-side code
// This service should be moved to a secure backend implementation

export interface AISuggestion {
  id: string
  text: string
  suggestion: string
  replacement?: string
  original?: string // The exact text that should be replaced
  type: 'grammar' | 'vocabulary' | 'clarity' | 'style' | 'spelling'
  category: 'grammar' | 'vocabulary' | 'clarity' | 'style' | 'spelling'
  confidence: number
  startPosition?: number
  endPosition?: number
}

export interface AIAnalysisResult {
  grammarIssues: AISuggestion[]
  vocabularyIssues: AISuggestion[]
  clarityIssues: AISuggestion[]
  styleIssues: AISuggestion[]
  spellingIssues: AISuggestion[]
  overallScore: number
  hasContent: boolean
  wordCount: number
}

/**
 * Comprehensive Grammar and Vocabulary Analysis Engine
 * Based on common ESL patterns, grammar handbooks, and dictionary principles
 */
export class OpenAIService {
  // Comprehensive word lists (dictionary-style)
  private readonly properNouns = new Set([
    'abdurrahman', 'mirza', 'ahmed', 'sarah', 'maria', 'john', 'david', 'lisa', 'michael', 'jennifer',
    'mohammed', 'fatima', 'ali', 'hassan', 'ibrahim', 'aisha', 'omar', 'khadija', 'yusuf', 'zainab',
    'carlos', 'sofia', 'diego', 'lucia', 'pablo', 'isabela', 'antonio', 'camila', 'francisco', 'valentina'
  ]);

  private readonly acronyms = new Set([
    'ai', 'usa', 'uk', 'eu', 'fbi', 'cia', 'nasa', 'gps', 'dna', 'html', 'css', 'js', 'api', 'url',
    'http', 'www', 'pdf', 'jpg', 'png', 'gif', 'mp3', 'mp4', 'dvd', 'cd', 'tv', 'pc', 'mac', 'ios',
    'android', 'wifi', 'bluetooth', 'usb', 'hdmi', 'cpu', 'gpu', 'ram', 'ssd', 'hdd'
  ]);

  private readonly daysMonths = new Set([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 
    'september', 'october', 'november', 'december'
  ]);

  // Dictionary for spell checker
  private readonly commonMisspellings = new Map([
    ['adres', 'address'], ['adress', 'address'],
    ['wierd', 'weird'], ['seperate', 'separate'],
    ['definately', 'definitely'], ['occured', 'occurred'],
    ['untill', 'until'], ['recieved', 'received'],
    ['goverment', 'government'], ['enviroment', 'environment'],
    ['publically', 'publicly'], ['succesful', 'successful'],
    ['gramar', 'grammar'], ['checkerr', 'checker'], ['chek', 'check'],
    ['teh', 'the'], ['becuase', 'because'], ['thier', 'their'],
    ['wanna', 'want to'], ['gonna', 'going to'],
    ['alot', 'a lot'], ['reccomend', 'recommend']
  ]);

  // Advanced vocabulary replacements (dictionary-style)
  private readonly vocabularyUpgrades = new Map([
    ['good', ['excellent', 'outstanding', 'superb', 'remarkable', 'exceptional']],
    ['bad', ['terrible', 'awful', 'dreadful', 'poor', 'inadequate']],
    ['big', ['large', 'enormous', 'massive', 'substantial', 'significant']],
    ['small', ['tiny', 'minute', 'compact', 'modest', 'limited']],
    ['nice', ['pleasant', 'delightful', 'wonderful', 'charming', 'appealing']],
  ]);

  constructor() {
    console.warn('🚨 Using comprehensive mock AI service. Backend implementation needed for production.');
  }

  async analyzeText(content: string): Promise<AIAnalysisResult> {
    if (!content.trim()) {
      return {
        grammarIssues: [], vocabularyIssues: [], clarityIssues: [], styleIssues: [], spellingIssues: [],
        overallScore: 100, hasContent: false, wordCount: 0
      };
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const suggestions = this.analyzeWithGrammarHandbook(content);
    
    const grammarIssues = suggestions.filter((s) => s.type === 'grammar');
    const vocabularyIssues = suggestions.filter((s) => s.type === 'vocabulary');
    const clarityIssues = suggestions.filter((s) => s.type === 'clarity');
    const styleIssues = suggestions.filter((s) => s.type === 'style');
    const spellingIssues = suggestions.filter((s) => s.type === 'spelling');
    
    const totalDeductions = 
        (grammarIssues.length * 10) +
        (spellingIssues.length * 8) + 
        (vocabularyIssues.length * 6) +
        (clarityIssues.length * 4) +
        (styleIssues.length * 2);
    
    const overallScore = Math.max(0, 100 - totalDeductions);
    
    return {
      grammarIssues, vocabularyIssues, clarityIssues, styleIssues, spellingIssues,
      overallScore, hasContent: wordCount > 0, wordCount
    };
  }

  private analyzeWithGrammarHandbook(content: string): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    let suggestionId = 1;

    this.findSpellingErrors(content, suggestions, suggestionId);
    suggestionId = suggestions.length + 1;

    this.findAdvancedGrammarErrors(content, suggestions, suggestionId);
    suggestionId = suggestions.length + 1;
    
    this.findVocabularyImprovements(content, suggestions, suggestionId);
    
    return this.deduplicateSuggestions(suggestions);
  }
  
  private findSpellingErrors(content: string, suggestions: AISuggestion[], startId: number): void {
    let currentId = startId;
    const regex = new RegExp(`\\b(${Array.from(this.commonMisspellings.keys()).join('|')})\\b`, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const misspelledWord = match[0];
      const correctedWord = this.commonMisspellings.get(misspelledWord.toLowerCase());
      if (correctedWord) {
        suggestions.push({
          id: `spell_${currentId++}`,
          text: misspelledWord,
          suggestion: `Spelling: Change to "${this.matchCase(misspelledWord, correctedWord)}"`,
          original: misspelledWord,
          replacement: this.matchCase(misspelledWord, correctedWord),
          type: 'spelling',
          category: 'spelling',
          confidence: 0.99,
          startPosition: match.index,
          endPosition: match.index + misspelledWord.length
        });
      }
    }
  }

  private findAdvancedGrammarErrors(content: string, suggestions: AISuggestion[], startId: number): void {
    let currentId = startId;
    
    // Capitalization: First letter of sentence
    const firstLetterPattern = /^\s*([a-z])/;
    const firstLetterMatch = content.match(firstLetterPattern);
    if (firstLetterMatch) {
      const firstChar = firstLetterMatch[1];
      const startPos = content.indexOf(firstChar);
      suggestions.push({
        id: `punct_cap_${currentId++}`, text: firstChar,
        suggestion: `Capitalize the first letter of a sentence.`,
        original: firstChar, replacement: firstChar.toUpperCase(),
        type: 'grammar', category: 'grammar', confidence: 0.98,
        startPosition: startPos, endPosition: startPos + 1
      });
    }

    // Capitalization: Proper Nouns & Acronyms
    let regex = new RegExp(`\\b(${[...this.properNouns, ...this.acronyms, ...this.daysMonths].join('|')})\\b`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const word = match[0];
      const lowerWord = word.toLowerCase();
      
      if (this.acronyms.has(lowerWord) && word !== word.toUpperCase()) {
        suggestions.push({
          id: `capital_acr_${currentId++}`, text: word,
          suggestion: `Acronyms like "${word.toUpperCase()}" should be fully capitalized.`,
          original: word, replacement: word.toUpperCase(),
          type: 'grammar', category: 'grammar', confidence: 0.98,
          startPosition: match.index, endPosition: match.index + word.length
        });
      } else if ((this.properNouns.has(lowerWord) || this.daysMonths.has(lowerWord)) && word !== this.capitalizeProperNoun(word)) {
        suggestions.push({
          id: `capital_noun_${currentId++}`, text: word,
          suggestion: `Proper nouns like "${this.capitalizeProperNoun(word)}" should be capitalized.`,
          original: word, replacement: this.capitalizeProperNoun(word),
          type: 'grammar', category: 'grammar', confidence: 0.95,
          startPosition: match.index, endPosition: match.index + word.length
        });
      }
    }

    // Punctuation: Missing comma after greeting
    const greetingPattern = /^(Hello|Hi|Hey)(?!,)/i;
    const greetingMatch = content.match(greetingPattern);
    if (greetingMatch) {
      const fullMatch = greetingMatch[0];
      suggestions.push({
        id: `punct_greet_${currentId++}`, text: fullMatch,
        suggestion: `Add a comma after a greeting.`,
        original: fullMatch, replacement: `${fullMatch},`,
        type: 'grammar', category: 'grammar', confidence: 0.92,
        startPosition: 0, endPosition: fullMatch.length
      });
    }
    
    // Run-on sentences: Detect sentences that are too long
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      const wordCount = trimmedSentence.split(/\s+/).length;
      
      if (wordCount > 25) {
        const sentenceStart = content.indexOf(trimmedSentence);
        suggestions.push({
          id: `runon_${currentId++}`,
          text: trimmedSentence.substring(0, 50) + '...',
          suggestion: `This sentence is very long (${wordCount} words). Consider breaking it into shorter sentences for better readability.`,
          original: trimmedSentence,
          replacement: `${trimmedSentence}`, // Keep same for now, user needs to manually break it
          type: 'clarity',
          category: 'clarity',
          confidence: 0.80,
          startPosition: sentenceStart,
          endPosition: sentenceStart + trimmedSentence.length
        });
      }
    });

    // Punctuation: Missing commas in lists
    const listPattern = /\b(\w+)\s+(\w+)\s+and\s+(\w+)\b/gi;
    while ((match = listPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const word1 = match[1];
      const word2 = match[2];
      const word3 = match[3];
      
      if (!fullMatch.includes(',')) {
        suggestions.push({
          id: `comma_list_${currentId++}`,
          text: fullMatch,
          suggestion: `Use commas to separate items in a list: "${word1}, ${word2}, and ${word3}".`,
          original: fullMatch,
          replacement: `${word1}, ${word2}, and ${word3}`,
          type: 'grammar',
          category: 'grammar',
          confidence: 0.88,
          startPosition: match.index,
          endPosition: match.index + fullMatch.length
        });
      }
    }

    // Punctuation: Missing comma before coordinating conjunctions
    const compoundPattern = /([a-zA-Z, ]+[a-zA-Z])( (?:and|but|or|so|for|nor|yet) )([a-zA-Z].*)/gi;
    while ((match = compoundPattern.exec(content)) !== null) {
      const clause1 = match[1];
      const conjunction = match[2];
      const clause3 = match[3];
      
      // Check if this looks like two independent clauses (both have enough words)
      if (clause1.split(' ').length > 2 && clause3.split(' ').length > 2 && !clause1.endsWith(',')) {
        // We want to replace the entire phrase with the comma added
        const originalPhrase = clause1 + conjunction + clause3;
        const replacementPhrase = clause1 + ',' + conjunction + clause3;
        
        suggestions.push({
          id: `punct_conj_${currentId++}`,
          text: conjunction.trim(),
          suggestion: `Use a comma before "${conjunction.trim()}" to join two independent clauses.`,
          original: originalPhrase,
          replacement: replacementPhrase,
          type: 'grammar', category: 'grammar', confidence: 0.85,
          startPosition: match.index,
          endPosition: match.index + originalPhrase.length
        });
      }
    }

    // Unclear pronoun references
    const pronounPattern = /\b(it|this|that|they|them|these|those)\b/gi;
    let pronounCount = 0;
    while ((match = pronounPattern.exec(content)) !== null && pronounCount < 3) {
      const pronoun = match[0];
      const contextBefore = content.substring(Math.max(0, match.index - 20), match.index);
      const contextAfter = content.substring(match.index, Math.min(content.length, match.index + 20));
      
      // Simple heuristic: if pronoun appears in a long sentence, it might be unclear
      if (contextBefore.length > 15 && !contextBefore.includes('.') && !contextBefore.includes('!') && !contextBefore.includes('?')) {
        suggestions.push({
          id: `pronoun_${currentId++}`,
          text: pronoun,
          suggestion: `The pronoun "${pronoun}" may be unclear. Consider replacing it with the specific noun it refers to.`,
          original: pronoun,
          replacement: pronoun, // Keep same, user needs to replace manually
          type: 'clarity',
          category: 'clarity',
          confidence: 0.70,
          startPosition: match.index,
          endPosition: match.index + pronoun.length
        });
        pronounCount++;
      }
    }

    // Subject-verb agreement issues
    const svAgreementPatterns = [
      { pattern: /\b(is|was)\s+(they|we|you)\b/gi, suggestion: "Use 'are' or 'were' with plural subjects." },
      { pattern: /\b(are|were)\s+(he|she|it)\b/gi, suggestion: "Use 'is' or 'was' with singular subjects." },
      { pattern: /\b(don't|doesn't)\s+(he|she|it)\b/gi, suggestion: "Use 'doesn't' with singular subjects." }
    ];

    svAgreementPatterns.forEach(({ pattern, suggestion: suggestionText }) => {
      while ((match = pattern.exec(content)) !== null) {
        const fullMatch = match[0];
        suggestions.push({
          id: `sv_agreement_${currentId++}`,
          text: fullMatch,
          suggestion: suggestionText,
          original: fullMatch,
          replacement: fullMatch, // User needs to fix manually
          type: 'grammar',
          category: 'grammar',
          confidence: 0.85,
          startPosition: match.index,
          endPosition: match.index + fullMatch.length
        });
      }
    });

    // Missing articles (a, an, the)
    const articlePattern = /\b(is|was|has|have)\s+([A-Z][a-z]+)\b/g;
    while ((match = articlePattern.exec(content)) !== null) {
      const verb = match[1];
      const noun = match[2];
      const fullMatch = match[0];
      
      // Simple heuristic: if it's a common noun (starts with capital but not proper noun)
      if (!this.properNouns.has(noun.toLowerCase()) && !this.daysMonths.has(noun.toLowerCase())) {
        suggestions.push({
          id: `article_${currentId++}`,
          text: fullMatch,
          suggestion: `Consider adding an article before "${noun}". Example: "${verb} a ${noun}" or "${verb} the ${noun}".`,
          original: fullMatch,
          replacement: `${verb} a ${noun}`,
          type: 'grammar',
          category: 'grammar',
          confidence: 0.75,
          startPosition: match.index,
          endPosition: match.index + fullMatch.length
        });
      }
    }

    // Punctuation: Missing period at end of sentence
    const trimmedContent = content.trim();
    if (trimmedContent && !/[.!?]$/.test(trimmedContent)) {
      suggestions.push({
        id: `punct_end_${currentId++}`, text: trimmedContent.slice(-10),
        suggestion: 'Add a period to the end of the sentence.',
        original: "", 
        replacement: ".",
        type: 'grammar', category: 'grammar', confidence: 0.90,
        startPosition: content.length, 
        endPosition: content.length
      });
    }
  }

  private findVocabularyImprovements(content: string, suggestions: AISuggestion[], startId: number): void {
    let id = startId;
    const regex = new RegExp(`\\b(${Array.from(this.vocabularyUpgrades.keys()).join('|')})\\b`, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null && suggestions.length < 15) {
      const word = match[0];
      const alternatives = this.vocabularyUpgrades.get(word.toLowerCase());
      if (alternatives) {
        const suggestion = alternatives[Math.floor(Math.random() * alternatives.length)];
        suggestions.push({
          id: `vocab_${id++}`, text: word,
          suggestion: `For more variety, consider using "${this.matchCase(word, suggestion)}" instead of "${word}".`,
          original: word, replacement: this.matchCase(word, suggestion),
          type: 'vocabulary', category: 'vocabulary', confidence: 0.80,
          startPosition: match.index, endPosition: match.index + word.length
        });
      }
    }
  }

  private deduplicateSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
    const seen = new Map<string, AISuggestion>();
    suggestions.forEach(suggestion => {
        const key = `${suggestion.startPosition}-${suggestion.endPosition}`;
        const existing = seen.get(key);
        if (!existing || suggestion.confidence > existing.confidence) {
            seen.set(key, suggestion);
        }
    });
    return Array.from(seen.values()).sort((a,b) => (a.startPosition || 0) - (b.startPosition || 0));
  }

  private capitalizeProperNoun(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  private matchCase(original: string, replacement: string): string {
    if (original.toUpperCase() === original) {
      return replacement.toUpperCase();
    }
    if (original.charAt(0).toUpperCase() === original.charAt(0)) {
      return this.capitalizeProperNoun(replacement);
    }
    return replacement.toLowerCase();
  }
}

export const openaiService = new OpenAIService();
export default openaiService;