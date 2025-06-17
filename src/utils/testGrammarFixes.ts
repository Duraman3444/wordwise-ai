import { OpenAIService } from '../services/openaiService';

/**
 * Test the enhanced grammar detection for common issues
 */
export async function testGrammarFixes() {
  console.log('🧪 Testing enhanced grammar and punctuation detection...');
  
  const aiService = new OpenAIService();
  
  // Test cases that should be caught
  const testCases = [
    {
      text: "Hello my name is Abdurrahman Mirza and this is my grammar checker.",
      expectedIssues: [
        'Missing comma after "Hello"',
        'Missing comma before "and"',
        'Capitalization'
      ]
    },
    {
      text: "I dont know nothing about this",
      expectedIssues: [
        'Missing apostrophe in "dont"',
        'Double negative'
      ]
    },
    {
      text: "She are going to school",
      expectedIssues: [
        'Subject-verb agreement'
      ]
    },
    {
      text: "I have a apple and an cat",
      expectedIssues: [
        'Article errors'
      ]
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: "${testCase.text}"`);
    
    try {
      const result = await aiService.analyzeText(testCase.text);
      const allSuggestions = [
        ...result.grammarIssues,
        ...result.vocabularyIssues,
        ...result.clarityIssues,
        ...result.styleIssues
      ];

      console.log(`📊 Found ${allSuggestions.length} suggestions:`);
      allSuggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.suggestion}`);
        if (suggestion.replacement) {
          console.log(`     Fix: "${suggestion.original}" → "${suggestion.replacement}"`);
        }
      });

      console.log(`📈 Score: ${result.overallScore}/100`);

      // Check if we caught the expected issues
      const issueTypes = allSuggestions.map(s => s.suggestion.toLowerCase());
      const caughtExpected = testCase.expectedIssues.filter(expected => 
        issueTypes.some(issue => issue.includes(expected.toLowerCase()))
      );

      if (caughtExpected.length > 0) {
        console.log(`✅ Successfully caught: ${caughtExpected.join(', ')}`);
      } else {
        console.log(`❌ Missed expected issues: ${testCase.expectedIssues.join(', ')}`);
      }

    } catch (error) {
      console.error(`❌ Error testing "${testCase.text}":`, error);
    }
  }

  console.log('\n🏁 Grammar testing complete!');
}

// Auto-run in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testGrammarFixes();
  }, 3000); // Wait a bit for services to initialize
} 