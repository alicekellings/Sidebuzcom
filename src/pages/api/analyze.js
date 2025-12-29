// Astro API endpoint for local development
// This proxies to the same logic as the Vercel serverless function

export const prerender = false;

export async function POST({ request }) {
    console.log('=== API /api/analyze called ===');

    try {
        const body = await request.json();
        const { answers, recommendations } = body;
        console.log('Received answers:', JSON.stringify(answers));
        console.log('Received recommendations count:', recommendations?.length || 0);

        // Get API key from environment
        const apiKey = import.meta.env.GROQ_API_KEY;
        console.log('API Key exists:', !!apiKey);
        console.log('API Key is placeholder:', apiKey === 'gsk_placeholder_replace_with_your_key');

        if (!apiKey || apiKey === 'gsk_placeholder_replace_with_your_key') {
            console.log('No valid API key, returning fallback');
            // No valid API key, return fallback
            return new Response(JSON.stringify({
                success: true,
                analysis: getFallbackAnalysis(answers, recommendations),
                source: 'fallback',
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Calling Groq API...');

        // Call Groq API
        const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

        const prompt = buildPrompt(answers, recommendations);

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `You are a friendly career advisor helping students find income opportunities. 
Be encouraging, specific, and practical. Keep responses under 100 words. 
Use a warm, supportive tone. Focus on actionable advice.`
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API Error:', response.status, errorText);

            // Handle rate limiting specifically
            if (response.status === 429) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'AI service is busy right now. Please try again in a moment.',
                    errorCode: 'RATE_LIMITED',
                    analysis: getFallbackAnalysis(answers, recommendations),
                    source: 'fallback',
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const analysis = data.choices?.[0]?.message?.content || getFallbackAnalysis(answers, recommendations);

        console.log('✅ Groq API Success!');
        console.log('AI Response:', analysis.substring(0, 100) + '...');
        console.log('Tokens used:', data.usage?.total_tokens || 'N/A');

        return new Response(JSON.stringify({
            success: true,
            analysis,
            source: 'ai',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: true,
            analysis: getFallbackAnalysis(answers || {}, recommendations || []),
            source: 'fallback',
            note: 'Using smart recommendations while AI is unavailable.',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function buildPrompt(userProfile, recommendations) {
    const { major, year, hours, skills, goal } = userProfile || {};
    const topRecs = recommendations?.slice(0, 3).map(r => r?.name || 'Unknown').join(', ') || 'online opportunities';

    return `Based on this student profile:
- Major: ${major || 'Not specified'}
- Year: ${year || 'Not specified'}  
- Available hours: ${hours || 'Not specified'} per week
- Skills: ${skills?.join(', ') || 'None specified'}
- Income goal: ${goal || 'Not specified'}

I'm recommending: ${topRecs}

Provide a personalized 2-3 sentence analysis explaining why these opportunities are a great fit.`;
}

function getFallbackAnalysis(userProfile, recommendations) {
    const topRec = recommendations?.[0]?.name || 'online tutoring';
    const hours = userProfile?.hours || 'your available';

    const analyses = [
        `Based on your profile, ${topRec} looks like an excellent fit! With ${hours} hours per week, you could earn solid side income while studying.`,
        `Great news! Your background makes you a strong candidate for ${topRec}. Many students find success starting here.`,
        `${topRec} aligns perfectly with your goals. This flexible option works well for students.`,
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
}
