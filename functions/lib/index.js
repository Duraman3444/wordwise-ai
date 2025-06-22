"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeText = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const params_1 = require("firebase-functions/params");
const openai_1 = require("openai");
// Set global options for better performance
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB"
});
// Define the OpenAI API key as a secret parameter
const openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
exports.analyzeText = (0, https_1.onRequest)({
    secrets: [openaiApiKey],
    timeoutSeconds: 30,
    cors: true,
    invoker: 'public', // Allow unauthenticated access
}, async (request, response) => {
    var _a, _b, _c;
    const startTime = Date.now();
    try {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            response.set('Access-Control-Allow-Origin', '*');
            response.set('Access-Control-Allow-Methods', 'POST');
            response.set('Access-Control-Allow-Headers', 'Content-Type');
            response.status(204).send('');
            return;
        }
        console.log('Function called with method:', request.method);
        console.log('Function called with body:', JSON.stringify(request.body));
        // Get the API key from the secret and trim any whitespace/newlines
        const apiKey = (_a = openaiApiKey.value()) === null || _a === void 0 ? void 0 : _a.trim();
        console.log('API key status:', {
            exists: !!apiKey,
            length: apiKey ? apiKey.length : 0,
            startsWithSk: apiKey ? apiKey.startsWith('sk-') : false,
            firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
            hasNewlines: apiKey ? apiKey.includes('\n') : false,
            hasSpaces: apiKey ? apiKey.includes(' ') : false
        });
        if (!apiKey || !apiKey.startsWith('sk-')) {
            console.error('OpenAI API key not found or invalid');
            response.status(500).json({ error: 'API key not configured properly' });
            return;
        }
        const openai = new openai_1.default({
            apiKey: apiKey,
            timeout: 10000 // 10 second timeout for OpenAI requests
        });
        const { text, userType = 'student', documentType = 'essay' } = request.body || {};
        if (!text || typeof text !== 'string') {
            console.error('Missing or invalid text parameter:', { text, userType, documentType });
            response.status(400).json({ error: 'Text is required and must be a string' });
            return;
        }
        console.log('Processing text analysis for:', userType, 'Length:', text.length);
        // AGGRESSIVE PROMPT - Catch ALL errors
        const prompt = `You are a strict grammar checker. Find ALL errors in this text:

"${text}"

This text has MULTIPLE errors. Find them ALL:
- Grammar mistakes (subject-verb agreement, tense errors)
- Spelling errors  
- Word choice problems
- Punctuation issues
- Clarity problems

Return JSON array with ALL errors found:
[{
  "id": "error_1", 
  "type": "grammar",
  "originalText": "This are",
  "suggestions": ["These are", "This is"],
  "message": "Subject-verb disagreement"
},{
  "id": "error_2",
  "type": "spelling", 
  "originalText": "grammer",
  "suggestions": ["grammar"],
  "message": "Spelling error"
}]

Be thorough - if you see 5+ errors, report ALL of them. Return ONLY JSON array.`;
        console.log('Calling OpenAI API with gpt-4o-mini...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a strict grammar checker. Always find ALL errors and return complete JSON arrays."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0,
            max_tokens: 800,
            presence_penalty: 0,
            frequency_penalty: 0
        });
        const aiResponse = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        console.log('OpenAI response received in:', Date.now() - startTime, 'ms');
        if (!aiResponse) {
            console.error('No response from OpenAI');
            throw new Error('No response from AI');
        }
        try {
            // Clean up the AI response - remove markdown code blocks if present
            let cleanResponse = aiResponse.trim();
            // Remove markdown code block markers
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            }
            else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            const suggestions = JSON.parse(cleanResponse);
            console.log('Successfully parsed suggestions:', Array.isArray(suggestions) ? suggestions.length : 'not array');
            console.log('Total function time:', Date.now() - startTime, 'ms');
            response.set('Access-Control-Allow-Origin', '*');
            response.status(200).json({
                analysisResult: suggestions,
                processingTime: Date.now() - startTime
            });
        }
        catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw AI response:', aiResponse.substring(0, 200));
            response.set('Access-Control-Allow-Origin', '*');
            response.status(500).json({ error: 'Invalid AI response format' });
            return;
        }
    }
    catch (error) {
        console.error('Function error:', error);
        console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        const totalTime = Date.now() - startTime;
        console.error('Error occurred after:', totalTime, 'ms');
        // More specific error handling
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                console.error('API key related error');
            }
            else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('connection')) {
                console.error('Network/connection error');
            }
            else if (error.message.includes('quota') || error.message.includes('rate limit')) {
                console.error('Rate limit or quota error');
            }
        }
        response.set('Access-Control-Allow-Origin', '*');
        response.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
//# sourceMappingURL=index.js.map