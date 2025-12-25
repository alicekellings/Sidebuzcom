// SideBuz.com Groq AI Integration
// With rate limiting for free tier (30 RPM, 14,400 RPD)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default model - can be changed
const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

// ============================================
// Rate Limiting Configuration (Groq Free Tier)
// ============================================
const RATE_LIMITS = {
    requestsPerMinute: 30,      // Groq free tier limit
    requestsPerDay: 14400,      // Groq free tier limit
    minIntervalMs: 2500,        // Min 2.5 seconds between requests (safer margin)
    queueTimeout: 30000,        // Max 30 seconds wait in queue
};

// Rate limiter state (in-memory, resets on server restart)
const rateLimiter = {
    lastRequestTime: 0,
    requestsThisMinute: 0,
    requestsToday: 0,
    minuteStartTime: Date.now(),
    dayStartTime: Date.now(),
    queue: [],
    processing: false,
};

/**
 * Simple queue-based rate limiter
 * Ensures requests don't exceed Groq's free tier limits
 */
async function withRateLimit(requestFn) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Rate limit queue timeout'));
        }, RATE_LIMITS.queueTimeout);

        rateLimiter.queue.push({ requestFn, resolve, reject, timeout });
        processQueue();
    });
}

async function processQueue() {
    if (rateLimiter.processing || rateLimiter.queue.length === 0) return;

    rateLimiter.processing = true;

    while (rateLimiter.queue.length > 0) {
        // Reset minute counter if a minute has passed
        const now = Date.now();
        if (now - rateLimiter.minuteStartTime >= 60000) {
            rateLimiter.requestsThisMinute = 0;
            rateLimiter.minuteStartTime = now;
        }

        // Reset day counter if a day has passed
        if (now - rateLimiter.dayStartTime >= 86400000) {
            rateLimiter.requestsToday = 0;
            rateLimiter.dayStartTime = now;
        }

        // Check if we've hit daily limit
        if (rateLimiter.requestsToday >= RATE_LIMITS.requestsPerDay) {
            const item = rateLimiter.queue.shift();
            clearTimeout(item.timeout);
            item.reject(new Error('Daily rate limit exceeded'));
            continue;
        }

        // Check if we need to wait for minute limit
        if (rateLimiter.requestsThisMinute >= RATE_LIMITS.requestsPerMinute) {
            const waitTime = 60000 - (now - rateLimiter.minuteStartTime);
            await sleep(waitTime + 100); // Wait until next minute + buffer
            continue;
        }

        // Ensure minimum interval between requests
        const timeSinceLastRequest = now - rateLimiter.lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMITS.minIntervalMs) {
            await sleep(RATE_LIMITS.minIntervalMs - timeSinceLastRequest);
        }

        // Process the request
        const item = rateLimiter.queue.shift();
        clearTimeout(item.timeout);

        try {
            rateLimiter.lastRequestTime = Date.now();
            rateLimiter.requestsThisMinute++;
            rateLimiter.requestsToday++;

            const result = await item.requestFn();
            item.resolve(result);
        } catch (error) {
            item.reject(error);
        }
    }

    rateLimiter.processing = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current rate limit stats
 */
export function getRateLimitStats() {
    return {
        requestsThisMinute: rateLimiter.requestsThisMinute,
        requestsToday: rateLimiter.requestsToday,
        queueLength: rateLimiter.queue.length,
        limitPerMinute: RATE_LIMITS.requestsPerMinute,
        limitPerDay: RATE_LIMITS.requestsPerDay,
    };
}

// ============================================
// AI Generation Functions
// ============================================

/**
 * Generate AI analysis based on user quiz responses
 * @param {Object} userProfile - User's quiz answers
 * @param {Array} recommendations - Matched recommendations
 * @param {string} apiKey - Groq API key
 * @returns {Promise<string>} - AI generated analysis
 */
export async function generateAIAnalysis(userProfile, recommendations, apiKey) {
    if (!apiKey) {
        console.warn('No Groq API key provided, returning fallback response');
        return getFallbackAnalysis(userProfile, recommendations);
    }

    const prompt = buildPrompt(userProfile, recommendations);

    try {
        const result = await withRateLimit(async () => {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a friendly career advisor helping students find income opportunities. 
Be encouraging, specific, and practical. Keep responses under 100 words. 
Use a warm, supportive tone. Focus on actionable advice.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || getFallbackAnalysis(userProfile, recommendations);
        });

        return result;

    } catch (error) {
        console.error('Groq AI error:', error);
        return getFallbackAnalysis(userProfile, recommendations);
    }
}

/**
 * Build prompt from user profile
 */
function buildPrompt(userProfile, recommendations) {
    const { major, year, hoursPerWeek, skills, incomeGoal } = userProfile;
    const topRecs = recommendations.slice(0, 3).map(r => r.name).join(', ');

    return `Based on this student profile:
- Major: ${major || 'Not specified'}
- Year: ${year || 'Not specified'}
- Available hours: ${hoursPerWeek || 'Not specified'} per week
- Skills: ${skills?.join(', ') || 'None specified'}
- Income goal: ${incomeGoal || 'Not specified'}

I'm recommending: ${topRecs}

Provide a personalized 2-3 sentence analysis explaining why these opportunities are a great fit. Be encouraging and specific to their situation.`;
}

/**
 * Fallback analysis when API is unavailable
 */
function getFallbackAnalysis(userProfile, recommendations) {
    const { hoursPerWeek, skills } = userProfile;
    const topRec = recommendations[0]?.name || 'online tutoring';

    const analyses = [
        `Based on your profile, ${topRec} looks like an excellent fit for you! With ${hoursPerWeek || 'your available'} hours per week, you could realistically earn a solid side income while maintaining your studies.`,

        `Great news! Your background makes you a strong candidate for ${topRec}. Many students with similar profiles have found success starting here and expanding their income streams over time.`,

        `Looking at your skills and availability, ${topRec} aligns perfectly with your goals. This is a flexible option that many students use to earn while studying.`
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
}

/**
 * Generate 30-day action plan
 */
export async function generateActionPlan(userProfile, recommendation, apiKey) {
    if (!apiKey) {
        return getDefaultActionPlan(recommendation);
    }

    const prompt = `Create a simple 30-day action plan for a ${userProfile.year || 'college'} student 
starting with ${recommendation.name}. Give exactly 4 weekly milestones. 
Keep each milestone to one sentence. Format as a numbered list.`;

    try {
        const result = await withRateLimit(async () => {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages: [
                        { role: 'system', content: 'You are a practical career coach. Be concise and actionable.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.6,
                    max_tokens: 150
                })
            });

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            return data.choices[0]?.message?.content || getDefaultActionPlan(recommendation);
        });

        return result;

    } catch (error) {
        console.error('Groq action plan error:', error);
        return getDefaultActionPlan(recommendation);
    }
}

/**
 * Default action plan fallback
 */
function getDefaultActionPlan(recommendation) {
    return `Week 1: Create your profile on ${recommendation.name} and set up your account
Week 2: Complete your first task or session to get your first review
Week 3: Optimize your profile based on feedback and increase availability
Week 4: Scale up by taking on more tasks and building your reputation`;
}

// Export for use
export const GroqAI = {
    generateAIAnalysis,
    generateActionPlan,
    getRateLimitStats,
};
