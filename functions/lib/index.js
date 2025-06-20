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
    var _a, _b, _c, _d;
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
        const { text, userType = 'student', documentType = 'essay', includeAcademicTone = false, analysisType = 'general', targetDocumentType = 'essay' } = request.body || {};
        if (!text || typeof text !== 'string') {
            response.status(400).json({ error: 'Text is required and must be a string' });
            return;
        }
        console.log('Processing text analysis for:', userType, 'Length:', text.length, 'Type:', analysisType);
        // Handle academic tone analysis specifically
        if (analysisType === 'academic_tone' || documentType === 'academic_tone_analysis') {
            console.log('Processing academic tone analysis...');
            const academicPrompt = `Analyze the following text for academic tone and formality. Provide specific suggestions to improve the academic writing style:

Text to analyze:
"${text}"

Focus on:
1. Informal language and contractions (yo, ur, beatin, etc.)
2. Slang expressions that need formal alternatives
3. Personal pronouns and subjective statements
4. Colloquialisms and casual expressions
5. Sentence structure and complexity
6. Vocabulary appropriateness for academic context

Return suggestions in JSON format:
[{
  "id": "tone_1",
  "type": "academic_tone",
  "severity": "warning",
  "message": "Academic tone improvement",
  "explanation": "Academic writing requires formal terminology and complete sentence structure.",
  "originalText": "what is yo opinion on beatin yo dih",
  "suggestions": ["What is your opinion on masturbation?"],
  "confidence": 0.85
}]

Be thorough and identify ALL informal patterns. Return ONLY the JSON array.`;
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an academic writing expert. Help improve text to meet academic standards by identifying informal language, slang, and casual expressions."
                    },
                    {
                        role: "user",
                        content: academicPrompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 1000
            });
            const aiResponse = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (aiResponse) {
                try {
                    let cleanResponse = aiResponse.trim();
                    if (cleanResponse.startsWith('```json')) {
                        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                    }
                    else if (cleanResponse.startsWith('```')) {
                        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
                    }
                    const suggestions = JSON.parse(cleanResponse);
                    console.log('Academic tone suggestions parsed:', suggestions.length);
                    response.json({
                        analysisResult: suggestions,
                        processingTime: Date.now() - startTime
                    });
                    return;
                }
                catch (parseError) {
                    console.error('Academic tone JSON parse error:', parseError);
                }
            }
        }
        // Standard grammar and style analysis
        let prompt = '';
        if (includeAcademicTone) {
            // Combined analysis including academic tone
            prompt = `You are a comprehensive writing assistant. Analyze this text for ALL types of improvements:

"${text}"

Find and categorize ALL issues:
1. GRAMMAR: Subject-verb agreement, tense errors, sentence fragments
2. SPELLING: Misspelled words
3. PUNCTUATION: Missing or incorrect punctuation
4. VOCABULARY: Word choice improvements
5. CLARITY: Unclear or confusing expressions
6. STYLE: Awkward phrasing, repetition
7. ACADEMIC_TONE: Informal language that needs formalization

Return ALL findings in this JSON format:
[{
  "id": "error_1",
  "type": "grammar|spelling|punctuation|vocabulary|clarity|style|academic_tone",
  "severity": "error|warning|info",
  "originalText": "exact text with issue",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "message": "Brief description",
  "explanation": "Detailed explanation of the issue",
  "confidence": 0.85
}]

Be thorough - find ALL issues. Return ONLY JSON array.`;
        }
        else {
            // Standard analysis
            prompt = `You are a strict grammar checker. Find ALL errors in this text:

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
        }
        console.log('Calling OpenAI API with gpt-4o-mini...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: includeAcademicTone
                        ? "You are a comprehensive writing assistant that checks grammar, style, and academic tone. Always find ALL issues and return complete JSON arrays."
                        : "You are a strict grammar checker. Always find ALL errors and return complete JSON arrays."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0,
            max_tokens: 1200,
            presence_penalty: 0,
            frequency_penalty: 0
        });
        const aiResponse = (_d = (_c = completion.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
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