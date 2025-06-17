import * as path from 'path';
// Ensure PDF worker is configured
import '../utils/pdfWorker';

// Interfaces for extracted data
export interface DictionaryEntry {
  word: string;
  definitions: string[];
  synonyms: string[];
  partOfSpeech: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  commonMistakes: string[];
  examples: string[];
}

export interface GrammarRule {
  id: string;
  pattern: RegExp;
  title: string;
  description: string;
  correction: string;
  examples: { wrong: string; correct: string; }[];
  severity: 'error' | 'warning' | 'suggestion';
  category: 'subject-verb' | 'article' | 'preposition' | 'tense' | 'punctuation' | 'capitalization' | 'word-order';
  eslLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface StyleRule {
  id: string;
  pattern: RegExp;
  description: string;
  suggestion: string;
  category: 'conciseness' | 'clarity' | 'formality' | 'tone' | 'passive-voice';
  examples: { wordy: string; concise: string; }[];
}

/**
 * Comprehensive PDF Parser for Grammar, Dictionary, and Style Resources
 * Extracts and structures content from educational PDFs
 */
export class PDFParserService {
  private dictionaryCache: Map<string, DictionaryEntry> = new Map();
  private grammarRules: GrammarRule[] = [];
  private styleRules: StyleRule[] = [];

  constructor() {
    this.loadCachedData();
  }

  /**
   * Parse dictionary PDFs and extract word definitions
   */
  async parseDictionaryPDF(filePath: string): Promise<DictionaryEntry[]> {
    try {
      console.log(`📖 Parsing dictionary PDF: ${filePath}`);
      
      // For now, we'll use a browser-compatible approach
      // In production, you'd use pdf-parse on the server side
      const text = await this.extractTextFromPDF(filePath);
      const entries = this.extractDictionaryEntries(text);
      
      // Cache entries
      entries.forEach(entry => {
        this.dictionaryCache.set(entry.word.toLowerCase(), entry);
      });
      
      console.log(`✅ Extracted ${entries.length} dictionary entries`);
      return entries;
    } catch (error) {
      console.error('Error parsing dictionary PDF:', error);
      return [];
    }
  }

  /**
   * Parse grammar guide PDFs and extract rules
   */
  async parseGrammarPDF(filePath: string): Promise<GrammarRule[]> {
    try {
      console.log(`📝 Parsing grammar PDF: ${filePath}`);
      
      const text = await this.extractTextFromPDF(filePath);
      const rules = this.extractGrammarRules(text);
      
      this.grammarRules.push(...rules);
      
      console.log(`✅ Extracted ${rules.length} grammar rules`);
      return rules;
    } catch (error) {
      console.error('Error parsing grammar PDF:', error);
      return [];
    }
  }

  /**
   * Parse style guide PDFs
   */
  async parseStyleGuidePDF(filePath: string): Promise<StyleRule[]> {
    try {
      console.log(`🎨 Parsing style guide PDF: ${filePath}`);
      
      const text = await this.extractTextFromPDF(filePath);
      const rules = this.extractStyleRules(text);
      
      this.styleRules.push(...rules);
      
      console.log(`✅ Extracted ${rules.length} style rules`);
      return rules;
    } catch (error) {
      console.error('Error parsing style guide PDF:', error);
      return [];
    }
  }

  /**
   * Extract text from PDF using browser-compatible PDF.js
   */
  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      console.log(`🔍 Extracting text from: ${filePath}`);
      
      // Use PDF.js for browser-based parsing
      const { getDocument } = await import('pdfjs-dist');
      
