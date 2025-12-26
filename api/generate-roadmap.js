// Vercel Serverless Function for AI Skills Roadmap Generator
// Path: /api/generate-roadmap.js

import {
    checkUserRateLimit,
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
            });
        }

        const { hustleName, userProfile } = req.body;

        if (!hustleName || typeof hustleName !== 'string') {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Please provide a hustle name',
            });
        }

        const sanitizedHustle = hustleName.trim().substring(0, 100);

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                success: true,
                roadmap: getFallbackRoadmap(sanitizedHustle),
                source: 'fallback',
            });
        }

        const roadmap = await generateRoadmap(sanitizedHustle, userProfile, apiKey);

        return res.status(200).json({
            success: true,
            roadmap,
            source: 'ai',
        });

    } catch (error) {
        console.error('Generate roadmap error:', error);
        return res.status(200).json({
            success: true,
            roadmap: getFallbackRoadmap(req.body?.hustleName || 'Side Hustle'),
            source: 'fallback',
        });
    }
}

async function generateRoadmap(hustleName, userProfile, apiKey) {
    const profileInfo = userProfile ? `
Student Profile:
- Major: ${userProfile.major || 'Not specified'}
- Available hours: ${userProfile.hours || 'Flexible'}
- Skills: ${userProfile.skills?.join(', ') || 'Various'}
` : '';

    const prompt = `Create a practical 4-week learning roadmap for a college student who wants to start "${hustleName}" as a side hustle.

${profileInfo}

Respond in this EXACT JSON format:
{
  "title": "Your 4-Week ${hustleName} Roadmap",
  "overview": "One sentence about what they'll achieve",
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "goal": "Main goal for this week",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "resource": {
        "name": "Resource name",
        "type": "Free/Paid",
        "description": "Brief description"
      }
    }
  ],
  "milestones": {
    "week1": "First milestone achievement",
    "week2": "Second milestone",
    "week4": "Final milestone - first income!"
  }
}

Rules:
- Keep tasks actionable and specific
- Include one free resource per week
- Make it realistic for someone with 10-15 hours/week
- Focus on getting to first income quickly
- Return ONLY valid JSON, no other text`;

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
                        content: 'You are a practical career coach creating learning roadmaps. Always respond with valid JSON only. Be specific and actionable.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
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

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        const roadmap = JSON.parse(jsonMatch[0]);

        // Validate and sanitize
        return {
            title: String(roadmap.title || `Your ${hustleName} Roadmap`).substring(0, 100),
            overview: String(roadmap.overview || '').substring(0, 200),
            weeks: Array.isArray(roadmap.weeks) ? roadmap.weeks.slice(0, 4).map((w, i) => ({
                week: i + 1,
                title: String(w.title || `Week ${i + 1}`).substring(0, 50),
                goal: String(w.goal || '').substring(0, 100),
                tasks: Array.isArray(w.tasks) ? w.tasks.slice(0, 4).map(t => String(t).substring(0, 100)) : [],
                resource: w.resource ? {
                    name: String(w.resource.name || '').substring(0, 50),
                    type: w.resource.type === 'Paid' ? 'Paid' : 'Free',
                    description: String(w.resource.description || '').substring(0, 100),
                } : null
            })) : getFallbackRoadmap(hustleName).weeks,
            milestones: roadmap.milestones || {}
        };

    } catch (error) {
        console.error('Groq roadmap error:', error);
        return getFallbackRoadmap(hustleName);
    }
}

function getFallbackRoadmap(hustleName) {
    return {
        title: `Your 4-Week ${hustleName} Roadmap`,
        overview: `A practical guide to start earning with ${hustleName} in just 4 weeks.`,
        weeks: [
            {
                week: 1,
                title: "Foundation & Setup",
                goal: "Set up your profile and understand the basics",
                tasks: [
                    "Research the platform and requirements",
                    "Create your account and complete your profile",
                    "Study top performers in this area",
                    "Set up your workspace and tools"
                ],
                resource: {
                    name: "YouTube Tutorial Series",
                    type: "Free",
                    description: "Search for beginner guides on YouTube"
                }
            },
            {
                week: 2,
                title: "Skill Building",
                goal: "Develop core skills needed for success",
                tasks: [
                    "Complete a beginner course or tutorial",
                    "Practice with sample projects",
                    "Get feedback on your work",
                    "Create 2-3 portfolio samples"
                ],
                resource: {
                    name: "Free online courses",
                    type: "Free",
                    description: "Check Coursera or Skillshare free trials"
                }
            },
            {
                week: 3,
                title: "First Clients",
                goal: "Land your first paying opportunity",
                tasks: [
                    "Apply to 5-10 opportunities",
                    "Customize your pitches for each",
                    "Respond quickly to any interest",
                    "Complete your first task/project"
                ],
                resource: {
                    name: "Cold outreach templates",
                    type: "Free",
                    description: "Use proven templates for reaching out"
                }
            },
            {
                week: 4,
                title: "Scale & Optimize",
                goal: "Build momentum and increase earnings",
                tasks: [
                    "Request reviews from satisfied clients",
                    "Raise your rates slightly",
                    "Streamline your workflow",
                    "Set recurring income goals"
                ],
                resource: {
                    name: "Productivity tools",
                    type: "Free",
                    description: "Use Notion or Trello to organize"
                }
            }
        ],
        milestones: {
            week1: "Profile complete and ready to go",
            week2: "Portfolio created with sample work",
            week4: "First payment received! 🎉"
        }
    };
}

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}
