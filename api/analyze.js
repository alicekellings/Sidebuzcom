// Vercel Serverless Function for Groq AI Analysis
// Path: /api/analyze.js

import {
    validateQuizAnswers,
    checkUserRateLimit,
    getClientIP,
    securityHeaders
} from '../src/lib/security.js';

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

// API-level rate limiting (in addition to user rate limiting)
let lastApiCall = 0;
const MIN_API_INTERVAL_MS = 2500; // 2.5 seconds between API calls

/**
 * Main handler for /api/analyze
 */
export default async function handler(req, res) {
    // Set security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are accepted'
        });
    }

    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(req);

        // Check user rate limit
        const rateLimitResult = checkUserRateLimit(clientIP);
        if (!rateLimitResult.allowed) {
            res.setHeader('Retry-After', rateLimitResult.retryAfter);
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: rateLimitResult.message,
                retryAfter: rateLimitResult.retryAfter,
            });
        }

        // Validate request body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Request body must be a JSON object',
            });
        }

        const { answers, recommendations } = req.body;

        // Validate quiz answers
        const validation = validateQuizAnswers(answers);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Validation failed',
                message: validation.error,
            });
        }

        // Get API key from environment
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('GROQ_API_KEY not configured, using fallback');
            return res.status(200).json({
                success: true,
                analysis: getFallbackAnalysis(validation.data, recommendations),
                source: 'fallback',
            });
        }

        // API-level rate limiting
        const now = Date.now();
        const timeSinceLastCall = now - lastApiCall;
        if (timeSinceLastCall < MIN_API_INTERVAL_MS) {
            await sleep(MIN_API_INTERVAL_MS - timeSinceLastCall);
        }
        lastApiCall = Date.now();

        // Call Groq API
        const analysis = await callGroqAPI(validation.data, recommendations, apiKey);

        return res.status(200).json({
            success: true,
            analysis,
            source: 'ai',
        });

    } catch (error) {
        console.error('API Error:', error);

        // Always return fallback on error - don't expose error details
        return res.status(200).json({
            success: true,
            analysis: getFallbackAnalysis({}, []),
            source: 'fallback',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}

/**
 * Call Groq API with retry logic
 */
async function callGroqAPI(userProfile, recommendations, apiKey, retries = 2) {
    const prompt = buildPrompt(userProfile, recommendations);

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a friendly career advisor helping students find income opportunities. 
Be encouraging, specific, and practical. Keep responses under 100 words. 
Use a warm, supportive tone. Focus on actionable advice.
Do not include any links, code, or special formatting.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            // Handle different error codes
            if (response.status === 429) {
                // Rate limited - wait and retry
                const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
                if (attempt < retries) {
                    await sleep(retryAfter * 1000);
                    continue;
                }
                throw new Error('API rate limit exceeded');
            }

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('Empty response from API');
            }

            // Sanitize AI response (remove any potential HTML/scripts)
            return sanitizeAIResponse(content);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('API timeout on attempt', attempt + 1);
            } else {
                console.error('API error on attempt', attempt + 1, error.message);
            }

            if (attempt === retries) {
                throw error;
            }

            // Wait before retry
            await sleep(1000 * (attempt + 1));
        }
    }
}

/**
 * Sanitize AI response to prevent XSS
 */
function sanitizeAIResponse(response) {
    if (typeof response !== 'string') return '';

    return response
        .replace(/<[^>]*>/g, '')           // Remove HTML tags
        .replace(/javascript:/gi, '')       // Remove javascript: URLs
        .replace(/on\w+=/gi, '')            // Remove event handlers
        .trim()
        .substring(0, 500);                 // Limit length
}

/**
 * Build prompt from user profile
 */
function buildPrompt(userProfile, recommendations) {
    const { major, year, hours, skills, goal } = userProfile;
    const topRecs = recommendations?.slice(0, 3).map(r => r?.name || 'Unknown').join(', ') || 'online opportunities';

    return `Based on this student profile:
- Major: ${major || 'Not specified'}
- Year: ${year || 'Not specified'}
- Available hours: ${hours || 'Not specified'} per week
- Skills: ${skills?.join(', ') || 'None specified'}
- Income goal: ${goal || 'Not specified'}

I'm recommending: ${topRecs}

Provide a personalized 2-3 sentence analysis explaining why these opportunities are a great fit. Be encouraging and specific to their situation.`;
}

/**
 * Fallback analysis when API is unavailable
 */
function getFallbackAnalysis(userProfile, recommendations) {
    const topRec = recommendations?.[0]?.name || 'online tutoring';
    const hours = userProfile?.hours || 'your available';

    const analyses = [
        `Based on your profile, ${topRec} looks like an excellent fit for you! With ${hours} hours per week, you could realistically earn a solid side income while maintaining your studies.`,
        `Great news! Your background makes you a strong candidate for ${topRec}. Many students with similar profiles have found success starting here and expanding their income streams over time.`,
        `Looking at your skills and availability, ${topRec} aligns perfectly with your goals. This is a flexible option that many students use to earn while studying.`,
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to extract IP from request
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}