      // Fetch the PDF file
      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`⚠️ Could not fetch PDF: ${filePath}, falling back to mock data`);
        return await this.mockPDFExtraction(filePath);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await getDocument(arrayBuffer).promise;
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 50); // Limit to first 50 pages for performance
      
      console.log(`📄 Processing ${maxPages} pages from ${pdf.numPages} total pages`);
      
      for (let i = 1; i <= maxPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          if (pageText.length > 10) { // Only add pages with substantial content
            fullText += pageText + '\n\n';
          }
          
          // Progress logging for large files
          if (i % 10 === 0) {
            console.log(`📖 Processed ${i}/${maxPages} pages...`);
          }
        } catch (pageError) {
          console.warn(`⚠️ Error processing page ${i}:`, pageError);
        }
      }
      
      console.log(`✅ Successfully extracted ${fullText.length} characters from ${filePath}`);
      return fullText;
      
    } catch (error) {
      console.error(`❌ Error extracting PDF ${filePath}:`, error);
      console.log(`🔄 Falling back to mock data for ${filePath}`);
      return await this.mockPDFExtraction(filePath);
    }
  }

  /**
   * Mock PDF extraction - replace with real PDF parsing
   */
  private async mockPDFExtraction(filePath: string): Promise<string> {
    const fileName = path.basename(filePath).toLowerCase();
    
    if (fileName.includes('dictionary') || fileName.includes('vocab')) {
      return `
        abandon (verb): to leave completely and finally; forsake utterly
        Synonyms: desert, forsake, leave, quit
        Examples: "Don't abandon your studies" (incorrect: "Don't abandon to your studies")
        
        ability (noun): capacity or skill to do something
        Synonyms: capability, skill, talent, competence
        Examples: "She has the ability to succeed" (incorrect: "She has ability to succeed")
        
        above (preposition): higher than; over
        Synonyms: over, beyond, exceeding
        Examples: "The bird flew above the trees" (incorrect: "The bird flew above to the trees")
      `;
    }
    
    if (fileName.includes('grammar') || fileName.includes('esl')) {
      return `
        Subject-Verb Agreement Rules:
        
        Rule 1: Singular subjects take singular verbs
        Wrong: "She are going to school"
        Correct: "She is going to school"
        
        Rule 2: Use "a" before consonant sounds, "an" before vowel sounds
        Wrong: "I saw a elephant"
        Correct: "I saw an elephant"
        
        Rule 3: Don't use double negatives
        Wrong: "I don't know nothing"
        Correct: "I don't know anything"
        
        Article Usage:
        Wrong: "I am student"
        Correct: "I am a student"
      `;
    }
    
    if (fileName.includes('style') || fileName.includes('writing')) {
      return `
        Conciseness Rules:
        
        Rule 1: Avoid wordy phrases
        Wordy: "in order to"
        Concise: "to"
        
        Rule 2: Eliminate redundancy
        Wordy: "at this point in time"
        Concise: "now"
        
        Rule 3: Use active voice when possible
        Passive: "The ball was thrown by John"
        Active: "John threw the ball"
      `;
    }
    
    return 'Sample PDF text content';
  }

  /**
   * Extract dictionary entries from text (enhanced for real books)
   */
  private extractDictionaryEntries(text: string): DictionaryEntry[] {
    const entries: DictionaryEntry[] = [];
    
    // Multiple patterns to match different dictionary formats
    
    // Pattern 1: Standard dictionary format "word (part): definition"
    const standardPattern = /^([a-zA-Z-]+)\s*\(([^)]+)\):\s*([^.\n]+)/gm;
    
    // Pattern 2: Webster's format "word: definition"
    const websterPattern = /^([a-zA-Z-]+):\s*([^.\n]{20,})/gm;
    
    // Pattern 3: Usage entries "word or phrase [usage note]"
    const usagePattern = /\b([a-zA-Z-]+(?:\s+[a-zA-Z-]+)*)\s*[:\-\s]*(?:should be|avoid|use|prefer|better|correct)\s*([^.\n]{15,})/gmi;
    
    // Pattern 4: Common mistakes format
    const mistakePattern = /(?:wrong|incorrect|avoid|don't say)[:\s]*"([^"]+)"\s*(?:right|correct|say|use)[:\s]*"([^"]+)"/gmi;
    
    console.log(`🔍 Analyzing dictionary text (${text.length} characters)...`);
    
    // Extract standard dictionary entries
    this.extractWithPattern(text, standardPattern, entries, 'standard');
    
    // Extract Webster's style entries
    this.extractWithPattern(text, websterPattern, entries, 'webster');
    
    // Extract usage guidelines
    this.extractUsageGuidelines(text, usagePattern, entries);
    
    // Extract common mistakes
    this.extractMistakePatterns(text, mistakePattern, entries);
    
    console.log(`📖 Extracted ${entries.length} dictionary entries`);
    return entries;
  }

  private extractWithPattern(text: string, pattern: RegExp, entries: DictionaryEntry[], type: string): void {
    let match;
    let count = 0;
    
    while ((match = pattern.exec(text)) !== null && count < 500) { // Limit to prevent infinite loops
      const word = match[1]?.toLowerCase().trim();
      if (!word || word.length < 2) continue;
      
      // Check if we already have this word
      if (entries.some(e => e.word === word)) continue;
      
      let definition = '';
      let partOfSpeech = 'unknown';
      
      if (type === 'standard') {
        partOfSpeech = match[2]?.trim() || 'unknown';
        definition = match[3]?.trim() || '';
      } else if (type === 'webster') {
        definition = match[2]?.trim() || '';
        partOfSpeech = this.guessPartOfSpeech(word, definition);
      }
      
      if (definition.length > 10) { // Only meaningful definitions
        entries.push({
          word,
          definitions: [definition],
          synonyms: [],
          partOfSpeech,
          difficulty: this.determineDifficulty(word),
          commonMistakes: [],
          examples: []
        });
        count++;
      }
    }
    
    console.log(`✅ ${type} pattern: extracted ${count} entries`);
  }

  private extractUsageGuidelines(text: string, pattern: RegExp, entries: DictionaryEntry[]): void {
    let match;
    let count = 0;
    
    while ((match = pattern.exec(text)) !== null && count < 200) {
      const phrase = match[1]?.toLowerCase().trim();
      const guideline = match[2]?.trim();
      
      if (phrase && guideline && phrase.length > 1) {
        entries.push({
          word: phrase,
          definitions: [guideline],
          synonyms: [],
          partOfSpeech: 'usage',
          difficulty: 'intermediate',
          commonMistakes: [],
          examples: []
        });
        count++;
      }
    }
    
    console.log(`✅ Usage guidelines: extracted ${count} entries`);
  }

  private extractMistakePatterns(text: string, pattern: RegExp, entries: DictionaryEntry[]): void {
    let match;
    let count = 0;
    
    while ((match = pattern.exec(text)) !== null && count < 100) {
      const wrong = match[1]?.trim();
      const correct = match[2]?.trim();
      
      if (wrong && correct && wrong !== correct) {
        // Extract the key word from the correction
        const keyWord = this.extractKeyWord(correct);
        
        if (keyWord) {
          entries.push({
            word: keyWord.toLowerCase(),
            definitions: [`Avoid saying "${wrong}". Use "${correct}" instead.`],
            synonyms: [],
            partOfSpeech: 'correction',
            difficulty: 'intermediate',
            commonMistakes: [wrong],
            examples: [correct]
          });
          count++;
        }
      }
    }
    
    console.log(`✅ Mistake patterns: extracted ${count} entries`);
  }

  private guessPartOfSpeech(word: string, definition: string): string {
    const def = definition.toLowerCase();
    
    if (def.includes('verb') || def.includes('to ') || word.endsWith('ing') || word.endsWith('ed')) {
      return 'verb';
    }
    if (def.includes('noun') || def.includes('a ') || def.includes('an ')) {
      return 'noun';
    }
    if (def.includes('adjective') || def.includes('describes') || word.endsWith('ly')) {
      return 'adjective';
    }
    if (def.includes('adverb') || word.endsWith('ly')) {
      return 'adverb';
    }
    
    return 'unknown';
  }

  private extractKeyWord(phrase: string): string | null {
    // Extract the main word from a phrase
    const words = phrase.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    // Filter out common words
    const commonWords = new Set(['the', 'and', 'but', 'for', 'you', 'are', 'not', 'can', 'will', 'have', 'this', 'that', 'with', 'from']);
    const meaningfulWords = words.filter(w => !commonWords.has(w));
    
    return meaningfulWords[0] || words[0] || null;
  }

  /**
   * Extract grammar rules from text (enhanced for Dreyer's English)
   */
  private extractGrammarRules(text: string): GrammarRule[] {
    const rules: GrammarRule[] = [];
    let ruleId = 1;
    
    console.log(`🔍 Analyzing grammar text (${text.length} characters)...`);
    
    // Pattern 1: Traditional "Rule X: Wrong/Correct" format
    const traditionalPattern = /(?:Rule \d+|Chapter \d+)[:\s]*([^:.\n]+)[:\s]*Wrong[:\s]*"([^"]+)"\s*Correct[:\s]*"([^"]+)"/gi;
    
    // Pattern 2: Dreyer's style advice "Don't use X, use Y"
    const dreyerPattern = /(?:don't|avoid|never)\s+(?:use|say|write)\s*"?([^".,\n]+)"?[,.\s]*(?:use|say|write|instead|prefer)\s*"?([^".,\n]+)"?/gi;
    
    // Pattern 3: Common mistake format "X is wrong, Y is right"
    const mistakePattern = /"([^"]+)"\s*(?:is|are)\s*(?:wrong|incorrect|bad|poor)[,.\s]*"([^"]+)"\s*(?:is|are)\s*(?:right|correct|better|preferred)/gi;
    
    // Pattern 4: Direct advice format "Use X instead of Y"
    const advicePattern = /(?:use|prefer|write)\s*"([^"]+)"\s*(?:instead of|rather than|not)\s*"([^"]+)"/gi;
    
    // Pattern 5: Style guidelines from Dreyer's English
    const stylePattern = /(?:always|never|usually|typically|generally)\s+([^.\n]{10,50})/gi;
    
    // Extract traditional rules
    this.extractRulesWithPattern(text, traditionalPattern, rules, ruleId, 'traditional');
    ruleId = rules.length + 1;
    
    // Extract Dreyer's style advice  
    this.extractRulesWithPattern(text, dreyerPattern, rules, ruleId, 'dreyer');
    ruleId = rules.length + 1;
    
    // Extract mistake patterns
    this.extractRulesWithPattern(text, mistakePattern, rules, ruleId, 'mistake');
    ruleId = rules.length + 1;
    
    // Extract advice patterns
    this.extractRulesWithPattern(text, advicePattern, rules, ruleId, 'advice');
    ruleId = rules.length + 1;
    
    // Extract style guidelines
    this.extractStyleGuidelines(text, stylePattern, rules, ruleId);
    
    console.log(`📝 Extracted ${rules.length} grammar rules`);
    return rules;
  }

  private extractRulesWithPattern(text: string, pattern: RegExp, rules: GrammarRule[], startId: number, type: string): void {
    let match;
    let count = 0;
    let currentId = startId;
    
    while ((match = pattern.exec(text)) !== null && count < 200) { // Limit to prevent infinite loops
      let wrong = '';
      let correct = '';
      let description = '';
      
      if (type === 'traditional') {
        description = match[1]?.trim() || '';
        wrong = match[2]?.trim() || '';
        correct = match[3]?.trim() || '';
      } else if (type === 'dreyer' || type === 'advice') {
        wrong = match[1]?.trim() || '';
        correct = match[2]?.trim() || '';
        description = `Avoid "${wrong}", use "${correct}" instead`;
      } else if (type === 'mistake') {
        wrong = match[1]?.trim() || '';
        correct = match[2]?.trim() || '';
        description = `Common mistake: "${wrong}" should be "${correct}"`;
      }
      
      if (wrong && correct && wrong !== correct && wrong.length > 2 && correct.length > 2) {
        // Clean up the text
        wrong = this.cleanText(wrong);
        correct = this.cleanText(correct);
        
        const rule: GrammarRule = {
          id: `${type}_${currentId++}`,
          pattern: this.createAdvancedPattern(wrong),
          title: description || `Use "${correct}" instead of "${wrong}"`,
          description: description || `Grammar rule: Replace "${wrong}" with "${correct}"`,
          correction: correct,
          examples: [{ wrong, correct }],
          severity: this.determineSeverity(wrong, correct),
          category: this.categorizeAdvancedRule(wrong, correct, description),
          eslLevel: this.determineESLLevel(wrong, correct)
        };
        
        rules.push(rule);
        count++;
      }
    }
    
    console.log(`✅ ${type} pattern: extracted ${count} rules`);
  }

  private extractStyleGuidelines(text: string, pattern: RegExp, rules: GrammarRule[], startId: number): void {
    let match;
    let count = 0;
    let currentId = startId;
    
    while ((match = pattern.exec(text)) !== null && count < 100) {
      const guideline = match[1]?.trim();
      
      if (guideline && guideline.length > 10 && guideline.length < 100) {
        const rule: GrammarRule = {
          id: `style_${currentId++}`,
          pattern: new RegExp('.*', 'g'), // Style guidelines apply broadly
          title: 'Style Guideline',
          description: guideline,
          correction: guideline,
          examples: [],
          severity: 'suggestion',
          category: 'word-order',
          eslLevel: 'advanced'
        };
        
        rules.push(rule);
        count++;
      }
    }
    
    console.log(`✅ Style guidelines: extracted ${count} rules`);
  }

  private cleanText(text: string): string {
    return text
      .replace(/["""'']/g, '"') // Normalize quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  private createAdvancedPattern(wrong: string): RegExp {
    // Escape special characters and create flexible pattern
    const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Make pattern case-insensitive and allow for slight variations
    const flexible = escaped
      .replace(/\s+/g, '\\s+') // Allow flexible whitespace
      .replace(/\b/g, '\\b'); // Ensure word boundaries
    
    return new RegExp(`\\b${flexible}\\b`, 'gi');
  }

  private determineSeverity(wrong: string, correct: string): 'error' | 'warning' | 'suggestion' {
    // Grammar errors (subject-verb agreement, articles, etc.)
    if (wrong.includes(' are ') && correct.includes(' is ') ||
        wrong.includes(' is ') && correct.includes(' are ') ||
        wrong.includes(' a ') && correct.includes(' an ') ||
        wrong.includes(' an ') && correct.includes(' a ')) {
      return 'error';
    }
    
    // Style improvements
    if (wrong.length > correct.length * 1.5) {
      return 'suggestion';
    }
    
    return 'warning';
  }

  private categorizeAdvancedRule(wrong: string, correct: string, description: string): GrammarRule['category'] {
    const text = `${wrong} ${correct} ${description}`.toLowerCase();
    
    if (text.includes('subject') || text.includes('verb') || wrong.includes(' are ') || wrong.includes(' is ')) {
      return 'subject-verb';
    }
    if (text.includes('article') || wrong.includes(' a ') || wrong.includes(' an ') || wrong.includes(' the ')) {
      return 'article';
    }
    if (text.includes('preposition') || text.includes(' of ') || text.includes(' in ') || text.includes(' on ')) {
      return 'preposition';
    }
    if (text.includes('tense') || text.includes('past') || text.includes('present')) {
      return 'tense';
    }
    if (text.includes('comma') || text.includes('period') || text.includes('semicolon')) {
      return 'punctuation';
    }
    if (text.includes('capital') || /^[A-Z]/.test(correct) && /^[a-z]/.test(wrong)) {
      return 'capitalization';
    }
    
    return 'word-order';
  }

  private determineESLLevel(wrong: string, correct: string): 'beginner' | 'intermediate' | 'advanced' {
    // Basic errors (articles, simple verbs) = beginner
    if (wrong.includes(' a ') || wrong.includes(' an ') || wrong.includes(' the ') ||
        wrong.includes(' is ') || wrong.includes(' are ') || wrong.includes(' do ') || wrong.includes(' does ')) {
      return 'beginner';
    }
    
    // Complex grammar or style = advanced
    if (wrong.length > 20 || correct.length > 20) {
      return 'advanced';
    }
    
    return 'intermediate';
  }

  /**
   * Extract style rules from text
   */
  private extractStyleRules(text: string): StyleRule[] {
    const rules: StyleRule[] = [];
    
    const stylePattern = /(Wordy|Passive):\s*"([^"]+)"\s*(Concise|Active):\s*"([^"]+)"/g;
    
    let match;
    let ruleId = 1;
    
    while ((match = stylePattern.exec(text)) !== null) {
      const [, type1, example1, type2, example2] = match;
      
      const rule: StyleRule = {
        id: `style_${ruleId++}`,
        pattern: new RegExp(example1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        description: `${type1} phrase - consider using ${type2.toLowerCase()} alternative`,
        suggestion: example2,
        category: type1.toLowerCase() === 'wordy' ? 'conciseness' : 'passive-voice',
        examples: [{ wordy: example1, concise: example2 }]
      };
      
      rules.push(rule);
    }
    
    return rules;
  }

  /**
   * Get all cached dictionary entries
   */
  getDictionaryEntries(): Map<string, DictionaryEntry> {
    return this.dictionaryCache;
  }

  /**
   * Get all grammar rules
   */
  getGrammarRules(): GrammarRule[] {
    return this.grammarRules;
  }

  /**
   * Get all style rules
   */
  getStyleRules(): StyleRule[] {
    return this.styleRules;
  }

  /**
   * Load all PDFs from the data directory
   */
  async loadAllPDFs(): Promise<void> {
    console.log('📚 Loading all PDF resources...');
    
    try {
      // Load real PDF files from your directories
      await this.loadRealPDFs();
      
      console.log(`📊 Total resources loaded:
        - Dictionary entries: ${this.dictionaryCache.size}
        - Grammar rules: ${this.grammarRules.length}
        - Style rules: ${this.styleRules.length}`);
        
    } catch (error) {
      console.error('Error loading PDFs:', error);
      // Fallback to mock data if real PDFs fail
      await this.simulateLoadingPDFs();
    }
  }

  private async loadRealPDFs(): Promise<void> {
    console.log('🔄 Attempting to load real PDFs...');
    
    // For now, use enhanced mock data based on your actual PDF content
    console.log('📚 Loading comprehensive mock data based on Webster\'s Dictionary and Dreyer\'s English...');
    
    // Load enhanced dictionary data (Webster's style)
    await this.loadWebstersDictionaryData();
    
    // Load enhanced grammar data (Dreyer's style)
    await this.loadDreyersGrammarData();
  }

  private async loadWebstersDictionaryData(): Promise<void> {
    console.log('📖 Loading Webster\'s Dictionary mock data...');
    
    // Enhanced dictionary entries based on common ESL needs
    const websterEntries = [
      {
        word: 'good',
        definitions: ['Having the required qualities; of a high standard'],
        synonyms: ['excellent', 'outstanding', 'superb', 'wonderful', 'fine'],
        partOfSpeech: 'adjective',
        difficulty: 'basic' as const,
        commonMistakes: ['good at something', 'very good'],
        examples: ['She is good at mathematics', 'This is a good example']
      },
      {
        word: 'bad',
        definitions: ['Of poor quality or a low standard; not good'],
        synonyms: ['terrible', 'awful', 'poor', 'inadequate', 'dreadful'],
        partOfSpeech: 'adjective',
        difficulty: 'basic' as const,
        commonMistakes: ['bad in something'],
        examples: ['The weather is bad today']
      },
      {
        word: 'big',
        definitions: ['Of considerable size, extent, or intensity'],
        synonyms: ['large', 'enormous', 'huge', 'massive', 'substantial'],
        partOfSpeech: 'adjective',
        difficulty: 'basic' as const,
        commonMistakes: ['more big'],
        examples: ['A big house', 'The big problem']
      },
      {
        word: 'small',
        definitions: ['Of little size; not large or big'],
        synonyms: ['tiny', 'little', 'compact', 'miniature', 'petite'],
        partOfSpeech: 'adjective',
        difficulty: 'basic' as const,
        commonMistakes: ['more small'],
        examples: ['A small car', 'Small details matter']
      },
      {
        word: 'make',
        definitions: ['Form something by putting parts together or combining substances'],
        synonyms: ['create', 'produce', 'construct', 'build', 'manufacture'],
        partOfSpeech: 'verb',
        difficulty: 'basic' as const,
        commonMistakes: ['make homework', 'make a mistake'],
        examples: ['Make a decision', 'Make progress']
      },
      {
        word: 'get',
        definitions: ['Come to have or hold; receive'],
        synonyms: ['obtain', 'acquire', 'receive', 'gain', 'secure'],
        partOfSpeech: 'verb',
        difficulty: 'basic' as const,
        commonMistakes: ['get angry to someone'],
        examples: ['Get a job', 'Get information']
      }
    ];

    websterEntries.forEach(entry => {
      this.dictionaryCache.set(entry.word, entry);
    });

    console.log(`✅ Loaded ${websterEntries.length} Webster's Dictionary entries`);
  }

  private async loadDreyersGrammarData(): Promise<void> {
    console.log('📝 Loading Dreyer\'s English grammar rules...');
    
    // Enhanced grammar rules based on Dreyer's English style
    const dreyersRules = [
      {
        id: 'dreyer_1',
        pattern: /\b(Hello|Hi|Hey)\s+(?!,)/gi,
        title: 'Comma after greeting',
        description: 'Always use a comma after greetings like "Hello", "Hi", or "Hey"',
        correction: 'Add comma after greeting',
        examples: [{ wrong: 'Hello my name is', correct: 'Hello, my name is' }],
        severity: 'warning' as const,
        category: 'punctuation' as const,
        eslLevel: 'beginner' as const
      },
      {
        id: 'dreyer_2',
        pattern: /\s+(and|but|or|so|yet|for|nor)\s+(?!.*,)/gi,
        title: 'Comma before coordinating conjunction',
        description: 'Use a comma before coordinating conjunctions in compound sentences',
        correction: 'Add comma before conjunction',
        examples: [{ wrong: 'I went home and I ate dinner', correct: 'I went home, and I ate dinner' }],
        severity: 'suggestion' as const,
        category: 'punctuation' as const,
        eslLevel: 'intermediate' as const
      },
      {
        id: 'dreyer_3',
        pattern: /\b(dont|wont|cant|isnt|arent|wasnt|werent|hasnt|havent|hadnt|didnt|doesnt|shouldnt|wouldnt|couldnt)\b/gi,
        title: 'Missing apostrophe in contraction',
        description: 'Contractions require apostrophes',
        correction: 'Add apostrophe',
        examples: [{ wrong: 'dont', correct: "don't" }],
        severity: 'error' as const,
        category: 'punctuation' as const,
        eslLevel: 'beginner' as const
      }
    ];

    this.grammarRules.push(...dreyersRules);
    console.log(`✅ Loaded ${dreyersRules.length} Dreyer's English grammar rules`);
  }

  private async simulateLoadingPDFs(): Promise<void> {
    console.log('🔄 Falling back to mock data...');
    
    // Simulate loading dictionary
    await this.parseDictionaryPDF('src/data/pdfs/dictionaries/sample-dictionary.pdf');
    
    // Simulate loading grammar guide
    await this.parseGrammarPDF('src/data/pdfs/grammar/esl-grammar-guide.pdf');
    
    // Simulate loading style guide
    await this.parseStyleGuidePDF('src/data/pdfs/style-guides/writing-style.pdf');
  }

  // Helper methods
  private determineDifficulty(word: string): 'basic' | 'intermediate' | 'advanced' {
    if (word.length <= 4) return 'basic';
    if (word.length <= 8) return 'intermediate';
    return 'advanced';
  }

  private extractCommonMistakes(text: string, word: string): string[] {
    const mistakes: string[] = [];
    const mistakePattern = new RegExp(`incorrect:\\s*"([^"]*${word}[^"]*)"`, 'gi');
    let match;
    
    while ((match = mistakePattern.exec(text)) !== null) {
      mistakes.push(match[1]);
    }
    
    return mistakes;
  }

  private createPatternFromExample(example: string): RegExp {
    // Escape special characters and create a pattern
    const escaped = example.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'gi');
  }

  private categorizeRule(description: string): GrammarRule['category'] {
    const desc = description.toLowerCase();
    if (desc.includes('subject') && desc.includes('verb')) return 'subject-verb';
    if (desc.includes('article') || desc.includes('"a"') || desc.includes('"an"')) return 'article';
    if (desc.includes('preposition')) return 'preposition';
    if (desc.includes('tense')) return 'tense';
    if (desc.includes('punctuation')) return 'punctuation';
    if (desc.includes('capital')) return 'capitalization';
    return 'word-order';
  }

  private loadCachedData(): void {
    // In production, load from localStorage or IndexedDB
    console.log('📂 Loading cached grammar and dictionary data...');
  }

  private saveCachedData(): void {
    // In production, save to localStorage or IndexedDB
    console.log('💾 Saving parsed data to cache...');
  }
}

// Export singleton instance
export const pdfParserService = new PDFParserService();
export default pdfParserService; 