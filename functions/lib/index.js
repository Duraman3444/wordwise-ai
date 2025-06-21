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
    cors: true,
    secrets: [openaiApiKey],
    timeoutSeconds: 30
}, async (request, response) => {
    var _a, _b;
    const startTime = Date.now();
    try {
        console.log('Function called with method:', request.method);
        // Only allow POST requests
        if (request.method !== 'POST') {
            response.status(405).json({ error: 'Method Not Allowed' });
            return;
        }
        // Get the API key from the secret
        const apiKey = openaiApiKey.value();
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
        const aiResponse = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        console.log('OpenAI response received in:', Date.now() - startTime, 'ms');
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
            }
            else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            const suggestions = JSON.parse(cleanResponse);
            console.log('Successfully parsed suggestions:', Array.isArray(suggestions) ? suggestions.length : 'not array');
            console.log('Total function time:', Date.now() - startTime, 'ms');
            response.json({
                analysisResult: suggestions,
                processingTime: Date.now() - startTime
            });
        }
        catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw AI response:', aiResponse.substring(0, 200));
            response.status(500).json({ error: 'Invalid AI response format' });
        }
    }
    catch (error) {
        console.error('Function error:', error);
        const totalTime = Date.now() - startTime;
        console.error('Error occurred after:', totalTime, 'ms');
        response.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error),
            processingTime: totalTime
        });
    }
});
//# sourceMappingURL=index.js.map