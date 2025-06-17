import { create } from 'zustand'
import { Document, Suggestion, AIAnalysis } from '@/types'

interface DocumentState {
  currentDocument: Document | null
  documents: Document[]
  suggestions: Suggestion[]
  analysis: AIAnalysis | null
  isAnalyzing: boolean
  isLoading: boolean
  
  // Document actions
  setCurrentDocument: (document: Document) => void
  updateCurrentDocument: (updates: Partial<Document>) => void
  addDocument: (document: Document) => void
  removeDocument: (documentId: string) => void
  
  // Suggestion actions
  setSuggestions: (suggestions: Suggestion[]) => void
  addSuggestion: (suggestion: Suggestion) => void
  acceptSuggestion: (suggestionId: string) => void
  rejectSuggestion: (suggestionId: string) => void
  
  // Analysis actions
  setAnalysis: (analysis: AIAnalysis) => void
  setAnalyzing: (analyzing: boolean) => void
  setLoading: (loading: boolean) => void
  
  // Reset state
  reset: () => void
}

const initialState = {
  currentDocument: null,
  documents: [],
  suggestions: [],
  analysis: null,
  isAnalyzing: false,
  isLoading: false,
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  ...initialState,

  setCurrentDocument: (document: Document) => {
    set({ currentDocument: document })
  },

  updateCurrentDocument: (updates: Partial<Document>) => {
    const currentDocument = get().currentDocument
    if (currentDocument) {
      const updatedDocument = {
        ...currentDocument,
        ...updates,
        updatedAt: new Date(),
      }
      set({ currentDocument: updatedDocument })
      
      // Update in documents list
      const documents = get().documents.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
      set({ documents })
    }
  },

  addDocument: (document: Document) => {
    set(state => ({
      documents: [...state.documents, document]
    }))
  },

  removeDocument: (documentId: string) => {
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== documentId),
      currentDocument: state.currentDocument?.id === documentId ? null : state.currentDocument
    }))
  },

  setSuggestions: (suggestions: Suggestion[]) => {
    set({ suggestions })
  },

  addSuggestion: (suggestion: Suggestion) => {
    set(state => ({
      suggestions: [...state.suggestions, suggestion]
    }))
  },

  acceptSuggestion: (suggestionId: string) => {
    set(state => ({
      suggestions: state.suggestions.map(s => 
        s.id === suggestionId ? { ...s, accepted: true } : s
      )
    }))
  },

  rejectSuggestion: (suggestionId: string) => {
    set(state => ({
      suggestions: state.suggestions.map(s => 
        s.id === suggestionId ? { ...s, accepted: false } : s
      )
    }))
  },

  setAnalysis: (analysis: AIAnalysis) => {
    set({ analysis })
  },

  setAnalyzing: (analyzing: boolean) => {
    set({ isAnalyzing: analyzing })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  reset: () => {
    set(initialState)
  },
})) 