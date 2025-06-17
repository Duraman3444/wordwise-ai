import nlp from 'compromise'

export interface GrammarError {
  id: string
  type: 'grammar' | 'spelling' | 'style'
  message: string
  suggestion: string[]
  start: number
  end: number
  severity: 'error' | 'warning' | 'suggestion'
  explanation?: string
}

export class GrammarChecker {
  private commonMisspellings: { [key: string]: string[] } = {}
  private grammarPatterns: { [key: string]: string[] } = {}
  private basicDictionary: Set<string> = new Set()
  private extendedDictionary: Set<string> = new Set()
  private inappropriateWords: { [key: string]: { correct: string, alternatives: string[] } } = {}

  constructor() {
    // Initialize comprehensive dictionaries
    this.initializeDictionaries()
    this.initializeInappropriateWords()
    this.initializeCommonMisspellings()
    this.initializeGrammarPatterns()
  }

  private initializeDictionaries() {
    // Basic dictionary for common words
    this.basicDictionary = new Set([
      'hello', 'world', 'the', 'is', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'under',
      'between', 'among', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'get', 'got', 'go', 'went', 'gone',
      'make', 'made', 'take', 'took', 'taken', 'come', 'came', 'see', 'saw', 'seen', 'know', 'knew', 'known',
      'think', 'thought', 'say', 'said', 'tell', 'told', 'give', 'gave', 'given', 'find', 'found',
      'work', 'worked', 'call', 'called', 'try', 'tried', 'ask', 'asked', 'need', 'needed', 'feel', 'felt',
      'become', 'became', 'leave', 'left', 'put', 'seem', 'seemed', 'keep', 'kept', 'let', 'begin', 'began',
      'help', 'helped', 'show', 'showed', 'shown', 'hear', 'heard', 'play', 'played', 'run', 'ran',
      'move', 'moved', 'live', 'lived', 'believe', 'believed', 'bring', 'brought', 'happen', 'happened',
      'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid',
      'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learned', 'change', 'changed',
      'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped',
      'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'open', 'opened', 'close', 'closed',
      'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'wait', 'waited', 'serve', 'served',
      'die', 'died', 'send', 'sent', 'expect', 'expected', 'build', 'built', 'stay', 'stayed',
      'fall', 'fell', 'fallen', 'cut', 'reach', 'reached', 'kill', 'killed', 'remain', 'remained',
      'name', 'names', 'can', 'give', 'papa', 'mouth', 'words', 'wrong', 'grammar', 'please', 'done', 'pantaloons'
    ])

    // Extended dictionary for more comprehensive checking
    this.extendedDictionary = new Set([
      ...this.basicDictionary,
      // Add more common words
      'example', 'important', 'different', 'following', 'without', 'again', 'something', 'each', 'right', 'between',
      'three', 'state', 'never', 'become', 'another', 'however', 'many', 'those', 'much', 'family', 'own', 'out',
      'leave', 'put', 'old', 'while', 'mean', 'keep', 'student', 'why', 'let', 'great', 'same', 'big', 'group',
      'begin', 'seem', 'country', 'help', 'talk', 'where', 'turn', 'problem', 'every', 'start', 'hand', 'might',
      'american', 'show', 'part', 'about', 'against', 'place', 'over', 'such', 'again', 'few', 'case', 'most',
      'week', 'company', 'where', 'system', 'each', 'right', 'program', 'hear', 'question', 'during', 'work',
      'play', 'government', 'run', 'small', 'number', 'off', 'always', 'move', 'like', 'night', 'live', 'point',
      'believe', 'hold', 'today', 'bring', 'happen', 'next', 'without', 'before', 'large', 'all', 'million',
      'must', 'home', 'under', 'water', 'room', 'write', 'mother', 'area', 'national', 'money', 'story', 'young',
      'fact', 'month', 'different', 'lot', 'study', 'book', 'eye', 'job', 'word', 'business', 'issue', 'side',
      'kind', 'head', 'house', 'service', 'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'member',
      'law', 'car', 'city', 'community', 'name', 'president', 'university', 'public', 'history', 'party', 'result',
      'change', 'morning', 'reason', 'research', 'girl', 'guy', 'moment', 'air', 'teacher', 'force', 'education'
    ])
  }

