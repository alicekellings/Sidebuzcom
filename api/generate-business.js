// Vercel Serverless Function for Self-Employed Business Generator
// Path: /api/generate-business.js

import {
    checkUserRateLimit,
    securityHeaders
} from '../src/lib/security.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

export default async function handler(req, res) {
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
            });
        }

        const { budget, skills, timeCommitment, goals } = req.body;

        if (!budget || !skills) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Please provide budget and skills',
            });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                success: true,
                businesses: getFallbackBusinesses(budget, skills),
                source: 'fallback',
            });
        }

        const businesses = await generateBusinesses(budget, skills, timeCommitment, goals, apiKey);

        return res.status(200).json({
            success: true,
            businesses,
            source: 'ai',
        });

    } catch (error) {
        console.error('Generate business error:', error);
        return res.status(200).json({
            success: true,
            businesses: getFallbackBusinesses('$0-$500', []),
            source: 'fallback',
        });
    }
}

async function generateBusinesses(budget, skills, timeCommitment, goals, apiKey) {
    const prompt = `Based on this profile:
- Starting Budget: ${budget}
- Skills: ${skills.join(', ')}
- Time Available: ${timeCommitment}
- Goals: ${goals}

Generate exactly 3 unique self-employed business ideas.

Respond in this EXACT JSON format:
[
  {
    "name": "Business Name",
    "emoji": "🏪",
    "category": "E-commerce/Service/Digital/Local",
    "startupCost": "$X-$Y",
    "monthlyEarnings": "$X-$Y potential",
    "timeToProfit": "X-Y months",
    "difficulty": "Easy/Medium/Hard",
    "description": "2-3 sentences about why this fits their profile",
    "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
    "firstWeekPlan": ["Day 1-2 action", "Day 3-4 action", "Day 5-7 action"]
  }
]

Rules:
- Match businesses to their budget and skills
- Include at least one low-cost option
- Be realistic about earnings and timeframes
- Focus on proven business models
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
                        content: 'You are a business advisor specializing in low-cost startups and self-employment. Always respond with valid JSON only. Be practical and realistic.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 800,
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

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        const businesses = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(businesses) || businesses.length === 0) {
            throw new Error('Invalid businesses array');
        }

        return businesses.slice(0, 3).map(b => ({
            name: String(b.name || 'Business Idea').substring(0, 60),
            emoji: String(b.emoji || '💼').substring(0, 4),
            category: String(b.category || 'Service').substring(0, 30),
            startupCost: String(b.startupCost || '$0-$500').substring(0, 30),
            monthlyEarnings: String(b.monthlyEarnings || '$500-$2,000').substring(0, 40),
            timeToProfit: String(b.timeToProfit || '1-3 months').substring(0, 30),
            difficulty: ['Easy', 'Medium', 'Hard'].includes(b.difficulty) ? b.difficulty : 'Medium',
            description: String(b.description || '').substring(0, 250),
            requirements: Array.isArray(b.requirements) ? b.requirements.slice(0, 4).map(r => String(r).substring(0, 80)) : [],
            firstWeekPlan: Array.isArray(b.firstWeekPlan) ? b.firstWeekPlan.slice(0, 3).map(p => String(p).substring(0, 100)) : [],
        }));

    } catch (error) {
        console.error('Groq generate error:', error);
        return getFallbackBusinesses(budget, skills);
    }
}

function getFallbackBusinesses(budget, skills) {
    return [
        {
            name: "Freelance Service Business",
            emoji: "💻",
            category: "Service",
            startupCost: "$0-$100",
            monthlyEarnings: "$1,000-$5,000 potential",
            timeToProfit: "1-2 months",
            difficulty: "Easy",
            description: "Start offering your skills as a freelance service. Perfect for beginners with low overhead and immediate income potential.",
            requirements: ["A marketable skill", "Laptop and internet", "Portfolio samples"],
            firstWeekPlan: ["Days 1-2: Set up profiles on Upwork/Fiverr", "Days 3-4: Create 3 portfolio pieces", "Days 5-7: Apply to 10+ jobs"]
        },
        {
            name: "Print-on-Demand Store",
            emoji: "👕",
            category: "E-commerce",
            startupCost: "$0-$200",
            monthlyEarnings: "$500-$3,000 potential",
            timeToProfit: "2-4 months",
            difficulty: "Medium",
            description: "Sell custom-designed products without inventory. Great for creative people who want passive income potential.",
            requirements: ["Design skills or AI tools", "Printful/Printify account", "Shopify or Etsy store"],
            firstWeekPlan: ["Days 1-2: Research niche and competition", "Days 3-4: Create 10 designs", "Days 5-7: Set up store and listings"]
        },
        {
            name: "Digital Product Business",
            emoji: "📚",
            category: "Digital",
            startupCost: "$0-$500",
            monthlyEarnings: "$1,000-$10,000 potential",
            timeToProfit: "2-6 months",
            difficulty: "Medium",
            description: "Create and sell digital products like courses, templates, or ebooks. High margins and scalable income.",
            requirements: ["Expertise in a topic", "Content creation tools", "Sales platform (Gumroad/Teachable)"],
            firstWeekPlan: ["Days 1-2: Outline your product idea", "Days 3-5: Create minimum viable product", "Days 6-7: Set up sales page"]
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
