// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  targetAudience: 'students' | 'professionals' | 'creators'
  writingStyle: 'academic' | 'business' | 'casual' | 'creative'
  suggestions: {
    grammar: boolean
    style: boolean
    vocabulary: boolean
    clarity: boolean
    tone: boolean
  }
  autoSave: boolean
  theme: 'light' | 'dark' | 'system'
}

// Document Types
export interface Document {
  id: string
  title: string
  content: string
  userId: string
  type: DocumentType
  status: 'draft' | 'published' | 'archived'
  suggestions: Suggestion[]
  metadata: DocumentMetadata
  createdAt: Date
  updatedAt: Date
}

export type DocumentType = 
  | 'essay'
  | 'email'
  | 'blog-post'
  | 'academic-paper'
  | 'business-report'
  | 'creative-writing'
  | 'social-media'
  | 'presentation'

export interface DocumentMetadata {
  wordCount: number
  readingTime: number
  readabilityScore: number
  targetAudience?: string
  tags: string[]
}

// Suggestion Types
export interface Suggestion {
  id: string
  type: SuggestionType
  severity: 'error' | 'warning' | 'info'
  message: string
  explanation: string
  position: TextPosition
  originalText: string
  suggestions: string[]
  confidence: number
  accepted?: boolean
  timestamp: Date
  isAcademicTone?: boolean
  semanticKey?: string
}

export type SuggestionType = 
  | 'grammar'
  | 'spelling'
  | 'style'
  | 'vocabulary'
  | 'clarity'
  | 'tone'
  | 'conciseness'
  | 'formality'
  | 'punctuation'
  | 'academic_tone'

export interface TextPosition {
  start: number
  end: number
  line?: number
  column?: number
}

// AI Analysis Types
export interface AIAnalysis {
  documentId: string
  overallScore: number
  metrics: {
    grammar: number
    style: number
    clarity: number
    engagement: number
    readability: number
  }
  suggestions: Suggestion[]
  summary: string
  improvements: string[]
  strengths: string[]
  generatedAt: Date
}

// API Response Types
export interface APIResponse<T> {
  data: T
  error?: string
  message?: string
  success: boolean
}

// Writing Assistant Types
export interface WritingSession {
  documentId: string
  startTime: Date
  endTime?: Date
  wordsWritten: number
  suggestionsAccepted: number
  suggestionsRejected: number
  keystrokeCount: number
}

// User Story Types (for MVP focus)
export interface UserStory {
  id: string
  title: string
  description: string
  acceptance_criteria: string[]
  user_type: 'student' | 'professional' | 'creator'
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'in_progress' | 'completed'
  feature_category: 'grammar' | 'style' | 'vocabulary' | 'real_time' | 'ai_analysis' | 'user_experience'
} 