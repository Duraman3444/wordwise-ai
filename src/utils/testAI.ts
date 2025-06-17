import { openaiService } from '../services/openaiService';

// Test content with common ESL errors
const testContent = `
This is a example of text with some grammar and vocabulary issues. I am very good at writing, but there are some areas where I could improve. In order to make this text better, I need to check for a errors and try to fix them.

It is important to note that this text has some problems. There writing could be more clear and the vocabulary could be better. I think this is a nice example of how the AI suggestions work.
`.trim();

// Function to test the AI analysis
export async function testAIAnalysis() {
  console.log('🧪 Testing AI Analysis with sample content...');
  console.log('Content:', testContent);
  
  try {
    const result = await openaiService.analyzeText(testContent, 'intermediate');
    
    console.log('\n📊 Analysis Results:');
    console.log('Overall Score:', result.overallScore);
    console.log('Word Count:', result.wordCount);
    console.log('Grammar Issues:', result.grammarIssues.length);
    console.log('Vocabulary Issues:', result.vocabularyIssues.length);
    console.log('Clarity Issues:', result.clarityIssues.length);
    console.log('Style Issues:', result.styleIssues.length);
    
    if (result.grammarIssues.length > 0) {
      console.log('\n🔴 Grammar Issues:');
      result.grammarIssues.forEach(issue => {
        console.log(`- "${issue.original}" → ${issue.suggestion}`);
      });
    }
    
    if (result.vocabularyIssues.length > 0) {
      console.log('\n🟢 Vocabulary Issues:');
      result.vocabularyIssues.forEach(issue => {
        console.log(`- "${issue.original}" → ${issue.suggestion}`);
      });
    }
    
    if (result.clarityIssues.length > 0) {
      console.log('\n🟠 Clarity Issues:');
      result.clarityIssues.forEach(issue => {
        console.log(`- "${issue.original}" → ${issue.suggestion}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ AI Analysis failed:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('🚀 WordWise AI Mock Service Test');
  console.log('You can test the AI analysis by calling testAIAnalysis() in the console');
} 