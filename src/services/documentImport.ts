import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist';
import { Document } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Ensure PDF worker is configured
import '../utils/pdfWorker';

export interface ImportOptions {
  preserveFormatting?: boolean;
  extractImages?: boolean;
  convertToMarkdown?: boolean;
}

export interface ImportResult {
  success: boolean;
  document?: Document;
  error?: string;
  warnings?: string[];
}

export interface ImportProgress {
  stage: 'reading' | 'parsing' | 'processing' | 'complete';
  progress: number; // 0-100
  message: string;
}

export class DocumentImportService {
  private onProgress?: (progress: ImportProgress) => void;

  constructor(onProgress?: (progress: ImportProgress) => void) {
    this.onProgress = onProgress;
  }

  /**
   * Import a document from a File object
   */
  async importDocument(file: File, options: ImportOptions = {}): Promise<ImportResult> {
    this.reportProgress('reading', 0, 'Reading file...');

    try {
      const fileExtension = this.getFileExtension(file.name).toLowerCase();
      const documentTitle = this.extractTitleFromFilename(file.name);

      switch (fileExtension) {
        case 'docx':
        case 'doc':
          return await this.importWordDocument(file, documentTitle, options);
          
        case 'pdf':
          return await this.importPDFDocument(file, documentTitle, options);
          
        case 'txt':
        case 'rtf':
          return await this.importTextDocument(file, documentTitle, options);
          
        default:
          return {
            success: false,
            error: `Unsupported file type: ${fileExtension}. Supported formats: .docx, .doc, .pdf, .txt, .rtf`
          };
      }
    } catch (error) {
      console.error('Document import failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during import'
      };
    }
  }

  /**
   * Import Word document (.docx, .doc)
   */
  private async importWordDocument(file: File, title: string, options: ImportOptions): Promise<ImportResult> {
    this.reportProgress('parsing', 25, 'Parsing Word document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (file.name.endsWith('.docx')) {
        // Use mammoth for .docx files
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        this.reportProgress('processing', 75, 'Processing document content...');
        
        const document = this.createDocument({
          title,
          content: options.convertToMarkdown ? this.htmlToMarkdown(result.value) : result.value,
          type: 'essay'
        });

        const warnings = result.messages.length > 0 
          ? result.messages.map(m => m.message)
          : undefined;

        this.reportProgress('complete', 100, 'Import completed successfully!');

        return {
          success: true,
          document,
          warnings
        };
      } else {
        // For .doc files, we'll need a different approach
        // For now, show an informative error
        return {
          success: false,
          error: 'Legacy .doc files are not fully supported. Please save as .docx format for best results, or copy and paste your content.',
          warnings: ['Tip: In Word, go to File > Save As > Choose .docx format']
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import PDF document
   */
  private async importPDFDocument(file: File, title: string, options: ImportOptions): Promise<ImportResult> {
    this.reportProgress('parsing', 25, 'Parsing PDF document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument(arrayBuffer).promise;
      
      this.reportProgress('processing', 50, `Processing ${pdf.numPages} pages...`);
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 100); // Limit for performance
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText.length > 10) {
          fullText += pageText + '\n\n';
        }
        
        // Update progress
        const progress = 50 + (i / maxPages) * 40;
        this.reportProgress('processing', progress, `Processing page ${i} of ${maxPages}...`);
      }

      const document = this.createDocument({
        title,
        content: options.convertToMarkdown ? this.textToMarkdown(fullText) : fullText,
        type: 'essay'
      });

      const warnings = pdf.numPages > 100 
        ? [`Only the first 100 pages were imported (document has ${pdf.numPages} pages)`]
        : undefined;

      this.reportProgress('complete', 100, 'PDF import completed successfully!');

      return {
        success: true,
        document,
        warnings
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import plain text document
   */
  private async importTextDocument(file: File, title: string, options: ImportOptions): Promise<ImportResult> {
    this.reportProgress('parsing', 50, 'Reading text content...');

    try {
      let content = await file.text();

      // Handle RTF files by stripping formatting
      if (file.name.endsWith('.rtf')) {
        content = this.stripRTFFormatting(content);
      }

      this.reportProgress('processing', 90, 'Processing text content...');

      const document = this.createDocument({
        title,
        content: options.convertToMarkdown ? this.textToMarkdown(content) : content,
        type: 'essay'
      });

      this.reportProgress('complete', 100, 'Text import completed successfully!');

      return {
        success: true,
        document
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read text file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create a Document object with proper metadata
   */
  private createDocument(params: { title: string; content: string; type: Document['type'] }): Document {
    const now = new Date();
    const wordCount = this.calculateWordCount(params.content);
    
    return {
      id: uuidv4(),
      title: params.title,
      content: params.content,
      userId: 'current-user', // This should be set from auth context
      type: params.type,
      status: 'draft',
      suggestions: [],
      metadata: {
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        readabilityScore: 0, // Could be calculated
        tags: []
      },
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Utility functions
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  private extractTitleFromFilename(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  }

  private calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private stripRTFFormatting(rtfText: string): string {
    return rtfText
      .replace(/\\[a-z]{1,32}(-?\d{1,10})?[ ]?|\\'[0-9a-f]{2}|\\([^a-z])|[{}]|\r\n?|\n/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private htmlToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    return html
      .replace(/<h([1-6])>/gi, (match, level) => '#'.repeat(parseInt(level)) + ' ')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<strong>|<b>/gi, '**')
      .replace(/<\/strong>|<\/b>/gi, '**')
      .replace(/<em>|<i>/gi, '*')
      .replace(/<\/em>|<\/i>/gi, '*')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim();
  }

  private textToMarkdown(text: string): string {
    // Convert plain text to basic markdown structure
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    return paragraphs.map(p => p.trim()).join('\n\n');
  }

  private reportProgress(stage: ImportProgress['stage'], progress: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message });
    }
  }
}

// Factory function for easy usage
export const createDocumentImporter = (onProgress?: (progress: ImportProgress) => void) => {
  return new DocumentImportService(onProgress);
}; 