  private initializeInappropriateWords() {
    this.inappropriateWords = {
      'shiat': { correct: 'shoot', alternatives: ['darn', 'oh no', 'goodness'] },
      'pee': { correct: 'urinate', alternatives: ['use restroom', 'bathroom break'] },
      'poo': { correct: 'defecate', alternatives: ['bathroom', 'restroom'] },
      'crap': { correct: 'nonsense', alternatives: ['poor quality', 'rubbish', 'bad'] },
      'stupid': { correct: 'unwise', alternatives: ['poor', 'ineffective', 'misguided'] },
      'dumb': { correct: 'unwise', alternatives: ['poor', 'ineffective', 'illogical'] },
      'skibidi': { correct: 'silly', alternatives: ['playful', 'fun', 'energetic'] }
    }
  }

  private initializeCommonMisspellings() {
    this.commonMisspellings = {
      'teh': ['the'],
      'recieve': ['receive'],
      'seperate': ['separate'],
      'definately': ['definitely'],
      'occured': ['occurred'],
      'accomodate': ['accommodate'],
      'neccessary': ['necessary'],
      'embarass': ['embarrass'],
      'alot': ['a lot'],
      'untill': ['until'],
      'begining': ['beginning'],
      'wierd': ['weird'],
      'freind': ['friend'],
      'calender': ['calendar'],
      'goverment': ['government'],
      'rember': ['remember'],
      'shedule': ['schedule'],
      'beleive': ['believe'],
      'sucess': ['success'],
      'buisness': ['business'],
      'occassion': ['occasion'],
      'reccomend': ['recommend'],
      'adress': ['address'],
      'aparent': ['apparent'],
      'comming': ['coming'],
      'difinitely': ['definitely'],
      'excersise': ['exercise'],
      'fourty': ['forty'],
      'gratefull': ['grateful'],
      'happend': ['happened'],
      'intrested': ['interested'],
      'libary': ['library'],
      'posible': ['possible'],
      'tommorow': ['tomorrow'],
      'diffrent': ['different'],
      'perfact': ['perfect'],
      'excelent': ['excellent'],
      'beatiful': ['beautiful'],
      'importent': ['important'],
      'indipendent': ['independent'],
      'becuase': ['because'],
      'receving': ['receiving'],
      'writeing': ['writing'],
      'makeing': ['making'],
      'comeing': ['coming'],
      'liveing': ['living'],
      'haveing': ['having'],
      'giveing': ['giving'],
      'takeing': ['taking'],
      'useing': ['using'],
      'loveing': ['loving'],
      'moveing': ['moving'],
      'pacakge': ['package'],
      'langauge': ['language'],
      'knowlege': ['knowledge'],
      'priviledge': ['privilege'],
      'maintainance': ['maintenance'],
      'occurence': ['occurrence'],
      'refference': ['reference'],
      'diferent': ['different'],
      'independant': ['independent'],
      'existance': ['existence'],
      'persistant': ['persistent'],
      'resistence': ['resistance'],
      'appearence': ['appearance'],
      'experiance': ['experience'],
      'performence': ['performance'],
      'recomend': ['recommend'],
      'developement': ['development'],
      'enviroment': ['environment'],
      'managment': ['management'],
      'arguement': ['argument'],
      'judgement': ['judgment'],
      'acknowledgement': ['acknowledgment'],
      'mispell': ['misspell'],
      'upto': ['up to'],
      'alright': ['all right'],
      'incase': ['in case'],
      'alittle': ['a little'],
      'thankyou': ['thank you'],
      'goodluck': ['good luck'],
      'anymore': ['any more'],
      'anyways': ['anyway'],
      'irregardless': ['regardless'],
      'supposably': ['supposedly'],
      'gammer': ['grammar'],
      'plese': ['please'],
      'hahahahaha': ['haha']
    }
  }

