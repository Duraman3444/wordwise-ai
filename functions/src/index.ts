import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';

// Set global options
setGlobalOptions({ maxInstances: 10 });
// Force update for JSON parsing fix

// Define the OpenAI API key as a secret parameter
const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const analyzeText = onRequest(
  { 
    cors: true,
    secrets: [openaiApiKey]
  },
  async (request, response) => {
    try {
      console.log('Function called with method:', request.method);
      console.log('Request headers:', request.headers);
      
      // Only allow POST requests
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      // Get the API key from the secret
      const apiKey = openaiApiKey.value();
      
      console.log('API Key present:', !!apiKey);
      console.log('API Key valid format:', apiKey?.startsWith('sk-') || false);
      
      if (!apiKey || !apiKey.startsWith('sk-')) {
        console.error('OpenAI API key not found or invalid');
        response.status(500).json({ error: 'API key not configured properly' });
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      const { text, userType = 'student', documentType = 'essay' } = request.body || {};

      console.log('Request body:', { 
        hasText: !!text, 
        textLength: text?.length || 0, 
        userType, 
        documentType 
      });

      if (!text || typeof text !== 'string') {
        console.error('Invalid request body:', { text: !!text, type: typeof text });
        response.status(400).json({ error: 'Text is required and must be a string' });
        return;
      }

      console.log('Processing text analysis for:', userType, documentType);

          const prompt = `You are a professional grammar and style checker analyzing a ${documentType} written by a ${userType}. Provide specific suggestions for improvement.

Text to analyze: "${text}"

CRITICAL: "grammar checker" is a compound noun and is CORRECT. Do NOT suggest adding a comma to make it "grammar, checker".

Please respond in JSON format with an array of suggestions. Each suggestion should have:
- "id": unique identifier (use timestamp + random number)
- "originalText": the exact text that needs to be corrected
- "suggestions": array with one corrected version
- "type": one of "grammar", "spelling", "vocabulary", "clarity", "style", "punctuation"
- "message": brief explanation of the issue
- "confidence": number between 0 and 1

IMPORTANT RULES:
1. PROPER NOUNS: ALWAYS capitalize names of people, places, companies, titles. Examples:
   - "abdurrahman" → "Abdurrahman"
   - "mirza" → "Mirza" (when used as a name)
   - "john smith" → "John Smith"
   - "new york" → "New York"
   - Any word that is clearly a person's name MUST be capitalized
2. PUNCTUATION: Check for missing commas, but DO NOT suggest adding spaces before periods
3. GRAMMAR: Subject-verb agreement, tense consistency, pronoun agreement
4. SPELLING: All misspelled words (e.g., "gramar" should be "grammar")
5. CAPITALIZATION: Sentence beginnings, proper nouns (this is critical!)
6. CLARITY: Run-on sentences, unclear references

Common comma rules (ONLY suggest these specific cases):
- After greetings: "Hello, my name is..."
- Before coordinating conjunctions in compound sentences: "...Mirza, and this is..."
- After introductory phrases: "After the meeting, we..."
- In series/lists: "red, blue, and green"
- Around non-essential clauses: "My friend, who lives nearby, came over"

DO NOT add commas:
- Between adjectives and nouns: "grammar checker" is CORRECT (not "grammar, checker")
- In compound nouns or phrases that work together as one unit
- Between closely related words that form a single concept

NEVER suggest:
- Adding spaces before periods (periods attach directly to words)
- Changing correctly formatted punctuation
- Fixing text that is already correct
- Changes that have already been applied
- Redundant or duplicate suggestions
- Suggesting the same word multiple times
- Adding commas between adjectives and nouns (e.g., "grammar checker" is CORRECT)
- Breaking up compound nouns or phrases with commas

CRITICAL: Only suggest changes for actual errors. If text is already correct, do not suggest any changes.

CONSISTENCY RULES:
- Be consistent with your suggestions - don't suggest different fixes for the same error type
- If text appears to have been recently corrected, don't suggest reversing those corrections
- Focus on the most important errors first (grammar > spelling > style)

SPECIFIC EXAMPLES - These are CORRECT and need NO changes:
- "grammar checker" ✓ (NOT "grammar, checker")
- "spell checker" ✓ (NOT "spell, checker")
- "word processor" ✓ (NOT "word, processor")
- "web browser" ✓ (NOT "web, browser")
- "text editor" ✓ (NOT "text, editor")

If you see "grammar checker" in the text, it is ALREADY CORRECT - do not suggest any changes to it.

${userType === 'student' ? 'Provide educational explanations that help with learning.' :
        userType === 'professional' ? 'Focus on business writing clarity and professionalism.' :
            'Focus on readability and engagement.'}

Return only valid JSON array format. Do not wrap in markdown code blocks.`;

      console.log('Calling OpenAI API...');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional grammar and writing assistant. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const aiResponse = completion.choices[0]?.message?.content;
      console.log('OpenAI response received:', !!aiResponse);
      console.log('Response length:', aiResponse?.length || 0);
      
      if (!aiResponse) {
        console.error('No response from OpenAI');
        response.status(500).json({ error: 'No response from AI' });
        return;
      }

      try {
        // Clean up the AI response - remove markdown code blocks if present
        let cleanResponse = aiResponse.trim();
        
        // Remove markdown code block markers
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        console.log('Cleaned response:', cleanResponse.substring(0, 200));
        
        const suggestions = JSON.parse(cleanResponse);
        console.log('Successfully parsed suggestions:', Array.isArray(suggestions) ? suggestions.length : 'not array');
        response.json({ analysisResult: suggestions });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw AI response:', aiResponse.substring(0, 500));
        response.status(500).json({ error: 'Invalid AI response format' });
      }

    } catch (error) {
      console.error('Function error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      response.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
); 