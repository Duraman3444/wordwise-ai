import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,

  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

export interface CloudDocument {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
  wordCount: number
  characterCount: number
}

export interface CreateDocumentData {
  title: string
  content: string
  userId: string
}

export interface UpdateDocumentData {
  title?: string
  content?: string
}

class FirestoreService {
  private readonly COLLECTION_NAME = 'documents'

  // Create a new document
  async createDocument(data: CreateDocumentData): Promise<CloudDocument> {
    try {
      const docData = {
        ...data,
        wordCount: this.countWords(data.content),
        characterCount: data.content.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), docData)
      
      // Get the created document to return with proper timestamps
      const createdDoc = await getDoc(docRef)
      if (!createdDoc.exists()) {
        throw new Error('Failed to retrieve created document')
      }

      return this.formatDocument(createdDoc.id, createdDoc.data())
    } catch (error) {
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get a specific document by ID
  async getDocument(documentId: string, userId: string): Promise<CloudDocument | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const docData = docSnap.data()
      
      // Verify the user owns this document
      if (docData.userId !== userId) {
        throw new Error('Unauthorized access to document')
      }

      return this.formatDocument(docSnap.id, docData)
    } catch (error) {
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get all documents for a user
  async getUserDocuments(userId: string, limitCount: number = 50): Promise<CloudDocument[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => 
        this.formatDocument(doc.id, doc.data())
      )
    } catch (error) {
      throw new Error(`Failed to get user documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update an existing document
  async updateDocument(documentId: string, userId: string, updates: UpdateDocumentData): Promise<CloudDocument> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId)
      
      // First verify the document exists and user owns it
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        throw new Error('Document not found')
      }

      const docData = docSnap.data()
      if (docData.userId !== userId) {
        throw new Error('Unauthorized access to document')
      }

      // Prepare update data
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      // Update word and character counts if content is being updated
      if (updates.content !== undefined) {
        updateData.wordCount = this.countWords(updates.content)
        updateData.characterCount = updates.content.length
      }

      await updateDoc(docRef, updateData)

      // Get the updated document
      const updatedDoc = await getDoc(docRef)
      if (!updatedDoc.exists()) {
        throw new Error('Failed to retrieve updated document')
      }

      return this.formatDocument(updatedDoc.id, updatedDoc.data())
    } catch (error) {
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Delete a document
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId)
      
      // First verify the document exists and user owns it
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        throw new Error('Document not found')
      }

      const docData = docSnap.data()
      if (docData.userId !== userId) {
        throw new Error('Unauthorized access to document')
      }

      await deleteDoc(docRef)
    } catch (error) {
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search documents by title
  async searchDocuments(userId: string, searchTerm: string): Promise<CloudDocument[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production you'd want to use 
      // Algolia or implement more sophisticated search
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs
        .map(doc => this.formatDocument(doc.id, doc.data()))
        .filter(doc => 
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
    } catch (error) {
      throw new Error(`Failed to search documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper method to format Firestore document data
  private formatDocument(id: string, data: any): CloudDocument {
    return {
      id,
      title: data.title || 'Untitled',
      content: data.content || '',
      userId: data.userId,
      wordCount: data.wordCount || 0,
      characterCount: data.characterCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  }

  // Helper method to count words
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }
}

export const firestoreService = new FirestoreService()
export default firestoreService 