  private initializeGrammarPatterns() {
    this.grammarPatterns = {
      'could of': ['could have'],
      'would of': ['would have'],
      'should of': ['should have'],
      'might of': ['might have'],
      'must of': ['must have'],
      'your welcome': ['you\'re welcome'],
      'its okay': ['it\'s okay'],
      'who\'s book': ['whose book'],
      'there going': ['they\'re going'],
      'there house': ['their house'],
      'to much': ['too much'],
      'to many': ['too many'],
      'alot': ['a lot'],
      'loose weight': ['lose weight'],
      'than you': ['thank you'],
      'then you': ['than you'],  // context dependent
    }
  }

  async checkText(text: string): Promise<GrammarError[]> {
    const errors: GrammarError[] = []
    let errorId = 0

    console.log('Checking text:', text)

    // 1. Universal spelling check
    const spellingErrors = this.universalSpellCheck(text)
    errors.push(...spellingErrors.map(error => ({ ...error, id: `spell-${errorId++}` })))

    // 2. Universal grammar check
    const grammarErrors = this.universalGrammarCheck(text)
    errors.push(...grammarErrors.map(error => ({ ...error, id: `grammar-${errorId++}` })))

    // 3. Inappropriate word check with alternatives
    const inappropriateErrors = this.checkInappropriateWords(text)
    errors.push(...inappropriateErrors.map(error => ({ ...error, id: `inappropriate-${errorId++}` })))

    // 4. Sentence structure analysis
    const structureErrors = this.analyzeSentenceStructure(text)
    errors.push(...structureErrors.map(error => ({ ...error, id: `structure-${errorId++}` })))

    // 5. Punctuation and capitalization
    const punctuationErrors = this.checkPunctuationAndCapitalization(text)
    errors.push(...punctuationErrors.map(error => ({ ...error, id: `punct-${errorId++}` })))

    console.log('Found errors:', errors)
    return errors
  }

  private universalSpellCheck(text: string): Omit<GrammarError, 'id'>[] {
    const errors: Omit<GrammarError, 'id'>[] = []
    const words = text.match(/\b[a-zA-Z]+\b/g) || []
    let currentPos = 0

    words.forEach(word => {
      const wordStart = text.indexOf(word, currentPos)
      currentPos = wordStart + word.length
      const lowerWord = word.toLowerCase()

      // Skip very short words and obvious proper nouns in specific contexts
      if (word.length < 3) {
        return
      }

      // Check common misspellings first (highest confidence)
      if (this.commonMisspellings[lowerWord]) {
        errors.push({
          type: 'spelling',
          message: `"${word}" is misspelled`,
          suggestion: this.commonMisspellings[lowerWord],
          start: wordStart,
          end: wordStart + word.length,
          severity: 'error',
          explanation: `Did you mean "${this.commonMisspellings[lowerWord][0]}"?`
        })
        return
      }

      // Universal spell check: if not in dictionary, suggest corrections
      if (!this.extendedDictionary.has(lowerWord) && !this.isProperNoun(word)) {
        const suggestions = this.generateSpellingSuggestions(lowerWord)
        
        if (suggestions.length > 0) {
          errors.push({
            type: 'spelling',
            message: `"${word}" may be misspelled`,
            suggestion: suggestions,
            start: wordStart,
            end: wordStart + word.length,
            severity: 'warning',
            explanation: `Possible corrections: ${suggestions.slice(0, 2).join(', ')}`
          })
        }
      }
    })

    return errors
  }

