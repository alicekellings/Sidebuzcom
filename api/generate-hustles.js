// Vercel Serverless Function for AI Side Hustle Generator
// Path: /api/generate-hustles.js

import {
    validateInput,
    checkUserRateLimit,
    getClientIP,
    securityHeaders
} from '../src/lib/security.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

export default async function handler(req, res) {
    // Set security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const clientIP = getClientIP(req);
        const rateLimitResult = checkUserRateLimit(clientIP);

        if (!rateLimitResult.allowed) {
            res.setHeader('Retry-After', rateLimitResult.retryAfter);
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: rateLimitResult.message,
                retryAfter: rateLimitResult.retryAfter,
            });
        }

        const { description } = req.body;

        // Validate input
        if (!description || typeof description !== 'string') {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Please provide a description',
            });
        }

        // Sanitize input
        const sanitizedDescription = description
            .replace(/<[^>]*>/g, '')
            .trim()
            .substring(0, 500);

        if (sanitizedDescription.length < 10) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Description too short. Please provide more details.',
            });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                success: true,
                hustles: getFallbackHustles(sanitizedDescription),
                source: 'fallback',
            });
        }

        const hustles = await generateHustles(sanitizedDescription, apiKey);

        return res.status(200).json({
            success: true,
            hustles,
            source: 'ai',
        });

    } catch (error) {
        console.error('Generate hustles error:', error);
        return res.status(200).json({
            success: true,
            hustles: getFallbackHustles(''),
            source: 'fallback',
        });
    }
}

async function generateHustles(description, apiKey) {
    const prompt = `Based on this student's description:
"${description}"

Generate exactly 3 unique side hustle ideas tailored to them.

For each idea, respond in this EXACT JSON format:
[
  {
    "name": "Side Hustle Name",
    "emoji": "💼",
    "earnings": "$X-$Y/month",
    "timeNeeded": "X-Y hours/week",
    "difficulty": "Easy/Medium/Hard",
    "description": "One sentence explaining why this fits them",
    "firstStep": "One actionable first step to start today"
  }
]

Rules:
- Be creative and specific to their interests
- Include at least one low-barrier option
- Include realistic earnings estimates
- Make first steps actionable and specific
- Return ONLY the JSON array, no other text`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

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
                        content: 'You are a creative side hustle advisor for students. Always respond with valid JSON only. Be practical and encouraging.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 600,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response');
        }

        // Parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        const hustles = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!Array.isArray(hustles) || hustles.length === 0) {
            throw new Error('Invalid hustles array');
        }

        return hustles.slice(0, 3).map(h => ({
            name: String(h.name || 'Side Hustle').substring(0, 50),
            emoji: String(h.emoji || '💼').substring(0, 4),
            earnings: String(h.earnings || '$100-$500/month').substring(0, 30),
            timeNeeded: String(h.timeNeeded || '5-10 hours/week').substring(0, 30),
            difficulty: ['Easy', 'Medium', 'Hard'].includes(h.difficulty) ? h.difficulty : 'Medium',
            description: String(h.description || '').substring(0, 150),
            firstStep: String(h.firstStep || '').substring(0, 150),
        }));

    } catch (error) {
        console.error('Groq generate error:', error);
        return getFallbackHustles(description);
    }
}

function getFallbackHustles(description) {
    return [
        {
            name: "Freelance Content Writing",
            emoji: "✍️",
            earnings: "$200-$800/month",
            timeNeeded: "5-10 hours/week",
            difficulty: "Easy",
            description: "Turn your ideas into paid articles for blogs and websites.",
            firstStep: "Create a profile on Contently or Medium and publish your first article today."
        },
        {
            name: "Online Tutoring",
            emoji: "📚",
            earnings: "$300-$1,000/month",
            timeNeeded: "5-15 hours/week",
            difficulty: "Medium",
            description: "Help other students learn subjects you're good at.",
            firstStep: "Sign up on Wyzant or Tutor.com and set your availability."
        },
        {
            name: "Social Media Management",
            emoji: "📱",
            earnings: "$400-$1,200/month",
            timeNeeded: "10-20 hours/week",
            difficulty: "Medium",
            description: "Help small businesses grow their online presence.",
            firstStep: "Create a portfolio with 3 sample posts and reach out to local businesses."
        }
    ];
}

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}
