import { pdfParserService } from '../services/pdfParser';

/**
 * Test utility to validate PDF parsing implementation
 */
export async function testPDFParsing() {
  console.log('🧪 Testing PDF parsing implementation...');
  
  try {
    // Test loading PDFs
    await pdfParserService.loadAllPDFs();
    
    // Check what was loaded
    const dictionaryEntries = pdfParserService.getDictionaryEntries();
    const grammarRules = pdfParserService.getGrammarRules();
    const styleRules = pdfParserService.getStyleRules();
    
    console.log(`📊 PDF Parsing Results:
    📖 Dictionary entries: ${dictionaryEntries.size}
    📝 Grammar rules: ${grammarRules.length}
    🎨 Style rules: ${styleRules.length}`);
    
    // Show sample entries
    if (dictionaryEntries.size > 0) {
      console.log('\n📖 Sample Dictionary Entries:');
      let count = 0;
      for (const [word, entry] of dictionaryEntries.entries()) {
        if (count >= 5) break;
        console.log(`  • ${word}: ${entry.definitions[0]?.substring(0, 100)}...`);
        count++;
      }
    }
    
    // Show sample grammar rules
    if (grammarRules.length > 0) {
      console.log('\n📝 Sample Grammar Rules:');
      grammarRules.slice(0, 5).forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.title}`);
        if (rule.examples.length > 0) {
          console.log(`     Wrong: "${rule.examples[0].wrong}"`);
          console.log(`     Correct: "${rule.examples[0].correct}"`);
        }
      });
    }
    
    // Show sample style rules
    if (styleRules.length > 0) {
      console.log('\n🎨 Sample Style Rules:');
      styleRules.slice(0, 3).forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.description}`);
      });
    }
    
    return {
      success: true,
      dictionaryCount: dictionaryEntries.size,
      grammarCount: grammarRules.length,
      styleCount: styleRules.length
    };
    
  } catch (error) {
    console.error('❌ PDF parsing test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Auto-test when in development mode
if (import.meta.env.DEV) {
  // Test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testPDFParsing().then(result => {
      if (result.success) {
        console.log('✅ PDF parsing test completed successfully!');
      } else {
        console.log('❌ PDF parsing test failed:', result.error);
      }
    });
  }, 2000);
} 