  private universalGrammarCheck(text: string): Omit<GrammarError, 'id'>[] {
    const errors: Omit<GrammarError, 'id'>[] = []

    // Check predefined grammar patterns
    Object.entries(this.grammarPatterns).forEach(([mistake, corrections]) => {
      const regex = new RegExp(`\\b${mistake.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      let match
      while ((match = regex.exec(text)) !== null) {
        errors.push({
          type: 'grammar',
          message: `Grammar error: "${match[0]}"`,
          suggestion: corrections,
          start: match.index,
          end: match.index + match[0].length,
          severity: 'error',
          explanation: `"${match[0]}" should be "${corrections[0]}"`
        })
      }
    })

    // Check subject-verb agreement and other grammar rules
    const grammarRuleErrors = this.checkGrammarRules(text)
    errors.push(...grammarRuleErrors)

    return errors
  }

  private checkInappropriateWords(text: string): Omit<GrammarError, 'id'>[] {
    const errors: Omit<GrammarError, 'id'>[] = []

    Object.entries(this.inappropriateWords).forEach(([word, options]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      let match
      while ((match = regex.exec(text)) !== null) {
        errors.push({
          type: 'style',
          message: `Consider replacing "${match[0]}" with more appropriate language`,
          suggestion: [options.correct, ...options.alternatives],
          start: match.index,
          end: match.index + match[0].length,
          severity: 'suggestion',
          explanation: `You can use "${options.correct}" for formal writing, or choose: ${options.alternatives.join(', ')}`
        })
      }
    })

    return errors
  }

  private analyzeSentenceStructure(text: string): Omit<GrammarError, 'id'>[] {
    const errors: Omit<GrammarError, 'id'>[] = []

    try {
      const doc = nlp(text)
      const sentences = doc.sentences().out('array')

      sentences.forEach((sentence: string) => {
        const sentenceStart = text.indexOf(sentence)
        if (sentenceStart === -1) return

        // Check sentence length
        const wordCount = sentence.split(/\s+/).length
        if (wordCount > 30) {
          errors.push({
            type: 'style',
            message: 'Very long sentence detected',
            suggestion: ['Consider breaking into shorter sentences'],
            start: sentenceStart,
            end: sentenceStart + sentence.length,
            severity: 'suggestion',
            explanation: `This sentence has ${wordCount} words. Shorter sentences are often clearer.`
          })
        }

        // Check for run-on sentences (multiple clauses without proper punctuation)
        if (sentence.split(' and ').length > 3 || sentence.split(' but ').length > 2) {
          errors.push({
            type: 'style',
            message: 'Possible run-on sentence',
            suggestion: ['Break into separate sentences', 'Use semicolons', 'Add commas'],
            start: sentenceStart,
            end: sentenceStart + sentence.length,
            severity: 'suggestion',
            explanation: 'This sentence may have too many clauses. Consider breaking it up.'
          })
        }

        // Check for sentence fragments (very basic check)
        if (wordCount < 3 && !sentence.match(/[.!?]$/)) {
          errors.push({
            type: 'grammar',
            message: 'Possible sentence fragment',
            suggestion: ['Complete the sentence', 'Add subject or verb'],
            start: sentenceStart,
            end: sentenceStart + sentence.length,
            severity: 'warning',
            explanation: 'This may be an incomplete sentence.'
          })
        }
      })
    } catch (e) {
      console.warn('Sentence structure analysis error:', e)
    }

    return errors
  }

  private checkGrammarRules(text: string): Omit<GrammarError, 'id'>[] {
    const errors: Omit<GrammarError, 'id'>[] = []

    // Check for double negatives
    const doubleNegativePattern = /\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|isn't|aren't|wasn't|weren't)\s+\w*\s+(no|nothing|nobody|nowhere|never|none)\b/gi
    let match
    while ((match = doubleNegativePattern.exec(text)) !== null) {
      errors.push({
        type: 'grammar',
        message: 'Double negative detected',
        suggestion: ['Use positive form', 'Remove one negative'],
        start: match.index,
        end: match.index + match[0].length,
        severity: 'warning',
        explanation: 'Double negatives can be confusing. Use either positive or single negative form.'
      })
    }

    // Check for comma splices (basic detection)
    const commaSplicePattern = /\b\w+\s*,\s*\w+\s+(is|are|was|were|will|would|can|could|should|may|might|must|do|does|did|have|has|had)\b/gi
    while ((match = commaSplicePattern.exec(text)) !== null) {
      errors.push({
        type: 'grammar',
        message: 'Possible comma splice',
        suggestion: ['Use semicolon', 'Make separate sentences', 'Add conjunction'],
        start: match.index,
        end: match.index + match[0].length,
        severity: 'suggestion',
        explanation: 'Two independent clauses may need stronger punctuation than a comma.'
      })
    }

    return errors
  }

  private checkPunctuationAndCapitalization(text: string): Omit<GrammarError, 'id'>[] {
    const errors: Omit<GrammarError, 'id'>[] = []

    // Check for sentences not starting with capital letters
    const sentences = text.split(/[.!?]+\s+/)
    let currentPos = 0

    sentences.forEach((sentence, _index) => {
      if (sentence.trim().length === 0) return
      
      const sentenceStart = text.indexOf(sentence.trim(), currentPos)
      if (sentenceStart !== -1 && sentence.trim().match(/^[a-z]/)) {
        errors.push({
          type: 'grammar',
          message: 'Sentence should start with capital letter',
          suggestion: [sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1)],
          start: sentenceStart,
          end: sentenceStart + 1,
          severity: 'warning',
          explanation: 'Sentences should begin with a capital letter'
        })
      }
      currentPos = sentenceStart + sentence.length
    })

    // Check for multiple spaces
    let doubleSpaceIndex = 0
    while ((doubleSpaceIndex = text.indexOf('  ', doubleSpaceIndex)) !== -1) {
      errors.push({
        type: 'style',
        message: 'Multiple spaces found',
        suggestion: [' '],
        start: doubleSpaceIndex,
        end: doubleSpaceIndex + 2,
        severity: 'suggestion',
        explanation: 'Use single space between words'
      })
      doubleSpaceIndex += 2
    }

    // Check for missing periods at end of sentences
    if (text.trim().length > 0 && !text.trim().match(/[.!?]$/)) {
      errors.push({
        type: 'grammar',
        message: 'Missing punctuation at end',
        suggestion: [text.trim() + '.'],
        start: text.length - 1,
        end: text.length,
        severity: 'warning',
        explanation: 'Sentences should end with proper punctuation'
      })
    }

    return errors
  }

  private generateSpellingSuggestions(word: string): string[] {
    const suggestions = []

    // Check edit distance with common words
    for (const dictWord of this.extendedDictionary) {
      if (dictWord.length > 2 && Math.abs(word.length - dictWord.length) <= 2) {
        const distance = this.editDistance(word, dictWord)
        if (distance <= 2) {
          suggestions.push(dictWord)
        }
      }
    }

    // Check for common letter substitutions
    const commonSubstitutions = [
      ['ie', 'ei'], ['ei', 'ie'], ['ph', 'f'], ['f', 'ph'],
      ['c', 'k'], ['k', 'c'], ['s', 'z'], ['z', 's']
    ]

    commonSubstitutions.forEach(([from, to]) => {
      if (word.includes(from)) {
        const variant = word.replace(from, to)
        if (this.extendedDictionary.has(variant)) {
          suggestions.push(variant)
        }
      }
    })

    // Remove duplicates and sort by relevance
    return [...new Set(suggestions)].slice(0, 3)
  }

  private isProperNoun(word: string): boolean {
    return /^[A-Z]/.test(word) && word.length > 2
  }

  private editDistance(a: string, b: string): number {
    const matrix = []
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[b.length][a.length]
  }

  // Apply a suggestion to text
  applySuggestion(text: string, error: GrammarError, suggestionIndex: number = 0): string {
    const suggestion = error.suggestion[suggestionIndex]
    if (!suggestion) return text

    return text.substring(0, error.start) + suggestion + text.substring(error.end)
  }

  // Ignore/dismiss an error
  ignoreError(errors: GrammarError[], errorId: string): GrammarError[] {
    return errors.filter(error => error.id !== errorId)
  }
} 